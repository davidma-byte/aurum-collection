'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { cancelBooking } from '@/lib/booking/service';

export async function cancelMyBooking(bookingId: string): Promise<{ ok: boolean; message?: string }> {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, message: 'Please sign in again.' };
  if (typeof bookingId !== 'string' || bookingId.length > 64) return { ok: false, message: 'Booking not found.' };

  try {
    const res = await cancelBooking({ id: session.user.id, role: session.user.role }, bookingId);
    if (!res.ok) return { ok: false, message: res.message };
    revalidatePath('/account');
    return { ok: true };
  } catch {
    return { ok: false, message: 'We could not cancel this booking. Please try again.' };
  }
}
