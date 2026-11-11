"use client";

import { MultiDeviceIcon as IconWifi } from "../icons/outline/MultiDeviceIcon";
import { ProfilePhotoIcon as IconUser } from "../icons/outline/ProfilePhotoIcon";
import { ReadReceiptsToggleIcon as IconEye } from "../icons/outline/ReadReceiptsToggleIcon";
import { NotificationsIcon as IconBell } from "../icons/outline/NotificationsIcon";
import { PrivacySettingsIcon as IconShield } from "../icons/outline/PrivacySettingsIcon";
import { ShieldIcon } from "../icons/outline/ShieldIcon";

const SECTIONS = [
 { id: "linked-devices", label: "Linked Devices", Icon: IconWifi },
 { id: "account", label: "Account", Icon: IconUser },
 { id: "appearance", label: "Appearance", Icon: IconEye },
 { id: "notifications", label: "Notifications", Icon: IconBell },
 { id: "privacy", label: "Privacy", Icon: IconShield },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function SettingsSidebar({
  active,
  onSelect,
}: {
  active: SectionId;
  onSelect: (_id: SectionId) => void;
}) {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-hairline bg-surface-container">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
          <ShieldIcon size={16} />
        </div>
        <span className="text-sm font-semibold text-on-surface">Settings</span>
      </div>

      <div className="mx-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Nav list */}
      <nav className="mt-2 flex flex-col gap-0.5 px-2">
        {SECTIONS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                isActive
                  ? "bg-accent-subtle text-accent-emerald"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
