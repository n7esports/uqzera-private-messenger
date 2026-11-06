"use client";

import { useState, useEffect, useCallback } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useVaultStore } from "../../store/useVaultStore";
import { decodeBytes, encodeBytes } from "../../lib/protocol";
import { parseShareKey } from "../../lib/contracts/shareKey";
import IconCopy from "../icons/IconCopy";
import BoxQRCode from "../icons/BoxQRCode";

export default function AddContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"mycode" | "add">("mycode");
  const [hexKey, setHexKey] = useState("");
  const [nickname, setNickname] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identity = useVaultStore((s) => s.identity);
  const chats = useChatStore((s) => s.chats);
  const addContact = useChatStore((s) => s.addContact);
  const showToast = useChatStore((s) => s.showToast);
  const myCodeID = identity
    ? `uqz1.${[...identity.encryptionPublicKey, ...identity.signingPublicKey]
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")}`
    : "";

  // Reset when opening
  useEffect(() => {
    if (open) {
      setTab("mycode");
      setHexKey("");
      setNickname("");
      setCopied(false);
      setSaving(false);
      setError(null);
    }
  }, [open]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(myCodeID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [myCodeID]);

  const handleSaveContact = async () => {
    setError(null);
    const alias = nickname.trim();
    if (alias.length < 1 || alias.length > 40) {
      setError("Nickname must be 1–40 characters.");
      return;
    }
    let publicKey: Uint8Array;
    const pastedKey = hexKey.trim();
    if (pastedKey.startsWith("uqz1.")) {
      const parsed = parseShareKey(pastedKey, myCodeID || undefined);
      if (!parsed.ok) {
        setError(
          parsed.reason === "self"
            ? "You cannot add your own identity as a contact."
            : "Enter a valid uqz1. ID or public key.",
        );
        return;
      }
      publicKey = parsed.bytes.slice(0, 32);
    } else {
      const legacyKey = pastedKey
        .replace(/[\s\u200B-\u200D\uFEFF]/g, "")
        .replace(/^cloak:/i, "");
      try {
        publicKey = /^[0-9a-f]{64}$/i.test(legacyKey)
          ? Uint8Array.from(
              legacyKey.match(/.{2}/g) ?? [],
              (byte) => Number.parseInt(byte, 16),
            )
          : decodeBytes(legacyKey);
      } catch {
        setError("Enter a valid uqz1. ID or public key.");
        return;
      }
      if (publicKey.length !== 32) {
        setError("Enter a valid uqz1. ID or public key.");
        return;
      }
      if (
        identity &&
        publicKey.every((byte, index) => byte === identity.encryptionPublicKey[index])
      ) {
        setError("You cannot add your own identity as a contact.");
        return;
      }
    }
    const normalizedKey = encodeBytes(publicKey);
    if (chats.some((chat) => chat.recipientPubKey === normalizedKey)) {
      setError("This contact is already in your contacts.");
      return;
    }
    setSaving(true);
    try {
      const chat = await addContact(alias, normalizedKey);
      showToast({ id: crypto.randomUUID(), message: `Contact "${chat.alias}" added.`, type: "success" });
      setHexKey("");
      setNickname("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add contact.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex w-full max-w-md flex-col rounded-lg border border-hairline bg-surface-container shadow-panel glass-strong">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h3 className="font-sans text-base font-semibold text-on-surface">
            Add Contact
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
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

        {/* Tabs */}
        <div className="flex border-b border-hairline px-4">
          <button
            onClick={() => setTab("mycode")}
            className={`flex-1 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              tab === "mycode"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            My Code
          </button>
          <button
            onClick={() => setTab("add")}
            className={`flex-1 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              tab === "add"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Add Contact
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {tab === "mycode" && (
            <div className="flex flex-col items-center gap-4">
              {/* QR with center IconKey */}
              <div className="relative rounded-xl border border-hairline bg-surface-container p-3">
                {myCodeID && (
                  <BoxQRCode payload={myCodeID} size={192} />
                )}
              </div>

              {/* Share ID + copy */}
              {myCodeID && (
                <div className="flex w-full items-center gap-2 rounded-xl border border-hairline bg-surface-container px-3 py-2">
                  <code className="flex-1 truncate font-mono text-xs text-on-surface">
                    {myCodeID}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="rounded-lg p-1.5 text-primary transition hover:bg-surface-high"
                  >
                    <IconCopy size={16} />
                  </button>
                </div>
              )}
              {copied && (
                <p className="text-xs text-primary">Copied to clipboard.</p>
              )}
            </div>
          )}

          {tab === "add" && (
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-on-surface-variant">
                  Contact Share ID or Public Key
                </span>
                <div className="flex gap-2">
                  <input
                    value={hexKey}
                    onChange={(e) => setHexKey(e.target.value)}
                    placeholder="uqz1. ID or Base64 public key"
                    className="flex-1 rounded-xl border border-hairline bg-surface-container px-3 py-2.5 font-mono text-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-on-surface-variant">
                  Nickname
                </span>
                <input
                  value={nickname}
                  maxLength={40}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="How you know them"
                  className="w-full rounded-xl border border-hairline bg-surface-container px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
                />
              </label>

              {error && <p className="text-xs text-error">{error}</p>}

              <button
                onClick={handleSaveContact}
                disabled={saving}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Contact"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
