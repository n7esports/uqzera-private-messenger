import {
  getRelayUrl,
  type RelayClient,
  type RelayConnectionStatus,
} from "./contracts/relayClient";
import { WebSocketRelayClient } from "./relay/relayClient";
import {
  type SignedEnvelope,
  type SignedReceipt,
  verifySignedEnvelope,
  verifySignedReceipt,
} from "./protocol";

export interface TransportCallbacks {
  onMessage: (_packet: SignedEnvelope) => void | Promise<void>;
  /** Authenticated delivery/read receipt from a peer. */
  onReceipt?: (_receipt: SignedReceipt) => void | Promise<void>;
  onConnectionChange: (_status: "connecting" | "connected" | "disconnected") => void;
  onError: (_error: Error) => void;
}

export type RelayStatus = "connecting" | "connected" | "disconnected";
export type DeliveryResult = "sent" | "queued";

const MAX_RECENTLY_SEEN_MESSAGE_IDS = 1000;

function parseSignedEnvelope(value: unknown): SignedEnvelope | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const packet = value as Record<string, unknown>;
  if (
    packet.type !== "message" ||
    typeof packet.id !== "string" ||
    !/^[A-Za-z0-9-]{1,128}$/.test(packet.id) ||
    typeof packet.senderPubKey !== "string" ||
    typeof packet.senderEncryptionPubKey !== "string" ||
    typeof packet.signature !== "string" ||
    typeof packet.envelope !== "object" ||
    packet.envelope === null ||
    Array.isArray(packet.envelope)
  ) {
    return null;
  }
  const envelope = packet.envelope as Record<string, unknown>;
  if (
    typeof envelope.recipientPubKey !== "string" ||
    typeof envelope.ephemeralPubKey !== "string" ||
    typeof envelope.nonce !== "string" ||
    typeof envelope.ciphertext !== "string" ||
    typeof envelope.timestamp !== "number" ||
    !Number.isSafeInteger(envelope.counter) ||
    (envelope.counter as number) < 0
  ) {
    return null;
  }
  return value as SignedEnvelope;
}

function parseSignedReceipt(value: unknown): SignedReceipt | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const receipt = value as Record<string, unknown>;
  if (
    receipt.type !== "receipt" ||
    typeof receipt.id !== "string" ||
    receipt.id.length === 0 ||
    typeof receipt.messageId !== "string" ||
    receipt.messageId.length === 0 ||
    (receipt.status !== "delivered" && receipt.status !== "read") ||
    typeof receipt.senderPubKey !== "string" ||
    typeof receipt.senderEncryptionPubKey !== "string" ||
    typeof receipt.recipientPubKey !== "string" ||
    typeof receipt.signature !== "string" ||
    typeof receipt.timestamp !== "number" ||
    !Number.isSafeInteger(receipt.timestamp)
  ) {
    return null;
  }
  return value as SignedReceipt;
}

const RECEIPT_MAX_SKEW_MS = 24 * 60 * 60 * 1000;

export class TransportManager {
  private readonly client: RelayClient;
  private readonly configuredRelayUrl: string | undefined;
  private callbacks: TransportCallbacks | null = null;
  private recipientPubKey: string | null = null;
  private relayStatus: RelayConnectionStatus = "offline";
  private unsubscribeMessages: (() => void) | null = null;
  private unsubscribeStatus: (() => void) | null = null;
  private readonly seenMessageIds = new Set<string>();
  private ignoredReceiptCount = 0;
  private stopped = true;
  private messageProcessing: Promise<void> = Promise.resolve();

  constructor(
    _relayClient: RelayClient = new WebSocketRelayClient(),
    _relayUrl = getRelayUrl(process.env.NEXT_PUBLIC_RELAY_URL),
  ) {
    this.client = _relayClient;
    this.configuredRelayUrl = _relayUrl;
  }

