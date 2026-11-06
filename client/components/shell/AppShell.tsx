"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore, type ChatState } from "../../store/useChatStore";
import IconChat from "../icons/IconChat";
import IconPlus from "../icons/IconPlus";
import IconSearch from "../icons/IconSearch";
import IconSettings from "../icons/IconSettings";
import AddContactModal from "../modals/AddContactModal";
import AcceptContactModal from "../modals/AcceptContactModal";
import { useVaultStore } from "../../store/useVaultStore";
import ChatList from "../chatList/ChatList";

export default function AppShell({
  onOpenIdentity,
  onOpenChat,
  onOpenGuide,
  guideActive = false,
}: {
  onOpenIdentity?: () => void;
  onOpenChat?: () => void;
  onOpenGuide?: () => void;
  guideActive?: boolean;
}) {

  const initials = (alias: string) =>
    alias
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const [showAddContact, setShowAddContact] = useState(false);
  const [acceptRequest, setAcceptRequest] = useState<{ senderKey: string; packet: unknown } | null>(null);
  const pendingRequests = useChatStore((s: ChatState) => s.pendingRequests);
  const dismissPendingRequest = useChatStore((s: ChatState) => s.dismissPendingRequest);
  const isUnlocked = useVaultStore((s) => s.isUnlocked);
  const profile = useVaultStore((s) => s.profile);
  const loadChats = useChatStore((s: ChatState) => s.loadChats);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setIsSettingsOpen(false);
    }
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, []);

  useEffect(() => {
    if (isUnlocked) void loadChats().catch(() => {});
  }, [isUnlocked, loadChats]);

  return (
    <aside aria-label="Chats sidebar" className="flex h-screen w-80 flex-col glass">
      {/* Logo / brand */}
      <div className="flex h-14 items-center gap-3 bg-bg-sidebar px-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dfe2ee"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span className="text-base font-semibold text-text-primary">UQZERA</span>
      </div>

      {/* Divider after logo */}
      <div className="mx-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Search bar */}
      <div className="px-4 pb-2">
        <div
          className="flex h-[35px] items-center gap-2 rounded-lg bg-bg-panel px-3"
        >
          <IconSearch
            size={16}
            className="text-text-secondary"
          />
          <input
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
          <IconChat size={18} />
          <span>Chats</span>
        </div>
        <button
          onClick={() => setShowAddContact(true)}
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

      {/* Bottom fixed area */}
      <div className="flex flex-col border-t border-border">
        <div className="flex h-16 items-center justify-between border-t border-border px-4">
          <button
            onClick={onOpenIdentity}
            aria-label="My Identity"
            className="flex items-center gap-3 text-left transition hover:bg-bg-hover"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-bg-panel text-base font-medium text-text-primary">
              {initials(profile?.name ?? "")}
            </div>
            <div className="min-w-0">
              <span className="block truncate text-base font-medium text-text-primary">
                {profile?.name || "Your profile"}
              </span>
              <span className="block font-mono text-[11px] text-text-secondary">
                ID 0x4F2A_C91D
              </span>
            </div>
          </button>
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setIsSettingsOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-hover"
            >
              <IconSettings size={18} />
            </button>
            {isSettingsOpen && (
              <div className="absolute bottom-10 right-0 z-50 w-48 rounded-xl border border-border bg-bg-panel py-1 shadow-panel">
                {["Linked Devices", "Account", "Appearance", "Notifications", "Privacy"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setIsSettingsOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-text-primary hover:bg-bg-hover"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddContactModal
        open={showAddContact}
        onClose={() => setShowAddContact(false)}
      />
      <AcceptContactModal
        open={!!acceptRequest}
        senderEncryptionPubKey={acceptRequest?.senderKey || ""}
        packet={acceptRequest?.packet || null}
        onClose={() => setAcceptRequest(null)}
      />

    </aside>
  );
}
