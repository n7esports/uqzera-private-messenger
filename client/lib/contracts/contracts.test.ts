import { describe, expect, it } from "vitest";
import {
  getOutboxRetryDelay,
  hasOutboxExpired,
  OutboxStatus,
} from "./outbox";
import {
  getRelayUrl,
  isRelayOffline,
  type RelayClient,
} from "./relayClient";
import { isEnvelope, type Envelope } from "./envelope";
import { parseShareKey } from "./shareKey";

describe("share key contracts", () => {
  const shareKey = `uqz1.${"a1".repeat(64)}`;

  it("parses the exact prefix and 128 hexadecimal characters to 64 bytes", () => {
    const result = parseShareKey(shareKey);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.bytes).toBeInstanceOf(Uint8Array);
      expect(result.bytes).toHaveLength(64);
      expect(result.bytes[0]).toBe(0xa1);
    }
  });

  it.each([
    ["wrong prefix", `uqz2.${"a1".repeat(64)}`],
    ["short key", `uqz1.${"a1".repeat(63)}`],
    ["long key", `uqz1.${"a1".repeat(65)}`],
    ["non-hexadecimal key", `uqz1.${"a1".repeat(63)}xz`],
    ["missing prefix", "a1".repeat(64)],
  ])("rejects a key with %s", (_description, input) => {
    expect(parseShareKey(input)).toEqual({
      ok: false,
      reason: "invalid-format",
    });
  });

  it("rejects the caller's own key, even when hex casing differs", () => {
    expect(parseShareKey(`uqz1.${"A1".repeat(64)}`, shareKey)).toEqual({
      ok: false,
      reason: "self",
    });
  });
});

describe("envelope contract", () => {
  const validEnvelope: Envelope = {
    id: "envelope-1",
    type: "msg",
    fromShareKey: `uqz1.${"ab".repeat(64)}`,
    body: { ciphertext: "sealed" },
    ts: 1_800_000_000_000,
    expiresAt: 1_800_000_060_000,
    msgId: "message-1",
  };

  it("accepts a valid envelope", () => {
    expect(isEnvelope(validEnvelope)).toBe(true);
  });

  it.each([
    ["unknown type", { ...validEnvelope, type: "message" }],
    ["invalid sender key", { ...validEnvelope, fromShareKey: "bad-key" }],
    ["missing id", { ...validEnvelope, id: "" }],
    ["non-finite timestamp", { ...validEnvelope, ts: Number.NaN }],
    ["invalid expiry", { ...validEnvelope, expiresAt: "later" }],
    ["invalid message id", { ...validEnvelope, msgId: 7 }],
  ])("rejects envelopes with %s", (_description, input) => {
    expect(isEnvelope(input)).toBe(false);
  });
});

describe("outbox policy", () => {
  it("exports the supported outbox statuses", () => {
    expect(Object.values(OutboxStatus)).toEqual([
      "waiting",
      "relayAccepted",
      "delivered",
      "failed",
    ]);
  });

  it("uses 30-second exponential retry delays capped at ten minutes", () => {
    expect(getOutboxRetryDelay(0)).toBe(30_000);
    expect(getOutboxRetryDelay(1)).toBe(60_000);
    expect(getOutboxRetryDelay(2)).toBe(120_000);
    expect(getOutboxRetryDelay(7)).toBe(600_000);
    expect(getOutboxRetryDelay(20)).toBe(600_000);
  });

  it("marks an outbox item expired after seven days", () => {
    const createdAt = 1_800_000_000_000;
    expect(hasOutboxExpired(createdAt, createdAt + 7 * 24 * 60 * 60 * 1000 - 1))
      .toBe(false);
    expect(hasOutboxExpired(createdAt, createdAt + 7 * 24 * 60 * 60 * 1000))
      .toBe(true);
  });
});

describe("relay configuration", () => {
  it("uses the configured URL and treats absent or blank configuration as offline", () => {
    expect(getRelayUrl("wss://relay.example")).toBe("wss://relay.example");
    expect(getRelayUrl(undefined)).toBeUndefined();
    expect(getRelayUrl("  ")).toBeUndefined();
    expect(isRelayOffline(undefined)).toBe(true);
    expect(isRelayOffline("wss://relay.example")).toBe(false);
  });

  it("exposes the transport contract", () => {
    const relay: RelayClient = {
      connect: async (_url) => {},
      publish: async (_channelId, _sealed) => {},
      subscribe: (_channelId, _onMessage) => () => {},
      ack: async (_msgId) => {},
      onStatus: (_callback) => () => {},
    };

    expect(relay).toBeDefined();
  });
});
