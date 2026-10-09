import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { FleetCard } from '@/components/FleetCard';
import { COLLECTION_LABEL, getBusyTodayIds, isCollection } from '@/lib/fleet';

export const metadata = { title: 'Fleet' };
export const dynamic = 'force-dynamic';

const tabs = [
  { key: undefined, label: 'All' },
  { key: 'CLASSIC', label: COLLECTION_LABEL.CLASSIC },
  { key: 'MODERN', label: COLLECTION_LABEL.MODERN },
  { key: 'YACHT', label: COLLECTION_LABEL.YACHT },
] as const;

export default async function FleetPage({ searchParams }: { searchParams?: Promise<{ collection?: string }> | { collection?: string } }) {
  const sp = (await searchParams) ?? {};
  const collection = isCollection(sp.collection) ? sp.collection : undefined;
  const [items, busy] = await Promise.all([
    prisma.fleetItem.findMany({
      where: { isActive: true, ...(collection ? { collection } : {}) },
      orderBy: [{ collection: 'asc' }, { pricePerDay: 'asc' }],
    }),
    getBusyTodayIds(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <h1 className="font-serif text-5xl text-ivory">The fleet</h1>
      <nav aria-label="Filter by collection" className="mt-8 flex flex-wrap gap-3">
        {tabs.map((t) => {
          const active = t.key === collection;
          return (
            <Link
              key={t.label}
              href={t.key ? `/fleet?collection=${t.key}` : '/fleet'}
              aria-current={active ? 'page' : undefined}
              className={`border px-5 py-2 text-sm transition-colors ${
                active ? 'border-gold bg-gold text-ink' : 'border-gold/30 text-ivory hover:border-gold'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <p className="mt-12 text-ivory-dim">Nothing in this collection is available to hire right now.</p>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <FleetCard key={item.id} item={item} busy={busy.has(item.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
