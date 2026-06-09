type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

export function checkRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const current = store.get(params.key);

  if (!current || current.resetAt <= now) {
    const next: Entry = {
      count: 1,
      resetAt: now + params.windowMs,
    };
    store.set(params.key, next);
    return { allowed: true, remaining: params.limit - 1, resetAt: next.resetAt };
  }

  current.count += 1;
  store.set(params.key, current);
  const remaining = Math.max(0, params.limit - current.count);

  return {
    allowed: current.count <= params.limit,
    remaining,
    resetAt: current.resetAt,
  };
}
