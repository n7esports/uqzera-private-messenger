export type RelayConnectionStatus =
  | "offline"
  | "connecting"
  | "connected"
  | "disconnected";

export interface RelayClient {
  connect(_url: string): Promise<void>;
  publish(_channelId: string, _sealed: string): Promise<void>;
  subscribe(
    _channelId: string,
    _onMessage: (_sealed: string) => void,
  ): () => void;
  ack(_msgId: string): Promise<void>;
  onStatus(
    _callback: (_status: RelayConnectionStatus) => void,
  ): () => void;
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
