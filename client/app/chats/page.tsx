"use client";

import { useState } from "react";
import AppShell from "../../components/shell/AppShell";
import AddContactModal from "../../components/modals/AddContactModal";
import { ChatView } from "../../components/ChatView";
import GuideConversation from "../../components/chatList/GuideConversation";
import { MyIdentityModal } from "../../components/modals/MyIdentityModal";
import { useChatStore } from "../../store/useChatStore";

type MobileView = "list" | "chat";

export default function ChatsPage() {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const guideActive = useChatStore((state) => state.guideActive);
  const setGuideActive = useChatStore((state) => state.setGuideActive);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);




  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0D14]">
      <div className="hidden md:flex shrink-0 flex-col h-full overflow-hidden">
        <AppShell
          onOpenIdentity={() => setIdentityOpen(true)}
          onOpenChat={() => setGuideActive(false)}
          onOpenGuide={() => setGuideActive(true)}
          guideActive={guideActive}
          onAddContactRequest={() => setAddContactOpen(true)}
          contactsActive={addContactOpen}
        />
      </div>

      <div className="flex w-full flex-col md:hidden">
        {mobileView === "list" ? (
          <div className="flex-1">
            <AppShell
              onOpenIdentity={() => setIdentityOpen(true)}
              onOpenChat={() => {
                setGuideActive(false);
                setMobileView("chat");
              }}
              onOpenGuide={() => {
                setGuideActive(true);
                setMobileView("chat");
              }}
              guideActive={guideActive}
              onAddContactRequest={() => setAddContactOpen(true)}
              contactsActive={addContactOpen}
            />
          </div>
        ) : (
          <div className="flex-1">
            {guideActive ? (
              <GuideConversation onBack={() => setMobileView("list")} />
            ) : (
              <ChatView chatId={activeChatId} onBack={() => setMobileView("list")} onOpenGuide={() => setGuideActive(true)} onAddContact={() => setAddContactOpen(true)} />
            )}
          </div>
        )}
      </div>

      <main className="hidden flex-1 min-w-0 md:flex h-full">
        {guideActive ? (
          <GuideConversation />
        ) : (
          <ChatView chatId={activeChatId} onOpenGuide={() => setGuideActive(true)} onAddContact={() => setAddContactOpen(true)} />
        )}
      </main>

      <MyIdentityModal open={identityOpen} onClose={() => setIdentityOpen(false)} />
      <AddContactModal open={addContactOpen} onClose={() => setAddContactOpen(false)} />
    </div>
  );
}
