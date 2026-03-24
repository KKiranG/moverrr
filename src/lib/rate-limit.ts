const windows = new Map<string, number[]>();

export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const start = now - windowMs;
  const timestamps = (windows.get(key) ?? []).filter((stamp) => stamp > start);

  if (timestamps.length >= limit) {
    return {
      allowed: false,
      retryAfterMs: Math.max(0, timestamps[0] + windowMs - now),
    };
  }

  timestamps.push(now);
  windows.set(key, timestamps);

  return { allowed: true, retryAfterMs: 0 };
}
