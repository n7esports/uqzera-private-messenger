"use client";

import { useState, type CSSProperties } from "react";
import { copyTextToClipboard } from "../../lib/clipboard";
import { useChatStore, type ChatMessage } from "../../store/useChatStore";
import { ReplyIcon } from "../icons/outline/ReplyIcon";
import { ForwardIcon } from "../icons/outline/ForwardIcon";
import { CopyMessageIcon } from "../icons/outline/CopyMessageIcon";
import { ReactEmojiIcon } from "../icons/outline/ReactEmojiIcon";
import { DeleteForMeIcon } from "../icons/outline/DeleteForMeIcon";
import { DeleteForEveryoneIcon } from "../icons/outline/DeleteForEveryoneIcon";
import { PinMessageIcon } from "../icons/outline/PinMessageIcon";
import { StarMessageIcon } from "../icons/outline/StarMessageIcon";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
const MENU_WIDTH = 220;
const MENU_HEIGHT_ESTIMATE = 320;

const itemStyle: CSSProperties = {
  display: "flex",
  width: "100%",
  alignItems: "center",
  gap: 10,
  padding: "10px 16px",
  background: "transparent",
  border: 0,
  textAlign: "left",
  fontSize: 13,
  lineHeight: 1.35,
  color: "#E9EDEF",
  cursor: "pointer",
};

export default function MessageActions({
  message,
  isMe,
  chatAlias,
  position,
  onClose,
  onReply,
  onForward,
  onDeleteForEveryone,
}: {
  message: ChatMessage;
  isMe: boolean;
  chatAlias: string;
  position: { top: number; left: number };
  onClose: () => void;
  onReply: (_message: ChatMessage) => void;
  onForward: (_message: ChatMessage) => void;
  onDeleteForEveryone?: (_message: ChatMessage) => Promise<void> | void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const deleteMessages = useChatStore((state) => state.deleteMessages);
  const showToast = useChatStore((state) => state.showToast);

  const top =
    typeof window === "undefined"
      ? position.top
      : Math.max(
          8,
          Math.min(
            position.top,
            window.innerHeight - (pickerOpen ? MENU_HEIGHT_ESTIMATE + 40 : MENU_HEIGHT_ESTIMATE) - 8,
          ),
        );
  const left =
    typeof window === "undefined"
      ? position.left
      : Math.max(8, Math.min(position.left, window.innerWidth - MENU_WIDTH - 8));

  const copy = async () => {
    try {
      await copyTextToClipboard(message.content);
      showToast({
        id: crypto.randomUUID(),
        message: "Message copied.",
        type: "success",
      });
    } catch {
      showToast({
        id: crypto.randomUUID(),
        message: "Could not copy the message.",
        type: "warning",
      });
    }
    onClose();
  };

  const react = async (emoji: string) => {
    const next = [...(message.reactions ?? []), emoji].slice(-6);
    await updateMessage(message.id, { reactions: next });
    onClose();
  };

  const deleteForMe = async () => {
    await deleteMessages([message.id]);
    showToast({
      id: crypto.randomUUID(),
      message: "Message deleted for you.",
      type: "success",
    });
    onClose();
  };

  const deleteForEveryone = async () => {
    if (onDeleteForEveryone) {
      await onDeleteForEveryone(message);
    } else {
      await deleteMessages([message.id]);
    }
    showToast({
      id: crypto.randomUUID(),
      message: "Message deleted.",
      type: "success",
    });
    onClose();
  };

  const toggleStar = async () => {
    await updateMessage(message.id, {
      starred: !message.starred,
      pinned: !message.pinned,
    });
    showToast({
      id: crypto.randomUUID(),
      message: message.starred ? "Message unstarred." : "Message starred.",
      type: "success",
    });
    onClose();
  };

  return (
    <div
      role="group"
      aria-label="Message actions"
      style={{
        position: "fixed",
        top,
        left,
        zIndex: 10000,
        width: MENU_WIDTH,
        backgroundColor: "#0a1410",
        borderRadius: 12,
        boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
        border: "1px solid rgba(16,185,129,0.18)",
        padding: "6px 0",
        maxHeight: "calc(100vh - 16px)",
        overflowY: "auto",
      }}
    >
      <div role="menu" aria-label={`Actions for message from ${isMe ? "you" : chatAlias}`}>
        <button
          type="button"
          role="menuitem"
          style={itemStyle}
          onClick={() => {
            onReply(message);
            onClose();
          }}
        >
          <ReplyIcon size={15} />
          Reply
        </button>
        <button
          type="button"
          role="menuitem"
          style={itemStyle}
          onClick={() => {
            onForward(message);
            onClose();
          }}
        >
          <ForwardIcon size={15} />
          Forward
        </button>
        <button
          type="button"
          role="menuitem"
          style={itemStyle}
          onClick={() => void copy()}
        >
          <CopyMessageIcon size={15} />
          Copy
        </button>
        <button
          type="button"
          role="menuitem"
          aria-expanded={pickerOpen}
          style={itemStyle}
          onClick={() => setPickerOpen((value) => !value)}
        >
          <ReactEmojiIcon size={15} />
          React
        </button>
        {pickerOpen && (
          <div className="flex flex-wrap gap-1 px-4 pb-2" aria-label="Choose a reaction">
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                aria-label={`React with ${emoji}`}
                onClick={() => void react(emoji)}
                className="rounded-lg px-2 py-1 text-base transition hover:bg-white/10"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          role="menuitem"
          style={itemStyle}
          onClick={() => void toggleStar()}
        >
          {message.starred ? <StarMessageIcon size={15} /> : <PinMessageIcon size={15} />}
          {message.starred ? "Unstar / unpin message" : "Star / pin message"}
        </button>
        <div
          style={{
            margin: "6px 0 0",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 6,
          }}
        >
          <button
            type="button"
            role="menuitem"
            style={itemStyle}
            onClick={() => void deleteForMe()}
          >
            <DeleteForMeIcon size={15} />
            Delete for me
          </button>
          {isMe && (
            <button
              type="button"
              role="menuitem"
              style={{ ...itemStyle, color: "#F15C6D" }}
              onClick={() => void deleteForEveryone()}
            >
              <DeleteForEveryoneIcon size={15} />
              Delete for everyone
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
