"use client";

import { create } from "zustand";
import { initCrypto, type IdentityKeys } from "../lib/crypto";
import {
  clearDEKMemory,
  createDEKVault,
  findEncryptedRowsByScope,
  setDEKLock,
  storeEncryptedRow,
  unlockDEKWithPin,
  unlockDEKWithRecovery,
} from "../lib/dek";
import {
  decryptIdentityWithVaultKey,
  database,
  registerVaultWipeCleanup,
  saveIdentityWithVaultKey,
  type VaultRecord,
} from "../lib/vault";
import {
  validateVaultProfile,
  type VaultProfile,
} from "../lib/onboarding";

const LOCK_MINUTES_KEY = "UQZERA.lock.autoLockMinutes";
const LOCK_BACKGROUND_KEY = "UQZERA.lock.onBackground";
const PROFILE_TABLE = "vaultProfile";
const PROFILE_ID = "primary";

interface LockPreferences {
  autoLockMinutes: 0 | 15 | 30;
  lockOnBackground: boolean;
}

interface VaultState extends LockPreferences {
  isUnlocked: boolean;
  vaultExists: boolean;
  sessionRestored: boolean;
  sessionRestoreError: string | null;
  vaultKey: Uint8Array | null;
  identity: IdentityKeys | null;
  profile: VaultProfile | null;
  initializeVault: () => Promise<void>;
  createVault: (pin: string, recoveryPhrase: string, profile: VaultProfile) => Promise<void>;
  unlockVault: (pin: string) => Promise<void>;
  unlockWithRecoveryPhrase: (phrase: string, newLock: string) => Promise<void>;
  setProfile: (profile: VaultProfile) => Promise<void>;
  setLockPreferences: (preferences: LockPreferences) => void;
  lockVault: () => void;
  clearMemoryKeys: () => void;
}

let unlockGeneration = 0;
const memoryKeyCleanups = new Set<() => void>();

function readLockPreferences(): LockPreferences {
  if (typeof window === "undefined") {
    return { autoLockMinutes: 0, lockOnBackground: true };
  }
  const savedMinutes = Number(window.localStorage.getItem(LOCK_MINUTES_KEY) ?? "0");
  const autoLockMinutes: LockPreferences["autoLockMinutes"] =
    savedMinutes === 15 || savedMinutes === 30 ? savedMinutes : 0;
  const savedBackground = window.localStorage.getItem(LOCK_BACKGROUND_KEY);
  return {
    autoLockMinutes,
    lockOnBackground: savedBackground === null || savedBackground === "true",
  };
}

function clearKeys(state: Pick<VaultState, "vaultKey" | "identity">): void {
  state.vaultKey?.fill(0);
  state.identity?.signingPrivateKey.fill(0);
  state.identity?.encryptionPrivateKey.fill(0);
  state.identity?.signingPublicKey.fill(0);
  state.identity?.encryptionPublicKey.fill(0);
  clearDEKMemory();
  for (const cleanup of memoryKeyCleanups) cleanup();
}

export function registerMemoryKeyCleanup(cleanup: () => void): () => void {
  memoryKeyCleanups.add(cleanup);
  return () => memoryKeyCleanups.delete(cleanup);
}

async function createIdentity(): Promise<IdentityKeys> {
  const sodium = await initCrypto();
  const signing = sodium.crypto_sign_keypair();
  const encryption = sodium.crypto_box_keypair();
  return {
    signingPublicKey: signing.publicKey,
    signingPrivateKey: signing.privateKey,
    encryptionPublicKey: encryption.publicKey,
    encryptionPrivateKey: encryption.privateKey,
  };
}

async function readProfile(dek: Uint8Array): Promise<VaultProfile | null> {
  const rows = await findEncryptedRowsByScope(
    dek,
    PROFILE_TABLE,
    "owner",
    "self",
  );
  if (rows.length === 0) return null;
  try {
    const profile: unknown = JSON.parse(new TextDecoder().decode(rows[0].plaintext));
    if (
      typeof profile !== "object" ||
      profile === null ||
      !("name" in profile) ||
      typeof profile.name !== "string" ||
      !("bio" in profile) ||
      typeof profile.bio !== "string"
    ) {
      throw new Error("The encrypted vault profile is invalid.");
    }
    return { name: profile.name, bio: profile.bio };
  } finally {
    rows.forEach((row) => row.plaintext.fill(0));
  }
}

async function persistProfile(dek: Uint8Array, profile: VaultProfile): Promise<void> {
  const validationError = validateVaultProfile(profile);
  if (validationError) throw new Error(validationError);
  const plaintext = new TextEncoder().encode(JSON.stringify({
    name: profile.name.trim(),
    bio: profile.bio,
  }));
  try {
    await storeEncryptedRow(
      dek,
      PROFILE_TABLE,
      PROFILE_ID,
      "owner",
      "self",
      plaintext,
    );
  } finally {
    plaintext.fill(0);
  }
}

