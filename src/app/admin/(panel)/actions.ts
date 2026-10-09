'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';
import { cancelBooking, confirmBooking } from '@/lib/booking/service';
import { fieldErrors, fleetItemSchema } from '@/lib/validation/fleet';

// Every exported action starts with requireAdmin(): a non-admin gets notFound().

export type ActionResult = { ok: true; id?: string } | { ok: false; message: string; fieldErrors?: Record<string, string>; canDeactivate?: boolean };

export async function saveFleetItem(id: string | null, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = fleetItemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Please correct the highlighted fields.', fieldErrors: fieldErrors(parsed.error) };

  const data = parsed.data;
  if (id) {
    const exists = await prisma.fleetItem.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return { ok: false, message: 'Item not found.' };
    await prisma.fleetItem.update({ where: { id }, data });
    revalidatePath('/', 'layout');
    return { ok: true, id };
  }
  const created = await prisma.fleetItem.create({ data });
  revalidatePath('/', 'layout');
  return { ok: true, id: created.id };
}

export async function setFleetActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  await prisma.fleetItem.update({ where: { id }, data: { isActive } });
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function deleteFleetItem(id: string): Promise<ActionResult> {
  await requireAdmin();
  const bookings = await prisma.booking.count({ where: { fleetItemId: id } });
  if (bookings > 0) {
    return {
      ok: false,
      canDeactivate: true,
      message: `This item has ${bookings} booking${bookings === 1 ? '' : 's'} on record, so it cannot be deleted. Deactivate it instead to hide it from clients.`,
    };
  }
  await prisma.fleetItem.delete({ where: { id } });
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function confirmBookingAction(bookingId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await confirmBooking(admin.id, bookingId);
  if (!res.ok) return { ok: false, message: res.message };
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function cancelBookingAction(bookingId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await cancelBooking({ id: admin.id, role: 'ADMIN' }, bookingId);
  if (!res.ok) return { ok: false, message: res.message };
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function markInquiryHandled(inquiryId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.inquiry.update({ where: { id: inquiryId }, data: { status: 'HANDLED' } });
  revalidatePath('/admin', 'layout');
  return { ok: true };
}
