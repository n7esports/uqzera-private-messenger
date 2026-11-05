export function startAutoLockTimer(
  lock: () => void,
  minutes: 0 | 15 | 30,
): () => void {
  if (minutes === 0) return () => {};
  const timer = setTimeout(lock, minutes * 60_000);
  return () => clearTimeout(timer);
}
