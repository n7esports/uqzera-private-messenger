"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore, type ChatState } from "../../store/useChatStore";
import SolidChat from "../icons/solid/SolidChat";
import IconPlus from "../icons/IconPlus";
import { SearchChatsIcon } from "../icons/outline/SearchChatsIcon";
import AcceptContactModal from "../modals/AcceptContactModal";
import { useVaultStore } from "../../store/useVaultStore";
import ChatList from "../chatList/ChatList";
import IconRail from "./IconRail";

export default function AppShell({
  onOpenIdentity: _onOpenIdentity,
  onOpenChat,
  onOpenGuide,
  guideActive = false,
  onAddContactRequest,
}: {
  onOpenIdentity?: () => void;
  onOpenChat?: () => void;
  onOpenGuide?: () => void;
  guideActive?: boolean;
  onAddContactRequest?: () => void;
}) {

  const [acceptRequest, setAcceptRequest] = useState<{ senderKey: string; packet: unknown } | null>(null);
  const pendingRequests = useChatStore((s: ChatState) => s.pendingRequests);
  const dismissPendingRequest = useChatStore((s: ChatState) => s.dismissPendingRequest);
  const isUnlocked = useVaultStore((s) => s.isUnlocked);
  const loadChats = useChatStore((s: ChatState) => s.loadChats);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isUnlocked) void loadChats().catch(() => {});
  }, [isUnlocked, loadChats]);

  return (
    <div className="flex h-screen w-full">
      <IconRail onSearchClick={() => searchInputRef.current?.focus()} />
      <aside aria-label="Chats sidebar" className="flex h-screen w-80 flex-col sidebar-glass">
        {/* Logo / brand */}
      <div className="flex h-14 items-center justify-between gap-3 sidebar-glass px-4">
        <div className="flex items-center gap-3">
          <img src="/logo-withoutbg.png" alt="UQZERA" className="h-11 w-auto object-contain" />
        </div>

      </div>

      {/* Divider after logo */}
      <div className="mx-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Search bar */}
      <div className="px-4 pb-2">
        <div
          className="flex h-[40px] items-center gap-2 rounded-[12px] bg-bg-panel border border-border px-4"
        >
          <SearchChatsIcon
            size={16}
            className="text-text-secondary"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            aria-label="Search chats and messages"
            className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary focus:ring-2 focus:ring-accent"
          />
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
        className="flex items-center justify-between px-4 py-2 text-sm font-semibold cursor-pointer transition-colors"
        style={{ color: "var(--text-primary)" }}
      >
        <div className="flex items-center gap-2">
          <SolidChat width={18} height={18} />
          <span>Chats</span>
        </div>
        <button
          onClick={() => onAddContactRequest?.()}
          aria-label="Add contact"
          className="flex h-7 w-7 items-center justify-center rounded-lg transition"
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
  );
}
