// @vitest-environment jsdom
import "fake-indexeddb/auto";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { database } from "../vault";
import { startAutoLockTimer } from "../lockSettings";

let useVaultStore!: typeof import("../../store/useVaultStore").useVaultStore;

function makeStorage() {
  return {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
}

beforeAll(async () => {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: makeStorage(),
  });
  Object.defineProperty(window, "sessionStorage", {
    configurable: true,
    value: makeStorage(),
  });
  ({ useVaultStore } = await import("../../store/useVaultStore"));
});

beforeEach(async () => {
  await database.open();
  await Promise.all(database.tables.map((table) => table.clear()));
});

afterEach(async () => {
  vi.useRealTimers();
  useVaultStore.setState({
    isUnlocked: false,
    vaultExists: false,
    sessionRestored: false,
    sessionRestoreError: null,
    vaultKey: null,
    identity: null,
    profile: null,
  });
  window.sessionStorage.clear();
  window.localStorage.clear();
});

afterAll(() => database.close());

describe("vault store", () => {
  it("defaults auto-lock off and background locking on", () => {
    expect(useVaultStore.getState().autoLockMinutes).toBe(0);
    expect(useVaultStore.getState().lockOnBackground).toBe(true);
  });

  it("does not create an identity when the first open has no vault", async () => {
    await useVaultStore.getState().initializeVault();

    expect(useVaultStore.getState().vaultExists).toBe(false);
    expect(useVaultStore.getState().identity).toBeNull();
    expect(await database.vault.get("primary")).toBeUndefined();
  });

  it("auto-locks after the selected interval and clears the in-memory key", () => {
    vi.useFakeTimers();
    const key = new Uint8Array(32).fill(7);
    useVaultStore.setState({ isUnlocked: true, vaultKey: key });
    const cancel = startAutoLockTimer(() => useVaultStore.getState().lockVault(), 15);

    vi.advanceTimersByTime(15 * 60_000 - 1);
    expect(useVaultStore.getState().isUnlocked).toBe(true);
    vi.advanceTimersByTime(1);

    expect(useVaultStore.getState().isUnlocked).toBe(false);
    expect(useVaultStore.getState().vaultKey).toBeNull();
    expect([...key].every((byte) => byte === 0)).toBe(true);
    cancel();
  });
});
