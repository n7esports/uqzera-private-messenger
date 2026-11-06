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
}

export default function ChatMenu({ chatId, onClose }: ChatMenuProps) {
  const [open, setOpen] = useState(false);
  const chats = useChatStore((state) => state.chats);
  const deleteChat = useChatStore((state) => state.deleteChat);
  const showToast = useChatStore((state) => state.showToast);
  const chat = chats.find((entry) => entry.id === chatId);

  if (!chat) return null;

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

  return (
    <div className="relative">
      <button
        type="button"
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
          className="absolute right-0 z-30 mt-1 min-w-48 rounded-lg border border-border bg-surface p-2 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-md px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-high"
            onClick={() => void togglePinned()}
          >
            {chat.pinned ? "Unpin chat" : "Pin chat"}
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
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-high"
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
            className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-surface-high"
            onClick={() => void confirmDelete()}
          >
            Delete chat
          </button>
        </div>
      )}
    </div>
  );
}
