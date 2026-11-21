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
    <nav className={`flex flex-col items-center gap-1 py-4 h-screen w-16 bg-[#0d1117] border-r border-white/5 ${className || ""}`} aria-label="Icon rail">
      {/* Logo */}
      <div className="flex items-center justify-center rounded-xl bg-[#060c09] p-2 mb-2">
        <Image src="/keyhole-512.png" alt="UQZERA" width={32} height={32} className="h-8 w-8 object-contain text-[#34D399]" />
      </div>
      
      <div className="my-1 h-px w-8 bg-white/10" />
      
      {/* Search */}
      <button type="button" aria-label="Search chats" onClick={onSearchClick} className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-all duration-200 hover:bg-white/5 hover:text-emerald-400">
        <SearchChatsIcon width={20} height={20} />
      </button>
      
      {/* Chats */}
      <button 
        type="button" 
        aria-label="Chats" 
        onClick={() => setActiveChat(null)} 
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
          activeChatId === null 
            ? "bg-emerald-500/10 text-emerald-400" 
            : "text-gray-400 hover:bg-white/5 hover:text-emerald-400"
        }`}
      >
        <ChatBubbleIcon width={20} height={20} />
      </button>
      
      {/* Private Notes */}
      <button 
        type="button" 
        aria-label="Private Notes" 
        onClick={() => { if (privateNotesId) setActiveChat(privateNotesId); }} 
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
          privateNotesId !== null && activeChatId === privateNotesId
            ? "bg-emerald-500/10 text-emerald-400"
            : "text-gray-400 hover:bg-white/5 hover:text-emerald-400"
        }`}
      >
        <DocumentIcon width={20} height={20} />
      </button>
      
      {/* Bottom Section */}
      <div className="mt-auto flex flex-col items-center gap-2">
        <button type="button" onClick={onOpenSettings} aria-label="Settings" className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-all duration-200 hover:bg-white/5 hover:text-emerald-400">
          <SettingsProfileIcon width={20} height={20} />
        </button>
        <button type="button" onClick={onOpenSettings} aria-label="Profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-medium text-emerald-400">
          {initials("UQZERA") || "?"}
        </button>
      </div>
    </nav>
  );
}
