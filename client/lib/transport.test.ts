import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const encryptedRows = new Map<string, Uint8Array>();

vi.mock("./dek", () => ({
  findEncryptedRowsByScope: vi.fn(async () =>
    Array.from(encryptedRows.entries()).map(([key, plaintext]) => {
      const rowId = key.split(":")[1] ?? "pending";
      return { rowId, plaintext: Uint8Array.from(plaintext) };
    }),
  ),
  storeEncryptedRow: vi.fn(
    async (
      _dek: Uint8Array,
      table: string,
      rowId: string,
      owner: string,
      scope: string,
      plaintext: Uint8Array,
    ) => {
      encryptedRows.set(
        `${table}:${rowId}:${owner}:${scope}`,
        Uint8Array.from(plaintext),
      );
    },
  ),
}));

import { TransportManager } from "./transport";
import { EncryptedOutbox } from "./outbox";
import {
  OutboxStatus,
  OUTBOX_INITIAL_RETRY_DELAY_MS,
  OUTBOX_MAX_RETRY_DELAY_MS,
  OUTBOX_MAX_AGE_MS,
  getOutboxRetryDelay,
  hasOutboxExpired,
} from "./contracts/outbox";
import type { RelayClient, RelayConnectionStatus } from "./contracts/relayClient";
import { generateIdentity } from "./crypto";
import {
  buildSignedReceipt,
  encodeBytes,
  type SignedEnvelope,
} from "./protocol";

const ownPublicKey = encodeBytes(new Uint8Array(32).fill(7));
const peerPublicKey = encodeBytes(new Uint8Array(32).fill(9));

function makePacket(
  recipientPubKey: string,
  id = `msg-${Math.random().toString(36).slice(2)}`,
): SignedEnvelope {
  return {
    type: "message",
    id,
    senderPubKey: ownPublicKey,
    senderEncryptionPubKey: ownPublicKey,
    signature: "signature",
    envelope: {
      recipientPubKey,
      ephemeralPubKey: ownPublicKey,
      nonce: encodeBytes(new Uint8Array(24)),
      ciphertext: encodeBytes(new Uint8Array([1, 2, 3])),
      timestamp: Date.now(),
      counter: 0,
    },
  };
}

type RelayClientMock = RelayClient & {
  emitStatus: (_status: RelayConnectionStatus) => void;
  emitMessage: (_channelId: string, _sealed: string) => void;
};

function createRelayClientMock(): RelayClientMock {
  const subscriptions = new Map<string, (_sealed: string) => void>();
  const statusListeners = new Set<(_status: RelayConnectionStatus) => void>();

  const client: RelayClientMock = {
    connect: vi.fn(async () => {}),
    publish: vi.fn(async () => {}),
    subscribe: vi.fn((channelId: string, onMessage: (_sealed: string) => void) => {
      subscriptions.set(channelId, onMessage);
      return () => subscriptions.delete(channelId);
    }),
    ack: vi.fn(async () => {}),
    onStatus: vi.fn((callback) => {
      statusListeners.add(callback);
      callback("offline");
      return () => statusListeners.delete(callback);
    }),
    emitStatus(status) {
      for (const handler of statusListeners) handler(status);
    },
    emitMessage(channelId, sealed) {
      const handler = subscriptions.get(channelId);
      if (handler) handler(sealed);
    },
  };

  return client;
}

