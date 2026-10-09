import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

export const metadata = { title: 'Dashboard' };

function Stat({ label, value, sub, href }: { label: string; value: number; sub: string; href: string }) {
  return (
    <Link href={href} className="block border border-gold/30 bg-surface p-7 transition-colors hover:border-gold">
      <p className="text-ivory-dim">{label}</p>
      <p className="mt-2 font-serif text-6xl text-gold-soft">{value}</p>
      <p className="mt-2 text-sm text-ivory-dim">{sub}</p>
    </Link>
  );
}

export default async function AdminDashboard() {
  await requireAdmin();
  const [fleet, active, bookings, pending, inquiries, fresh] = await Promise.all([
    prisma.fleetItem.count(),
    prisma.fleetItem.count({ where: { isActive: true } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: 'NEW' } }),
  ]);
  return (
    <>
      <h1 className="font-serif text-4xl text-ivory">Dashboard</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Stat label="Fleet items" value={fleet} sub={`${active} active`} href="/admin/fleet" />
        <Stat label="Bookings" value={bookings} sub={`${pending} pending`} href="/admin/bookings?status=PENDING" />
        <Stat label="Inquiries" value={inquiries} sub={`${fresh} new`} href="/admin/inquiries" />
      </div>
    </>
  );
}
