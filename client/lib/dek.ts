import { mnemonicToSeedSync } from "@scure/bip39";
import { initCrypto } from "./crypto";
import { validateRecoveryPhrase } from "./recovery";
import {
  database,
  registerVaultWipeCleanup,
  type DEKVaultRecord,
  type EncryptedValue,
  type EncryptedVaultRowRecord,
} from "./vault";

const DEK_BYTES = 32;
const LOCK_AAD = new TextEncoder().encode("vault/dek/primary");
const RECOVERY_INFO = new TextEncoder().encode("uqzera/v1/recovery");
const SCOPE_TAG_INFO = new TextEncoder().encode("uqzera/v1/scope-tags");
const EMPTY_HKDF_SALT = new Uint8Array(32);
const FAILED_ATTEMPTS_STORAGE = "UQZERA.lock.failedAttempts";
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", { fatal: true });

export const LOCK_FAILURE_DELAYS_MS = [0, 0, 0, 5_000, 15_000, 60_000] as const;

const activeDEKs = new Set<Uint8Array>();

function trackDEK(dek: Uint8Array): Uint8Array {
  activeDEKs.add(dek);
  return dek;
}

export function clearDEKMemory(): void {
  for (const dek of activeDEKs) dek.fill(0);
  activeDEKs.clear();
}

export function getLockFailureDelay(failedAttempts: number): number {
  if (!Number.isSafeInteger(failedAttempts) || failedAttempts < 0) {
    throw new Error("Failed-attempt count must be a non-negative integer.");
  }
  if (failedAttempts === 0) return 0;
  return LOCK_FAILURE_DELAYS_MS[
    Math.min(failedAttempts, LOCK_FAILURE_DELAYS_MS.length) - 1
  ];
}

function readFailedAttempts(): number {
  if (typeof window === "undefined") {
    throw new Error("Local lock-attempt storage is unavailable.");
  }
  const value = window.localStorage.getItem(FAILED_ATTEMPTS_STORAGE);
  if (value === null) return 0;
  const count = Number(value);
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error("The local lock-attempt counter is invalid.");
  }
  return count;
}

export function recordFailedLockAttempt(): number {
  if (typeof window === "undefined") {
    throw new Error("Local lock-attempt storage is unavailable.");
  }
  const failedAttempts = Math.min(readFailedAttempts() + 1, LOCK_FAILURE_DELAYS_MS.length);
  window.localStorage.setItem(FAILED_ATTEMPTS_STORAGE, String(failedAttempts));
  return getLockFailureDelay(failedAttempts);
}

export function clearFailedLockAttempts(): void {
  if (typeof window === "undefined") {
    throw new Error("Local lock-attempt storage is unavailable.");
  }
  window.localStorage.removeItem(FAILED_ATTEMPTS_STORAGE);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function assertDEK(dek: Uint8Array): void {
  if (dek.length !== DEK_BYTES) throw new Error("DEK must be 32 bytes.");
}

function assertScopeParts(...parts: string[]): void {
  if (parts.some((part) => part.length === 0)) {
    throw new Error("Vault table, row, scope, and scope value must be non-empty.");
  }
}

async function importAESKey(
  rawKey: Uint8Array,
  usages: KeyUsage[],
): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, usages);
}

async function encryptWithKey(
  key: CryptoKey,
  plaintext: Uint8Array,
  additionalData: Uint8Array,
): Promise<EncryptedValue> {
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce, additionalData },
    key,
    plaintext,
  );
  return { nonce, ciphertext: new Uint8Array(ciphertext) };
}

async function decryptWithKey(
  key: CryptoKey,
  encrypted: EncryptedValue,
  additionalData: Uint8Array,
): Promise<Uint8Array> {
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: encrypted.nonce, additionalData },
    key,
    encrypted.ciphertext,
  );
  return new Uint8Array(plaintext);
}

