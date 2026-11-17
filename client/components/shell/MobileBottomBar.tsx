"use client";

import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/useChatStore";
import { ChatBubbleIcon as ChatIcon } from "@/components/icons/outline/ChatBubbleIcon";
import { CameraIcon } from "@/components/icons/outline/CameraIcon";
import { SettingsProfileIcon as ProfileIcon } from "@/components/icons/outline/SettingsProfileIcon";
import IconPlus from "../icons/IconPlus";

export default function MobileBottomBar({
  onChatsClick,
}: {
  onChatsClick?: () => void;
}) {
  const router = useRouter();
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  const handleChats = () => {
    setActiveChat(null); // Close active chat
    onChatsClick?.(); // Switch to list view
  };

  const handleProfile = () => {
    router.push("/settings");
  };

  const handleAdd = () => {
    // Trigger the add contact modal (you can lift this state to the parent)
    // For now, we can dispatch a custom event or use a global state
    window.dispatchEvent(new CustomEvent("open-add-contact"));
  };

  return (
    <nav className="fixed bottom-6 left-1/2 z-40 w-[90%] max-w-md -translate-x-1/2 md:hidden">
      <div className="relative flex h-16 items-center justify-between rounded-full border border-emerald-500/20 bg-[#0a1410]/90 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        

        {/* Chats */}
        <button
          onClick={handleChats}
          className="relative flex flex-col items-center justify-center gap-1 text-gray-400 transition hover:text-emerald-400"
        >
          {/* Notch Indicator */}
          <span className="absolute -top-[18px] h-1 w-8 rounded-full bg-emerald-400" />
          <div className="relative">
            <ChatIcon className="h-6 w-6" />
            {/* Small Plus Badge */}
            <span className="absolute -right-2 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-black">
              +
            </span>
          </div>
          <span className="text-[10px] font-medium text-emerald-400">Chats</span>
        </button>

        {/* Center FAB (Add) */}
        <button
          onClick={handleAdd}
          className="absolute -top-6 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#0a1410] bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)] transition hover:scale-105 active:scale-95"
        >
          <IconPlus size={24} className="text-black" />
        </button>

        {/* Camera */}
        <button
          onClick={() => alert("Camera coming soon")}
          className="flex flex-col items-center justify-center gap-1 text-gray-400 transition hover:text-emerald-400"
        >
          <CameraIcon className="h-6 w-6" />
          <span className="text-[10px] font-medium">Camera</span>
        </button>

        {/* Profile */}
        <button
          onClick={handleProfile}
          className="flex flex-col items-center justify-center gap-1 text-gray-400 transition hover:text-emerald-400"
        >
          <ProfileIcon className="h-6 w-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
}
