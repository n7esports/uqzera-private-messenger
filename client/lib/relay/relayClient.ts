import { isEnvelope, type Envelope } from "../contracts/envelope";
import type {
  RelayClient,
  RelayConnectionStatus,
} from "../contracts/relayClient";

export type RelayStatus = RelayConnectionStatus;

const INITIAL_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 30_000;

type MessageHandler = (sealed: string) => void;

export class WebSocketRelayClient implements RelayClient {
  private url: string;
  private socket: WebSocket | null = null;
  private connectionPromise: Promise<void> | null = null;
  private rejectConnection: ((error: Error) => void) | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private status: RelayStatus;
  private readonly statusListeners = new Set<(status: RelayStatus) => void>();
  private readonly subscriptions = new Map<string, Set<MessageHandler>>();
  private readonly pendingMessages: string[] = [];

  constructor(url = process.env.NEXT_PUBLIC_RELAY_URL ?? "") {
    this.url = url.trim();
    this.status = this.url ? "disconnected" : "offline";
    if (this.url) void this.connect(this.url).catch(() => {});
  }

  async connect(url: string): Promise<void> {
    const nextUrl = url.trim();
    if (this.url !== nextUrl && this.socket) {
      const previousSocket = this.socket;
      this.socket = null;
      previousSocket.onclose = null;
      previousSocket.onerror = null;
      previousSocket.close();
      this.rejectConnection?.(new Error("Relay URL changed during connection."));
      this.connectionPromise = null;
      this.rejectConnection = null;
    }
    this.url = nextUrl;
    if (!this.url) {
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
      this.setStatus("offline");
      return;
    }

    if (this.socket?.readyState === WebSocket.OPEN) return;
    if (this.connectionPromise) return this.connectionPromise;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    return this.openSocket();
  }

  async publish(channelId: string, sealed: string): Promise<void> {
    if (!this.url) return;
    this.send({ type: "publish", channelId, sealed });
  }

  subscribe(channelId: string, onMessage: (sealed: string) => void): () => void {
    let handlers = this.subscriptions.get(channelId);
    if (!handlers) {
      handlers = new Set();
      this.subscriptions.set(channelId, handlers);
      if (this.status === "connected") {
        this.send({ type: "subscribe", channelId });
      }
    }

    handlers.add(onMessage);
    return () => {
      handlers?.delete(onMessage);
      if (handlers?.size === 0) this.subscriptions.delete(channelId);
    };
  }

  async ack(msgId: string): Promise<void> {
    if (!this.url) return;
    this.send({ type: "ack", msgId });
  }

  onStatus(callback: (status: RelayStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  private openSocket(): Promise<void> {
    if (!this.url) return Promise.resolve();
    if (this.socket) return this.connectionPromise ?? Promise.resolve();
    this.setStatus("connecting");

    let socket: WebSocket;
    try {
      socket = new WebSocket(this.url);
    } catch (error) {
      this.setStatus("disconnected");
      this.scheduleReconnect();
      return Promise.reject(error);
    }

    const connection = new Promise<void>((resolve, reject) => {
      let opened = false;
      this.socket = socket;
      this.rejectConnection = reject;
      socket.onopen = () => {
        if (this.socket !== socket) return;
        opened = true;
        this.connectionPromise = null;
        this.rejectConnection = null;
        this.reconnectAttempt = 0;
        this.setStatus("connected");
        for (const channelId of this.subscriptions.keys()) {
          this.send({ type: "subscribe", channelId });
        }
        this.flushPendingMessages();
        resolve();
      };
      socket.onmessage = (event) => {
        if (this.socket === socket) this.handleMessage(event.data);
      };
      socket.onerror = () => {
        this.disconnect(socket);
        if (!opened) {
          this.connectionPromise = null;
          this.rejectConnection = null;
          reject(new Error("Relay WebSocket connection failed."));
        }
      };
      socket.onclose = () => {
        this.disconnect(socket);
        if (!opened) {
          this.connectionPromise = null;
          this.rejectConnection = null;
          reject(new Error("Relay WebSocket closed before connecting."));
        }
      };
    });
    this.connectionPromise = connection;
    return connection;
  }

  private disconnect(socket: WebSocket): void {
    if (this.socket !== socket) return;
    this.socket = null;
    this.setStatus("disconnected");
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || !this.url) return;
    const delay = Math.min(
      INITIAL_BACKOFF_MS * 2 ** this.reconnectAttempt,
      MAX_BACKOFF_MS,
    );
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.openSocket().catch(() => {});
    }, delay);
  }

  private send(message: Record<string, string>): void {
    const serialized = JSON.stringify(message);
    if (this.socket?.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(serialized);
        return;
      } catch {
        // The socket may close between checking readyState and sending.
      }
    }
    this.pendingMessages.push(serialized);
  }

  private flushPendingMessages(): void {
    while (
      this.socket?.readyState === WebSocket.OPEN &&
      this.pendingMessages.length > 0
    ) {
      const message = this.pendingMessages[0];
      try {
        this.socket.send(message);
        this.pendingMessages.shift();
      } catch {
        break;
      }
    }
  }

  private handleMessage(data: unknown): void {
    if (typeof data !== "string") return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      return;
    }

    const frame = parseEnvelopeFrame(parsed);
    if (!frame) return;
    const handlers = frame.channelId
      ? this.subscriptions.get(frame.channelId) ?? []
      : [...this.subscriptions.values()].flatMap((subscribers) => [...subscribers]);
    for (const handler of handlers) handler(frame.sealed);
  }

  private setStatus(status: RelayStatus): void {
    if (this.status === status) return;
    this.status = status;
    for (const listener of this.statusListeners) listener(status);
  }
}

function parseEnvelopeFrame(
  value: unknown,
): { channelId?: string; sealed: string } | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const payload = record.envelope ?? record.payload ?? record.data ?? value;
  if (!isEnvelope(payload)) return null;
  const sealed =
    typeof payload.body === "string"
      ? payload.body
      : isRecord(payload.body) && typeof payload.body.sealed === "string"
        ? payload.body.sealed
        : null;
  if (sealed === null) return null;
  return {
    channelId:
      typeof record.channelId === "string" ? record.channelId : undefined,
    sealed,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