async function deriveLockKey(pin: string, salt: Uint8Array): Promise<Uint8Array> {
  const sodium = await initCrypto();
  if (pin.length === 0) throw new Error("A non-empty PIN or passphrase is required.");
  if (salt.length !== sodium.crypto_pwhash_SALTBYTES) {
    throw new Error(`Lock salt must be ${sodium.crypto_pwhash_SALTBYTES} bytes.`);
  }
  return sodium.crypto_pwhash(
    DEK_BYTES,
    pin,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE,
    sodium.crypto_pwhash_ALG_ARGON2ID13,
  );
}

async function deriveRecoveryKey(
  mnemonic: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const normalized = mnemonic.trim().split(/\s+/).join(" ");
  const words = normalized.split(" ");
  if (words.length !== 24 || !validateRecoveryPhrase(normalized)) {
    throw new Error("A valid 24-word BIP39 recovery phrase is required.");
  }
  const seed = mnemonicToSeedSync(normalized);
  try {
    const hkdfKey = await crypto.subtle.importKey("raw", seed, "HKDF", false, [
      "deriveKey",
    ]);
    return await crypto.subtle.deriveKey(
      { name: "HKDF", hash: "SHA-256", salt, info: RECOVERY_INFO },
      hkdfKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
  } finally {
    seed.fill(0);
  }
}

async function deriveScopeTagKey(dek: Uint8Array): Promise<CryptoKey> {
  assertDEK(dek);
  const hkdfKey = await crypto.subtle.importKey("raw", dek, "HKDF", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: EMPTY_HKDF_SALT, info: SCOPE_TAG_INFO },
    hkdfKey,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    false,
    ["sign"],
  );
}

async function createScopeTag(
  dek: Uint8Array,
  table: string,
  scope: string,
  scopeValue: string,
): Promise<string> {
  assertScopeParts(table, scope, scopeValue);
  const key = await deriveScopeTagKey(dek);
  const message = textEncoder.encode(JSON.stringify([table, scope, scopeValue]));
  const tag = await crypto.subtle.sign("HMAC", key, message);
  return bytesToBase64(new Uint8Array(tag));
}

async function encryptRow(
  dek: Uint8Array,
  table: string,
  rowId: string,
  plaintext: Uint8Array,
): Promise<EncryptedValue> {
  assertDEK(dek);
  assertScopeParts(table, rowId);
  const key = await importAESKey(dek, ["encrypt"]);
  return encryptWithKey(key, plaintext, textEncoder.encode(`${table}/${rowId}`));
}

export async function decryptRow(
  dek: Uint8Array,
  table: string,
  rowId: string,
  encrypted: EncryptedValue,
): Promise<Uint8Array> {
  assertDEK(dek);
  assertScopeParts(table, rowId);
  const key = await importAESKey(dek, ["decrypt"]);
  return decryptWithKey(key, encrypted, textEncoder.encode(`${table}/${rowId}`));
}

export async function createDEKVault(
  pin: string,
  recoveryPhrase: string,
): Promise<Uint8Array> {
  if (!validateRecoveryPhrase(recoveryPhrase.trim().split(/\s+/).join(" "))) {
    throw new Error("A valid 24-word BIP39 recovery phrase is required.");
  }
  const sodium = await initCrypto();
  const dek = sodium.randombytes_buf(DEK_BYTES);
  const lockSalt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
  let lockKey: Uint8Array | undefined;
  let recoveryPhraseBytes: Uint8Array | undefined;
  try {
    lockKey = await deriveLockKey(pin, lockSalt);
    const lockWrappedDEK = await encryptWithKey(
      await importAESKey(lockKey, ["encrypt"]),
      dek,
      LOCK_AAD,
    );
    const recoveryWrappedDEK = await encryptWithKey(
      await deriveRecoveryKey(recoveryPhrase, lockSalt),
      dek,
      LOCK_AAD,
    );
    recoveryPhraseBytes = textEncoder.encode(recoveryPhrase.trim().split(/\s+/).join(" "));
    const encryptedRecoveryPhrase = await encryptWithKey(
      await importAESKey(dek, ["encrypt"]),
      recoveryPhraseBytes,
      textEncoder.encode("vaultSecrets/recovery-phrase"),
    );
    await database.dekVault.put({
      id: "primary",
      lockSalt,
      lockWrappedDEK,
      recoveryWrappedDEK,
      encryptedRecoveryPhrase,
      createdAt: Date.now(),
    });
    return trackDEK(dek);
  } catch (error) {
    dek.fill(0);
    throw error;
  } finally {
    lockKey?.fill(0);
    recoveryPhraseBytes?.fill(0);
  }
}

