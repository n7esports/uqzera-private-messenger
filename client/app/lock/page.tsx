"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useVaultStore } from "../../store/useVaultStore";
import { recordFailedLockAttempt } from "../../lib/dek";

export default function LockPage() {
  const router = useRouter();
  const isUnlocked = useVaultStore((state) => state.isUnlocked);
  const vaultExists = useVaultStore((state) => state.vaultExists);
  const sessionRestored = useVaultStore((state) => state.sessionRestored);
  const unlockVault = useVaultStore((state) => state.unlockVault);
  const [lockType, setLockType] = useState<"pin" | "passphrase">("pin");
  const [lockValue, setLockValue] = useState("");
  const [showLockValue, setShowLockValue] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!sessionRestored) return;
    if (!vaultExists) router.replace("/onboarding");
    else if (isUnlocked) router.replace("/chats");
  }, [isUnlocked, router, sessionRestored, vaultExists]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [lockType]);

  useEffect(() => {
    if (!lockedUntil) return;
    const timer = setInterval(() => {
      if (Date.now() >= lockedUntil) setLockedUntil(0);
    }, 250);
    return () => clearInterval(timer);
  }, [lockedUntil]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || lockedUntil > Date.now()) return;
    setError(null);
    if (lockType === "pin" ? !/^\d{6}$/.test(lockValue) : lockValue.length < 8) {
      setError(lockType === "pin" ? "Enter your 6-digit PIN." : "Enter your passphrase.");
      return;
    }

    setBusy(true);
    try {
      await unlockVault(lockValue);
    } catch (unlockError) {
      if (unlockError instanceof DOMException && unlockError.name === "OperationError") {
        setLockValue("");
        try {
          const delay = recordFailedLockAttempt();
          if (delay > 0) setLockedUntil(Date.now() + delay);
          setError("Wrong PIN or passphrase");
        } catch {
          setError("Could not save the failed-attempt counter. Check browser storage and try again.");
        }
      } else {
        setError("Could not unlock the vault. Check browser storage and try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (!sessionRestored) {
    return <p className="p-8 text-center text-sm text-secondary">Checking vault…</p>;
  }

  const remainingSeconds = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
  return (
    <main className="flex h-screen w-full items-center justify-center bg-base px-4">
      <section className="bg-panel border border-default w-full max-w-[400px] rounded-2xl px-6 py-8">
        <h1 className="font-sans text-2xl font-semibold text-primary">Unlock your vault</h1>
        <p className="mt-2 text-sm text-secondary">Enter your PIN or passphrase.</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            aria-pressed={lockType === "pin"}
            onClick={() => { setLockType("pin"); setLockValue(""); setError(null); }}
            className="flex-1 rounded-xl border border-default px-3 py-2 text-sm text-primary"
          >
            PIN
          </button>
          <button
            type="button"
            aria-pressed={lockType === "passphrase"}
            onClick={() => { setLockType("passphrase"); setLockValue(""); setError(null); }}
            className="flex-1 rounded-xl border border-default px-3 py-2 text-sm text-primary"
          >
            Passphrase
          </button>
        </div>
        <form className="mt-5 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block text-sm text-secondary">
            {lockType === "pin" ? "6-digit PIN" : "Passphrase"}
            <span className="mt-2 flex gap-2">
              <input
                ref={inputRef}
                aria-label={lockType === "pin" ? "PIN" : "Passphrase"}
                autoComplete="current-password"
                disabled={busy || remainingSeconds > 0}
                inputMode={lockType === "pin" ? "numeric" : undefined}
                maxLength={lockType === "pin" ? 6 : undefined}
                onChange={(event) => setLockValue(lockType === "pin"
                  ? event.target.value.replace(/\D/g, "")
                  : event.target.value)}
                type={showLockValue ? "text" : "password"}
                value={lockValue}
                className={`h-11 min-w-0 flex-1 rounded-lg bg-bg-panel px-4 text-text-primary text-center focus:ring-2 focus:ring-accent ${lockType === "pin" ? "tracking-[0.2em]" : ""}`}
              />
              {lockType === "passphrase" && (
                <button
                  type="button"
                  onClick={() => setShowLockValue(!showLockValue)}
                  className="rounded-xl border border-default px-3 text-sm text-primary"
                >
                  {showLockValue ? "Hide" : "Show"}
                </button>
              )}
            </span>
          </label>
          {remainingSeconds > 0 && (
            <p aria-live="polite" className="text-center text-sm text-error">
              Try again in {remainingSeconds} seconds.
            </p>
          )}
          {error && <p role="alert" className="text-center text-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={busy || remainingSeconds > 0}
            className="h-11 w-full rounded-lg bg-accent text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40"
          >
            {busy ? "Unlocking…" : "Unlock"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => router.push("/unlock/recovery")}
          className="mt-5 w-full text-sm text-accent"
        >
          Forgot PIN or passphrase?
        </button>
      </section>
    </main>
  );
}
