"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore, type ChatMessage } from "../store/useChatStore";
import { useRouter } from "next/navigation";
import MessageBubble from "./MessageBubble";
import { ClockPendingIcon } from "./icons/outline/ClockPendingIcon";
import { VaultLockIcon } from "./icons/outline/VaultLockIcon";
import IconMoreVertical from "./icons/IconMoreVertical";
import IconReply from "./icons/IconReply";
import { SearchMessagesIcon } from "./icons/outline/SearchMessagesIcon";
import { SendIcon } from "./icons/outline/SendIcon";
import IconClose from "./icons/ui/IconClose";
import ChatMenu from "./chatList/ChatMenu";

const EMPTY_MESSAGES: ChatMessage[] = [];

export function ChatView({
  chatId,
  onBack,
  onAddContact,
  onOpenGuide,
}: {
  chatId: string | null;
  onBack?: () => void;
  onAddContact?: () => void;
  onOpenGuide?: () => void;
}) {
  const router = useRouter();
  const messages = useChatStore((state) =>
    chatId ? state.messagesMap[chatId] ?? EMPTY_MESSAGES : EMPTY_MESSAGES,
  );
  const chats = useChatStore((state) => state.chats);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const showToast = useChatStore((state) => state.showToast);
  const ephemeralTtl = useChatStore((state) => state.ephemeralTtl);
  const setEphemeralTtl = useChatStore((state) => state.setEphemeralTtl);
  const isPeerTyping = useChatStore((state) =>
    chatId ? !!state.peerTypingByChat[chatId] : false,
  );
  const broadcastTyping = useChatStore((state) => state.broadcastTyping);
  const replyTo = useChatStore((state) => state.replyTo);
  const setReplyTo = useChatStore((state) => state.setReplyTo);

  const [content, setContent] = useState("");
const [searchOpen, setSearchOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chat = chatId ? chats.find((entry) => entry.id === chatId) ?? null : null;
const filteredMessages = searchQuery.trim()
  ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  : messages;

  const handleSend = async () => {
    const text = content.trim();
    if (!text || !chatId) return;

    broadcastTyping(chatId, false);
    try {
      await sendMessage(
        text,
        "text",
        ephemeralTtl ?? undefined,
        undefined,
        replyTo ?? undefined,
      );
      setContent("");
      setReplyTo(null);
    } catch (error) {
      showToast({
        id: crypto.randomUUID(),
        message: `Send failed: ${error}`,
        type: "warning",
      });
    }
  };

  const cycleEphemeralTtl = () => {
    const presets = [0, 60, 300, 900, 3600];
    const index = presets.indexOf(ephemeralTtl ?? 0);
    const next = presets[(index + 1) % presets.length];
    setEphemeralTtl(next || null);
  };

  useEffect(() => {
    if (!content && chatId) broadcastTyping(chatId, false);
  }, [content, chatId, broadcastTyping]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages.length, isPeerTyping]);

  if (!chatId || !chat) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-2">
          <VaultLockIcon width={48} height={48} className="text-primary" />
          <p className="text-sm font-medium text-text-primary">No active session</p>
          <p className="text-xs text-text-secondary">
            Select a thread to establish an E2EE channel.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button type="button" aria-label="Start chat" onClick={onAddContact} className="h-9 rounded-lg bg-bg-panel px-3 text-sm text-text-primary hover:bg-accent/15">Start chat</button>
            <button type="button" aria-label="Setting up" onClick={() => router.push("/settings")} className="h-9 rounded-lg bg-bg-panel px-3 text-sm text-text-primary hover:bg-accent/15">Setting up</button>
            <button type="button" aria-label="Add contact" onClick={onAddContact} className="h-9 rounded-lg bg-bg-panel px-3 text-sm text-text-primary hover:bg-accent/15">Add contact</button>
            <button type="button" aria-label="Guide" onClick={onOpenGuide} className="h-9 rounded-lg bg-bg-panel px-3 text-sm text-text-primary hover:bg-accent/15">Guide</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col relative bg-surface">
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: "url('/doodle-pattern.svg')", backgroundRepeat: "repeat", backgroundSize: "300px 300px", opacity: 0.15 }} />
      <header className="flex h-14 items-center justify-between border-b border-border sidebar-glass px-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover"
            >
              <span className="text-lg">←</span>
            </button>
          )}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-bg-panel text-sm font-medium text-text-primary">
            {chat.alias.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium text-text-primary">{chat.alias}</h3>
            <p className="truncate text-xs text-text-secondary">
              E2EE Direct · Last seen{" "}
              {new Date(chat.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
<div className="flex items-center gap-1">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover"
            title="Search messages"
            onClick={() => {
              setSearchOpen((prev) => !prev);
              if (searchOpen) setSearchQuery("");
            }}
          >
            <SearchMessagesIcon width={18} height={18} />
          </button>
          <ChatMenu chatId={chatId!} />
        </div>
      </header>
      {searchOpen && (
        <div className="px-4 py-2 border-b border-border">
          <input
            type="text"
            placeholder="Search messages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-panel text-text-primary px-3 py-1.5 rounded-lg outline-none"
            autoFocus
          />
        </div>
      )}

      <div className="flex justify-center px-4 pt-3">
        <button
          onClick={cycleEphemeralTtl}
          title="Click to change TTL"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-container px-3 py-1 text-xs text-text-secondary transition hover:bg-surface-high"
        >
          <ClockPendingIcon width={12} height={12} />
          Messages auto-shred after{" "}
          {ephemeralTtl
            ? ephemeralTtl / 60 > 0
              ? `${ephemeralTtl / 60} min`
              : `${ephemeralTtl}s`
            : "off"}
        </button>
      </div>

      <div className="flex justify-center px-4 pb-2 pt-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
          Session established · X25519 + AES-256-GCM
        </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 pb-24" style={{ backgroundImage: "radial-gradient(rgba(16,185,129,0.08) 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
        {filteredMessages.length === 0 && (
          <p className="py-8 text-center text-sm text-outline">No messages yet. Say hello.</p>
        )}
        <div className="flex flex-col gap-3">
          {filteredMessages.map((message) => {
            const isMe = message.senderPubKey === "me" || message.outgoing;
            return (
              <div
                key={message.id}
                className={`group flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <MessageBubble message={message} isMe={isMe} />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {isPeerTyping && (
        <div className="flex items-center gap-1 px-4 pb-1">
          <span className="text-[10px] text-text-secondary">Peer is typing</span>
          <span className="flex gap-0.5">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="h-1 w-1 animate-bounce rounded-full bg-text-secondary"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </span>
        </div>
      )}

      <div className="flex-shrink-0 border-t border-border bg-bg-sidebar glass-strong">
        {replyTo && (
          <div className="flex items-center gap-2 border-b border-border bg-bg-sidebar px-4 py-2">
            <IconReply size={14} />
            <span className="flex-1 truncate text-xs text-text-secondary">
              Replying to {replyTo.alias}: {replyTo.excerpt}
            </span>
            <button
              onClick={() => setReplyTo(null)}
              aria-label="Cancel reply"
              className="rounded p-1 hover:bg-bg-hover"
            >
              <IconClose width={14} height={14} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 px-4 py-2">
          <button
            onClick={cycleEphemeralTtl}
            title="Ephemeral TTL"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-text-secondary transition hover:bg-bg-hover"
          >
            <ClockPendingIcon width={16} height={16} />
          </button>
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              broadcastTyping(chatId, true);
            }}
            aria-label="Message"
            placeholder="Write encrypted message..."
            rows={1}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            className="h-12 flex-1 resize-none rounded-[20px] border-0 bg-bg-panel px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={() => void handleSend()}
            disabled={!content.trim()}
            aria-label="Send message"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-accent-emerald/20 text-accent-emerald transition hover:bg-accent-emerald/40 disabled:opacity-40"
          >
            <SendIcon width={20} height={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
