"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { generateRecoveryPhrase, verifyChallengeWords } from "@/lib/recovery";
import {
  generateChallengePositions,
  nextOnboardingStep,
  validateVaultProfile,
  type OnboardingStep,
  type VaultProfile,
} from "@/lib/onboarding";
import BoxQRCode from "@/components/icons/BoxQRCode";
import { encodeBytes } from "@/lib/protocol";
import { useVaultStore } from "@/store/useVaultStore";
import { copyTextToClipboard } from "@/lib/clipboard";

const EMPTY_PROFILE: VaultProfile = { name: "", bio: "" };

export default function OnboardingPage() {
  const router = useRouter();
  const vaultExists = useVaultStore((state) => state.vaultExists);
  const createVault = useVaultStore((state) => state.createVault);
  const identity = useVaultStore((state) => state.identity);
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [recovery, setRecovery] = useState<ReturnType<typeof generateRecoveryPhrase> | null>(null);
  const [challengePositions, setChallengePositions] = useState<[number, number, number] | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [savedConfirmed, setSavedConfirmed] = useState(false);
  const [lockType, setLockType] = useState<"pin" | "passphrase">("pin");
  const [lockValue, setLockValue] = useState("");
  const [showLockValue, setShowLockValue] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);
  const creatingVault = useRef(false);

  useEffect(() => {
    if (vaultExists && !creatingVault.current) router.replace("/lock");
  }, [router, vaultExists]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => () => { recovery?.seed.fill(0); }, [recovery]);

  const advance = () => {
    const next = nextOnboardingStep(step, profile);
    if (!next) {
      setError(validateVaultProfile(profile) || "Complete this step before continuing.");
      return;
    }
    setError(null);
    setStep(next);
  };

  const beginRecovery = () => {
    const result = generateRecoveryPhrase();
    setRecovery(result);
    setChallengePositions(generateChallengePositions());
    setStep("recovery");
    setError(null);
  };

  const confirmRecovery = () => {
    if (!recovery || !challengePositions || !savedConfirmed) return;
    const correct = verifyChallengeWords(
      recovery.mnemonic,
      challengePositions,
      challengePositions.map((position) => answers[position] || ""),
    );
    if (!correct) {
      setError("One or more words are incorrect. Check your phrase and try again.");
      return;
    }
    setError(null);
    setStep("lock");
  };

  const createIdentity = async () => {
    if (!recovery) return;
    const validLock = lockType === "pin"
      ? /^\d{6}$/.test(lockValue)
      : lockValue.length >= 8;
    if (!validLock) {
      setError(lockType === "pin"
        ? "Enter a 6-digit PIN."
        : "Your passphrase must be at least 8 characters.");
      return;
    }
    setError(null);
    creatingVault.current = true;
    try {
      await createVault(lockValue, recovery.mnemonic, profile);
      recovery.seed.fill(0);
      setRecovery(null);
      setStep("identity");
    } catch (createError) {
      creatingVault.current = false;
      setError(createError instanceof Error ? createError.message : "Could not create the vault.");
    }
  };

  const copyID = async () => {
    if (!identity) return;
    const id = `uqz1.${encodeBytes(identity.encryptionPublicKey)}`;
    try {
      await copyTextToClipboard(id);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1_500);
    } catch {
      setError("Could not share the ID. Try copying it instead.");
    }
  };

  const shareID = async () => {
    if (!identity) return;
    const id = `uqz1.${encodeBytes(identity.encryptionPublicKey)}`;
    if (!navigator.share) {
      await copyID();
      return;
    }
    try {
      await navigator.share({ title: "My UQZERA ID", text: id });
    } catch {
      setError("Could not share the ID. Try copying it instead.");
    }
  };

  const phraseWords = recovery?.mnemonic.split(/\s+/) ?? [];
  const publicID = identity
    ? `uqz1.${encodeBytes(identity.encryptionPublicKey)}`
    : "";

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-base px-4 py-8">
      <section className="bg-panel border border-default w-full max-w-[400px] rounded-2xl px-6 py-8">
        {step === "welcome" && (
          <>
            <h1 className="font-sans text-2xl font-semibold text-primary">Welcome to UQZERA</h1>
            <p className="mt-3 text-sm text-secondary">
              Create a local encrypted vault. Your recovery phrase stays on this device unless you choose to share it.
            </p>
            <button onClick={advance} className="mt-8 h-11 w-full rounded-lg bg-accent text-sm font-medium text-white hover:bg-accent-hover">
              Get started
            </button>
          </>
        )}

        {step === "profile" && (
          <>
            <h1 className="font-sans text-2xl font-semibold text-primary">Your profile</h1>
            <label className="mt-6 block text-sm text-secondary">
              Name (1–40 characters)
              <input
                autoComplete="name"
                maxLength={40}
                value={profile.name}
                onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                className="mt-2 w-full rounded-xl border border-default bg-input px-4 py-3 text-primary"
              />
            </label>
            <label className="mt-4 block text-sm text-secondary">
              Bio (up to 160 characters)
              <textarea
                maxLength={160}
                rows={3}
                value={profile.bio}
                onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
                className="mt-2 w-full rounded-xl border border-default bg-input px-4 py-3 text-primary"
              />
            </label>
            <button onClick={advance} className="mt-6 h-11 w-full rounded-lg bg-accent text-sm font-medium text-white hover:bg-accent-hover">
              Continue
            </button>
          </>
        )}

        {step === "generate" && (
          <>
            <h1 className="font-sans text-2xl font-semibold text-primary">Create your recovery phrase</h1>
            <p className="mt-3 text-sm text-secondary">
              Your 24-word phrase is the only way to recover your vault if you forget your lock.
            </p>
            <button onClick={beginRecovery} className="mt-8 h-11 w-full rounded-lg bg-accent text-sm font-medium text-white hover:bg-accent-hover">
              Generate phrase
            </button>
          </>
        )}

        {step === "recovery" && recovery && challengePositions && (
          <>
            <h1 className="font-sans text-2xl font-semibold text-primary">Recovery phrase</h1>
            <p className="mt-2 text-sm text-secondary">
              Write down all 24 words in order. Downloaded files are not encrypted.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-elevated p-4 sm:grid-cols-3">
              {phraseWords.map((word, index) => (
                <div key={index} className="flex gap-2 rounded-lg bg-panel px-3 py-2">
                  <span className="text-xs text-outline">{index + 1}</span>
                  <span className="font-mono text-sm text-primary">{word}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  const file = new Blob([`${recovery.mnemonic}\n`], { type: "text/plain" });
                  const url = URL.createObjectURL(file);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = "uqzera-recovery-phrase.txt";
                  anchor.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 rounded-xl border border-default py-2 text-sm text-primary"
              >
                Download as .txt (not encrypted)
              </button>
              <button
                onClick={async () => {
                  try {
                    await copyTextToClipboard(recovery.mnemonic);
                    setError(null);
                    if (copyTimer.current) clearTimeout(copyTimer.current);
                    copyTimer.current = setTimeout(() => {
                      void copyTextToClipboard("").catch(() => {
                        if (mounted.current) {
                          setError("Clipboard could not be cleared automatically; clear it manually.");
                        }
                      });
                    }, 30_000);
                  } catch {
                    setError("Could not copy the recovery phrase. Check clipboard permission.");
                  }
                }}
                className="rounded-xl border border-default px-4 py-2 text-sm text-primary"
              >
                Copy
              </button>
            </div>
            <p className="mt-5 text-sm text-secondary">
              Confirm words at positions {challengePositions.join(", ")}:
            </p>
            {challengePositions.map((position) => (
              <label key={position} className="mt-2 flex items-center gap-3 text-sm text-secondary">
                <span>#{position}</span>
                <input
                  autoComplete="off"
                  value={answers[position] ?? ""}
                  onChange={(event) => setAnswers({ ...answers, [position]: event.target.value })}
                  className="flex-1 rounded-xl border border-default bg-input px-3 py-2 text-primary"
                />
              </label>
            ))}
            <label className="mt-4 flex gap-3 text-sm text-secondary">
              <input
                type="checkbox"
                checked={savedConfirmed}
                onChange={(event) => setSavedConfirmed(event.target.checked)}
              />
              I have saved the 24 words somewhere safe.
            </label>
            <button
              onClick={confirmRecovery}
              disabled={!savedConfirmed}
              className="mt-5 h-11 w-full rounded-lg bg-accent text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40"
            >
              Confirm phrase
            </button>
            <button
              onClick={() => {
                setError(null);
                setStep("recovery");
              }}
              className="mt-3 w-full text-sm text-accent"
            >
              Go back and check
            </button>
          </>
        )}

        {step === "lock" && (
          <>
            <h1 className="font-sans text-2xl font-semibold text-primary">Choose your lock</h1>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => { setLockType("pin"); setLockValue(""); setError(null); }}
                aria-pressed={lockType === "pin"}
                className="rounded-xl border border-default px-4 py-2 text-sm text-primary"
              >
                6-digit PIN
              </button>
              <button
                onClick={() => { setLockType("passphrase"); setLockValue(""); setError(null); }}
                aria-pressed={lockType === "passphrase"}
                className="rounded-xl border border-default px-4 py-2 text-sm text-primary"
              >
                Passphrase
              </button>
            </div>
            {lockType === "pin" && (
              <p className="mt-4 text-sm text-secondary">
                A 6-digit PIN is convenient but weaker against offline device theft. Use a strong passphrase if you need maximum security.
              </p>
            )}
            <label className="mt-4 block text-sm text-secondary">
              {lockType === "pin" ? "6-digit PIN" : "Passphrase (8+ characters)"}
              <span className="mt-2 flex gap-2">
                <input
                  autoComplete="new-password"
                  inputMode={lockType === "pin" ? "numeric" : undefined}
                  maxLength={lockType === "pin" ? 6 : undefined}
                  type={showLockValue ? "text" : "password"}
                  value={lockValue}
                  onChange={(event) => setLockValue(lockType === "pin"
                    ? event.target.value.replace(/\D/g, "")
                    : event.target.value)}
                  className={`min-w-0 flex-1 h-11 rounded-lg bg-bg-panel px-4 text-text-primary text-center text-base focus:ring-2 focus:ring-accent ${lockType === "pin" ? "tracking-[0.2em]" : ""}`}
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
            <button onClick={() => void createIdentity()} className="mt-6 h-11 w-full rounded-lg bg-accent text-sm font-medium text-white hover:bg-accent-hover">
              Create vault
            </button>
          </>
        )}

        {step === "identity" && (
          <>
            <h1 className="font-sans text-2xl font-semibold text-primary">Your ID</h1>
            <p className="mt-2 text-sm text-secondary">Share this ID or its QR code to connect.</p>
            <div className="my-6 flex justify-center">
              <BoxQRCode payload={publicID} size={220} />
            </div>
            <code className="block break-all rounded-xl bg-elevated p-3 font-mono text-xs text-primary">{publicID}</code>
            <button onClick={() => void copyID()} className="mt-4 w-full rounded-xl border border-default py-3 text-sm text-primary">
              {copied ? "Copied" : "Copy ID"}
            </button>
            <button onClick={() => void shareID()} className="mt-3 w-full rounded-xl border border-default py-3 text-sm text-primary">
              Share ID
            </button>
            <button onClick={() => router.replace("/chats")} className="mt-3 h-11 w-full rounded-lg bg-accent text-sm font-medium text-white hover:bg-accent-hover">
              Continue
            </button>
          </>
        )}

        {error && <p role="alert" className="mt-4 text-sm text-error">{error}</p>}
      </section>
    </main>
  );
}
