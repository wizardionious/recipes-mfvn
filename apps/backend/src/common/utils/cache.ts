import crypto from "node:crypto";

export function hashFilters(filters: Record<string, unknown>) {
  return crypto
    .createHash("md5")
    .update(JSON.stringify(filters))
    .digest("hex")
    .slice(0, 8);
}
