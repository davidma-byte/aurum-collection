import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';
import { FleetForm } from '@/components/admin/FleetForm';

export const metadata = { title: 'Edit fleet item' };

export default async function EditFleetItemPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  await requireAdmin();
  const { id } = await params;
  const item = await prisma.fleetItem.findUnique({ where: { id } });
  if (!item) notFound();
  return (
    <>
      <h1 className="mb-8 font-serif text-4xl text-ivory">Edit {item.name}</h1>
      <FleetForm
        id={item.id}
        initial={{
          name: item.name, collection: item.collection, description: item.description,
          specifications: item.specifications, history: item.history, condition: item.condition,
          pricePerDay: String(Number(item.pricePerDay)), imageUrl: item.imageUrl, isActive: item.isActive,
        }}
      />
    </>
  );
}
