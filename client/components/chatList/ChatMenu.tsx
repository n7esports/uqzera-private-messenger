"use client";

import { useState } from "react";
import {
  CHAT_DISAPPEARING_TIMER_MS,
  CHAT_DISAPPEARING_TIMER_OPTIONS,
  MAX_PINNED_CHATS,
  canPinChat,
  setChatDisappearingTimer,
  setChatPinned,
} from "../../lib/chatMeta";
import { useChatStore } from "../../store/useChatStore";

interface ChatMenuProps {
  chatId: string;
  onClose?: () => void;
  onCloseChat?: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

export default function ChatMenu({ chatId, onClose, onCloseChat, buttonRef }: ChatMenuProps) {
  const [open, setOpen] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const chats = useChatStore((state) => state.chats);
  const messagesMap = useChatStore((state) => state.messagesMap);
  const deleteChat = useChatStore((state) => state.deleteChat);
  const clearChatMessages = useChatStore((state) => state.clearChatMessages);
  const updateChat = useChatStore((state) => state.updateChat);
  const showToast = useChatStore((state) => state.showToast);
  const chat = chats.find((entry) => entry.id === chatId);

  if (!chat) return null;

  const messages = messagesMap[chatId] ?? [];

  const reportFailure = () =>
    showToast({
      id: crypto.randomUUID(),
      message: "Could not update this chat.",
      type: "warning",
    });

  const closeMenu = () => {
    setOpen(false);
    onClose?.();
  };

  const togglePinned = async () => {
    const nextPinned = !chat.pinned;
    if (nextPinned && !canPinChat(chats, chat.id)) {
      showToast({
        id: crypto.randomUUID(),
        message: `You can pin up to ${MAX_PINNED_CHATS} chats.`,
        type: "warning",
      });
      return;
    }
    try {
      if (!(await setChatPinned(chat.id, nextPinned))) {
        reportFailure();
        return;
      }
      closeMenu();
    } catch {
      reportFailure();
    }
  };

  const chooseTimer = async (timer: number | null) => {
    try {
      await setChatDisappearingTimer(chat.id, timer);
      closeMenu();
    } catch {
      reportFailure();
    }
  };

  const confirmDelete = async () => {
    if (!window.confirm(`Delete the chat with ${chat.alias}? This cannot be undone.`)) return;
    try {
      await deleteChat(chat.id);
      closeMenu();
    } catch {
      reportFailure();
    }
  };

  const clearChat = async () => {
    if (!window.confirm("Clear all messages in this chat?")) return;
    try {
      await clearChatMessages(chat.id);
      closeMenu();
    } catch {
      reportFailure();
    }
  };

  const closeChat = () => {
    closeMenu();
    onCloseChat?.();
  };

  const toggleMute = async () => {
    try {
      await updateChat(
        chat.id,
        chat.mutedForever
          ? { mutedForever: false, mutedUntil: undefined }
          : { mutedForever: true, mutedUntil: undefined },
      );
      closeMenu();
    } catch {
      reportFailure();
    }
  };

  const exportChat = () => {
    const lines = messages.map((m) => {
      const sender = m.senderPubKey === "me" || m.outgoing ? "You" : chat.alias;
      const time = new Date(m.timestamp).toLocaleString();
      return `[${time}] ${sender}: ${m.content}`;
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chat.alias}-chat.txt`;
    a.click();
    URL.revokeObjectURL(url);
    closeMenu();
  };

  const contactInfo = () => {
    setShowContactInfo(true);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        ref={buttonRef}
        aria-label={`Chat options for ${chat.alias}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-md p-2 text-text-secondary hover:bg-surface-high"
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">⋯</span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label={`Chat options for ${chat.alias}`}
          style={{
            backgroundColor: 'rgba(10, 20, 16, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
            zIndex: 50,
            position: 'absolute',
          }}
          className="right-0 top-full mt-2 min-w-[220px] w-max max-w-[280px] p-2"
        >
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-md whitespace-nowrap px-4 py-2.5 text-sm text-text-primary hover:bg-surface-high"
            onClick={() => void togglePinned()}
          >
            {chat.pinned ? "Unpin chat" : "Pin chat"}
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-md whitespace-nowrap px-4 py-2.5 text-sm text-text-primary hover:bg-surface-high"
            onClick={() => void clearChat()}
          >
            Clear chat
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-md whitespace-nowrap px-4 py-2.5 text-sm text-text-primary hover:bg-surface-high"
            onClick={() => closeChat()}
          >
            Close chat
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-md whitespace-nowrap px-4 py-2.5 text-sm text-text-primary hover:bg-surface-high"
            onClick={() => void toggleMute()}
          >
            {chat.mutedForever ? "Unmute notifications" : "Mute notifications"}
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-md whitespace-nowrap px-4 py-2.5 text-sm text-text-primary hover:bg-surface-high"
            onClick={() => contactInfo()}
          >
            Contact info
          </button>
          <div className="border-t border-border-default py-2">
            <p className="px-3 pb-1 text-xs text-text-secondary">Disappearing messages</p>
            {CHAT_DISAPPEARING_TIMER_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                role="menuitemradio"
                aria-checked={
                  (option.value === null && chat.disappearingMs === undefined) ||
                  chat.disappearingMs === option.value
                }
                className="block w-full rounded-md whitespace-nowrap px-4 py-2.5 text-sm text-text-primary hover:bg-surface-high"
                onClick={() => void chooseTimer(option.value)}
              >
                {option.label}
              </button>
            ))}
            {chat.disappearingMs === CHAT_DISAPPEARING_TIMER_MS && (
              <p className="px-3 pt-1 text-xs text-text-secondary">
                Applies to messages in this chat.
              </p>
            )}
          </div>
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-md whitespace-nowrap px-4 py-2.5 text-sm text-text-primary hover:bg-surface-high"
            onClick={() => exportChat()}
          >
            Export chat
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-md whitespace-nowrap px-4 py-2.5 text-sm text-red-600 hover:bg-surface-high"
            onClick={() => void confirmDelete()}
          >
            Delete chat
          </button>
        </div>
      )}
      {showContactInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg border border-border bg-surface p-4 shadow-lg max-w-sm">
            <p className="text-sm font-medium text-text-primary mb-2">Contact info</p>
            <p className="text-xs text-text-secondary mb-1">Alias: {chat.alias}</p>
            <p className="text-xs text-text-secondary mb-3">ID: {chat.id.slice(0, 10)}…</p>
            <button
              type="button"
              className="rounded bg-primary px-3 py-1 text-xs text-on-primary"
              onClick={() => {
                void navigator.clipboard.writeText(chat.id.slice(0, 10));
                setShowContactInfo(false);
              }}
            >
              Copy
            </button>
            <button
              type="button"
              className="ml-2 rounded bg-surface-high px-3 py-1 text-xs text-text-primary"
              onClick={() => setShowContactInfo(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}