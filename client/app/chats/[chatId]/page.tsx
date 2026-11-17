"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatView } from "../../../components/ChatView";
import { startChatServices, useChatStore } from "../../../store/useChatStore";

export default function ChatRoute({
  params,
}: {
  params: { chatId: string };
}) {
  const router = useRouter();
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  useEffect(() => {
    startChatServices();
  }, []);

  useEffect(() => {
    if (params.chatId) setActiveChat(params.chatId);
  }, [params.chatId, setActiveChat]);

  return <ChatView chatId={params.chatId} onBack={() => router.push("/chats")} />;
}
