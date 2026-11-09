export type RelayConnectionStatus =
  | "offline"
  | "connecting"
  | "connected"
  | "disconnected";

export interface RelayClient {
  connect(url: string): Promise<void>;
  publish(channelId: string, sealed: string): Promise<void>;
  subscribe(
    channelId: string,
    onMessage: (sealed: string) => void,
  ): () => void;
  ack(msgId: string): Promise<void>;
  onStatus(callback: (status: RelayConnectionStatus) => void): () => void;
}

export function getRelayUrl(
  configuredUrl: string | undefined,
): string | undefined {
  const url = configuredUrl?.trim();
  return url || undefined;
}

export const NEXT_PUBLIC_RELAY_URL = getRelayUrl(
  process.env.NEXT_PUBLIC_RELAY_URL,
);
export const RELAY_URL = NEXT_PUBLIC_RELAY_URL;

export function isRelayOffline(
  configuredUrl: string | undefined = NEXT_PUBLIC_RELAY_URL,
): boolean {
  return getRelayUrl(configuredUrl) === undefined;
}
