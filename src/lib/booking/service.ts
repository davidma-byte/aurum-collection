import { Prisma, type PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { addDays, parseDateOnly, BUFFER_DAYS } from '@/lib/booking/dates';
import { bookingSchema } from '@/lib/validation/booking';

export const CONFLICT_MESSAGE = 'These dates were just taken. Please choose different dates.';

export type ServiceResult =
  | { ok: true; id: string }
  | { ok: false; code: 'INVALID' | 'NOT_FOUND' | 'CONFLICT' | 'FORBIDDEN'; message: string; fieldErrors?: Record<string, string> };

const BLOCKING = ['PENDING', 'CONFIRMED'] as const;

function isSerializationFailure(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && (e.code === 'P2034' || e.code === 'P2028');
}

/**
 * Create a PENDING booking. The availability check, the insert and the audit
 * entry share ONE Serializable transaction, so two clients booking the same
 * item at the same moment cannot both succeed: Postgres aborts one of them
 * with a serialization failure (Prisma P2034), which becomes a clean message.
 */
export async function createBooking(
  userId: string,
  raw: unknown,
  db: PrismaClient = prisma,
): Promise<ServiceResult> {
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? 'form')] ??= issue.message;
    return { ok: false, code: 'INVALID', message: 'Please correct the highlighted fields.', fieldErrors };
  }
  const { fleetItemId, notes } = parsed.data;
  const start = parseDateOnly(parsed.data.startDate)!;
  const end = parseDateOnly(parsed.data.endDate)!;

  try {
    return await db.$transaction(
      async (tx): Promise<ServiceResult> => {
        const item = await tx.fleetItem.findUnique({
          where: { id: fleetItemId },
          select: { id: true, isActive: true },
        });
        if (!item || !item.isActive) {
          return { ok: false, code: 'NOT_FOUND', message: 'This item is not available for hire.' };
        }

        // Conflict: existing.start <= newEnd + buffer AND existing.end >= newStart - buffer
        const clash = await tx.booking.findFirst({
          where: {
            fleetItemId,
            status: { in: [...BLOCKING] },
            startDate: { lte: addDays(end, BUFFER_DAYS) },
            endDate: { gte: addDays(start, -BUFFER_DAYS) },
          },
          select: { id: true },
        });
        if (clash) return { ok: false, code: 'CONFLICT', message: CONFLICT_MESSAGE };

        const booking = await tx.booking.create({
          data: { userId, fleetItemId, startDate: start, endDate: end, notes: notes || null, status: 'PENDING' },
        });
        await tx.auditLog.create({
          data: { userId, action: 'BOOKING_CREATED', entity: 'Booking', entityId: booking.id },
        });
        return { ok: true, id: booking.id };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 10000,
        timeout: 15000,
      },
    );
  } catch (e) {
    if (isSerializationFailure(e)) return { ok: false, code: 'CONFLICT', message: CONFLICT_MESSAGE };
    throw e;
  }
}

export interface Actor {
  id: string;
  role: 'CLIENT' | 'ADMIN';
}

/** Owner (PENDING only) or admin (any non-cancelled booking) may cancel. */
export async function cancelBooking(actor: Actor, bookingId: string): Promise<ServiceResult> {
  return prisma.$transaction(async (tx): Promise<ServiceResult> => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    // Same answer for "missing" and "not yours", so ids cannot be probed.
    if (!booking || (booking.userId !== actor.id && actor.role !== 'ADMIN')) {
      return { ok: false, code: 'NOT_FOUND', message: 'Booking not found.' };
    }
    if (booking.status === 'CANCELLED') {
      return { ok: false, code: 'INVALID', message: 'This booking is already cancelled.' };
    }
    if (actor.role !== 'ADMIN' && booking.status !== 'PENDING') {
      return { ok: false, code: 'FORBIDDEN', message: 'Only pending bookings can be cancelled online. Contact us to change a confirmed booking.' };
    }
    await tx.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } });
    await tx.auditLog.create({
      data: { userId: actor.id, action: 'BOOKING_CANCELLED', entity: 'Booking', entityId: bookingId },
    });
    return { ok: true, id: bookingId };
  });
}

/** Admin only (the caller must have passed requireAdmin). PENDING -> CONFIRMED. */
export async function confirmBooking(adminId: string, bookingId: string): Promise<ServiceResult> {
  return prisma.$transaction(async (tx): Promise<ServiceResult> => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return { ok: false, code: 'NOT_FOUND', message: 'Booking not found.' };
    if (booking.status !== 'PENDING') {
      return { ok: false, code: 'INVALID', message: 'Only pending bookings can be confirmed.' };
    }
    await tx.booking.update({ where: { id: bookingId }, data: { status: 'CONFIRMED' } });
    await tx.auditLog.create({
      data: { userId: adminId, action: 'BOOKING_CONFIRMED', entity: 'Booking', entityId: bookingId },
    });
    return { ok: true, id: bookingId };
  });
}
