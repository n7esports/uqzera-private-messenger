"use client";

import { useRouter } from "next/navigation";
import { useChatStore } from "../store/useChatStore";
import AppearanceSettings from "@/components/settings/Appearance";
import NotificationSettings from "@/components/settings/Notifications";
import PrivacySettings from "@/components/settings/Privacy";
import LinkedDevices from "./settings/LinkedDevices";
import AccountSettings from "./settings/AccountSettings";

export type SettingsSection = "linked-devices" | "account" | "appearance" | "notifications" | "privacy";

export function SettingsView({ section }: { section: SettingsSection }) {
  const router = useRouter();
  const devices = useChatStore((s) => s.devices);
  const removeDevice = useChatStore((s) => s.removeDevice);
  const showToast = useChatStore((s) => s.showToast);

 return (
  <div className="flex h-full w-full flex-col overflow-y-auto bg-surface p-6">
   <div className="flex items-center justify-between pb-6 border-b border-outline-variant/30 mb-6">
     <div>
       <h1 className="font-sans text-xl font-semibold text-on-surface capitalize">{section.replace("-", " ")}</h1>
       <p className="mt-1 text-xs text-outline">Manage your UQZERA preferences and account.</p>
     </div>
     <button
       type="button"
       onClick={() => router.push("/chat")}
       className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors"
       title="Close Settings"
     >
       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <line x1="18" y1="6" x2="6" y2="18"></line>
         <line x1="6" y1="6" x2="18" y2="18"></line>
       </svg>
     </button>
   </div>
   <div className="mx-auto w-full max-w-2xl flex-1">
    {section === "linked-devices" && (
     <>
      <h1 className="font-sans text-xl font-semibold text-on-surface">Linked Devices</h1>
      <p className="mt-1 text-xs text-outline">Manage active sessions across your devices.</p>
      <div className="mt-6 flex flex-col gap-6">
       <LinkedDevices devices={devices} removeDevice={removeDevice} showToast={showToast} />
      </div>
     </>
    )}
    {section === "account" && (
     <>
      <h1 className="font-sans text-xl font-semibold text-on-surface">Account</h1>
      <p className="mt-1 text-xs text-outline">Security, data, and identity controls.</p>
      <div className="mt-6 flex flex-col gap-6">
       <AccountSettings showToast={showToast} />
      </div>
     </>
    )}
    {section === "appearance" && (
     <>
      <h1 className="font-sans text-xl font-semibold text-on-surface">Appearance</h1>
      <p className="mt-1 text-xs text-outline">Display and message behavior.</p>
      <div className="mt-6 flex flex-col gap-6">
       <AppearanceSettings />
       <section className="rounded-2xl border border-outline-variant/50 bg-surface-container/60 p-4">
        <h2 className="text-sm font-medium text-on-surface">Guide</h2>
        <button
         type="button"
         className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs text-on-primary"
         onClick={() => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("uqzera.guide.confirmed");
          }
         }}
        >
         Show guide again
        </button>
       </section>
      </div>
     </>
    )}
    {section === "notifications" && (
     <>
      <h1 className="font-sans text-xl font-semibold text-on-surface">Notifications</h1>
      <p className="mt-1 text-xs text-outline">Notification preferences.</p>
      <div className="mt-6 flex flex-col gap-6">
       <NotificationSettings />
      </div>
     </>
    )}
    {section === "privacy" && (
     <>
      <h1 className="font-sans text-xl font-semibold text-on-surface">Privacy</h1>
      <p className="mt-1 text-xs text-outline">Privacy and security settings.</p>
      <div className="mt-6 flex flex-col gap-6">
       <PrivacySettings />
      </div>
     </>
    )}
   </div>
  </div>
 );
}

