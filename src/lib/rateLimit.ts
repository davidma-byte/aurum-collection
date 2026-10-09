export interface LimiterOptions {
  max: number;
  windowMs: number;
  now?: () => number;
}

interface Entry {
  failures: number;
  resetAt: number;
}

/**
 * In-memory failed-attempt limiter. Fine for a single-process coursework
 * deployment; for several instances swap the Map for Redis or a DB table.
 */
export function createLimiter({ max, windowMs, now = () => Date.now() }: LimiterOptions) {
  const entries = new Map<string, Entry>();

  function live(key: string): Entry | undefined {
    const e = entries.get(key);
    if (e && e.resetAt <= now()) {
      entries.delete(key);
      return undefined;
    }
    return e;
  }

  return {
    check(key: string): { allowed: boolean; retryAfterMs: number } {
      const e = live(key);
      if (e && e.failures >= max) return { allowed: false, retryAfterMs: e.resetAt - now() };
      return { allowed: true, retryAfterMs: 0 };
    },
    fail(key: string): void {
      const e = live(key);
      if (e) e.failures += 1;
      else entries.set(key, { failures: 1, resetAt: now() + windowMs });
    },
    reset(key: string): void {
      entries.delete(key);
    },
  };
}

const g = globalThis as unknown as {
  __aurumLoginLimiter?: ReturnType<typeof createLimiter>;
  __aurumRegisterLimiter?: ReturnType<typeof createLimiter>;
};

export const loginLimiter = (g.__aurumLoginLimiter ??= createLimiter({ max: 5, windowMs: 15 * 60_000 }));
export const registerLimiter = (g.__aurumRegisterLimiter ??= createLimiter({ max: 5, windowMs: 15 * 60_000 }));

export const TOO_MANY_MESSAGE = 'Too many attempts. Try again in 15 minutes.';

export function clientIp(headers: Headers | Record<string, string | string[] | undefined>): string {
  const get = (name: string): string | undefined => {
    if (headers instanceof Headers) return headers.get(name) ?? undefined;
    const v = headers[name];
    return Array.isArray(v) ? v[0] : v;
  };
  const fwd = get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return get('x-real-ip') ?? 'unknown';
}
