'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { createBooking } from '@/lib/booking/service';

export type BookingActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function requestBooking(input: unknown): Promise<BookingActionResult> {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, message: 'Please sign in to request a booking.' };

  try {
    const result = await createBooking(session.user.id, input);
    if (!result.ok) return { ok: false, message: result.message, fieldErrors: result.fieldErrors };
    revalidatePath('/account');
    const itemId = (input as { fleetItemId?: string })?.fleetItemId;
    if (itemId) revalidatePath(`/fleet/${itemId}`);
    return { ok: true };
  } catch {
    return { ok: false, message: 'We could not save your request. Please try again.' };
  }
}