async function restoreUnlockedVault(
  dek: Uint8Array,
  request: number,
): Promise<void> {
  const record: VaultRecord | undefined = await database.vault.get("primary");
  if (!record) throw new Error("The encrypted device identity is missing.");
  const identity = await decryptIdentityWithVaultKey(record, dek);
  const profile = await readProfile(dek);
  if (request !== unlockGeneration) {
    dek.fill(0);
    identity.signingPrivateKey.fill(0);
    identity.encryptionPrivateKey.fill(0);
    identity.signingPublicKey.fill(0);
    identity.encryptionPublicKey.fill(0);
    return;
  }
  useVaultStore.setState({
    isUnlocked: true,
    vaultExists: true,
    sessionRestored: true,
    sessionRestoreError: null,
    vaultKey: dek,
    identity,
    profile,
  });
}

async function unlockWithPin(pin: string): Promise<void> {
  const request = ++unlockGeneration;
  const dek = await unlockDEKWithPin(pin);
  try {
    await restoreUnlockedVault(dek, request);
  } catch (error) {
    dek.fill(0);
    throw error;
  }
}

export const useVaultStore = create<VaultState>((set, get) => ({
  ...readLockPreferences(),
  isUnlocked: false,
  vaultExists: false,
  sessionRestored: false,
  sessionRestoreError: null,
  vaultKey: null,
  identity: null,
  profile: null,
  initializeVault: async () => {
    if (get().sessionRestored || typeof window === "undefined") return;
    const [record, preferences] = await Promise.all([
      database.dekVault.get("primary"),
      Promise.resolve(readLockPreferences()),
    ]);
    set({
      ...preferences,
      vaultExists: Boolean(record),
      isUnlocked: false,
      sessionRestored: true,
      sessionRestoreError: null,
      vaultKey: null,
      identity: null,
      profile: null,
    });
  },
  createVault: async (pin, recoveryPhrase, profile) => {
    const validationError = validateVaultProfile(profile);
    if (validationError) throw new Error(validationError);
    const dek = await createDEKVault(pin, recoveryPhrase);
    let identity: IdentityKeys | undefined;
    try {
      identity = await createIdentity();
      await saveIdentityWithVaultKey(identity, dek);
      await persistProfile(dek, profile);
      set({
        isUnlocked: true,
        vaultExists: true,
        sessionRestored: true,
        sessionRestoreError: null,
        vaultKey: dek,
        identity,
        profile: { name: profile.name.trim(), bio: profile.bio },
      });
    } catch (error) {
      dek.fill(0);
      identity?.signingPrivateKey.fill(0);
      identity?.encryptionPrivateKey.fill(0);
      set({
        isUnlocked: false,
        vaultExists: false,
        sessionRestored: true,
        vaultKey: null,
        identity: null,
        profile: null,
      });
      await Promise.all([
        database.dekVault.delete("primary"),
        database.vault.delete("primary"),
        database.encryptedRows.where("table").equals(PROFILE_TABLE).delete(),
      ]);
      throw error;
    }
  },
  unlockVault: unlockWithPin,
  unlockWithRecoveryPhrase: async (phrase, newLock) => {
    const request = ++unlockGeneration;
    const dek = await unlockDEKWithRecovery(phrase);
    try {
      await setDEKLock(dek, newLock);
      await restoreUnlockedVault(dek, request);
    } catch (error) {
      dek.fill(0);
      throw error;
    }
  },
  setProfile: async (profile) => {
    const { vaultKey, isUnlocked } = get();
    if (!isUnlocked || !vaultKey) throw new Error("Unlock the vault before editing your profile.");
    await persistProfile(vaultKey, profile);
    set({ profile: { name: profile.name.trim(), bio: profile.bio } });
  },
  setLockPreferences: (preferences) => {
    window.localStorage.setItem(LOCK_MINUTES_KEY, String(preferences.autoLockMinutes));
    window.localStorage.setItem(LOCK_BACKGROUND_KEY, String(preferences.lockOnBackground));
    set(preferences);
  },
  lockVault: () => {
    unlockGeneration += 1;
    clearKeys(get());
    set({
      isUnlocked: false,
      sessionRestored: true,
      sessionRestoreError: null,
      vaultKey: null,
      identity: null,
      profile: null,
    });
  },
  clearMemoryKeys: () => {
    unlockGeneration += 1;
    clearKeys(get());
    set({
      isUnlocked: false,
      sessionRestored: true,
      sessionRestoreError: null,
      vaultKey: null,
      identity: null,
      profile: null,
    });
  },
}));

registerVaultWipeCleanup(() => useVaultStore.getState().clearMemoryKeys());

export { readLockPreferences };
