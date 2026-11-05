export type ShareKeyParseResult =
  | { ok: true; bytes: Uint8Array }
  | { ok: false; reason: "invalid-format" | "self" };

const SHARE_KEY_PATTERN = /^uqz1\.([0-9a-fA-F]{128})$/;

/**
 * Parses a share key into its 64 raw bytes. Pass the caller's own key as the
 * second argument to reject self-addressing keys.
 */
export function parseShareKey(
  input: unknown,
  ownShareKey?: string,
): ShareKeyParseResult {
  if (typeof input !== "string") {
    return { ok: false, reason: "invalid-format" };
  }

  const match = SHARE_KEY_PATTERN.exec(input);
  if (!match) return { ok: false, reason: "invalid-format" };
  if (
    ownShareKey !== undefined &&
    SHARE_KEY_PATTERN.test(ownShareKey) &&
    input.toLowerCase() === ownShareKey.toLowerCase()
  ) {
    return { ok: false, reason: "self" };
  }

  const hex = match[1];
  const bytes = new Uint8Array(64);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return { ok: true, bytes };
}
