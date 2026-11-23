"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useChatStore, type ChatState } from "../../store/useChatStore";
import { ChatBubbleIcon } from "../icons/outline/ChatBubbleIcon";
import IconPlus from "../icons/IconPlus";
import { SearchChatsIcon } from "../icons/outline/SearchChatsIcon";
import AcceptContactModal from "../modals/AcceptContactModal";
import ChatList from "../chatList/ChatList";
import NotesSidebar from "../chatList/NotesSidebar";
import IconRail from "./IconRail";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SettingsView, type SettingsSection } from "@/components/SettingsView";

export default function AppShell({
  onOpenIdentity: _onOpenIdentity,
  onOpenChat,
  onOpenGuide,
  guideActive = false,
  onAddContactRequest,
  contactsActive = false,
}: {
  onOpenIdentity?: () => void;
  onOpenChat?: () => void;
  onOpenGuide?: () => void;
  guideActive?: boolean;
  onAddContactRequest?: () => void;
  contactsActive?: boolean;
}) {

  const [acceptRequest, setAcceptRequest] = useState<{ senderKey: string; packet: unknown } | null>(null);
  const pendingRequests = useChatStore((s: ChatState) => s.pendingRequests);
  const activeChatId = useChatStore((s: ChatState) => s.activeChatId);
  const chats = useChatStore((s: ChatState) => s.chats);
  const notesId = chats.find((chat) => chat.alias === "Private Notes")?.id ?? "private-notes";
  const notesActive = activeChatId === notesId;
  const dismissPendingRequest = useChatStore((s: ChatState) => s.dismissPendingRequest);
    const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("linked-devices");


  return (
    <>
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0D14]">
      <IconRail onOpenContacts={onAddContactRequest} contactsActive={contactsActive} onOpenSettings={() => setIsSettingsOpen(true)} className="hidden md:flex w-16 shrink-0" />
      <aside aria-label="Chats sidebar" className="hidden h-full w-80 shrink-0 flex-col overflow-hidden border-r border-white/[0.07] bg-[#0d1117] md:flex">
        {!notesActive && (
        <>
        <div className="px-4 pt-4 pb-3 shrink-0">
        {/* Logo / brand */}
      <div className="flex h-14 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image src="/uqzera-logo.png" alt="UQZERA" width={32} height={32} className="h-4 w-auto object-contain" />
        </div>

      </div>

      {/* Search bar */}
      <div className="pb-2">
        <div className="flex items-center gap-2 bg-[#161b22] border border-white/10 rounded-lg px-3 py-2">
          <SearchChatsIcon width={16} height={16} className="text-gray-400" />
          <input 
            ref={searchInputRef}
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search or start new chat" 
            aria-label="Search chats and messages" 
            className="bg-transparent text-white text-sm outline-none w-full placeholder:text-gray-500" 
          />
        </div>
      </div>
        </div>

      {pendingRequests.length > 0 && (
        <div className="px-4 pb-2">
          {pendingRequests.map((req) => (
            <div key={req.senderEncryptionPubKey} className="mb-2 rounded-lg border border-hairline bg-surface-container p-3">
              <p className="text-xs text-on-surface">New chat request from {req.senderEncryptionPubKey.substring(0,8)}...</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => setAcceptRequest({ senderKey: req.senderEncryptionPubKey, packet: req.packet })} className="rounded bg-primary px-2 py-1 text-xs text-on-primary">Accept</button>
                <button onClick={() => dismissPendingRequest(req.senderEncryptionPubKey)} className="rounded border border-hairline px-2 py-1 text-xs text-on-surface">Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Chats nav */}
      <div
        className="flex shrink-0 items-center justify-between px-4 py-2 text-sm font-semibold cursor-pointer transition-colors"
        style={{ color: "var(--text-primary)" }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <ChatBubbleIcon width={18} height={18} className="shrink-0" />
          <span className="truncate">Chats</span>
        </div>
        <button
          onClick={() => onAddContactRequest?.()}
          aria-label="Add contact"
          className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition"
          style={{ color: "#dfe2ee" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#181c24")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <IconPlus size={16} />
        </button>
      </div>

      <ChatList
        guideActive={guideActive}
        onOpenChat={onOpenChat}
        onOpenGuide={onOpenGuide}
      />
        </>
      )}
      {notesActive && <NotesSidebar />}

      {/* Divider above bottom section */}
      <div className="mx-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

      <AcceptContactModal
        open={!!acceptRequest}
        senderEncryptionPubKey={acceptRequest?.senderKey || ""}
        packet={acceptRequest?.packet || null}
        onClose={() => setAcceptRequest(null)}
      />

    </aside>
    </div>
    {isSettingsOpen && (
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
    )}
    {isSettingsOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="flex h-[80vh] w-full max-w-5xl overflow-hidden rounded-xl bg-bg-panel shadow-2xl">
          <SettingsSidebar active={settingsSection} onSelect={setSettingsSection} />
          <main className="flex-1 overflow-hidden">
            <SettingsView section={settingsSection} />
          </main>
        </div>
      </div>
    )}
    </>
  );
}
