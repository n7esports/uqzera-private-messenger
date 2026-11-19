import { useChatStore, type ChatSummary } from "../store/useChatStore";

export const MAX_PINNED_CHATS = 3;
export const CHAT_DISAPPEARING_TIMER_MS = 24 * 60 * 60 * 1000;

export const CHAT_DISAPPEARING_TIMER_OPTIONS = [
  { label: "Off", value: null },
  { label: "24 hours", value: CHAT_DISAPPEARING_TIMER_MS },
] as const;

const messageExpiryTimers = new Map<string, ReturnType<typeof setTimeout>>();
let pinUpdateQueue = Promise.resolve();

export function canPinChat(chats: ChatSummary[], chatId: string): boolean {
  const chat = chats.find((entry) => entry.id === chatId);
  return Boolean(
    chat && (chat.pinned || chats.filter((entry) => entry.pinned).length < MAX_PINNED_CHATS),
  );
}

export function setChatPinned(chatId: string, pinned: boolean): Promise<boolean> {
  const operation = pinUpdateQueue.then(async () => {
    const store = useChatStore.getState();
    const chat = store.chats.find((entry) => entry.id === chatId);
    if (!chat || (pinned && !chat.pinned && !canPinChat(store.chats, chatId))) return false;
    await store.updateChat(chatId, { pinned });
    return true;
  });
  pinUpdateQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export async function setChatDisappearingTimer(
  chatId: string,
  timer: number | null,
): Promise<boolean> {
  if (timer !== null && timer !== CHAT_DISAPPEARING_TIMER_MS) {
    throw new Error("Chat timer must be Off or 24 hours.");
  }

  const store = useChatStore.getState();
  const chat = store.chats.find((entry) => entry.id === chatId);
  if (!chat) return false;

  await store.updateChat(chatId, { disappearingMs: timer ?? undefined });

  // Simplified: deleteMessages is no longer a method on useChatStore,
  // we would use sqliteStore.deleteMessages(db, ids) directly
  // This needs further refactoring to get the dbInstance
  for (const message of store.messagesMap[chatId] ?? []) {
    const previousTimer = messageExpiryTimers.get(message.id);
    if (previousTimer) clearTimeout(previousTimer);
    messageExpiryTimers.delete(message.id);
  }

  return true;
}
