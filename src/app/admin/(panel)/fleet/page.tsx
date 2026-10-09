import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';
import { FleetRowActions } from '@/components/admin/FleetRowActions';
import { COLLECTION_LABEL, formatPrice } from '@/lib/fleet';

export const metadata = { title: 'Fleet' };

export default async function AdminFleetPage() {
  await requireAdmin();
  const items = await prisma.fleetItem.findMany({
    orderBy: [{ collection: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { bookings: true } } },
  });
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl text-ivory">Fleet</h1>
        <Link href="/admin/fleet/new" className="btn-gold">Add fleet item</Link>
      </div>
      <div className="mt-8 overflow-x-auto border border-gold/25">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface text-ivory-dim">
            <tr>
              <th className="p-4 font-normal">Name</th><th className="p-4 font-normal">Collection</th>
              <th className="p-4 font-normal">Per day</th><th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal">Bookings</th><th className="p-4 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t border-gold/15 align-top">
                <td className="p-4 text-ivory">{i.name}</td>
                <td className="p-4 text-ivory-dim">{COLLECTION_LABEL[i.collection]}</td>
                <td className="p-4">{formatPrice(i.pricePerDay)}</td>
                <td className="p-4">{i.isActive ? <span className="text-emerald-300">Active</span> : <span className="text-ivory-dim">Inactive</span>}</td>
                <td className="p-4">{i._count.bookings}</td>
                <td className="p-4"><FleetRowActions id={i.id} name={i.name} isActive={i.isActive} bookingCount={i._count.bookings} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
