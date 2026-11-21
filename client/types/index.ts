export type ViewMode = 'chats' | 'chat' | 'channels' | 'contacts' | 'settings';

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Attachment {
  name: string;
  size: string;
  hash: string;
  type: 'file' | 'audio' | 'image';
}

export interface Message {
  id: string;
  sender: 'me' | 'elena' | 'other';
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  reactions?: MessageReaction[];
  attachment?: Attachment;
  codeSnippet?: string;
  isMono?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  avatarText?: string;
  avatarUrl?: string;
  avatarGradient?: string;
  type: 'direct' | 'group';
  unreadCount?: number;
  lastMessage: string;
  prefix?: string;
  timestamp: string;
  verified: boolean;
  tag?: string;
  hasAttachment?: boolean;
  attachmentType?: 'file' | 'audio';
  online?: boolean;
  onionTag?: string;
}

export interface Broadcast {
  id: string;
  sender: string;
  senderNode: string;
  signature: string;
  hashMatch: string;
  title?: string;
  content: string;
  timestamp: string;
  relayedByCount: number;
  payloadSize: string;
  fingerprint?: string;
}

export interface Channel {
  id: string;
  name: string;
  icon: string;
  memberCount: number;
  unread?: boolean;
  category: 'broadcast' | 'private' | 'public';
  lastActivity: string;
  lastSnippet: string;
  verified: boolean;
  idHash: string;
  broadcastOnly: boolean;
  ephemeralHours: number;
  broadcasts: Broadcast[];
}

export interface ToastNotification {
  id: string;
  message: string;
  icon?: string;
  type?: 'success' | 'info' | 'warning';
}

export interface DeviceSession {
  id: string;
  name: string;
  platform: string;
  lastSeen: string;
  isCurrent: boolean;
  fingerprint: string;
}

// Core chat types for the new session-based system
export type ChatKind = "direct" | "system" | "notes";

export type MessageStatus =
  | "queued"
  | "relayAccepted"
  | "sent"
  | "delivered"
  | "read";

export interface ChatSummary {
  id: string;
  recipientPubKey: string;
  peerSigningPubKey?: string;
  alias: string;
  unreadCount: number;
  updatedAt: number;
  kind: ChatKind;
  pinned: boolean;
  favorite?: boolean;
  mutedUntil?: number;
  mutedForever?: boolean;
  disappearingMs?: number;
  theme?: string;
  listId?: string;
  blocked?: boolean;
}

export interface MessageReplyRef {
  id: string;
  alias: string;
  excerpt: string;
}

export type InnerPayload =
  | { type: "text"; content: string }
  | { type: "attachment"; attachment: MessageAttachment }
  | { type: "encrypted"; encryptedPayload: string }
  | { type: "system"; systemType: string };

export interface MessageAttachment {
  name: string;
  size: string;
  hash: string;
  type: "file" | "audio" | "image";
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderPubKey: string;
  content: string;
  type: InnerPayload["type"];
  status: MessageStatus;
  timestamp: number;
  readAt?: number;
  outgoing: boolean;
  ephemeralTimer?: number;
  attachment?: MessageAttachment;
  starred?: boolean;
  pinned?: boolean;
  reactions?: string[];
  replyTo?: MessageReplyRef;
}

export interface PendingRequest {
  senderEncryptionPubKey: string;
  senderPubKey: string;
  packet: any;
  receivedAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  isDraft: boolean;
}
