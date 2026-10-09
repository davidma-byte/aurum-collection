import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSession = vi.fn();
const findUnique = vi.fn();

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));
vi.mock('@/lib/auth', () => ({ getSession: () => getSession() }));
vi.mock('@/lib/prisma', () => ({ prisma: { user: { findUnique: (...a: unknown[]) => findUnique(...a) } } }));

import { requireAdmin, requireAdminApi } from '@/lib/requireAdmin';

beforeEach(() => {
  getSession.mockReset();
  findUnique.mockReset();
});

describe('requireAdmin', () => {
  it('404s a logged-out visitor', async () => {
    getSession.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
  });
  it('404s a CLIENT', async () => {
    getSession.mockResolvedValue({ user: { id: 'u1', role: 'CLIENT' } });
    findUnique.mockResolvedValue({ id: 'u1', name: 'C', email: 'c@x.co', role: 'CLIENT' });
    await expect(requireAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
  });
  it('404s a forged ADMIN token whose database role is CLIENT (demoted admin)', async () => {
    getSession.mockResolvedValue({ user: { id: 'u2', role: 'ADMIN' } });
    findUnique.mockResolvedValue({ id: 'u2', name: 'Old', email: 'o@x.co', role: 'CLIENT' });
    await expect(requireAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
  });
  it('404s when the user no longer exists', async () => {
    getSession.mockResolvedValue({ user: { id: 'gone', role: 'ADMIN' } });
    findUnique.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
  });
  it('lets a real ADMIN through', async () => {
    getSession.mockResolvedValue({ user: { id: 'a1', role: 'ADMIN' } });
    findUnique.mockResolvedValue({ id: 'a1', name: 'A', email: 'a@x.co', role: 'ADMIN' });
    await expect(requireAdmin()).resolves.toMatchObject({ id: 'a1' });
  });
});

describe('requireAdminApi', () => {
  it('returns a generic 404 JSON response to a client', async () => {
    getSession.mockResolvedValue({ user: { id: 'u1', role: 'CLIENT' } });
    findUnique.mockResolvedValue({ id: 'u1', name: 'C', email: 'c@x.co', role: 'CLIENT' });
    const out = await requireAdminApi();
    expect('response' in out).toBe(true);
    if ('response' in out) {
      expect(out.response.status).toBe(404);
      expect(await out.response.json()).toEqual({ error: 'Not found' });
    }
  });
  it('returns the admin for an ADMIN', async () => {
    getSession.mockResolvedValue({ user: { id: 'a1', role: 'ADMIN' } });
    findUnique.mockResolvedValue({ id: 'a1', name: 'A', email: 'a@x.co', role: 'ADMIN' });
    const out = await requireAdminApi();
    expect('admin' in out).toBe(true);
  });
});
