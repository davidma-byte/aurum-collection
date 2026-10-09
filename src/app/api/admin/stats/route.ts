import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/requireAdmin';

export async function GET() {
  const guard = await requireAdminApi();
  if ('response' in guard) return guard.response;

  const [fleet, bookings, pendingBookings, inquiries, newInquiries] = await Promise.all([
    prisma.fleetItem.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: 'NEW' } }),
  ]);
  return NextResponse.json({ fleet, bookings, pendingBookings, inquiries, newInquiries });
}
