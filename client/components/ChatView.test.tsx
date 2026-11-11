// @vitest-environment jsdom

import type { ReactNode } from "react";
import { act } from "react-dom/test-utils";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "../store/useChatStore";
import { ChatView } from "./ChatView";

const mockStore = vi.hoisted(() => {
  const sendMessage = vi.fn();
  const showToast = vi.fn();
  const setEphemeralTtl = vi.fn();
  const broadcastTyping = vi.fn();
  const setReplyTo = vi.fn();

  return {
    sendMessage,
    state: {
      chats: [{ id: "chat-1", alias: "Avery", updatedAt: 1_700_000_000_000 }],
      messagesMap: {} as Record<string, ChatMessage[]>,
      sendMessage,
      showToast,
      ephemeralTtl: null as number | null,
      setEphemeralTtl,
      peerTypingByChat: {},
      broadcastTyping,
      replyTo: null,
      setReplyTo,
    },
  };
});

vi.mock("../store/useChatStore", () => ({
  useChatStore: Object.assign(
    (selector: (_state: typeof mockStore.state) => unknown) => selector(mockStore.state),
    { getState: () => mockStore.state },
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      drag: _drag,
      dragConstraints: _dragConstraints,
      onDragEnd: _onDragEnd,
      ...props
    }: {
      children: ReactNode;
      drag?: unknown;
      dragConstraints?: unknown;
      onDragEnd?: unknown;
      className?: string;
    }) => <div {...props}>{children}</div>,
  },
}));

const mountedRoots: Array<{ root: Root; container: HTMLDivElement }> = [];

function renderChat(messages: ChatMessage[] = []) {
  mockStore.state.messagesMap = { "chat-1": messages };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mountedRoots.push({ root, container });
  act(() => root.render(<ChatView chatId="chat-1" />));
  return container;
}

function makeMessage(
  id: string,
  status: ChatMessage["status"] | "failed",
  outgoing = true,
): ChatMessage {
  return {
    id,
    chatId: "chat-1",
    senderPubKey: outgoing ? "me" : "peer-key-12345678",
    content: `Message ${id}`,
    type: "text",
    status: status as ChatMessage["status"],
    timestamp: 1_700_000_000_000,
    outgoing,
  };
}

function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  setter?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

beforeEach(() => {
  mockStore.sendMessage.mockReset().mockResolvedValue(undefined);
  mockStore.state.replyTo = null;
  mockStore.state.ephemeralTtl = null;
  mockStore.state.messagesMap = { "chat-1": [] };
});

afterEach(() => {
  for (const { root, container } of mountedRoots.splice(0)) {
    act(() => root.unmount());
    container.remove();
  }
});

describe("ChatView", () => {
  it("renders incoming and outgoing message content", () => {
    const container = renderChat([
      makeMessage("incoming", "read", false),
      makeMessage("outgoing", "sent"),
    ]);

    expect(container.textContent).toContain("Message incoming");
    expect(container.textContent).toContain("Message outgoing");
    // Raw public-key material must never leak into the message surface.
    expect(container.textContent).not.toContain("peer-key");
  });

  it("shows a distinct indicator for every delivery state", () => {
    const container = renderChat([
      makeMessage("queued", "queued"),
      makeMessage("relay-accepted", "relayAccepted"),
      makeMessage("sent", "sent"),
      makeMessage("delivered", "delivered"),
      makeMessage("read", "read"),
      makeMessage("failed", "failed"),
    ]);

    for (const label of [
      "Sending",
      "Relay accepted",
      "Sent",
      "Delivered",
      "Read",
      "Failed to send",
    ]) {
      expect(container.querySelector(`[role="img"][aria-label="${label}"]`)).not.toBeNull();
    }

    expect(container.querySelector('[aria-label="Sending"]')?.className).toContain(
      "text-text-secondary",
    );
    expect(container.querySelector('[aria-label="Delivered"]')?.className).toContain(
      "text-emerald-400",
    );
    expect(container.querySelector('[aria-label="Read"]')?.className).toContain(
      "text-text-secondary",
    );
    expect(container.querySelector('[aria-label="Relay accepted"]')?.className).toContain(
      "text-text-secondary",
    );
    expect(container.querySelector('[aria-label="Failed to send"]')?.className).toContain(
      "text-error",
    );
  });

  it("submits a message from the composer button", async () => {
    const container = renderChat();
    const textarea = container.querySelector('textarea[aria-label="Message"]');
    const sendButton = container.querySelector('button[aria-label="Send message"]');
    expect(textarea).not.toBeNull();
    expect(sendButton).not.toBeNull();

    await act(async () => {
      setTextareaValue(textarea!, "  Hello there  ");
    });
    await act(async () => {
      sendButton!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(mockStore.sendMessage).toHaveBeenCalledWith(
      "Hello there",
      "text",
      undefined,
      undefined,
      undefined,
    );
  });

  it("sends on Enter", async () => {
    const container = renderChat();
    const textarea = container.querySelector('textarea[aria-label="Message"]');
    expect(textarea).not.toBeNull();

    await act(async () => {
      setTextareaValue(textarea!, "Send with Enter");
    });
    await act(async () => {
      textarea!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
      await Promise.resolve();
    });

    expect(mockStore.sendMessage).toHaveBeenCalledWith(
      "Send with Enter",
      "text",
      undefined,
      undefined,
      undefined,
    );
  });
});
