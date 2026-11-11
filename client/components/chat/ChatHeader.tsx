"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import { SearchMessagesIcon } from "../icons/outline/SearchMessagesIcon";
import IconMoreVertical from "../icons/IconMoreVertical";

export default function ChatHeader({
  alias,
  lastSeenAt,
  onBack,
  onSearch,
  onMore,
}: {
  alias: string;
  lastSeenAt?: number;
  onBack?: () => void;
  onSearch?: () => void;
  onMore?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  const lastSeen = lastSeenAt
    ? new Date(lastSeenAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <header
      className="relative flex h-14 flex-shrink-0 items-center justify-between border-b border-white/10 px-3 md:px-4"
      style={{
        backgroundColor: "rgba(10, 20, 16, 0.85)",
        backdropFilter: "blur(80px)",
        WebkitBackdropFilter: "blur(80px)",
        zIndex: 30,
      }}
    >
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to chats"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover"
          >
            <span aria-hidden="true" className="text-lg">
              ←
            </span>
          </button>
        )}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-bg-panel text-sm font-medium text-text-primary">
          {alias.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium text-text-primary">
            {alias}
          </h3>
          <p className="truncate text-xs text-text-secondary">
            E2EE Direct
            {lastSeen ? ` · Last seen ${lastSeen}` : ""}
          </p>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search messages"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover"
          title="Search messages"
        >
          <SearchMessagesIcon width={18} height={18} />
        </button>
        <button
          type="button"
          onClick={onMore}
          aria-label="More options"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover"
          title="More options"
        >
          <IconMoreVertical size={18} />
        </button>
      </div>
    </header>
  );
}
