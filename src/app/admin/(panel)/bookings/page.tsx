import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';
import { BookingActions } from '@/components/admin/BookingActions';
import { formatDate } from '@/lib/fleet';

export const metadata = { title: 'Bookings' };

const filters = [undefined, 'PENDING', 'CONFIRMED', 'CANCELLED'] as const;
const label = { PENDING: 'Pending', CONFIRMED: 'Confirmed', CANCELLED: 'Cancelled' };

export default async function AdminBookingsPage({ searchParams }: { searchParams: { status?: string } }) {
  await requireAdmin();
  const status = searchParams.status === 'PENDING' || searchParams.status === 'CONFIRMED' || searchParams.status === 'CANCELLED' ? searchParams.status : undefined;
  const bookings = await prisma.booking.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } }, fleetItem: { select: { name: true } } },
  });
  return (
    <>
      <h1 className="font-serif text-4xl text-ivory">Bookings</h1>
      <nav aria-label="Filter by status" className="mt-6 flex flex-wrap gap-3">
        {filters.map((f) => (
          <Link key={f ?? 'all'} href={f ? `/admin/bookings?status=${f}` : '/admin/bookings'} aria-current={f === status ? 'page' : undefined}
            className={`border px-4 py-1.5 text-sm ${f === status ? 'border-gold bg-gold text-ink' : 'border-gold/30 hover:border-gold'}`}>
            {f ? label[f] : 'All'}
          </Link>
        ))}
      </nav>
      {bookings.length === 0 ? (
        <p className="mt-10 text-ivory-dim">No bookings match this filter.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-gold/25">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-surface text-ivory-dim">
              <tr>
                <th className="p-4 font-normal">Item</th><th className="p-4 font-normal">Client</th>
                <th className="p-4 font-normal">Dates</th><th className="p-4 font-normal">Status</th>
                <th className="p-4 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-gold/15 align-top">
                  <td className="p-4 text-ivory">{b.fleetItem.name}</td>
                  <td className="p-4">{b.user.name}<br /><span className="text-ivory-dim">{b.user.email}</span></td>
                  <td className="p-4">{formatDate(b.startDate)} to {formatDate(b.endDate)}{b.notes && <p className="prose-pre mt-1 max-w-xs text-ivory-dim">{b.notes}</p>}</td>
                  <td className="p-4">{label[b.status]}</td>
                  <td className="p-4"><BookingActions id={b.id} status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
