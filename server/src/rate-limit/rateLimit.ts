import { RATE_LIMIT } from "@core/constants.js";
import { rateLimited } from "@core/errors.js";

const buckets = new Map<number, number[]>();

export function assertUploadRate(userId: number) {
  const now = Date.now();
  const timestamps = buckets.get(userId) ?? [];
  const recent = timestamps.filter((ts) => now - ts < RATE_LIMIT.uploadWindowMs);

  if (recent.length >= RATE_LIMIT.uploadMaxRequests) {
    throw rateLimited("Too many upload requests");
  }

  recent.push(now);
  buckets.set(userId, recent);
}
