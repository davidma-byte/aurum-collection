import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { FleetImage } from '@/components/FleetImage';
import { BookingForm } from '@/components/BookingForm';
import { COLLECTION_LABEL, formatDate, formatPrice } from '@/lib/fleet';
import { addDays, blockedRange, BUFFER_DAYS, todayUtc, toDateOnlyString } from '@/lib/booking/dates';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> | { id: string } }): Promise<Metadata> {
  const { id } = await params;
  const item = await prisma.fleetItem.findUnique({ where: { id }, select: { name: true, isActive: true } });
  return { title: item?.isActive ? item.name : 'Not found' };
}

export default async function FleetDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await params;
  const item = await prisma.fleetItem.findUnique({ where: { id } });
  if (!item || !item.isActive) notFound();

  const session = await getSession();
  const today = todayUtc();
  const bookings = await prisma.booking.findMany({
    where: {
      fleetItemId: item.id,
      status: { in: ['PENDING', 'CONFIRMED'] },
      endDate: { gte: addDays(today, -BUFFER_DAYS) },
    },
    orderBy: { startDate: 'asc' },
    select: { startDate: true, endDate: true },
  });

  const taken = bookings.map((b) => ({ start: toDateOnlyString(b.startDate), end: toDateOnlyString(b.endDate) }));
  const blocked = bookings.map((b) => blockedRange({ start: b.startDate, end: b.endDate }));
  const gallery = [item.imageUrl];

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <Link href="/fleet" className="link-gold text-sm">Back to the fleet</Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="space-y-3">
            {gallery.map((src, i) => (
              <FleetImage key={src} src={src} name={item.name} priority={i === 0} className="aspect-[16/10] w-full border border-gold/30" />
            ))}
          </div>

          <p className="mt-10 text-ivory-dim">{COLLECTION_LABEL[item.collection]}</p>
          <h1 className="mt-1 font-serif text-5xl leading-tight text-ivory">{item.name}</h1>
          <p className="prose-pre mt-6 text-lg text-ivory/90">{item.description}</p>

          <dl className="mt-10 grid gap-8 md:grid-cols-2">
            <div>
              <dt className="font-serif text-2xl text-gold">Specifications</dt>
              <dd className="prose-pre mt-2 text-ivory-dim">{item.specifications}</dd>
            </div>
            <div>
              <dt className="font-serif text-2xl text-gold">Condition</dt>
              <dd className="prose-pre mt-2 text-ivory-dim">{item.condition}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="font-serif text-2xl text-gold">History</dt>
              <dd className="prose-pre mt-2 text-ivory-dim">{item.history}</dd>
            </div>
          </dl>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-serif text-4xl text-gold-soft">
            {formatPrice(item.pricePerDay)} <span className="font-sans text-base text-ivory-dim">per day</span>
          </p>

          <section aria-labelledby="availability" className="mt-6">
            <h2 id="availability" className="font-serif text-2xl text-ivory">Availability</h2>
            {blocked.length === 0 ? (
              <p className="mt-2 text-sm text-ivory-dim">No bookings at the moment. Every date is open.</p>
            ) : (
              <>
                <p className="mt-2 text-sm text-ivory-dim">
                  Unavailable dates, including the preparation day after each hire:
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {blocked.map((r, i) => (
                    <li key={i} className="border border-gold/20 px-4 py-2 text-ivory">
                      {formatDate(r.start)} to {formatDate(r.end)}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section aria-labelledby="request" className="mt-8">
            <h2 id="request" className="mb-3 font-serif text-2xl text-ivory">Request a booking</h2>
            <BookingForm
              fleetItemId={item.id}
              signedIn={Boolean(session?.user)}
              loginHref={`/login?callbackUrl=${encodeURIComponent(`/fleet/${item.id}`)}`}
              taken={taken}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}
