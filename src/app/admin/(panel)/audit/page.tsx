import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

export const metadata = { title: 'Audit log' };

export default async function AdminAuditPage() {
  await requireAdmin();
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { name: true } } },
  });
  return (
    <>
      <h1 className="font-serif text-4xl text-ivory">Audit log</h1>
      <p className="mt-2 text-ivory-dim">The latest 50 entries. Read only.</p>
      <div className="mt-6 overflow-x-auto border border-gold/25">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface text-ivory-dim">
            <tr>
              <th className="p-4 font-normal">When (UTC)</th><th className="p-4 font-normal">User</th>
              <th className="p-4 font-normal">Action</th><th className="p-4 font-normal">Entity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-gold/15">
                <td className="p-4">{l.createdAt.toISOString().replace('T', ' ').slice(0, 19)}</td>
                <td className="p-4">{l.user.name}</td>
                <td className="p-4 text-gold-soft">{l.action}</td>
                <td className="p-4 text-ivory-dim">{l.entity} {l.entityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