beforeEach(() => {
  encryptedRows.clear();
  vi.useRealTimers();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("relay transport", () => {
  it("publish sends the sealed signed packet through relayClient.publish with the recipient channel", async () => {
    const client = createRelayClientMock();
    const manager = new TransportManager(client, "ws://relay.test");
    const callbacks = {
      onMessage: vi.fn(),
      onConnectionChange: vi.fn(),
      onError: vi.fn(),
    };

    manager.start(new Uint8Array(32), ownPublicKey, callbacks);
    client.emitStatus("connected");

    const packet = makePacket(peerPublicKey);
    await manager.sendEnvelope(packet);

    expect(client.publish).toHaveBeenCalledWith(
      packet.envelope.recipientPubKey,
      JSON.stringify(packet),
    );
    expect(callbacks.onConnectionChange).toHaveBeenCalledWith("connected");

    manager.stop();
  });

  it("ignores inbound receipt frames and does not change message status", async () => {
    const client = createRelayClientMock();
    const onMessage = vi.fn();
    const manager = new TransportManager(client, "ws://relay.test");

    manager.start(new Uint8Array(32), ownPublicKey, {
      onMessage,
      onConnectionChange: vi.fn(),
      onError: vi.fn(),
    });
    client.emitStatus("connected");
    client.emitMessage(
      ownPublicKey,
      JSON.stringify({ type: "receipt", messageId: "receipt-1" }),
    );

    await Promise.resolve();

    expect(onMessage).not.toHaveBeenCalled();
    expect(client.ack).not.toHaveBeenCalled();
    expect(manager.getIgnoredReceiptCount()).toBe(1);

    manager.stop();
  });

  it("accepts a signed receipt for this recipient and acknowledges it", async () => {
    const client = createRelayClientMock();
    const onReceipt = vi.fn();
    const manager = new TransportManager(client, "ws://relay.test");
    const sender = await generateIdentity();
    const receiver = await generateIdentity();
    const receipt = await buildSignedReceipt(
      "message-1",
      "delivered",
      receiver,
      sender.encryptionPublicKey,
    );

    manager.start(new Uint8Array(32), encodeBytes(sender.encryptionPublicKey), {
      onMessage: vi.fn(),
      onReceipt,
      onConnectionChange: vi.fn(),
      onError: vi.fn(),
    });
    client.emitStatus("connected");
    client.emitMessage(
      encodeBytes(sender.encryptionPublicKey),
      JSON.stringify(receipt),
    );

    await vi.waitFor(() => expect(onReceipt).toHaveBeenCalledWith(receipt));
    expect(client.ack).toHaveBeenCalledWith(receipt.id);
    expect(manager.getIgnoredReceiptCount()).toBe(0);

    manager.stop();
  });

  it("runs in offline mode without throwing when the relay URL is missing", () => {
    const client = createRelayClientMock();
    const manager = new TransportManager(client, undefined);
    const onConnectionChange = vi.fn();

    expect(() =>
      manager.start(new Uint8Array(32), ownPublicKey, {
        onMessage: vi.fn(),
        onConnectionChange,
        onError: vi.fn(),
      }),
    ).not.toThrow();
    expect(onConnectionChange).toHaveBeenCalledWith("disconnected");
    expect(client.connect).not.toHaveBeenCalled();

    manager.stop();
  });
});

describe("relay outbox", () => {
  it("marks a relay ACK as relay accepted, not delivered", async () => {
    const dek = new Uint8Array(32).fill(3);
    const packet = makePacket(peerPublicKey, "relay-ack-test");
    const publish = vi.fn(async () => {});
    const outbox = new EncryptedOutbox(dek, publish);

    await outbox.start();
    await outbox.enqueue(packet);

    const state = (outbox as unknown as { items: Array<{ status: string }> }).items;
    expect(publish).toHaveBeenCalledTimes(1);
    expect(state[0]?.status).toBe(OutboxStatus.RelayAccepted);
    expect(state[0]?.status).not.toBe(OutboxStatus.Delivered);

    outbox.stop();
  });

  it("uses the outbox retry schedule with a 30s base and 10 minute cap", () => {
    expect(getOutboxRetryDelay(0)).toBe(OUTBOX_INITIAL_RETRY_DELAY_MS);
    expect(getOutboxRetryDelay(1)).toBe(OUTBOX_INITIAL_RETRY_DELAY_MS * 2);
    expect(getOutboxRetryDelay(8)).toBe(OUTBOX_MAX_RETRY_DELAY_MS);
    expect(getOutboxRetryDelay(99)).toBe(OUTBOX_MAX_RETRY_DELAY_MS);
  });

  it("expires queued messages after 7 days, not after a fixed retry count", () => {
    const now = Date.now();

    expect(hasOutboxExpired(now - OUTBOX_MAX_AGE_MS - 1)).toBe(true);
    expect(hasOutboxExpired(now - OUTBOX_MAX_AGE_MS)).toBe(true);
    expect(hasOutboxExpired(now - OUTBOX_MAX_AGE_MS + 1)).toBe(false);
  });

  it("survives a simulated restart and retries until an ACK removes the item", async () => {
    vi.useFakeTimers();

    const dek = new Uint8Array(32).fill(9);
    const packet = makePacket(peerPublicKey, "persisted-msg");
    const publish = vi.fn(async () => {});

    const first = new EncryptedOutbox(dek, publish);
    await first.start();
    await first.enqueue(packet);
    first.stop();

    const restarted = new EncryptedOutbox(dek, publish);
    await restarted.start();
    await restarted.acknowledge(packet.id, peerPublicKey);

    expect((restarted as unknown as { items: Array<{ status: string }> }).items).toHaveLength(0);

    restarted.stop();
    vi.useRealTimers();
  });
});
