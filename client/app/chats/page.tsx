"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../components/shell/AppShell";
import { ChatView } from "../../components/ChatView";
import GuideConversation from "../../components/chatList/GuideConversation";
import { MyIdentityModal } from "../../components/modals/MyIdentityModal";
import { useChatStore } from "../../store/useChatStore";
import { useVaultStore } from "../../store/useVaultStore";
import { startChatServices } from "../../store/useChatStore";

type MobileView = "list" | "chat";

export default function ChatsPage() {
  const router = useRouter();
  const isUnlocked = useVaultStore((state) => state.isUnlocked);
  const sessionRestored = useVaultStore((state) => state.sessionRestored);
  const vaultExists = useVaultStore((state) => state.vaultExists);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [guideActive, setGuideActive] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!sessionRestored || isUnlocked) return;
    router.replace(vaultExists ? "/lock" : "/onboarding");
  }, [isUnlocked, router, sessionRestored, vaultExists]);

  useEffect(() => {
    if (isUnlocked && !startedRef.current) {
      startedRef.current = true;
      startChatServices();
    }
  }, [isUnlocked]);

  if (!isUnlocked) return null;

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="hidden md:flex md:w-80 lg:w-96 flex-col">
        <AppShell
          onOpenIdentity={() => setIdentityOpen(true)}
          onOpenChat={() => setGuideActive(false)}
          onOpenGuide={() => setGuideActive(true)}
          guideActive={guideActive}
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
            />
          </div>
        ) : (
          <div className="flex-1">
            {guideActive ? (
              <GuideConversation onBack={() => setMobileView("list")} />
            ) : (
              <ChatView chatId={activeChatId} onBack={() => setMobileView("list")} />
            )}
          </div>
        )}
      </div>

      <main className="hidden flex-1 md:flex">
        {guideActive ? (
          <GuideConversation />
        ) : (
          <ChatView chatId={activeChatId} />
        )}
      </main>

      <MyIdentityModal open={identityOpen} onClose={() => setIdentityOpen(false)} />
    </div>
  );
}
