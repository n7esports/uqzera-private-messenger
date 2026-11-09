export const OutboxStatus = {
  Waiting: "waiting",
  RelayAccepted: "relayAccepted",
  Delivered: "delivered",
  Failed: "failed",
} as const;

export type OutboxStatus = (typeof OutboxStatus)[keyof typeof OutboxStatus];
export const OUTBOX_STATUSES = Object.values(OutboxStatus);

export const OUTBOX_INITIAL_RETRY_DELAY_MS = 30_000;
export const OUTBOX_MAX_RETRY_DELAY_MS = 10 * 60_000;
export const OUTBOX_MAX_AGE_MS = 7 * 24 * 60 * 60_000;

/** Returns the delay before retry number `attempt` (zero-based). */
export function getOutboxRetryDelay(attempt: number): number {
  if (!Number.isFinite(attempt)) {
    return attempt > 0
      ? OUTBOX_MAX_RETRY_DELAY_MS
      : OUTBOX_INITIAL_RETRY_DELAY_MS;
  }
  const retryNumber = Math.max(0, Math.floor(attempt));
  return Math.min(
    OUTBOX_INITIAL_RETRY_DELAY_MS * 2 ** retryNumber,
    OUTBOX_MAX_RETRY_DELAY_MS,
  );
}

export function hasOutboxExpired(
  createdAt: number,
  now: number = Date.now(),
): boolean {
  return (
    !Number.isFinite(createdAt) ||
    !Number.isFinite(now) ||
    now - createdAt >= OUTBOX_MAX_AGE_MS
  );
}
