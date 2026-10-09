import { prisma } from '@/lib/prisma';
import { addDays, BUFFER_DAYS, todayUtc } from '@/lib/booking/dates';

export type CollectionKey = 'CLASSIC' | 'MODERN' | 'YACHT';

export const COLLECTION_LABEL: Record<CollectionKey, string> = {
  CLASSIC: 'Classic cars',
  MODERN: 'Modern cars',
  YACHT: 'Yachts',
};

export function isCollection(v: unknown): v is CollectionKey {
  return v === 'CLASSIC' || v === 'MODERN' || v === 'YACHT';
}

export function formatPrice(value: unknown): string {
  return `$${Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** Ids of active items that are hired (or in their preparation day) today. */
export async function getBusyTodayIds(): Promise<Set<string>> {
  const today = todayUtc();
  const rows = await prisma.booking.findMany({
    where: {
      status: { in: ['PENDING', 'CONFIRMED'] },
      startDate: { lte: today },
      endDate: { gte: addDays(today, -BUFFER_DAYS) },
    },
    select: { fleetItemId: true },
  });
  return new Set(rows.map((r) => r.fleetItemId));
}
