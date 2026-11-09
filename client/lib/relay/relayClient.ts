import type {
  RelayClient,
  RelayConnectionStatus,
} from "../contracts/relayClient";

export type RelayStatus = RelayConnectionStatus;

const INITIAL_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 30_000;
const REQUEST_TIMEOUT_MS = 10_000;

type MessageHandler = (_sealed: string) => void;

export class WebSocketRelayClient implements RelayClient {
  private url: string;
  private socket: WebSocket | null = null;
  private connectionPromise: Promise<void> | null = null;
  private rejectConnection: ((_error: Error) => void) | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private status: RelayStatus;
  private readonly statusListeners = new Set<
    (_status: RelayStatus) => void
  >();
  private readonly subscriptions = new Map<string, Set<MessageHandler>>();
  private readonly inboundRoutes = new Map<string, string>();
  private readonly pendingRequests = new Map<
    string,
    { resolve: () => void; reject: (_error: Error) => void; timer: ReturnType<typeof setTimeout> }
  >();

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
    const parsed: unknown = JSON.parse(sealed);
    if (!isSignedEnvelope(parsed) || parsed.envelope.recipientPubKey !== channelId) {
      throw new Error("Relay publish packet does not match its recipient channel.");
    }
    await this.sendRequest({
      type: "publish",
      packet: parsed,
    });
  }

  subscribe(channelId: string, onMessage: (_sealed: string) => void): () => void {
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
    const recipientPubKey = this.inboundRoutes.get(msgId);
    if (!recipientPubKey) return;
    await this.sendRequest({
      type: "ack",
      messageId: msgId,
      recipientPubKey,
    });
    this.inboundRoutes.delete(msgId);
  }

  onStatus(callback: (_status: RelayStatus) => void): () => void {
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
              this.sendSubscription(channelId);
            }
        resolve();
      };
      socket.onmessage = (event) => {
        if (this.socket === socket) this.handleMessage(event.data);
      };
      socket.onerror = () => {
        this.disconnect(socket);
        this.rejectPendingRequests(new Error("Relay WebSocket connection failed."));
        if (!opened) {
          this.connectionPromise = null;
          this.rejectConnection = null;
          reject(new Error("Relay WebSocket connection failed."));
        }
      };
      socket.onclose = () => {
        this.disconnect(socket);
        this.rejectPendingRequests(new Error("Relay WebSocket closed."));
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
        throw new Error("Relay WebSocket send failed.");
      }
    }
    throw new Error("Relay is not connected.");
  }

  private sendRequest(message: Record<string, unknown>): Promise<void> {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error("Relay is not connected."));
    }
    const id = crypto.randomUUID();
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error("Relay request timed out."));
      }, REQUEST_TIMEOUT_MS);
      this.pendingRequests.set(id, { resolve, reject, timer });
      try {
        this.send({ ...message, id } as Record<string, string>);
      } catch (error) {
        clearTimeout(timer);
        this.pendingRequests.delete(id);
        reject(error instanceof Error ? error : new Error("Relay request failed."));
      }
    });
  }

  private rejectPendingRequests(error: Error): void {
    for (const [id, request] of this.pendingRequests) {
      clearTimeout(request.timer);
      request.reject(error);
      this.pendingRequests.delete(id);
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

    if (!isRecord(parsed)) return;
    if (typeof parsed.id === "string" && typeof parsed.status === "string") {
      const request = this.pendingRequests.get(parsed.id);
      if (!request) return;
      clearTimeout(request.timer);
      this.pendingRequests.delete(parsed.id);
      if (parsed.status === "ok") request.resolve();
      else request.reject(new Error("Relay rejected the request."));
      return;
    }

    if (parsed.type === "message" && isSignedEnvelope(parsed.packet)) {
      const route = parsed.packet.envelope.recipientPubKey;
      this.inboundRoutes.set(parsed.packet.id, route);
      this.dispatch(route, JSON.stringify(parsed.packet));
      return;
    }

    if (
      parsed.type === "receipt" &&
      typeof parsed.recipientPubKey === "string"
    ) {
      this.dispatch(parsed.recipientPubKey, JSON.stringify(parsed));
    }
  }

  private dispatch(channelId: string, sealed: string): void {
    for (const handler of this.subscriptions.get(channelId) ?? []) {
      handler(sealed);
    }
  }

  private sendSubscription(channelId: string): void {
    this.send({
      type: "subscribe",
      id: crypto.randomUUID(),
      recipientPubKey: channelId,
    });
  }

  private setStatus(status: RelayStatus): void {
    if (this.status === status) return;
    this.status = status;
    for (const listener of this.statusListeners) listener(status);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSignedEnvelope(value: unknown): value is {
  type: "message";
  id: string;
  senderPubKey: string;
  senderEncryptionPubKey: string;
  signature: string;
  envelope: { recipientPubKey: string };
} {
  if (!isRecord(value) || !isRecord(value.envelope)) return false;
  return (
    value.type === "message" &&
    typeof value.id === "string" &&
    typeof value.senderPubKey === "string" &&
    typeof value.senderEncryptionPubKey === "string" &&
    typeof value.signature === "string" &&
    typeof value.envelope.recipientPubKey === "string"
  );
}
