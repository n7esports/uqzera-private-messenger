"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVaultStore } from "../../../store/useVaultStore";
import { validateRecoveryPhrase, disposeMnemonic } from "../../../lib/recovery";

export default function UnlockRecoveryPage() {
  const router = useRouter();
  const unlockWithRecoveryPhrase = useVaultStore((state) => state.unlockWithRecoveryPhrase);
  const [phrase, setPhrase] = useState("");
  const [newLock, setNewLock] = useState("");
  const [lockType, setLockType] = useState<"pin" | "passphrase">("pin");
  const [showLock, setShowLock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const recover = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const normalized = phrase.trim().replace(/\s+/g, " ");
    const validLock = lockType === "pin"
      ? /^\d{6}$/.test(newLock)
      : newLock.length >= 8;
    if (!validateRecoveryPhrase(normalized)) {
      setError("Recovery phrase is invalid. Check the words and try again.");
      return;
    }
    if (!validLock) {
      setError(lockType === "pin"
        ? "Choose a new 6-digit PIN."
        : "Your new passphrase must be at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      await unlockWithRecoveryPhrase(normalized, newLock);
      setPhrase("");
      setNewLock("");
      disposeMnemonic(normalized);
      router.replace("/chats");
    } catch {
      setError("Could not recover the vault. Check the phrase and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-base px-4 py-8">
      <section className="bg-panel border border-default w-full max-w-md rounded-2xl px-8 py-10">
        <h1 className="font-sans text-2xl font-semibold text-primary">Recover your vault</h1>
        <p className="mt-2 text-sm text-secondary">
          Enter your 24-word phrase and choose a new lock. Your encrypted contacts and messages remain on this device.
        </p>
        <form onSubmit={(event) => void recover(event)} className="mt-6 space-y-4">
          <label className="block text-sm text-secondary">
            Recovery phrase
            <textarea
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              rows={5}
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
              className="mt-2 w-full rounded-xl border border-default bg-input px-4 py-3 font-mono text-sm text-primary"
            />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setLockType("pin"); setNewLock(""); }} className="rounded-xl border border-default px-4 py-2 text-sm text-primary">
              New PIN
            </button>
            <button type="button" onClick={() => { setLockType("passphrase"); setNewLock(""); }} className="rounded-xl border border-default px-4 py-2 text-sm text-primary">
              New passphrase
            </button>
          </div>
          <label className="block text-sm text-secondary">
            {lockType === "pin" ? "New 6-digit PIN" : "New passphrase (8+ characters)"}
            <span className="mt-2 flex gap-2">
              <input
                autoComplete="new-password"
                inputMode={lockType === "pin" ? "numeric" : undefined}
                maxLength={lockType === "pin" ? 6 : undefined}
                type={showLock ? "text" : "password"}
                value={newLock}
                onChange={(event) => setNewLock(lockType === "pin"
                  ? event.target.value.replace(/\D/g, "")
                  : event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-default bg-input px-4 py-3 text-primary"
              />
              {lockType === "passphrase" && (
                <button type="button" onClick={() => setShowLock(!showLock)} className="rounded-xl border border-default px-3 text-sm text-primary">
                  {showLock ? "Hide" : "Show"}
                </button>
              )}
            </span>
          </label>
          {error && <p role="alert" className="text-sm text-error">{error}</p>}
          <button type="submit" disabled={busy} className="h-11 w-full rounded-lg bg-accent text-sm font-medium text-[#0A0D14] hover:bg-accent-hover disabled:opacity-40">
            {busy ? "Recovering…" : "Recover and set new lock"}
          </button>
        </form>
        <Link href="/lock" className="mt-4 block text-center text-sm text-secondary underline">
          Back to unlock
        </Link>
      </section>
    </main>
  );
}
