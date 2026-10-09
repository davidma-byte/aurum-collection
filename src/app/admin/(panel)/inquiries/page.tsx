import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';
import { HandledButton } from '@/components/admin/HandledButton';

export const metadata = { title: 'Inquiries' };

export default async function AdminInquiriesPage() {
  await requireAdmin();
  const inquiries = await prisma.inquiry.findMany({ orderBy: [{ status: 'asc' }, { createdAt: 'desc' }] });
  return (
    <>
      <h1 className="font-serif text-4xl text-ivory">Inquiries</h1>
      {inquiries.length === 0 ? (
        <p className="mt-10 text-ivory-dim">No enquiries yet.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {inquiries.map((q) => (
            <li key={q.id} className="border border-gold/25 bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-ivory">{q.name} <span className="text-ivory-dim">&lt;{q.email}&gt;</span></p>
                  <p className="text-sm text-ivory-dim">{q.createdAt.toLocaleString('en-GB', { timeZone: 'UTC' })} UTC</p>
                </div>
                {q.status === 'NEW' ? <HandledButton id={q.id} /> : <span className="text-sm text-emerald-300">Handled</span>}
              </div>
              <p className="prose-pre mt-4 text-ivory/90">{q.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
