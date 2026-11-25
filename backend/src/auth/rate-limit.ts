import { HttpException, HttpStatus } from "@nestjs/common";

/** ponytail: in-memory per-process; swap for Redis if multi-instance. */
const hits = new Map<string, number[]>();

export type AssertRateLimitParams = {
  key: string;
  limit?: number;
  windowMs?: number;
};

export function assertRateLimit(params: AssertRateLimitParams): void {
  const { key, limit = 5, windowMs = 60_000 } = params;
  const now = Date.now();
  const window = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (window.length >= limit) {
    throw new HttpException("Too many attempts, try again later", HttpStatus.TOO_MANY_REQUESTS);
  }
  window.push(now);
  hits.set(key, window);
}

/** Test helper. */
export function clearRateLimits(): void {
  hits.clear();
}
