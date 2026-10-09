import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { FleetCard } from '@/components/FleetCard';
import { getBusyTodayIds, type CollectionKey } from '@/lib/fleet';

export const dynamic = 'force-dynamic';

const PREFERRED: Record<CollectionKey, string> = {
  CLASSIC: 'classic-jaguar-etype',
  MODERN: 'modern-bmw-i7',
  YACHT: 'yacht-anima-maris',
};

async function featured() {
  const out = [];
  for (const collection of ['CLASSIC', 'MODERN', 'YACHT'] as CollectionKey[]) {
    const item =
      (await prisma.fleetItem.findFirst({ where: { id: PREFERRED[collection], isActive: true } })) ??
      (await prisma.fleetItem.findFirst({ where: { collection, isActive: true }, orderBy: { pricePerDay: 'desc' } }));
    if (item) out.push(item);
  }
  return out;
}

export default async function HomePage() {
  const [items, busy] = await Promise.all([featured(), getBusyTodayIds()]);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero.jpg" alt="A Jaguar E-Type under a moody sky" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/75 to-ink/20" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />
        <div className="mx-auto flex min-h-[78vh] max-w-7xl items-center px-5 py-24 sm:px-8">
          <div className="max-w-2xl">
            <h1 className="font-serif text-5xl leading-[1.05] text-ivory sm:text-7xl">
              The car or yacht you cannot simply rent, hired directly from its keeper.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ivory/85">
              Restored classics, modern flagships and private yachts for weddings, events and travel. No brokers, no
              commission, and you see each item&rsquo;s condition and availability before you ask to book.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/fleet" className="btn-gold">Browse the fleet</Link>
              <Link href="/about" className="btn-ghost">How hiring works</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <h2 className="font-serif text-4xl text-ivory">From each collection</h2>
        <p className="mt-3 max-w-xl text-ivory-dim">One piece from the classics, the modern cars and the yachts.</p>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {items.map((item) => (
            <FleetCard key={item.id} item={item} busy={busy.has(item.id)} />
          ))}
        </div>
        {items.length === 0 && <p className="mt-10 text-ivory-dim">The fleet is being updated. Please check back soon.</p>}
      </section>

      <section className="border-y border-gold/20 bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-3">
          <div>
            <h3 className="font-serif text-2xl text-gold">Direct from the company</h3>
            <p className="mt-3 text-ivory-dim">Ask us for dates and we answer ourselves. There is no middleman adding commission or delay.</p>
          </div>
          <div>
            <h3 className="font-serif text-2xl text-gold">See before you commit</h3>
            <p className="mt-3 text-ivory-dim">Every item lists its specification, history and present condition, with the dates already taken.</p>
          </div>
          <div>
            <h3 className="font-serif text-2xl text-gold">Looked after properly</h3>
            <p className="mt-3 text-ivory-dim">Each hire is followed by a preparation day, so the next client receives it as it should be.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <h2 className="font-serif text-4xl text-ivory">Planning a wedding, an event or a journey?</h2>
        <p className="mt-4 text-ivory-dim">Tell us what you have in mind and we will suggest the right car or yacht.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/contact" className="btn-gold">Send an enquiry</Link>
          <Link href="/fleet" className="btn-ghost">See what is available</Link>
        </div>
      </section>
    </>
  );
}
