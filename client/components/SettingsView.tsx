"use client";

import { useRouter } from "next/navigation";
import { useChatStore } from "../store/useChatStore";
import { useVaultStore } from "../store/useVaultStore";
import AppearanceSettings from "@/components/settings/Appearance";
import NotificationSettings from "@/components/settings/Notifications";
import PrivacySettings from "@/components/settings/Privacy";
import LinkedDevices from "./settings/LinkedDevices";
import AccountSettings from "./settings/AccountSettings";

export type SettingsSection = "linked-devices" | "account" | "appearance" | "notifications" | "privacy";

export function SettingsView({ section }: { section: SettingsSection }) {
 const devices = useChatStore((s) => s.devices);
 const removeDevice = useChatStore((s) => s.removeDevice);
 const showToast = useChatStore((s) => s.showToast);

 return (
  <div className="flex h-full w-full overflow-y-auto bg-surface p-6">
   <div className="mx-auto w-full max-w-2xl">
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
       <VaultLockSettings />
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

function VaultLockSettings() {
 const router = useRouter();
 const autoLockMinutes = useVaultStore((s) => s.autoLockMinutes);
 const lockOnBackground = useVaultStore((s) => s.lockOnBackground);
 const setLockPreferences = useVaultStore((s) => s.setLockPreferences);
 const lockVault = useVaultStore((s) => s.lockVault);

 return (
  <section className="rounded-2xl border border-outline-variant/50 bg-surface-container/60 p-4">
   <h2 className="text-sm font-medium text-on-surface">Vault lock</h2>
   <label className="mt-4 flex items-center justify-between gap-4 text-sm text-on-surface">
    Auto-lock
    <select
     aria-label="Auto-lock"
     value={autoLockMinutes}
     onChange={(event) => {
      const selected = Number(event.target.value);
      if (selected === 0 || selected === 15 || selected === 30) {
       setLockPreferences({ autoLockMinutes: selected, lockOnBackground });
      }
     }}
     className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2"
    >
     <option value={0}>Off</option>
     <option value={15}>15 minutes</option>
     <option value={30}>30 minutes</option>
    </select>
   </label>
   <label className="mt-4 flex items-center justify-between gap-4 text-sm text-on-surface">
    Lock on background
    <input
     aria-label="Lock on background"
     type="checkbox"
     checked={lockOnBackground}
     onChange={(event) => setLockPreferences({
      autoLockMinutes,
      lockOnBackground: event.target.checked,
     })}
    />
   </label>
   <button
    onClick={() => {
     lockVault();
     router.replace("/lock");
    }}
    className="mt-4 w-full rounded-xl border border-outline-variant px-4 py-2 text-sm text-on-surface"
   >
    Lock now
   </button>
  </section>
 );
}
