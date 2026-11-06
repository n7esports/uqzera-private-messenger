"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useChatStore,
  type ChatState,
  type ChatSummary,
} from "../../store/useChatStore";
import IconBellOff from "../icons/IconBellOff";
import IconLock from "../icons/IconLock";
import IconChat from "../icons/IconChat";
import IconMoreVertical from "../icons/IconMoreVertical";
import IconTrash from "../icons/IconTrash";
import IconX from "../icons/IconX";

const MAX_PINNED_CHATS = 3;
const ARCHIVED_LIST_ID = "archived";

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function initials(alias: string): string {
  return alias
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isMuted(chat: ChatSummary): boolean {
  return Boolean(
    chat.mutedForever ||
      (chat.mutedUntil !== undefined && chat.mutedUntil > Date.now()),
  );
}

export default function ChatList({
  guideActive,
  onOpenChat,
  onOpenGuide,
}: {
  guideActive: boolean;
  onOpenChat?: () => void;
  onOpenGuide?: () => void;
}) {
  const chats = useChatStore((state: ChatState) => state.chats);
  const messagesMap = useChatStore((state: ChatState) => state.messagesMap);
  const activeChatId = useChatStore((state: ChatState) => state.activeChatId);
  const setActiveChat = useChatStore((state: ChatState) => state.setActiveChat);
  const updateChat = useChatStore((state: ChatState) => state.updateChat);
  const clearChatMessages = useChatStore(
    (state: ChatState) => state.clearChatMessages,
  );
  const deleteChat = useChatStore((state: ChatState) => state.deleteChat);
  const [menuChatId, setMenuChatId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { activeChats, archivedChats, pinnedChats, regularChats } = useMemo(() => {
    const active = chats
      .filter((chat) => chat.listId !== ARCHIVED_LIST_ID)
      .sort((left, right) => right.updatedAt - left.updatedAt);
    const pinned = active.filter((chat) => chat.pinned);
    const displayedPinned = pinned.slice(0, MAX_PINNED_CHATS);
    const pinnedIds = new Set(displayedPinned.map((chat) => chat.id));
    return {
      activeChats: active,
      archivedChats: chats
        .filter((chat) => chat.listId === ARCHIVED_LIST_ID)
        .sort((left, right) => right.updatedAt - left.updatedAt),
      pinnedChats: displayedPinned,
      regularChats: active.filter((chat) => !pinnedIds.has(chat.id)),
    };
  }, [chats]);

  useEffect(() => {
    const closeMenuOutsideList = (event: MouseEvent) => {
      if (!listRef.current?.contains(event.target as Node)) setMenuChatId(null);
    };
    document.addEventListener("click", closeMenuOutsideList);
    return () => document.removeEventListener("click", closeMenuOutsideList);
  }, []);

  const selectChat = (chatId: string) => {
    setActiveChat(chatId);
    onOpenChat?.();
    setMenuChatId(null);
  };

  const togglePinned = async (chat: ChatSummary) => {
    if (!chat.pinned && activeChats.filter((entry) => entry.pinned).length >= MAX_PINNED_CHATS) {
      setMenuChatId(null);
      return;
    }
    await updateChat(chat.id, { pinned: !chat.pinned });
    setMenuChatId(null);
  };

  const toggleArchived = async (chat: ChatSummary) => {
    await updateChat(
      chat.id,
      chat.listId === ARCHIVED_LIST_ID
        ? { listId: undefined }
        : { listId: ARCHIVED_LIST_ID, pinned: false },
    );
    setMenuChatId(null);
  };

  const toggleMuted = async (chat: ChatSummary) => {
    await updateChat(
      chat.id,
      isMuted(chat)
        ? { mutedForever: false, mutedUntil: undefined }
        : { mutedForever: true, mutedUntil: undefined },
    );
    setMenuChatId(null);
  };

  const renderChat = (chat: ChatSummary) => {
    const messages = messagesMap[chat.id] ?? [];
    const lastMessage = messages[messages.length - 1];
    const timestamp = lastMessage?.timestamp ?? chat.updatedAt;
    const preview =
      lastMessage?.content ||
      (lastMessage?.type === "image"
        ? "Photo"
        : lastMessage?.type === "file"
          ? "File"
          : chat.kind === "notes"
            ? "Private Notes"
            : "No messages yet");
    const muted = isMuted(chat);
    const archived = chat.listId === ARCHIVED_LIST_ID;
    const menuOpen = menuChatId === chat.id;
    const pinnedCount = activeChats.filter((entry) => entry.pinned).length;

    return (
      <li
        key={chat.id}
        data-chat-id={chat.id}
        className="relative list-none"
        onContextMenu={(event) => {
          event.preventDefault();
          setMenuChatId(chat.id);
        }}
      >
        <div className="flex items-center pr-2">
          <button
            type="button"
            onClick={() => selectChat(chat.id)}
            aria-pressed={activeChatId === chat.id}
            className={`flex h-[72px] min-w-0 flex-1 items-center gap-3 px-4 py-0 text-left transition focus:ring-2 focus:ring-accent ${
              activeChatId === chat.id ? "bg-bg-selected" : "hover:bg-bg-hover"
            }`}
          >
            <span className="relative flex h-[49px] w-[49px] flex-shrink-0 items-center justify-center rounded-full bg-bg-panel">
              {chat.alias === "Private Notes" ? (
                <IconLock size={22} className="text-accent" />
              ) : (
                <span className="text-base font-medium text-text-primary">
                  {initials(chat.alias)}
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1 truncate text-base font-normal text-text-primary">
                  <span className="truncate">{chat.alias}</span>
                  {muted && (
                    <span title="Muted" aria-label="Muted" className="flex-shrink-0">
                      <IconBellOff size={13} aria-hidden="true" />
                    </span>
                  )}
                </span>
                <time
                  dateTime={new Date(timestamp).toISOString()}
                  aria-label={`${chat.alias} last message time`}
                  className="flex-shrink-0 text-xs tabular-nums text-text-secondary"
                >
                  {formatTime(timestamp)}
                </time>
              </span>
              <span className="mt-0.5 flex items-center justify-between gap-2">
                <span className="truncate text-sm text-text-secondary">
                  {lastMessage?.outgoing ? `You: ${preview}` : preview}
                </span>
                {chat.unreadCount > 0 && (
                  <span
                    aria-label={`${chat.unreadCount} unread messages`}
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white"
                  >
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </span>
                )}
              </span>
            </span>
          </button>
          <button
            type="button"
            aria-label={`More options for ${chat.alias}`}
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuChatId((current) => (current === chat.id ? null : chat.id))
            }
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-high hover:text-on-surface"
          >
            <IconMoreVertical size={18} aria-hidden="true" />
          </button>
        </div>
        {menuOpen && (
          <div
            role="group"
            aria-label={`${chat.alias} options`}
            className="absolute right-2 top-10 z-50 w-48 rounded-xl border border-hairline bg-surface-container py-1 shadow-panel"
          >
            {!archived && (
              <button
                type="button"
                disabled={!chat.pinned && pinnedCount >= MAX_PINNED_CHATS}
                onClick={() => void togglePinned(chat)}
                className="flex w-full items-center px-3 py-2 text-left text-xs text-on-surface hover:bg-surface-high disabled:cursor-not-allowed disabled:opacity-50"
              >
                {chat.pinned
                  ? "Unpin chat"
                  : pinnedCount >= MAX_PINNED_CHATS
                    ? "Pin limit reached (3)"
                    : "Pin chat"}
              </button>
            )}
            <button
              type="button"
              onClick={() => void toggleArchived(chat)}
              className="flex w-full items-center px-3 py-2 text-left text-xs text-on-surface hover:bg-surface-high"
            >
              {archived ? "Unarchive chat" : "Archive chat"}
            </button>
            <button
              type="button"
              onClick={() => void toggleMuted(chat)}
              className="flex w-full items-center px-3 py-2 text-left text-xs text-on-surface hover:bg-surface-high"
            >
              {muted ? "Unmute chat" : "Mute chat"}
            </button>
            <button
              type="button"
              onClick={() => {
                void clearChatMessages(chat.id).then(() => setMenuChatId(null));
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-on-surface hover:bg-surface-high"
            >
              <IconX size={14} aria-hidden="true" /> Clear chat
            </button>
            <button
              type="button"
              onClick={() => {
                if (!window.confirm(`Delete the chat with ${chat.alias}? This cannot be undone.`)) return;
                void deleteChat(chat.id).then(() => setMenuChatId(null));
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-error hover:bg-surface-high"
            >
              <IconTrash size={14} aria-hidden="true" /> Delete chat
            </button>
          </div>
        )}
      </li>
    );
  };

  return (
    <div
      ref={listRef}
      role="region"
      aria-label="Chat list"
      className="flex-1 overflow-y-auto no-scrollbar"
    >
      <section aria-labelledby="pinned-heading">
        <h2
          id="pinned-heading"
          className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant"
        >
          Pinned
        </h2>
        <ul>
          <li className="list-none">
            <button
              type="button"
              onClick={() => {
                onOpenGuide?.();
                setMenuChatId(null);
              }}
              aria-pressed={guideActive}
              className={`flex h-[72px] w-full items-center gap-3 px-4 py-0 text-left transition ${
                guideActive ? "bg-bg-selected" : "hover:bg-bg-hover"
              }`}
            >
              <span className="flex h-[49px] w-[49px] flex-shrink-0 items-center justify-center rounded-full bg-bg-panel text-accent">
                <IconChat size={20} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-normal text-text-primary">
                  Guide
                </span>
                <span className="block truncate text-sm text-text-secondary">
                  Your quick-start guide
                </span>
              </span>
              <span className="sr-only">Pinned</span>
            </button>
          </li>
          {pinnedChats.map(renderChat)}
        </ul>
      </section>

      <section aria-labelledby="chats-heading">
        <h2
          id="chats-heading"
          className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant"
        >
          Chats
        </h2>
        {regularChats.length === 0 ? (
          <p className="px-4 py-3 text-xs text-on-surface-variant">
            No conversations found
          </p>
        ) : (
          <ul>{regularChats.map(renderChat)}</ul>
        )}
      </section>

      {archivedChats.length > 0 && (
        <details className="group border-t border-hairline">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-semibold text-on-surface-variant hover:bg-surface">
            <span>Archived</span>
            <span>{archivedChats.length}</span>
          </summary>
          {archivedChats.length === 0 ? (
            <p className="px-4 pb-3 text-xs text-on-surface-variant">
              No archived chats
            </p>
          ) : (
            <ul>{archivedChats.map(renderChat)}</ul>
          )}
        </details>
      )}
    </div>
  );
}
