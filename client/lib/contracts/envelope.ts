import { parseShareKey } from "./shareKey";

export interface Envelope {
  id: string;
  type: "msg" | "ack" | "timer" | "delete";
  fromShareKey: string;
  body?: unknown;
  ts: number;
  expiresAt?: number;
  msgId?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isEnvelope(value: unknown): value is Envelope {
  if (!isRecord(value)) return false;
  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    (value.type !== "msg" &&
      value.type !== "ack" &&
      value.type !== "timer" &&
      value.type !== "delete") ||
    !parseShareKey(value.fromShareKey).ok ||
    typeof value.ts !== "number" ||
    !Number.isFinite(value.ts)
  ) {
    return false;
  }

  return (
    (value.expiresAt === undefined ||
      (typeof value.expiresAt === "number" &&
        Number.isFinite(value.expiresAt))) &&
    (value.msgId === undefined ||
      (typeof value.msgId === "string" && value.msgId.length > 0))
  );
}
