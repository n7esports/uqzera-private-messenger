"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatView } from "../../../components/ChatView";
import { startChatServices, useChatStore } from "../../../store/useChatStore";
import { useVaultStore } from "../../../store/useVaultStore";

export default function ChatRoute({
  params,
}: {
  params: { chatId: string };
}) {
  const router = useRouter();
  const isUnlocked = useVaultStore((state) => state.isUnlocked);
  const sessionRestored = useVaultStore((state) => state.sessionRestored);
  const vaultExists = useVaultStore((state) => state.vaultExists);
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  useEffect(() => {
    if (!sessionRestored || isUnlocked) return;
    router.replace(vaultExists ? "/lock" : "/onboarding");
  }, [isUnlocked, router, sessionRestored, vaultExists]);

  useEffect(() => {
    if (isUnlocked) startChatServices();
  }, [isUnlocked]);

  useEffect(() => {
    if (isUnlocked) setActiveChat(params.chatId);
  }, [isUnlocked, params.chatId, setActiveChat]);

  if (!isUnlocked) return null;

  return <ChatView chatId={params.chatId} onBack={() => router.push("/chats")} />;
}
