"use client";

import { ChatBubbleIcon } from "../icons/outline/ChatBubbleIcon";
import { DocumentIcon } from "../icons/outline/DocumentIcon";
import { BookIcon } from "../icons/outline/BookIcon";
import { SettingsProfileIcon } from "../icons/outline/SettingsProfileIcon";
import Image from "next/image";
import { useChatStore } from "../../store/useChatStore";

type IconRailProps = {
  onSearchClick?: () => void;
  onOpenSettings?: () => void;
  onOpenContacts?: () => void;
  contactsActive?: boolean;
  className?: string;
};

export default function IconRail({ onOpenSettings, onOpenContacts, contactsActive = false, className }: IconRailProps) {
  const setActiveChat = useChatStore((s) => s.setActiveChat);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const guideActive = useChatStore((s) => s.guideActive);
  const setGuideActive = useChatStore((s) => s.setGuideActive);
  const chats = useChatStore((s) => s.chats);
  const privateNotesId = chats.find((c) => c.alias === "Private Notes")?.id ?? null;

  const initials = (alias: string) =>
    alias.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "?";

  const notesActive = (activeChatId === privateNotesId && privateNotesId !== null) || activeChatId === "private-notes";
  const itemClass = (active: boolean) =>
    `flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
      active ? "bg-[#10B981]/10 text-[#10B981]" : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <nav className={`w-16 shrink-0 flex flex-col items-center py-3 h-full border-r border-white/[0.07] bg-[#0d1117] ${className || ""}`} aria-label="Icon rail">
      <div className="flex flex-col items-center gap-1 py-3">
        <button
          type="button"
          aria-label="Chats"
          aria-current={!guideActive && !notesActive && activeChatId === null ? "page" : undefined}
          onClick={() => { setActiveChat(null); setGuideActive(false); }}
          className={itemClass(!guideActive && !notesActive && activeChatId === null)}
        >
          <ChatBubbleIcon size={20} />
        </button>
        <button
          type="button"
          aria-label="Contacts and key exchange"
          aria-current={contactsActive ? "true" : undefined}
          onClick={() => onOpenContacts?.()}
          className={itemClass(contactsActive)}
        >
          <span
            className="block h-5 w-5 bg-current"
            aria-hidden="true"
            style={{
              WebkitMaskImage: "url(/icons/groups/add-member.svg)",
              maskImage: "url(/icons/groups/add-member.svg)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        </button>
        <button
          type="button"
          aria-label="Private Notes"
          aria-current={!guideActive && notesActive ? "page" : undefined}
          onClick={() => {
            setActiveChat(privateNotesId ?? "private-notes");
            setGuideActive(false);
          }}
          className={itemClass(!guideActive && notesActive)}
        >
          <DocumentIcon size={20} />
        </button>
        <div className="flex h-10 w-10 items-center justify-center">
          <Image src="/keyhole-512.png" alt="UQZERA" width={24} height={24} className="h-6 w-6 object-contain" priority />
        </div>
        <div className="my-1 h-px w-8 bg-border" />
        <button
          type="button"
          aria-label="Guide"
          aria-current={guideActive ? "page" : undefined}
          onClick={() => setGuideActive(true)}
          className={itemClass(guideActive)}
        >
          <BookIcon size={20} />
        </button>
      </div>

      <div className="mt-auto flex flex-col items-center gap-2 border-t border-white/[0.07] py-4">
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <SettingsProfileIcon size={20} />
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-slate-200"
        >
          {initials("UQZERA")}
        </button>
      </div>
    </nav>
  );
}