function clearFailedLockAttemptsIfAvailable(): void {
  if (typeof window !== "undefined") clearFailedLockAttempts();
}

async function readDEKVault(): Promise<DEKVaultRecord> {
  const record = await database.dekVault.get("primary");
  if (!record) throw new Error("The DEK vault has not been initialized.");
  return record;
}

export async function unlockDEKWithPin(pin: string): Promise<Uint8Array> {
  const record = await readDEKVault();
  const lockKey = await deriveLockKey(pin, record.lockSalt);
  try {
    const dek = await decryptWithKey(
      await importAESKey(lockKey, ["decrypt"]),
      record.lockWrappedDEK,
      LOCK_AAD,
    );
    try {
      clearFailedLockAttemptsIfAvailable();
    } catch (error) {
      dek.fill(0);
      throw error;
    }
    return trackDEK(dek);
  } finally {
    lockKey.fill(0);
  }
}

export async function unlockDEKWithRecovery(
  recoveryPhrase: string,
): Promise<Uint8Array> {
  const record = await readDEKVault();
  const recoveryKey = await deriveRecoveryKey(recoveryPhrase, record.lockSalt);
  const dek = await decryptWithKey(
    recoveryKey,
    record.recoveryWrappedDEK,
    LOCK_AAD,
  );
  try {
    clearFailedLockAttemptsIfAvailable();
  } catch (error) {
    dek.fill(0);
    throw error;
  }
  return trackDEK(dek);
}

export async function revealRecoveryPhrase(dek: Uint8Array): Promise<string> {
  const record = await readDEKVault();
  const plaintext = await decryptRow(
    dek,
    "vaultSecrets",
    "recovery-phrase",
    record.encryptedRecoveryPhrase,
  );
  try {
    return textDecoder.decode(plaintext);
  } finally {
    plaintext.fill(0);
  }
}

export async function storeEncryptedRow(
  dek: Uint8Array,
  table: string,
  rowId: string,
  scope: string,
  scopeValue: string,
  plaintext: Uint8Array,
): Promise<void> {
  const encrypted = await encryptRow(dek, table, rowId, plaintext);
  const scopeTag = await createScopeTag(dek, table, scope, scopeValue);
  const record: EncryptedVaultRowRecord = {
    id: await createScopeTag(dek, table, "row-id", rowId),
    table,
    rowId,
    scopeTag,
    ...encrypted,
  };
  await database.encryptedRows.put(record);
}

export async function findEncryptedRowsByScope(
  dek: Uint8Array,
  table: string,
  scope: string,
  scopeValue: string,
): Promise<Array<{ rowId: string; plaintext: Uint8Array }>> {
  const scopeTag = await createScopeTag(dek, table, scope, scopeValue);
  const records = await database.encryptedRows
    .where("scopeTag")
    .equals(scopeTag)
    .toArray();
  return Promise.all(
    records.map(async (record) => ({
      rowId: record.rowId,
      plaintext: await decryptRow(dek, record.table, record.rowId, record),
    })),
  );
}

registerVaultWipeCleanup(() => {
  clearDEKMemory();
  if (typeof window !== "undefined") clearFailedLockAttempts();
});
