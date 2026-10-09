import { describe, expect, it } from 'vitest';
import { registerSchema, passwordStrength, loginSchema } from '@/lib/validation/auth';
import { safeCallbackUrl } from '@/lib/safeCallback';
import { createLimiter } from '@/lib/rateLimit';

describe('registerSchema', () => {
  const base = { name: 'Test User', email: 'Test@Example.com', password: 'abcdefg1', confirmPassword: 'abcdefg1' };

  it('strips a role sent from the browser', () => {
    const res = registerSchema.parse({ ...base, role: 'ADMIN' });
    expect(res).not.toHaveProperty('role');
    expect(res.email).toBe('test@example.com');
  });
  it('enforces the password policy', () => {
    expect(registerSchema.safeParse({ ...base, password: 'short1', confirmPassword: 'short1' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: 'abcdefghij', confirmPassword: 'abcdefghij' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: '12345678', confirmPassword: '12345678' }).success).toBe(false);
  });
  it('requires matching passwords', () => {
    expect(registerSchema.safeParse({ ...base, confirmPassword: 'different1' }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('defaults the portal to client', () => {
    expect(loginSchema.parse({ email: 'a@b.co', password: 'x' }).portal).toBe('client');
  });
});

describe('passwordStrength', () => {
  it('rates longer mixed passwords higher', () => {
    expect(passwordStrength('abc').score).toBeLessThan(passwordStrength('Abcdefgh12!x').score);
    expect(passwordStrength('').label).toBe('');
  });
});

describe('safeCallbackUrl', () => {
  it('keeps safe relative paths', () => {
    expect(safeCallbackUrl('/fleet/abc', 'CLIENT')).toBe('/fleet/abc');
    expect(safeCallbackUrl('/account?x=1', 'CLIENT')).toBe('/account?x=1');
  });
  it('rejects absolute and protocol-relative URLs', () => {
    expect(safeCallbackUrl('https://evil.com', 'CLIENT')).toBe('/account');
    expect(safeCallbackUrl('//evil.com', 'CLIENT')).toBe('/account');
    expect(safeCallbackUrl('/\\evil.com', 'CLIENT')).toBe('/account');
    expect(safeCallbackUrl('javascript:alert(1)', 'CLIENT')).toBe('/account');
  });
  it('never sends a client to /admin', () => {
    expect(safeCallbackUrl('/admin', 'CLIENT')).toBe('/account');
    expect(safeCallbackUrl('/admin/fleet', 'CLIENT')).toBe('/account');
    expect(safeCallbackUrl('/ADMIN', 'CLIENT')).toBe('/account');
  });
  it('does not loop back to the login pages', () => {
    expect(safeCallbackUrl('/login', 'CLIENT')).toBe('/account');
  });
  it('handles empty input', () => {
    expect(safeCallbackUrl(undefined)).toBe('/account');
    expect(safeCallbackUrl('')).toBe('/account');
  });
});

describe('login rate limiter', () => {
  it('blocks after 5 failures and recovers after 15 minutes', () => {
    let t = 0;
    const l = createLimiter({ max: 5, windowMs: 15 * 60_000, now: () => t });
    for (let i = 0; i < 5; i++) {
      expect(l.check('a|1').allowed).toBe(true);
      l.fail('a|1');
    }
    expect(l.check('a|1').allowed).toBe(false);
    expect(l.check('b|1').allowed).toBe(true); // other email+IP unaffected
    t = 15 * 60_000 + 1;
    expect(l.check('a|1').allowed).toBe(true);
  });
  it('reset clears the counter after a successful login', () => {
    const l = createLimiter({ max: 2, windowMs: 1000 });
    l.fail('k');
    l.reset('k');
    l.fail('k');
    expect(l.check('k').allowed).toBe(true);
  });
});
