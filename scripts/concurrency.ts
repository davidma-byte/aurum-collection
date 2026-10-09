/**
 * Fires simultaneous booking requests for the SAME item and dates and proves
 * that exactly one succeeds. Needs the database from .env.local (run db:migrate and db:seed first).
 *
 *   npm run test:concurrency
 */
import './env';
import bcrypt from 'bcrypt';
import { prisma } from '../src/lib/prisma';
import { createBooking, CONFLICT_MESSAGE } from '../src/lib/booking/service';
import { addDays, todayUtc, toDateOnlyString } from '../src/lib/booking/dates';

const CONCURRENT = Number(process.env.CONCURRENT ?? 10);

async function main() {
  const tag = `concurrency-${Date.now()}`;
  const hash = await bcrypt.hash('Concurrency1x', 4);
  const users = await Promise.all(
    Array.from({ length: CONCURRENT }, (_, i) =>
      prisma.user.create({ data: { name: `Racer ${i + 1}`, email: `${tag}-${i}@example.test`, passwordHash: hash } }),
    ),
  );
  const item = await prisma.fleetItem.create({
    data: {
      name: `Concurrency test item ${tag}`, collection: 'CLASSIC', description: 'temporary test item', specifications: 'n/a',
      history: 'n/a', condition: 'n/a', pricePerDay: 1, imageUrl: '/images/none.jpg', isActive: true,
    },
  });

  const start = toDateOnlyString(addDays(todayUtc(), 400));
  const end = toDateOnlyString(addDays(todayUtc(), 403));

  try {
    console.log(`Firing ${CONCURRENT} simultaneous requests for ${item.name} (${start} to ${end})...`);
    const results = await Promise.allSettled(
      users.map((u) => createBooking(u.id, { fleetItemId: item.id, startDate: start, endDate: end })),
    );

    let ok = 0;
    let conflicts = 0;
    let unexpected = 0;
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.ok) ok++;
      else if (r.status === 'fulfilled' && !r.value.ok && r.value.code === 'CONFLICT' && r.value.message === CONFLICT_MESSAGE) conflicts++;
      else {
        unexpected++;
        console.error('Unexpected result:', r.status === 'fulfilled' ? r.value : r.reason);
      }
    }
    const rows = await prisma.booking.count({ where: { fleetItemId: item.id } });
    const audits = await prisma.auditLog.count({ where: { entity: 'Booking', userId: { in: users.map((u) => u.id) } } });

    console.log(`succeeded: ${ok}`);
    console.log(`rejected with "${CONFLICT_MESSAGE}": ${conflicts}`);
    console.log(`unexpected: ${unexpected}`);
    console.log(`booking rows in database for this item: ${rows}`);
    console.log(`audit rows written: ${audits}`);

    const pass = ok === 1 && rows === 1 && audits === 1 && unexpected === 0 && conflicts === CONCURRENT - 1;
    console.log(pass ? '\nPASS: exactly one booking was created.' : '\nFAIL: expected exactly one booking.');
    process.exitCode = pass ? 0 : 1;
  } finally {
    await prisma.auditLog.deleteMany({ where: { userId: { in: users.map((u) => u.id) } } });
    await prisma.booking.deleteMany({ where: { fleetItemId: item.id } });
    await prisma.fleetItem.delete({ where: { id: item.id } });
    await prisma.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
