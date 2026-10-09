import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { CancelBookingButton } from '@/components/CancelBookingButton';
import { formatDate, formatPrice } from '@/lib/fleet';
import { DAY_MS } from '@/lib/booking/dates';

export const metadata = { title: 'My bookings' };
export const dynamic = 'force-dynamic';

const statusStyle: Record<string, string> = {
  PENDING: 'border-gold text-gold-soft',
  CONFIRMED: 'border-emerald-400/60 text-emerald-300',
  CANCELLED: 'border-ivory/20 text-ivory-dim',
};
const statusLabel: Record<string, string> = { PENDING: 'Pending', CONFIRMED: 'Confirmed', CANCELLED: 'Cancelled' };

export default async function AccountPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect('/login?callbackUrl=%2Faccount');

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { fleetItem: { select: { id: true, name: true, pricePerDay: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      <h1 className="font-serif text-5xl text-ivory">My bookings</h1>
      <p className="mt-3 text-ivory-dim">Signed in as {session.user.name ?? session.user.email}.</p>

      {bookings.length === 0 ? (
        <div className="mt-10 border border-gold/30 p-8">
          <p className="text-ivory">You have no bookings yet.</p>
          <Link href="/fleet" className="btn-gold mt-5">Browse the fleet</Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-5">
          {bookings.map((b) => {
            const days = Math.round((b.endDate.getTime() - b.startDate.getTime()) / DAY_MS) + 1;
            return (
              <li key={b.id} className="border border-gold/25 bg-surface p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/fleet/${b.fleetItem.id}`} className="link-gold font-serif text-2xl">{b.fleetItem.name}</Link>
                    <p className="mt-1 text-ivory">{formatDate(b.startDate)} to {formatDate(b.endDate)}</p>
                    <p className="mt-1 text-sm text-ivory-dim">
                      {days} {days === 1 ? 'day' : 'days'} at {formatPrice(b.fleetItem.pricePerDay)} per day
                    </p>
                    {b.notes && <p className="prose-pre mt-2 text-sm text-ivory-dim">Notes: {b.notes}</p>}
                  </div>
                  <span className={`border px-3 py-1 text-sm ${statusStyle[b.status]}`}>{statusLabel[b.status]}</span>
                </div>
                {b.status === 'PENDING' && (
                  <div className="mt-5 border-t border-gold/15 pt-4">
                    <CancelBookingButton bookingId={b.id} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
