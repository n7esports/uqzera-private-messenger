import {
  OUTBOX_MAX_AGE_MS,
  getOutboxRetryDelay,
  hasOutboxExpired,
  OutboxStatus,
} from "./contracts/outbox";
import {
  findEncryptedRowsByScope,
  storeEncryptedRow,
} from "./dek";
import type { SignedEnvelope } from "./protocol";

interface OutboxItem {
  id: string;
  packet: SignedEnvelope;
  status: OutboxStatus;
  attempts: number;
  nextAttemptAt: number;
  createdAt: number;
}

const OUTBOX_TABLE = "relayOutbox";
const OUTBOX_ROW_ID = "pending";
const OUTBOX_SCOPE = "relay";
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", { fatal: true });

function isOutboxItem(value: unknown): value is OutboxItem {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value &&
    typeof value.id === "string" &&
    "packet" in value &&
    typeof value.packet === "object" &&
    value.packet !== null &&
    "id" in value.packet &&
    value.packet.id === value.id &&
    "envelope" in value.packet &&
    typeof value.packet.envelope === "object" &&
    value.packet.envelope !== null &&
    "recipientPubKey" in value.packet.envelope &&
    typeof value.packet.envelope.recipientPubKey === "string" &&
    "status" in value &&
    Object.values(OutboxStatus).includes(value.status as OutboxStatus) &&
    "attempts" in value &&
    typeof value.attempts === "number" &&
    Number.isSafeInteger(value.attempts) &&
    value.attempts >= 0 &&
    "nextAttemptAt" in value &&
    typeof value.nextAttemptAt === "number" &&
    Number.isFinite(value.nextAttemptAt) &&
    "createdAt" in value &&
    typeof value.createdAt === "number" &&
    Number.isFinite(value.createdAt)
  );
}

export class EncryptedOutbox {
  private readonly dek: Uint8Array;
  private readonly publish: (packet: SignedEnvelope) => Promise<void>;
  private readonly onPublished: (messageId: string) => void;
  private readonly onFailed: (messageId: string) => void;
  private items: OutboxItem[] = [];
  private loaded = false;
  private started = false;
  private processing = false;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private operation: Promise<void> = Promise.resolve();

  constructor(
    dek: Uint8Array,
    publish: (packet: SignedEnvelope) => Promise<void>,
    callbacks: {
      onPublished?: (messageId: string) => void;
      onFailed?: (messageId: string) => void;
    } = {},
  ) {
    this.dek = dek.slice();
    this.publish = publish;
    this.onPublished = callbacks.onPublished ?? (() => {});
    this.onFailed = callbacks.onFailed ?? (() => {});
  }

  start(): Promise<void> {
    return this.serialize(async () => {
      if (this.started) return;
      await this.load();
      this.started = true;
      await this.drain();
    });
  }

  enqueue(packet: SignedEnvelope): Promise<void> {
    return this.serialize(async () => {
      await this.load();
      if (this.items.some((item) => item.id === packet.id)) return;
      const now = Date.now();
      this.items.push({
        id: packet.id,
        packet,
        status: OutboxStatus.Waiting,
        attempts: 0,
        nextAttemptAt: now,
        createdAt: now,
      });
      await this.save();
      if (this.started) await this.drain();
    });
  }

  acknowledge(messageId: string, signerEncryptionPubKey: string): Promise<void> {
    return this.serialize(async () => {
      await this.load();
      const item = this.items.find((entry) => entry.id === messageId);
      if (
        !item ||
        item.packet.envelope.recipientPubKey !== signerEncryptionPubKey
      ) {
        return;
      }
      this.items = this.items.filter((entry) => entry.id !== messageId);
      await this.save();
      this.scheduleRetry();
    });
  }

  remove(messageId: string): Promise<void> {
    return this.serialize(async () => {
      await this.load();
      const remaining = this.items.filter((item) => item.id !== messageId);
      if (remaining.length === this.items.length) return;
      this.items = remaining;
      await this.save();
      this.scheduleRetry();
    });
  }

  clear(): Promise<void> {
    return this.serialize(async () => {
      await this.load();
      this.items = [];
      await this.save();
      this.scheduleRetry();
    });
  }

  stop(): void {
    this.started = false;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = undefined;
    this.dek.fill(0);
  }

  private serialize(action: () => Promise<void>): Promise<void> {
    const result = this.operation.then(action, action);
    this.operation = result.catch(() => {});
    return result;
  }

  private async load(): Promise<void> {
    if (this.loaded) return;
    const rows = await findEncryptedRowsByScope(
      this.dek,
      OUTBOX_TABLE,
      "owner",
      OUTBOX_SCOPE,
    );
    try {
      const row = rows.find((entry) => entry.rowId === OUTBOX_ROW_ID);
      if (row) {
        const parsed: unknown = JSON.parse(textDecoder.decode(row.plaintext));
        if (!Array.isArray(parsed) || !parsed.every(isOutboxItem)) {
          throw new Error("The encrypted relay outbox is invalid.");
        }
        this.items = parsed;
      }
      this.loaded = true;
    } finally {
      rows.forEach((row) => row.plaintext.fill(0));
    }
  }

  private async save(): Promise<void> {
    const plaintext = textEncoder.encode(JSON.stringify(this.items));
    try {
      await storeEncryptedRow(
        this.dek,
        OUTBOX_TABLE,
        OUTBOX_ROW_ID,
        "owner",
        OUTBOX_SCOPE,
        plaintext,
      );
    } finally {
      plaintext.fill(0);
    }
  }

  private async drain(): Promise<void> {
    if (!this.started || this.processing) return;
    this.processing = true;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = undefined;
    try {
      const now = Date.now();
      for (const item of [...this.items]) {
        if (!this.started) return;
        if (hasOutboxExpired(item.createdAt, now)) {
          item.status = OutboxStatus.Failed;
          this.items = this.items.filter((entry) => entry.id !== item.id);
          await this.save();
          this.onFailed(item.id);
          continue;
        }
        if (item.nextAttemptAt > now) continue;

        item.attempts += 1;
        try {
          await this.publish(item.packet);
          item.status = OutboxStatus.RelayAccepted;
          this.onPublished(item.id);
        } catch {
          item.status = OutboxStatus.Waiting;
        }
        item.nextAttemptAt = Date.now() + getOutboxRetryDelay(item.attempts - 1);
        await this.save();
      }
    } finally {
      this.processing = false;
      this.scheduleRetry();
    }
  }

  private scheduleRetry(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = undefined;
    if (!this.started) return;
    const now = Date.now();
    const nextAttemptAt = this.items.reduce(
      (next, item) =>
        Math.min(next, item.nextAttemptAt, item.createdAt + OUTBOX_MAX_AGE_MS),
      Number.POSITIVE_INFINITY,
    );
    if (!Number.isFinite(nextAttemptAt)) return;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = undefined;
      void this.serialize(() => this.drain());
    }, Math.max(0, nextAttemptAt - now));
  }
}
