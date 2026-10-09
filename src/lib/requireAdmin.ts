import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

/** Session check plus a fresh database check, so a demoted admin loses access at once. */
async function resolveAdmin(): Promise<AdminUser | null> {
  const session = await getSession();
  const id = session?.user?.id;
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user || user.role !== 'ADMIN') return null;
  return { id: user.id, name: user.name, email: user.email };
}

/** Pages, layouts and server actions: anyone who is not an admin gets the normal 404 page. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await resolveAdmin();
  if (!admin) notFound();
  return admin;
}

/** Route handlers: returns the admin, or a generic 404 JSON response to send back. */
export async function requireAdminApi(): Promise<{ admin: AdminUser } | { response: NextResponse }> {
  const admin = await resolveAdmin();
  if (!admin) return { response: NextResponse.json({ error: 'Not found' }, { status: 404 }) };
  return { admin };
}
