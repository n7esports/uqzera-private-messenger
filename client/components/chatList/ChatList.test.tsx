// @vitest-environment jsdom

import { act } from "react-dom/test-utils";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChatList from "./ChatList";

const mocks = vi.hoisted(() => ({
  state: {
    chats: [] as unknown[],
    messagesMap: {} as Record<string, unknown>,
    activeChatId: null as string | null,
  },
  setActiveChat: vi.fn(),
  updateChat: vi.fn(async () => null),
  clearChatMessages: vi.fn(async () => {}),
  deleteChat: vi.fn(async () => {}),
}));

vi.mock("../../store/useChatStore", () => ({
  useChatStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      ...mocks.state,
      setActiveChat: mocks.setActiveChat,
      updateChat: mocks.updateChat,
      clearChatMessages: mocks.clearChatMessages,
      deleteChat: mocks.deleteChat,
    }),
}));

function makeChat(
  id: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id,
    recipientPubKey: "",
    alias: id,
    unreadCount: 0,
    updatedAt: Date.UTC(2026, 10, 5, 12),
    kind: "direct",
    pinned: false,
    ...overrides,
  };
}

describe("ChatList", () => {
  let container: HTMLDivElement;
  let root: Root;
  let onOpenChat: ReturnType<typeof vi.fn>;
  let onOpenGuide: ReturnType<typeof vi.fn>;

  const renderList = (guideActive = false) => {
    act(() => {
      root.render(
        <ChatList
          guideActive={guideActive}
          onOpenChat={onOpenChat}
          onOpenGuide={onOpenGuide}
        />,
      );
    });
  };

  beforeEach(() => {
    Object.assign(mocks.state, {
      chats: [],
      messagesMap: {},
      activeChatId: null,
    });
    mocks.setActiveChat.mockReset();
    mocks.updateChat.mockReset();
    mocks.updateChat.mockResolvedValue(null);
    mocks.clearChatMessages.mockReset();
    mocks.deleteChat.mockReset();
    onOpenChat = vi.fn();
    onOpenGuide = vi.fn();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("keeps Guide first and shows no more than three pinned chats", () => {
    mocks.state.chats = [
      makeChat("one", { pinned: true, updatedAt: 4 }),
      makeChat("two", { pinned: true, updatedAt: 3 }),
      makeChat("three", { pinned: true, updatedAt: 2 }),
      makeChat("four", { pinned: true, updatedAt: 1 }),
    ];
    renderList();

    const pinnedSection = container.querySelector(
      'section[aria-labelledby="pinned-heading"]',
    );
    expect(pinnedSection?.querySelector("button")?.textContent).toContain("Guide");
    expect(
      [...(pinnedSection?.querySelectorAll("li[data-chat-id]") ?? [])].map(
        (row) => row.getAttribute("data-chat-id"),
      ),
    ).toEqual(["one", "two", "three"]);
    expect(container.querySelector('[data-chat-id="four"]')).not.toBeNull();
  });

  it("renders the latest message, time, mute state, and unread badge", () => {
    const timestamp = Date.UTC(2026, 10, 5, 9, 30);
    mocks.state.chats = [
      makeChat("contact", {
        alias: "A Contact",
        unreadCount: 128,
        mutedForever: true,
        updatedAt: timestamp,
      }),
    ];
    mocks.state.messagesMap = {
      contact: [
        {
          id: "message",
          chatId: "contact",
          timestamp,
          content: "Latest message",
          type: "text",
          outgoing: false,
        },
      ],
    };
    renderList();

    const row = container.querySelector('[data-chat-id="contact"]');
    expect(row?.textContent).toContain("Latest message");
    expect(row?.textContent).toContain("99+");
    expect(row?.querySelector('[aria-label="Muted"]')).not.toBeNull();
    expect(row?.querySelector("time")?.getAttribute("dateTime")).toBe(
      new Date(timestamp).toISOString(),
    );
  });

  it("marks the archive section and persists archive and mute actions", async () => {
    mocks.state.chats = [
      makeChat("archived", { listId: "archived" }),
      makeChat("active"),
    ];
    renderList();

    const archive = container.querySelector("details");
    expect(archive?.textContent).toContain("Archived");
    expect(archive?.querySelector('[data-chat-id="archived"]')).not.toBeNull();
    expect(container.querySelector('section[aria-labelledby="chats-heading"] [data-chat-id="archived"]')).toBeNull();

    const more = container.querySelector(
      'button[aria-label="More options for active"]',
    );
    act(() => more?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    const menuItems = [...container.querySelectorAll('[role="group"] button')];
    const archiveAction = menuItems.find((item) => item.textContent === "Archive chat");
    await act(async () => {
      archiveAction?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(mocks.updateChat).toHaveBeenCalledWith("active", {
      listId: "archived",
      pinned: false,
    });

    renderList();
    act(() =>
      container
        .querySelector('button[aria-label="More options for active"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
    );
    await act(async () => {
      [...container.querySelectorAll('[role="group"] button')]
        .find((item) => item.textContent === "Mute chat")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(mocks.updateChat).toHaveBeenLastCalledWith("active", {
      mutedForever: true,
      mutedUntil: undefined,
    });
  });

  it("blocks pinning once three chats are pinned and opens selected chats", () => {
    mocks.state.chats = [
      makeChat("one", { pinned: true }),
      makeChat("two", { pinned: true }),
      makeChat("three", { pinned: true }),
      makeChat("four"),
    ];
    renderList();

    act(() =>
      container
        .querySelector('button[aria-label="More options for four"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
    );
    const pinAction = [...container.querySelectorAll('[role="group"] button')].find(
      (item) => item.textContent === "Pin limit reached (3)",
    ) as HTMLButtonElement;
    expect(pinAction.disabled).toBe(true);

    act(() =>
      container
        .querySelector('[data-chat-id="four"] > div > button')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
    );
    expect(mocks.setActiveChat).toHaveBeenCalledWith("four");
    expect(onOpenChat).toHaveBeenCalledOnce();
  });

  it("opens the pinned Guide", () => {
    renderList();
    act(() =>
      [...container.querySelectorAll("button")]
        .find((button) => button.textContent?.includes("Guide"))
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
    );
    expect(onOpenGuide).toHaveBeenCalledOnce();
    expect(mocks.setActiveChat).not.toHaveBeenCalled();
  });
});
