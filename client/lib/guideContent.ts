import { ChatBubbleIcon } from "../components/icons/outline/ChatBubbleIcon";
import { ShieldIcon } from "../components/icons/outline/ShieldIcon";
import { WifiOffIcon } from "../components/icons/outline/WifiOffIcon";
import { SendIcon } from "../components/icons/outline/SendIcon";
import { QrShareIcon } from "../components/icons/outline/QrShareIcon";
import { DocumentIcon } from "../components/icons/outline/DocumentIcon";
import { DisappearingTimerIcon } from "../components/icons/outline/DisappearingTimerIcon";
import { ChannelsIcon } from "../components/icons/outline/ChannelsIcon";
import { EncryptedBackupIcon } from "../components/icons/outline/EncryptedBackupIcon";
import { TorModeIcon } from "../components/icons/outline/TorModeIcon";
import { AttachmentIcon } from "../components/icons/outline/AttachmentIcon";
import type { ComponentType } from "react";

/**
 * A guide action either navigates to a real route (`href`) or asks the guide
 * page to run an in-app intent (`intent`). `comingSoon` marks features that
 * are not wired up yet so the UI can disable the button instead of sending
 * the user to a 404.
 */
export type GuideAction = {
  label: string;
  href?: string;
  intent?: "new-chat" | "key-exchange";
  comingSoon?: boolean;
};

export type GuideSection = {
  heading: string;
  caption: string;
  items: {
    icon: ComponentType<{ className?: string }>;
    title: string;
    body: string;
    action?: GuideAction;
  }[];
};

export const guideIntro =
  "Hi, I'm your UQZERA guide. Everything below is grouped so you can find a feature fast.";

export const guideSections: GuideSection[] = [
  {
    heading: "Getting started",
    caption: "The three things you'll do most",
    items: [
      {
        icon: ChatBubbleIcon,
        title: "Start a private chat",
        body: "Open a new conversation and add someone by their public key or QR code. Messages are encrypted on this device before they ever leave it.",
        action: { label: "Start a chat", intent: "new-chat" },
      },
      {
        icon: QrShareIcon,
        title: "Exchange keys & add contacts",
        body: "Show your own QR / public key, or scan a contact's code to add them. UQZERA has no username directory — the key is the identity.",
        action: { label: "Open key exchange", intent: "key-exchange" },
      },
      {
        icon: DocumentIcon,
        title: "Private Notes",
        body: "A personal, encrypted space for drafts and links. Stored only on this device and never sent through the relay.",
        action: { label: "Open Notes", href: "/chats/notes" },
      },
    ],
  },
  {
    heading: "Privacy controls",
    caption: "Lock down on your terms",
    items: [
      {
        icon: DisappearingTimerIcon,
        title: "Self-destructing messages",
        body: "Attach a timer when you send (1 minute to 1 hour, or Off). The message deletes itself from both sides once the countdown ends.",
        action: { label: "Compose with a timer", href: "/chats?compose=1&timer=60000" },
      },
      {
        icon: ShieldIcon,
        title: "Verify before you trust",
        body: "Compare public keys out-of-band before your first message to be sure no one is impersonating your contact.",
      },
    ],
  },
  {
    heading: "Using the app",
    caption: "Day-to-day actions",
    items: [
      {
        icon: AttachmentIcon,
        title: "Attachments & reactions",
        body: "Tap the paperclip to send photos, files, audio or a location. Long-press a message (or use the arrow) to reply, react, star, pin, forward or delete it.",
      },
      {
        icon: WifiOffIcon,
        title: "Works offline",
        body: "No relay? No problem. Messages queue locally and send the moment you're back online. Nothing is lost.",
      },
    ],
  },
  {
    heading: "On the roadmap",
    caption: "Built but not switched on yet",
    items: [
      {
        icon: ChannelsIcon,
        title: "Channels",
        body: "Broadcast to many people at once, public or invite-only, still end-to-end encrypted.",
        action: { label: "Coming soon", href: "/chats/channels", comingSoon: true },
      },
      {
        icon: EncryptedBackupIcon,
        title: "Encrypted backup",
        body: "Export an encrypted copy of your vault. Only your device key can open it.",
        action: { label: "Coming soon", comingSoon: true },
      },
      {
        icon: TorModeIcon,
        title: "Tor mode",
        body: "Route traffic through Tor to hide your IP address. Off by default.",
        action: { label: "Coming soon", comingSoon: true },
      },
    ],
  },
];

export const guideOutro = {
  icon: SendIcon,
  title: "You're all set",
  body: "That's the tour. I'll be pinned in your sidebar whenever you need a refresher.",
  action: { label: "Send a message", intent: "new-chat" } as GuideAction,
};
