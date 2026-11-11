"use client";

import { useState } from "react";
import IconPlus from "../icons/IconPlus";
import { SettingsProfileIcon } from "../icons/outline/SettingsProfileIcon";

export default function MobileBottomBar() {
  const [active, setActive] = useState("chats");

  const tab = (key: string, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setActive(key)}
      className="relative flex flex-col items-center gap-1 text-gray-400"
    >
      {active === key && (
        <>
          <span className="absolute -top-2 h-1 w-8 rounded-full bg-white" />
          <span className="absolute inset-0 rounded-full bg-white/10 px-4 py-2" />
        </>
      )}
      <span className="relative">{icon}</span>
      <span className="relative text-[10px]">{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-6 left-1/2 z-40 flex h-16 w-[90%] max-w-md -translate-x-1/2 items-center justify-around rounded-full border border-emerald-500/30 bg-[#0a1410]/80 px-4 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] md:hidden">
      {tab("lock", "Lock", <span className="text-lg">🔒</span>)}
      {tab("chats", "Chats", <span className="text-lg">💬</span>)}
      <button
        type="button"
        className="absolute -top-6 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#0a1410] bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
      >
        <IconPlus size={24} className="text-white" />
      </button>
      {tab("settings", "Settings", <SettingsProfileIcon width={18} height={18} />)}
      {tab("profile", "Profile", <span className="h-6 w-6 rounded-full bg-gray-500" />)}
    </div>
  );
}
