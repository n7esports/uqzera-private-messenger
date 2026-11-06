"use client";

import IconSearch from "../icons/IconSearch";
import IconChat from "../icons/IconChat";
import IconSettings from "../icons/IconSettings";

export default function IconRail({ onSearchClick }: { onSearchClick?: () => void }) {
  return (
    <nav
      aria-label="Icon rail"
      className="flex h-screen w-16 flex-col items-center gap-2 border-r border-border bg-transparent py-3 glass"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent border border-border text-sm font-semibold text-white">
        U
      </div>
      <div className="my-1 h-px w-8 bg-border" />
      <button
        type="button"
        aria-label="Search chats"
        onClick={onSearchClick}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover hover:text-text-primary"
      >
        <IconSearch size={18} />
      </button>
      <button
        type="button"
        aria-label="Chats"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover hover:text-text-primary"
      >
        <IconChat size={18} />
      </button>
      <div className="mt-auto flex flex-col items-center gap-2">
        <a
          href="/settings"
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover hover:text-text-primary"
        >
          <IconSettings size={18} />
        </a>
      </div>
    </nav>
  );
}