  start(
    _vaultKey: Uint8Array,
    recipientPubKey: string,
    callbacks: TransportCallbacks,
  ): void {
    this.recipientPubKey = recipientPubKey;
    this.callbacks = callbacks;
    this.stopped = false;
    this.unsubscribeMessages?.();
    this.unsubscribeStatus?.();
    this.unsubscribeMessages = this.client.subscribe(
      recipientPubKey,
      (sealed) => {
        this.messageProcessing = this.messageProcessing
          .then(() => this.handleFrame(sealed))
          .catch((error: unknown) => {
            this.callbacks?.onError(
              error instanceof Error
                ? error
                : new Error("Could not process an incoming relay frame."),
            );
          });
      },
    );
    this.unsubscribeStatus = this.client.onStatus((status) => {
      this.relayStatus = status;
      this.setConnectionStatus(status);
    });

    if (this.configuredRelayUrl) {
      void this.client.connect(this.configuredRelayUrl).catch((error: unknown) => {
        this.callbacks?.onError(
          error instanceof Error
            ? error
            : new Error("Could not connect to the relay."),
        );
      });
    } else {
      this.relayStatus = "offline";
      this.setConnectionStatus("offline");
    }
  }

  stop(): void {
    this.stopped = true;
    this.unsubscribeMessages?.();
    this.unsubscribeStatus?.();
    this.unsubscribeMessages = null;
    this.unsubscribeStatus = null;
    this.recipientPubKey = null;
    this.callbacks = null;
    this.relayStatus = "offline";
    this.seenMessageIds.clear();
    this.setConnectionStatus("offline");
  }

  async sendEnvelope(packet: SignedEnvelope): Promise<void> {
    if (this.stopped) throw new Error("Relay transport is not running.");
    if (!this.configuredRelayUrl || this.relayStatus !== "connected") {
      throw new Error("Relay is offline; message remains in the encrypted outbox.");
    }
    await this.client.publish(
      packet.envelope.recipientPubKey,
      JSON.stringify(packet),
    );
  }

  async sendReceipt(receipt: SignedReceipt): Promise<void> {
    if (this.stopped) throw new Error("Relay transport is not running.");
    if (!this.configuredRelayUrl || this.relayStatus !== "connected") {
      throw new Error("Relay is offline; the receipt was not delivered.");
    }
    if (!this.client.sendReceipt) {
      throw new Error("This relay client does not support receipts.");
    }
    await this.client.sendReceipt(receipt);
  }

  getIgnoredReceiptCount(): number {
    return this.ignoredReceiptCount;
  }

  private async handleFrame(sealed: string): Promise<void> {
    if (this.stopped) return;
    let value: unknown;
    try {
      value = JSON.parse(sealed);
    } catch {
      return;
    }

    if (isReceiptFrame(value)) {
      const receipt = parseSignedReceipt(value);
      if (
        !receipt ||
        receipt.recipientPubKey !== this.recipientPubKey ||
        Math.abs(Date.now() - receipt.timestamp) > RECEIPT_MAX_SKEW_MS ||
        !(await verifySignedReceipt(receipt))
      ) {
        this.ignoredReceiptCount += 1;
        return;
      }
      await this.callbacks?.onReceipt?.(receipt);
      await this.acknowledge(receipt.id);
      return;
    }

    const packet = parseSignedEnvelope(value);
    if (!packet) return;
    if (this.seenMessageIds.has(packet.id)) {
      await this.acknowledge(packet.id);
      return;
    }
    if (!(await verifySignedEnvelope(packet))) return;
    await this.callbacks?.onMessage(packet);
    this.rememberMessage(packet.id);
    await this.acknowledge(packet.id);
  }

  private rememberMessage(messageId: string): void {
    this.seenMessageIds.add(messageId);
    if (this.seenMessageIds.size > MAX_RECENTLY_SEEN_MESSAGE_IDS) {
      const oldest = this.seenMessageIds.values().next().value;
      if (oldest !== undefined) this.seenMessageIds.delete(oldest);
    }
  }

  private async acknowledge(messageId: string): Promise<void> {
    try {
      await this.client.ack(messageId);
    } catch (error) {
      this.callbacks?.onError(
        error instanceof Error
          ? error
          : new Error("Could not acknowledge the relay message."),
      );
    }
  }

  private setConnectionStatus(status: RelayConnectionStatus): void {
    if (this.stopped) return;
    this.callbacks?.onConnectionChange(
      status === "offline" ? "disconnected" : status,
    );
  }
}

function isReceiptFrame(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "receipt"
  );
}

export const transportManager = new TransportManager();
