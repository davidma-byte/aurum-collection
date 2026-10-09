import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validation/auth';
import { fieldErrors } from '@/lib/validation/fleet';
import { clientIp, registerLimiter, TOO_MANY_MESSAGE } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const ip = clientIp(req.headers);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const key = `register|${email}|${ip}`;
  // Per-IP key as well, so rotating the email does not bypass the limit.
  const ipKey = `register-ip|${ip}`;

  if (!registerLimiter.check(key).allowed || !registerLimiter.check(ipKey).allowed) {
    return NextResponse.json({ error: TOO_MANY_MESSAGE }, { status: 429 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    registerLimiter.fail(key);
    registerLimiter.fail(ipKey);
    return NextResponse.json({ error: 'Please correct the highlighted fields.', fieldErrors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const { name, email: cleanEmail, password } = parsed.data; // `role` is stripped by the schema
  const existing = await prisma.user.findUnique({ where: { email: cleanEmail }, select: { id: true } });
  if (existing) {
    registerLimiter.fail(key);
    registerLimiter.fail(ipKey);
    return NextResponse.json({ error: 'An account with this email already exists.', fieldErrors: { email: 'An account with this email already exists.' } }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    await prisma.user.create({ data: { name, email: cleanEmail, passwordHash, role: 'CLIENT' } });
  } catch {
    // Unique violation from a simultaneous sign-up with the same email.
    return NextResponse.json({ error: 'An account with this email already exists.', fieldErrors: { email: 'An account with this email already exists.' } }, { status: 409 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
