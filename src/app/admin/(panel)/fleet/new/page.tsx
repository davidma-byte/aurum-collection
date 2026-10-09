import { requireAdmin } from '@/lib/requireAdmin';
import { EMPTY_FLEET, FleetForm } from '@/components/admin/FleetForm';

export const metadata = { title: 'Add fleet item' };

export default async function NewFleetItemPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="mb-8 font-serif text-4xl text-ivory">Add fleet item</h1>
      <FleetForm id={null} initial={EMPTY_FLEET} />
    </>
  );
}
