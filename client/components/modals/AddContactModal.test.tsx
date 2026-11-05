// @vitest-environment jsdom
import React from "react";
import { act, Simulate } from "react-dom/test-utils";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { encodeBytes } from "../../lib/protocol";

const mocks = vi.hoisted(() => ({
  identityKey: new Uint8Array(32).fill(1),
  chats: [] as { recipientPubKey: string }[],
  addContact: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("../../store/useChatStore", () => ({
  useChatStore: (selector: (state: unknown) => unknown) =>
    selector({
      chats: mocks.chats,
      addContact: mocks.addContact,
      showToast: mocks.showToast,
    }),
}));

vi.mock("../../store/useVaultStore", () => ({
  useVaultStore: (selector: (state: unknown) => unknown) =>
    selector({ identity: { encryptionPublicKey: mocks.identityKey } }),
}));

vi.mock("../icons/BoxQRCode", () => ({
  default: ({ payload }: { payload: string }) => (
    <div data-qr-payload={payload} />
  ),
}));

import AddContactModal from "./AddContactModal";

let root: Root;
let container: HTMLDivElement;
const ownKey = () => encodeBytes(mocks.identityKey);
const otherKey = () => encodeBytes(new Uint8Array(32).fill(2));

function renderModal() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<AddContactModal open onClose={vi.fn()} />));
}

function labeledInput(label: string) {
  const element = Array.from(container.querySelectorAll("label")).find((item) =>
    item.textContent?.includes(label),
  )?.querySelector("input");
  if (!element) throw new Error(`Missing input: ${label}`);
  return element;
}

function changeInput(input: HTMLInputElement, value: string) {
  act(() => Simulate.change(input, { target: { value } }));
}

async function submitContact(key: string, alias: string) {
  act(() => {
    Simulate.click(
      Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "Add Contact",
      )!,
    );
  });
  changeInput(labeledInput("Contact Share ID"), key);
  changeInput(labeledInput("Nickname"), alias);
  await act(async () => {
    Simulate.click(
      Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "Save Contact",
      )!,
    );
    await Promise.resolve();
  });
}

beforeEach(() => {
  mocks.identityKey = new Uint8Array(32).fill(1);
  mocks.chats = [];
  mocks.addContact.mockReset().mockResolvedValue({ alias: "Contact" });
  mocks.showToast.mockReset();
  renderModal();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("AddContactModal", () => {
  it("shows the own uqz1 share ID and matching QR payload", () => {
    const ownID = `uqz1.${ownKey()}`;
    expect(container.textContent).toContain(ownID);
    expect(container.querySelector("[data-qr-payload]")?.getAttribute("data-qr-payload")).toBe(
      ownID,
    );
  });

  it("rejects malformed or wrong-length uqz1 IDs", async () => {
    await submitContact("uqz1.invalid", "Friend");
    expect(container.textContent).toContain("Enter a valid uqz1. ID or public key.");
    expect(mocks.addContact).not.toHaveBeenCalled();

    await submitContact(`uqz1.${encodeBytes(new Uint8Array(31))}`, "Friend");
    expect(container.textContent).toContain("Enter a valid uqz1. ID or public key.");
    expect(mocks.addContact).not.toHaveBeenCalled();
  });

  it("requires aliases between 1 and 40 characters", async () => {
    await submitContact(`uqz1.${otherKey()}`, "");
    expect(container.textContent).toContain("Nickname must be 1–40 characters.");
    expect(mocks.addContact).not.toHaveBeenCalled();

    await submitContact(`uqz1.${otherKey()}`, "x".repeat(41));
    expect(container.textContent).toContain("Nickname must be 1–40 characters.");
    expect(mocks.addContact).not.toHaveBeenCalled();

    await submitContact(`uqz1.${otherKey()}`, "x");
    expect(mocks.addContact).toHaveBeenCalledWith("x", otherKey());

    mocks.addContact.mockClear();
    await submitContact(`uqz1.${otherKey()}`, "x".repeat(40));
    expect(mocks.addContact).toHaveBeenCalledWith("x".repeat(40), otherKey());
  });

  it("blocks adding an existing contact", async () => {
    mocks.chats = [{ recipientPubKey: otherKey() }];
    await submitContact(`uqz1.${otherKey()}`, "Friend");

    expect(container.textContent).toContain("This contact is already in your contacts.");
    expect(mocks.addContact).not.toHaveBeenCalled();
  });

  it("blocks adding the user's own ID", async () => {
    await submitContact(`uqz1.${ownKey()}`, "Friend");

    expect(container.textContent).toContain("You cannot add your own identity as a contact.");
    expect(mocks.addContact).not.toHaveBeenCalled();
  });
});
