"use client";

import { create } from "zustand";
import { useSessionStore } from "./useSessionStore";
import { type ChatSummary, type MessageStatus, type InnerPayload, type MessageAttachment, type MessageReplyRef, type PendingRequest, type Channel, type DeviceSession, type ToastNotification } from "../types";
import * as sqliteStore from "../lib/sqliteStore";

// Re-export types for use by other components
export type { ChatSummary, MessageStatus, MessageReplyRef, PendingRequest, InnerPayload, MessageAttachment };

export interface ChatState {
  activeChatId: string | null;
  chats: ChatSummary[];
  messagesMap: Record<string, any[]>;
  pendingRequests: PendingRequest[];
  isRelayConnected: boolean;
  relayStatus: "disconnected" | "connecting" | "connected" | "error";
  transportError: string | null;
  typingByChat: Record<string, boolean>;
  peerTypingByChat: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
  channels: Channel[];
  devices: DeviceSession[];
  ephemeralTtl: number;

  // Modal state
  sidebarOpen: boolean;
  replyTo: MessageReplyRef | null;
  setSidebarOpen: (open: boolean) => void;
  setReplyTo: (reply: MessageReplyRef | null) => void;

  // Actions
  setEphemeralTtl: (ttl: number) => void;
  addChannel: (channel: Channel) => void;
  removeDevice: (deviceId: string) => void;
  panicShred: () => void;
  showToast: (toast: ToastNotification) => void;
  dismissToast: (toastId: string) => void;
  acceptPendingRequest: (senderKey: string, nickname?: string) => Promise<void>;
  dismissPendingRequest: (senderKey: string) => void;
  setRelayStatus: (status: "disconnected" | "connecting" | "connected" | "error") => void;
  setActiveChat: (chatId: string | null) => void;
  broadcastTyping: (chatId: string, isTyping: boolean) => void;
  setTyping: (chatId: string, isTyping: boolean) => void;
  addContact: (alias: string, recipientPubKey: string) => Promise<ChatSummary>;
  sendMessage: (chatId: string, message: { content: string; attachment?: MessageAttachment }) => Promise<void>;
  loadChats: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  ensurePrivateNotes: () => Promise<ChatSummary>;
  updateChat: (chatId: string, patch: Partial<ChatSummary>) => Promise<ChatSummary | null>;
  clearChatMessages: (chatId: string) => Promise<void>;
}

export const startChatServices = async () => {
  // Load chats from SQLite on startup
  await (useChatStore.getState() as any).loadChats();
};

