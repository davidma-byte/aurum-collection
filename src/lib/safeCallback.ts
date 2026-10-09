/**
 * Only same-site relative paths are accepted. Anything else (absolute URLs,
 * protocol-relative `//host`, backslash tricks, control characters) falls back.
 * A CLIENT can never be sent to /admin through the callback.
 */
export function safeCallbackUrl(
  raw: string | null | undefined,
  role: 'CLIENT' | 'ADMIN' = 'CLIENT',
  fallback = '/account',
): string {
  if (!raw || typeof raw !== 'string') return fallback;
  if (raw.length > 500) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return fallback;
  if (role !== 'ADMIN' && /^\/admin(\/|\?|#|$)/i.test(raw)) return fallback;
  if (/^\/(login|register)(\/|\?|#|$)/i.test(raw)) return fallback;
  return raw;
}
