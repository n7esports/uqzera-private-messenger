"use client";

import { motion } from "framer-motion";
import { useChatStore, type ChatMessage } from "../store/useChatStore";
import { ClockPendingIcon } from "./icons/outline/ClockPendingIcon";
import { SingleTickSentIcon } from "./icons/outline/SingleTickSentIcon";
import { DoubleTickReadIcon } from "./icons/outline/DoubleTickReadIcon";
import { BlueTicksDeliveredIcon } from "./icons/outline/BlueTicksDeliveredIcon";
import { FailedMessageIcon } from "./icons/outline/FailedMessageIcon";

type DisplayStatus = ChatMessage["status"] | "failed";

function DeliveryStatus({ status }: { status: DisplayStatus }) {
  const indicators = {
    queued: {
      label: "Sending",
      className: "text-text-secondary",
      icon: <ClockPendingIcon width={14} height={14} />,
    },
    relayAccepted: {
      label: "Relay accepted",
      className: "text-text-secondary",
      icon: <DoubleTickReadIcon width={14} height={14} />,
    },
    sent: {
      label: "Sent",
      className: "text-text-secondary",
      icon: <SingleTickSentIcon width={14} height={14} />,
    },
    delivered: {
      label: "Delivered",
      className: "text-text-secondary",
      icon: <BlueTicksDeliveredIcon width={14} height={14} />,
    },
    read: {
      label: "Read",
      className: "text-text-secondary",
      icon: <DoubleTickReadIcon width={14} height={14} />,
    },
    failed: {
      label: "Failed to send",
      className: "text-error",
      icon: <FailedMessageIcon width={14} height={14} />,
    },
  } satisfies Record<DisplayStatus, { label: string; className: string; icon: React.ReactNode }>;
  const indicator = indicators[status];

  return (
    <span
      role="img"
      aria-label={indicator.label}
      className={indicator.className}
      title={indicator.label}
    >
      {indicator.icon}
    </span>
  );
}

export default function MessageBubble({
  message,
  isMe,
}: {
  message: ChatMessage;
  isMe: boolean;
}) {
  const alignment = isMe ? "justify-end" : "justify-start";
  const bubbleMargin = isMe ? "ml-auto" : "mr-auto";
  const bubbleBg = isMe ? "bg-bubble-out" : "text-text-primary";
  const bubbleGlass = isMe ? "" : "glass";
  const bubbleRadius = isMe ? "rounded-xl rounded-tr-sm rounded-br-xl" : "rounded-xl rounded-tl-sm rounded-bl-xl";
  const status = message.status as DisplayStatus;

  return (
    <div className={`relative flex ${alignment} gap-2`}>
      <motion.div
        className={`inline-flex flex-col ${bubbleRadius} px-2.5 py-1.5 max-w-[75%] text-sm ${bubbleMargin} ${bubbleBg} ${bubbleGlass} break-words text-text-primary w-fit`}
        drag={isMe ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (isMe && info.offset.x < -50) {
            useChatStore.getState().setReplyTo({
              id: message.id,
              alias: message.senderPubKey.slice(0, 8),
              excerpt: message.content,
            });
          }
        }}
      >
        {message.replyTo && (
          <div className="mb-2 rounded-lg border border-hairline bg-surface/60 px-3 py-2">
            <p className="text-[10px] font-medium text-text-primary">{message.replyTo.alias}</p>
            <p className="line-clamp-1 text-xs text-text-secondary">
              {message.replyTo.excerpt}
            </p>
          </div>
        )}

        <p className="whitespace-pre-wrap break-words text-[13px] leading-tight text-text-primary">
          {message.content}
        </p>

        <div className="mt-0.5 flex items-end justify-end gap-1">
          {isMe && <DeliveryStatus status={status} />}
          <span className="text-[10px] text-white/70 ml-2 inline-flex items-center gap-0.5 self-end mt-1 tabular-nums">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