export const useChatStore = create<ChatState>((set, get) => ({
  activeChatId: null,
  chats: [],
  messagesMap: {},
  pendingRequests: [],
  isRelayConnected: false,
  relayStatus: "disconnected",
  transportError: null,
  typingByChat: {},
  peerTypingByChat: {},
  isLoading: false,
  error: null,
  ephemeralTtl: 0,

  channels: [],
  devices: [],

  sidebarOpen: false,
  replyTo: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setReplyTo: (reply) => set({ replyTo: reply }),

  addChannel: (channel) => set((state) => ({ channels: [...state.channels, channel] })),
  setEphemeralTtl: (ttl) => set({ ephemeralTtl: ttl }),
  removeDevice: (deviceId) => set((state) => ({ devices: state.devices.filter(d => d.id !== deviceId) })),
  panicShred: async () => {
    // Security: Wipe all data
    await sqliteStore.clearStore();
    set({
      chats: [],
      messagesMap: {},
      pendingRequests: [],
      channels: [],
      devices: [],
      activeChatId: null,
    });
  },
  showToast: (toast) => {
    // TODO: Add toast notification system
    console.log("Toast shown:", toast);
  },
  dismissToast: (toastId) => {
    // TODO: Remove toast from notification queue
    console.log("Toast dismissed:", toastId);
  },
  acceptPendingRequest: async (senderKey) => {
    // TODO: Accept pending contact request
    console.log("Accept pending request:", senderKey);
  },
  dismissPendingRequest: (senderKey) => {
    set((state) => ({
      pendingRequests: state.pendingRequests.filter(r => r.senderPubKey !== senderKey),
    }));
  },
  setRelayStatus: (status) => set({ relayStatus: status }),

  loadChats: async () => {
    try {
      const sessionStore = useSessionStore.getState();
      if (!sessionStore.sessionEncryptionKey) {
        throw new Error('Session encryption key is required for database initialization');
      }
      await sqliteStore.initSqliteStore(sessionStore.sessionEncryptionKey.toString());
      const chats = await sqliteStore.getChats();
      const privateNotesChat = await get().ensurePrivateNotes();
      set({ chats: [...chats, privateNotesChat], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load chats",
        isLoading: false
      });
    }
  },

  addContact: async (alias: string, recipientPubKey: string) => {
    set({ isLoading: true, error: null });
    try {
      const sessionStore = useSessionStore.getState();
      if (!sessionStore.sessionEncryptionKey) {
        throw new Error('Session encryption key is required for database initialization');
      }
      await sqliteStore.initSqliteStore(sessionStore.sessionEncryptionKey.toString());
      const newChat: ChatSummary = {
        id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recipientPubKey,
        peerSigningPubKey: "", // TODO: Get from handshake
        alias,
        unreadCount: 0,
        updatedAt: Date.now(),
        kind: "direct",
        pinned: false,
      };

      await sqliteStore.saveChat(newChat);
      set((state) => ({ chats: [...state.chats, newChat], isLoading: false }));
      return newChat;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add chat",
        isLoading: false
      });
      throw error;
    }
  },

  sendMessage: async (chatId: string, message: { content: string; attachment?: MessageAttachment }) => {
    set({ error: null });
    try {
      const sessionStore = useSessionStore.getState();
      if (!sessionStore.sessionEncryptionKey) {
        throw new Error('Session encryption key is required for database initialization');
      }
      await sqliteStore.initSqliteStore(sessionStore.sessionEncryptionKey.toString());
      const store = useChatStore.getState();
      const chat = store.chats.find(c => c.id === chatId);
      if (!chat) {
        throw new Error("Chat not found");
      }

      const newMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        chatId,
        senderPubKey: "", // TODO: Get current user key
        content: message.content,
        type: message.attachment ? "attachment" as const : "text" as const,
        status: "sent" as const,
        timestamp: Date.now(),
        outgoing: true,
        attachment: message.attachment,
      };

      await sqliteStore.saveMessage(newMessage as any);
      set((state) => ({
        messagesMap: {
          ...state.messagesMap,
          [chatId]: [...(state.messagesMap[chatId] || []), newMessage],
        },
      }));

      // TODO: Send via WebSocket
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to send message",
      });
      throw error;
    }
  },

  deleteChat: async (chatId: string) => {
    set({ isLoading: true, error: null });
    try {
      const sessionStore = useSessionStore.getState();
      if (!sessionStore.sessionEncryptionKey) {
        throw new Error('Session encryption key is required for database initialization');
      }
      await sqliteStore.initSqliteStore(sessionStore.sessionEncryptionKey.toString());

      set((state) => {
        const newMessagesMap = { ...state.messagesMap };
        delete newMessagesMap[chatId];

        return {
          chats: state.chats.filter(c => c.id !== chatId),
          messagesMap: newMessagesMap,
          activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
          isLoading: false,
        };
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete chat",
        isLoading: false
      });
      throw error;
    }
  },

  setActiveChat: (chatId) => set({ activeChatId: chatId }),

  broadcastTyping: (chatId, isTyping) => {
    set((state) => {
      const typingByChat = { ...state.typingByChat };
      if (isTyping) {
        typingByChat[chatId] = true;
      } else {
        delete typingByChat[chatId];
      }
      return { typingByChat };
    });
  },

  setTyping: (chatId, isTyping) => {
    set((state) => {
      const peerTypingByChat = { ...state.peerTypingByChat };
      if (isTyping) {
        peerTypingByChat[chatId] = true;
      } else {
        delete peerTypingByChat[chatId];
      }
      return { peerTypingByChat };
    });
  },

  markAsRead: async (chatId) => {
    set({ isLoading: true, error: null });
    try {
      // Implementation will be added
      await new Promise(resolve => setTimeout(resolve, 100));
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to mark as read",
        isLoading: false
      });
    }
  },

  ensurePrivateNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const sessionStore = useSessionStore.getState();
      if (!sessionStore.sessionEncryptionKey) {
        throw new Error('Session encryption key is required');
      }
      await sqliteStore.initSqliteStore(sessionStore.sessionEncryptionKey.toString());

      // Check if already exists in DB
      const existingChats = await sqliteStore.getChats();
      const existing = existingChats.find((c: any) => c.id === "private-notes");
      if (existing) {
        set({ isLoading: false });
        return existing;
      }

      const summary: ChatSummary = {
        id: "private-notes",
        recipientPubKey: "",
        alias: "Private Notes",
        unreadCount: 0,
        updatedAt: Date.now(),
        kind: "notes",
        pinned: true,
      };

      // Save private notes chat to SQLite (pinned for visibility)
      await sqliteStore.saveChat(summary);

      set({ isLoading: false });
      return summary;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to ensure private notes",
        isLoading: false
      });
      throw error;
    }
  },

  updateChat: async (chatId, patch) => {
    set({ isLoading: true, error: null });
    try {
      // Implementation will be added
      await new Promise(resolve => setTimeout(resolve, 100));
      set({ isLoading: false });
      return null;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update chat",
        isLoading: false
      });
      throw error;
    }
  },

  clearChatMessages: async (chatId) => {
    set((state) => {
      const messagesMap = { ...state.messagesMap };
      delete messagesMap[chatId];
      return { messagesMap, isLoading: false };
    });
  },
}));