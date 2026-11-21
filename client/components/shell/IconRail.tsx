"use client";

import { SearchChatsIcon } from "../icons/outline/SearchChatsIcon";
import { ChatBubbleIcon } from "../icons/outline/ChatBubbleIcon";
import { DocumentIcon } from "../icons/outline/DocumentIcon";
import { SettingsProfileIcon } from "../icons/outline/SettingsProfileIcon";
import Image from "next/image";
import { useChatStore } from "../../store/useChatStore";

export default function IconRail({ onSearchClick, onOpenSettings, className }: { onSearchClick?: () => void; onOpenSettings?: () => void; className?: string }) {
  const setActiveChat = useChatStore((s) => s.setActiveChat);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const chats = useChatStore((s) => s.chats);
  const privateNotesId = chats.find((c) => c.alias === "Private Notes")?.id ?? null;

  const initials = (alias: string) =>
    alias.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <nav aria-label="Icon rail" className={`flex flex-col items-center gap-2 py-4 ${className || ""}`}>
      {/* Logo */}
      <div className="flex items-center justify-center rounded-xl bg-[#060c09] p-2">
        <Image src="/keyhole-512.png" alt="UQZERA" width={32} height={32} className="h-8 w-8 object-contain text-[#34D399]" />
      </div>
      
      <div className="my-1 h-px w-8 bg-border" />
      
      {/* Search */}
      <button type="button" aria-label="Search chats" onClick={onSearchClick} className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover hover:text-text-primary">
        <SearchChatsIcon width={18} height={18} />
      </button>
      
      {/* Chats */}
      <button type="button" aria-label="Chats" onClick={() => setActiveChat(null)} className={`flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-bg-hover hover:text-text-primary ${activeChatId === null ? "bg-bg-hover text-text-primary" : "text-text-secondary"}`}>
        <ChatBubbleIcon width={18} height={18} />
      </button>
      
      {/* Private Notes */}
      <button type="button" aria-label="Private Notes" aria-pressed={activeChatId === privateNotesId} onClick={() => { if (privateNotesId) setActiveChat(privateNotesId); }} className={`flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-bg-hover hover:text-text-primary ${activeChatId === privateNotesId ? "bg-bg-hover text-text-primary" : "text-text-secondary"}`}>
        <DocumentIcon width={18} height={18} />
      </button>
      
      {/* Bottom Section */}
      <div className="mt-auto flex flex-col items-center gap-2">
        <button type="button" onClick={onOpenSettings} aria-label="Settings" className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover hover:text-text-primary">
          <SettingsProfileIcon width={18} height={18} />
        </button>
        <button type="button" onClick={onOpenSettings} aria-label="Profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-panel text-xs font-medium text-text-primary">
          {initials("UQZERA") || "?"}
        </button>
      </div>
    </nav>
  );
}
