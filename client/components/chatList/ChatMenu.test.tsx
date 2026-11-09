import { describe, expect, it } from "vitest";
import {
  CHAT_DISAPPEARING_TIMER_MS,
  CHAT_DISAPPEARING_TIMER_OPTIONS,
  canPinChat,
} from "../../lib/chatMeta";
import type { ChatSummary } from "../../store/useChatStore";

function chat(id: string, pinned = false): ChatSummary {
  return {
    id,
    recipientPubKey: "",
    alias: id,
    unreadCount: 0,
    updatedAt: 0,
    kind: "direct",
    pinned,
  };
}

describe("chat metadata controls", () => {
  it("offers only Off and 24 hours for disappearing messages", () => {
    expect(CHAT_DISAPPEARING_TIMER_OPTIONS).toEqual([
      { label: "Off", value: null },
      { label: "24 hours", value: CHAT_DISAPPEARING_TIMER_MS },
    ]);
  });

  it("allows up to three pinned chats and always allows unpinning", () => {
    const chats = [chat("one", true), chat("two", true), chat("three", true), chat("four")];

    expect(canPinChat(chats, "one")).toBe(true);
    expect(canPinChat(chats, "four")).toBe(false);
    expect(canPinChat([chat("one", true), chat("two", true)], "three")).toBe(true);
  });

  it("does not allow pinning an unknown chat", () => {
    expect(canPinChat([chat("one")], "missing")).toBe(false);
  });
});
