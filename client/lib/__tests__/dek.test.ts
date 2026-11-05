import "fake-indexeddb/auto";
import { beforeAll, describe, expect, it } from "vitest";
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import {
  getLockFailureDelay,
  LOCK_FAILURE_DELAYS_MS,
  createDEKVault,
  decryptRow,
  findEncryptedRowsByScope,
  revealRecoveryPhrase,
  storeEncryptedRow,
  unlockDEKWithPin,
  unlockDEKWithRecovery,
} from "../dek";
import { database, wipeVaultDatabase } from "../vault";

const pin = "correct horse battery staple";
let recoveryPhrase: string;
let originalDEK: Uint8Array;

beforeAll(async () => {
  recoveryPhrase = generateMnemonic(wordlist, 256);
  originalDEK = await createDEKVault(pin, recoveryPhrase);
}, 30_000);

describe("DEK vault", () => {
  it("unlocks the same DEK through either wrapper", async () => {
    const pinDEK = await unlockDEKWithPin(pin);
    const recoveryDEK = await unlockDEKWithRecovery(recoveryPhrase);

    expect(pinDEK).toEqual(originalDEK);
    expect(recoveryDEK).toEqual(originalDEK);
  }, 30_000);

  it("rejects an incorrect PIN", async () => {
    await expect(unlockDEKWithPin("incorrect PIN")).rejects.toBeDefined();
  }, 30_000);

  it("allows recovery-only unlock of the original DEK", async () => {
    const recoveredDEK = await unlockDEKWithRecovery(recoveryPhrase);

    expect(recoveredDEK).toEqual(originalDEK);
  });

  it("reveals the recovery phrase only by decrypting its DEK-encrypted record", async () => {
    await expect(revealRecoveryPhrase(originalDEK)).resolves.toBe(recoveryPhrase);
  });

  it("rejects row AAD swaps and supports HMAC scope-tag lookup", async () => {
    const plaintext = new TextEncoder().encode("row payload");
    const table = "contacts";
    const rowId = "contact-1";
    await storeEncryptedRow(originalDEK, table, rowId, "owner", "self", plaintext);

    const stored = await database.encryptedRows.toCollection().first();
    expect(stored).toBeDefined();
    if (!stored) throw new Error("Encrypted row was not persisted.");
    expect(stored.id).toHaveLength(44);
    await expect(
      decryptRow(originalDEK, table, "contact-2", stored),
    ).rejects.toBeDefined();

    const matches = await findEncryptedRowsByScope(
      originalDEK,
      table,
      "owner",
      "self",
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].rowId).toBe(rowId);
    expect(matches[0].plaintext).toEqual(plaintext);
    await expect(
      findEncryptedRowsByScope(originalDEK, table, "owner", "other"),
    ).resolves.toEqual([]);
  });

  it("uses the approved local failed-attempt backoff", () => {
    expect(LOCK_FAILURE_DELAYS_MS).toEqual([0, 0, 0, 5_000, 15_000, 60_000]);
    expect(getLockFailureDelay(7)).toBe(60_000);
  });

  it("wipes persisted vault rows and in-memory DEKs", async () => {
    await storeEncryptedRow(
      originalDEK,
      "contacts",
      "wipe-check",
      "owner",
      "self",
      new TextEncoder().encode("must be erased"),
    );

    await wipeVaultDatabase();
    await database.open();

    expect(await database.dekVault.get("primary")).toBeUndefined();
    expect(await database.encryptedRows.count()).toBe(0);
    expect([...originalDEK].every((byte) => byte === 0)).toBe(true);
  });
});
