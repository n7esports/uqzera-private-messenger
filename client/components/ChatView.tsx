"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore, type ChatMessage } from "../store/useChatStore";
import MessageBubble from "./MessageBubble";
import IconClock from "./icons/IconClock";
import IconLock from "./icons/IconLock";
import IconMoreVertical from "./icons/IconMoreVertical";
import IconReply from "./icons/IconReply";
import IconSearch from "./icons/IconSearch";
import IconSend from "./icons/IconSend";
import IconX from "./icons/IconX";

const EMPTY_MESSAGES: ChatMessage[] = [];

export function ChatView({
  chatId,
  onBack,
}: {
  chatId: string | null;
  onBack?: () => void;
}) {
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
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chat = chatId ? chats.find((entry) => entry.id === chatId) ?? null : null;

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
          <IconLock size={48} className="text-primary" />
          <p className="text-sm font-medium text-text-primary">No active session</p>
          <p className="text-xs text-text-secondary">
            Select a thread to establish an E2EE channel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-surface">
      <header className="flex items-center justify-between border-b border-border-default bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-lg border border-border-default px-2 py-1 text-xs text-text-secondary md:hidden"
            >
              Back
            </button>
          )}
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-on-surface">{chat.alias}</h3>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" title="Online" />
          </div>
          <span className="text-xs text-on-surface-variant">E2EE Direct</span>
          <span className="text-[10px] text-on-surface-variant">
            Last seen{" "}
            {new Date(chat.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-md p-2 hover:bg-surface-high" title="Search messages">
            <IconSearch size={18} />
          </button>
          <button className="rounded-md p-2 hover:bg-surface-high" title="More options">
            <IconMoreVertical size={18} />
          </button>
        </div>
      </header>

      <div className="flex justify-center px-4 pt-3">
        <button
          onClick={cycleEphemeralTtl}
          title="Click to change TTL"
          className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-surface-container px-3 py-1 text-xs text-text-secondary transition hover:bg-surface-high"
        >
          <IconClock size={12} />
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

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-24">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-outline">No messages yet. Say hello.</p>
        )}
        <div className="flex flex-col gap-3">
          {messages.map((message) => {
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

      <div className="flex-shrink-0 border-t border-border-default bg-surface">
        {replyTo && (
          <div className="flex items-center gap-2 border-b border-border-default bg-surface/40 px-4 py-2">
            <IconReply size={14} />
            <span className="flex-1 truncate text-xs text-text-secondary">
              Replying to {replyTo.alias}: {replyTo.excerpt}
            </span>
            <button
              onClick={() => setReplyTo(null)}
              aria-label="Cancel reply"
              className="rounded p-1 hover:bg-surface-high"
            >
              <IconX size={14} />
            </button>
          </div>
        )}
        <div className="p-4">
          <div className="flex items-end gap-2">
            <button
              onClick={cycleEphemeralTtl}
              title="Ephemeral TTL"
              className="rounded-lg border border-border-default bg-surface-container p-2 text-xs text-text-secondary transition hover:text-text-primary"
            >
              <IconClock size={16} />
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
              className="flex-1 resize-none rounded-xl border border-border-default bg-surface-container px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-primary"
            />
            <button
              onClick={() => void handleSend()}
              disabled={!content.trim()}
              aria-label="Send message"
              className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-40"
            >
              <span className="flex items-center gap-1.5">
                <IconSend size={16} />
                Encrypt &amp; Send
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
