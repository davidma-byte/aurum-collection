import Link from 'next/link';
import { FleetImage } from '@/components/FleetImage';
import { COLLECTION_LABEL, formatPrice, type CollectionKey } from '@/lib/fleet';

export interface FleetCardItem {
  id: string;
  name: string;
  collection: CollectionKey;
  imageUrl: string;
  pricePerDay: unknown;
}

export function FleetCard({ item, busy }: { item: FleetCardItem; busy: boolean }) {
  return (
    <Link href={`/fleet/${item.id}`} className="group block border border-gold/25 bg-surface transition-colors hover:border-gold/70">
      <div className="relative aspect-[4/3] overflow-hidden">
        <FleetImage src={item.imageUrl} name={item.name} className="h-full w-full" imgClassName="transition-transform duration-700 group-hover:scale-105" />
        <span
          className={`absolute left-3 top-3 px-3 py-1 text-xs ${
            busy ? 'bg-ink/85 text-ivory-dim' : 'bg-gold text-ink'
          }`}
        >
          {busy ? 'Booked today' : 'Available'}
        </span>
      </div>
      <div className="p-5">
        <p className="text-sm text-ivory-dim">{COLLECTION_LABEL[item.collection]}</p>
        <h3 className="mt-1 font-serif text-2xl leading-snug text-ivory">{item.name}</h3>
        <p className="mt-3 text-gold-soft">
          {formatPrice(item.pricePerDay)} <span className="text-sm text-ivory-dim">per day</span>
        </p>
      </div>
    </Link>
  );
}
