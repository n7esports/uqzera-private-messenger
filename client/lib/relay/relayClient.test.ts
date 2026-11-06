import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WebSocketRelayClient } from "./relayClient";

class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  static instances: MockWebSocket[] = [];

  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((_event: { data: unknown }) => void) | null = null;
  send = vi.fn();

  readonly url: string;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  open(): void {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }

  message(data: unknown): void {
    this.onmessage?.({ data });
  }
}

function sentMessages(socket: MockWebSocket): Array<Record<string, string>> {
  return socket.send.mock.calls.map(([message]) => JSON.parse(message as string));
}

function makeSignedEnvelopePacket(
  id: string,
  recipientPubKey: string,
): Record<string, unknown> {
  return {
    type: "message",
    id,
    senderPubKey: `uqz1.${"b2".repeat(64)}`,
    senderEncryptionPubKey: `uqz1.${"c3".repeat(64)}`,
    signature: "test-signature",
    envelope: {
      recipientPubKey,
      ephemeralPubKey: `uqz1.${"d4".repeat(64)}`,
      nonce: "test-nonce",
      ciphertext: "test-ciphertext",
      timestamp: 1_800_000_000_000,
      counter: 0,
    },
  };
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal("WebSocket", MockWebSocket);
  vi.stubEnv("NEXT_PUBLIC_RELAY_URL", "");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("WebSocketRelayClient", () => {
  it("stays safely offline when no relay URL is configured", async () => {
    const client = new WebSocketRelayClient();
    const onStatus = vi.fn();

    client.onStatus(onStatus);
    expect(onStatus).toHaveBeenCalledWith("offline");
    expect(MockWebSocket.instances).toHaveLength(0);
    await client.publish("channel-1", "sealed");
    await client.ack("message-1");
    await client.connect("");
    expect(MockWebSocket.instances).toHaveLength(0);
  });

  it("connects, subscribes, publishes, acknowledges and delivers messages", async () => {
    const client = new WebSocketRelayClient();
    const connection = client.connect("wss://relay.example.test");
    const onMessage = vi.fn();
    client.subscribe("channel-1", onMessage);
    const socket = MockWebSocket.instances[0];
    const packet = makeSignedEnvelopePacket("message-1", "channel-1");

    expect(socket.url).toBe("wss://relay.example.test");
    socket.open();
    await connection;
    const publish = client.publish("channel-1", JSON.stringify(packet));
    const publishRequest = sentMessages(socket)[1];
    socket.message(JSON.stringify({ id: publishRequest.id, status: "ok" }));
    await publish;
    socket.message(JSON.stringify({ type: "message", packet }));
    const acknowledge = client.ack("message-1");
    const ackRequest = sentMessages(socket)[2];
    socket.message(JSON.stringify({ id: ackRequest.id, status: "ok" }));
    await acknowledge;

    expect(sentMessages(socket)).toEqual([
      {
        type: "subscribe",
        id: expect.any(String),
        recipientPubKey: "channel-1",
      },
      { type: "publish", id: expect.any(String), packet },
      {
        type: "ack",
        id: expect.any(String),
        messageId: "message-1",
        recipientPubKey: "channel-1",
      },
    ]);
    expect(onMessage).toHaveBeenCalledWith(JSON.stringify(packet));
  });

  it("reports connection status changes and lets listeners unsubscribe", () => {
    const client = new WebSocketRelayClient("wss://relay.example.test");
    const onStatus = vi.fn();
    const unsubscribe = client.onStatus(onStatus);
    const socket = MockWebSocket.instances[0];

    socket.open();
    socket.close();
    unsubscribe();

    expect(onStatus.mock.calls.map(([status]) => status)).toEqual([
      "connecting",
      "connected",
      "disconnected",
    ]);
  });

  it("reconnects with exponentially increasing delays", () => {
    vi.useFakeTimers();
    const client = new WebSocketRelayClient("wss://relay.example.test");
    const first = MockWebSocket.instances[0];
    client.subscribe("channel-1", vi.fn());
    first.open();
    first.close();

    vi.advanceTimersByTime(499);
    expect(MockWebSocket.instances).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(MockWebSocket.instances).toHaveLength(2);
    MockWebSocket.instances[1].close();

    vi.advanceTimersByTime(999);
    expect(MockWebSocket.instances).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(MockWebSocket.instances).toHaveLength(3);
    MockWebSocket.instances[2].open();
    expect(sentMessages(MockWebSocket.instances[2])).toEqual([
      {
        type: "subscribe",
        id: expect.any(String),
        recipientPubKey: "channel-1",
      },
    ]);
  });

  it("rejects publishes while connecting", async () => {
    const client = new WebSocketRelayClient("wss://relay.example.test");
    const packet = makeSignedEnvelopePacket("message-1", "channel-1");
    const publish = client.publish("channel-1", JSON.stringify(packet));
    const socket = MockWebSocket.instances[0];

    await expect(publish).rejects.toThrow("Relay is not connected.");
    socket.open();

    expect(sentMessages(socket)).toEqual([]);
  });
});
