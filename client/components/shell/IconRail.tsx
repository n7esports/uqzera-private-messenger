"use client";

import { useVaultStore } from "../../store/useVaultStore";
import { SearchChatsIcon } from "../icons/outline/SearchChatsIcon";
import { ChatBubbleIcon } from "../icons/outline/ChatBubbleIcon";
import { DocumentIcon } from "../icons/outline/DocumentIcon";
import { SettingsProfileIcon } from "../icons/outline/SettingsProfileIcon";
import { useChatStore } from "../../store/useChatStore";

export default function IconRail({ onSearchClick, onOpenSettings, className }: { onSearchClick?: () => void; onOpenSettings?: () => void; className?: string }) {
  const profile = useVaultStore((state) => state.profile);
  const setActiveChat = useChatStore((s) => s.setActiveChat);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const chats = useChatStore((s) => s.chats);
  const privateNotesId = chats.find((c) => c.alias === "Private Notes")?.id ?? null;

  const initials = (alias: string) =>
    alias
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  return (
    <nav
      aria-label="Icon rail"
      className={("flex h-screen w-16 flex-col items-center gap-2 sidebar-glass py-3 " + (className||"")).trim()}
    >
      <div style={{ backgroundColor: 'rgba(10, 20, 16, 1)', border: '1.5px solid rgba(16, 185, 129, 0.6)', borderRadius: '12px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/keyhole-512.png" alt="UQZERA" className="h-8 w-8 rounded object-contain" />
      </div>
      <div className="my-1 h-px w-8 bg-border" />
      <button
        type="button"
        aria-label="Search chats"
        onClick={onSearchClick}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover hover:text-text-primary"
      >
        <SearchChatsIcon width={18} height={18} />
      </button>
      <button
        type="button"
        aria-label="Chats"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover hover:text-text-primary"
      >
        <ChatBubbleIcon width={18} height={18} />
      </button>
      {privateNotesId && (
        <button
          type="button"
          aria-label="Private Notes"
          aria-pressed={activeChatId === privateNotesId}
          onClick={() => setActiveChat(privateNotesId)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover hover:text-text-primary"
        >
          <DocumentIcon width={18} height={18} />
        </button>
      )}
      <div className="mt-auto flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover hover:text-text-primary"
        >
          <SettingsProfileIcon width={18} height={18} />
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-panel text-xs font-medium text-text-primary"
        >
          {initials(profile?.name ?? "") || "?"}
        </button>
      </div>
    </nav>
  );
}
