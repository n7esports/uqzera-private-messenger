"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useVaultStore } from "../../store/useVaultStore";
import { encodeBytes } from "../../lib/protocol";
import IconCopy from "../icons/IconCopy";
import BoxQRCode from "../icons/BoxQRCode";

export function MyIdentityModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const identity = useVaultStore((s) => s.identity);
  const profile = useVaultStore((s) => s.profile);
  const setProfile = useVaultStore((s) => s.setProfile);
  const lockVault = useVaultStore((s) => s.lockVault);

  const publicKey = useMemo(() => {
    if (!identity) return "";
    return encodeBytes(identity.encryptionPublicKey);
  }, [identity]);
  const publicID = publicKey ? `uqz1.${publicKey}` : "";

  // QR payload rotates on a 5-minute timer so the canvas re-renders with a
  // fresh timestamp. shortcut: visible QR doesn't change, only the embedded ts.
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(profile?.name ?? "");
      setBio(profile?.bio ?? "");
    }
  }, [open, profile]);

  const handleCopy = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      setError(null);
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "Could not copy the ID.");
    }
  };

  const handleSaveProfile = async () => {
    setError(null);
    try {
      await setProfile({ name, bio });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save your profile.");
    }
  };

  const handleSignOut = () => {
    lockVault();
    router.replace("/lock");
  };

  const deviceInfo = useMemo(() => {
    if (typeof navigator === "undefined") return "Unavailable";
    return navigator.userAgent;
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm bg-surface-container border border-hairline rounded-2xl p-6 shadow-panel">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-on-surface">Identity</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-surface-high hover:text-on-surface"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-xs font-medium tracking-wider text-on-surface-variant uppercase">
            AUDIT BOT • E2EE BOT LINK
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Device info */}
          <div>
            <p className="mb-1 text-xs font-medium text-on-surface-variant">Device</p>
            <p className="text-xs text-on-surface break-all">{deviceInfo}</p>
          </div>

          {/* Public key with copy */}
          {publicKey && (
            <div>
              <p className="mb-1 text-xs font-medium text-on-surface-variant">SHARE ID • X25519</p>
              <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface px-3 py-2">
                <code className="flex-1 truncate font-mono text-xs text-on-surface break-all">
                  {publicID}
                </code>
                <button
                  onClick={handleCopy}
                  className="rounded-lg p-1.5 text-primary transition hover:bg-surface-high"
                  title="Copy share ID"
                >
                  <IconCopy size={16} />
                </button>
              </div>
              <div className="mt-3 flex justify-center">
                <BoxQRCode payload={publicID} size={160} />
              </div>
              {copied && (
                <p className="mt-1 text-xs text-primary">Copied to clipboard.</p>
              )}
            </div>
          )}

          {/* Session fingerprint */}
          {publicKey && (
            <div>
              <p className="mb-1 text-xs font-medium text-on-surface-variant">SESSION FINGERPRINT • SHA-256</p>
              <div className="rounded-xl border border-hairline bg-surface px-3 py-2">
                <code className="font-mono text-xs text-on-surface break-all">
                  {publicKey.slice(0, 32).match(/.{1,8}/g)?.join(" ") || publicKey.slice(0, 32)}
                </code>
              </div>
            </div>
          )}

          {/* Profile */}
          <div>
            <label className="mb-1 block text-xs font-medium text-on-surface-variant">Name</label>
            <input
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-hairline bg-surface-container px-3 py-2 text-sm text-on-surface"
            />
            <label className="mb-1 mt-3 block text-xs font-medium text-on-surface-variant">Bio</label>
            <textarea
              value={bio}
              maxLength={160}
              rows={3}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-hairline bg-surface-container px-3 py-2 text-sm text-on-surface"
            />
            <button
              onClick={() => void handleSaveProfile()}
              className="mt-2 w-full rounded-xl bg-primary px-4 py-2 text-xs font-medium text-on-primary"
            >
              Save profile
            </button>
          </div>

          {/* Key rotation is not available in the DEK-backed vault flow. */}
          <div className="flex flex-col gap-2">
            <button disabled className="rounded-xl border border-outline-variant bg-surface-container px-4 py-2.5 text-xs font-medium text-on-surface-variant opacity-40">
              Change Key (unavailable)
            </button>
            {error && <p className="text-xs text-error">{error}</p>}
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="rounded-xl border border-outline-variant bg-surface-container px-4 py-2.5 text-xs font-medium text-on-surface-variant transition hover:border-outline-variant hover:text-on-surface"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
