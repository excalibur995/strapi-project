import { MEDIA_STRIP_KEYS } from "./screen-constant";

export function sanitizeMedia(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeMedia);
  }
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const isMedia = typeof obj.url === "string" && typeof obj.mime === "string";
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([k]) => !(isMedia && MEDIA_STRIP_KEYS.has(k)))
        .map(([k, v]) => [k, sanitizeMedia(v)]),
    );
  }
  return value;
}
