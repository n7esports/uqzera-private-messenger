"use client";

import { useEffect, useState } from "react";
import { useChatStore, type ChatSummary } from "../../store/useChatStore";

export default function ChatInfoModal({
  chat,
  onClose,
}: {
  chat: ChatSummary;
  onClose: () => void;
}) {
  const updateChat = useChatStore((s) => s.updateChat);
  const deleteChat = useChatStore((s) => s.deleteChat);
  const showToast = useChatStore((s) => s.showToast);
  const [fingerprint, setFingerprint] = useState("Computing…");

  useEffect(() => {
    let cancelled = false;
    const key = chat.peerSigningPubKey || chat.recipientPubKey || chat.id;
    crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(key))
      .then((buffer) => {
        if (cancelled) return;
        const hex = Array.from(new Uint8Array(buffer))
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");
        setFingerprint(hex.match(/.{1,4}/g)?.join(" ") ?? hex);
      })
      .catch(() => {
        if (!cancelled) setFingerprint("Unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [chat.id, chat.peerSigningPubKey, chat.recipientPubKey]);

  const fail = () =>
    showToast({
      id: crypto.randomUUID(),
      message: "Could not update this chat.",
      type: "warning",
    });

  const setTimer = (hours: number) =>
    void updateChat(chat.id, {
      disappearingMs: hours ? hours * 3600000 : undefined,
    }).catch(fail);

  const toggleBlock = () =>
    void updateChat(chat.id, { blocked: !chat.blocked }).catch(fail);

  const removeChat = async () => {
    if (!window.confirm(`Delete the chat with ${chat.alias}? This cannot be undone.`)) return;
    try {
      await deleteChat(chat.id);
      onClose();
    } catch {
      fail();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Chat info for ${chat.alias}`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-white/10 bg-[#0d1117] p-5 text-sm text-gray-400"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{chat.alias}</h2>
          <button
            type="button"
            aria-label="Close chat info"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-gray-400 hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>

        <p className="mb-1 text-xs font-semibold text-white">Disappearing timer</p>
        <input
          type="range"
          min="0"
          max="24"
          step="1"
          aria-label="Disappearing timer"
          value={chat.disappearingMs ? chat.disappearingMs / 3600000 : 0}
          onChange={(event) => setTimer(Number(event.target.value))}
          className="w-full accent-emerald-500"
        />
        <div className="mb-4 flex justify-between text-xs">
          <span>Off</span>
          <span>24 hours</span>
        </div>

        <p className="mb-1 text-xs font-semibold text-white">Security fingerprint</p>
        <p className="mb-4 break-words font-mono text-xs text-gray-400">{fingerprint}</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void toggleBlock()}
            className="rounded-lg border border-white/10 bg-[#161b22] px-3 py-2 text-xs text-white hover:bg-white/10"
          >
            {chat.blocked ? "Unblock contact" : "Block contact"}
          </button>
          <button
            type="button"
            onClick={() => void removeChat()}
            className="rounded-lg border border-white/10 bg-[#161b22] px-3 py-2 text-xs text-red-400 hover:bg-white/10"
          >
            Delete chat
          </button>
        </div>
      </div>
    </div>
  );
}
