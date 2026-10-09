'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Spinner } from '@/components/Spinner';
import { bookingSchema } from '@/lib/validation/booking';
import { fieldErrors } from '@/lib/validation/fleet';
import { parseDateOnly, rangesConflict, todayUtc, toDateOnlyString } from '@/lib/booking/dates';
import { requestBooking } from '@/app/(public)/fleet/[id]/actions';

interface Props {
  fleetItemId: string;
  signedIn: boolean;
  loginHref: string;
  /** Existing bookings as YYYY-MM-DD (their own days, without the buffer). */
  taken: { start: string; end: string }[];
}

export function BookingForm({ fleetItemId, signedIn, loginHref, taken }: Props) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const minDate = toDateOnlyString(todayUtc());

  if (!signedIn) {
    return (
      <div className="border border-gold/30 p-6">
        <p className="text-ivory">Sign in to request this booking.</p>
        <div className="mt-4 flex gap-3">
          <Link href={loginHref} className="btn-gold">Sign in</Link>
          <Link href="/register" className="btn-ghost">Create account</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div role="status" className="border border-gold bg-gold/10 p-6">
        <p className="font-serif text-2xl text-gold-soft">Request sent</p>
        <p className="mt-2 text-sm text-ivory">Your booking is pending. You can follow it, or cancel it while it is pending, under My bookings.</p>
        <Link href="/account" className="btn-gold mt-5">View my bookings</Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    const parsed = bookingSchema.safeParse({ fleetItemId, startDate, endDate, notes: notes || undefined });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    // Instant feedback only. The server re-checks inside a serializable transaction.
    const start = parseDateOnly(startDate)!;
    const end = parseDateOnly(endDate)!;
    const clash = taken.some((t) => rangesConflict({ start, end }, { start: parseDateOnly(t.start)!, end: parseDateOnly(t.end)! }));
    if (clash) {
      setErrors({ startDate: 'These dates overlap a booking or its preparation day. See the unavailable dates above.' });
      return;
    }
    setErrors({});
    startTransition(async () => {
      const res = await requestBooking({ fleetItemId, startDate, endDate, notes: notes || undefined });
      if (res.ok) setSuccess(true);
      else {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 border border-gold/30 p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="mb-1.5 block text-sm text-ivory-dim">Start date</label>
          <input id="startDate" type="date" min={minDate} value={startDate} onChange={(e) => setStartDate(e.target.value)}
            aria-invalid={errors.startDate ? true : undefined} aria-describedby={errors.startDate ? 'startDate-err' : undefined}
            className={`field ${errors.startDate ? 'field-error' : ''}`} />
          {errors.startDate && <p id="startDate-err" className="mt-1.5 text-sm text-red-300">{errors.startDate}</p>}
        </div>
        <div>
          <label htmlFor="endDate" className="mb-1.5 block text-sm text-ivory-dim">End date</label>
          <input id="endDate" type="date" min={startDate || minDate} value={endDate} onChange={(e) => setEndDate(e.target.value)}
            aria-invalid={errors.endDate ? true : undefined} aria-describedby={errors.endDate ? 'endDate-err' : undefined}
            className={`field ${errors.endDate ? 'field-error' : ''}`} />
          {errors.endDate && <p id="endDate-err" className="mt-1.5 text-sm text-red-300">{errors.endDate}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm text-ivory-dim">Notes (optional)</label>
        <textarea id="notes" rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Occasion, pick-up location, special requests" className="field" />
        {errors.notes && <p className="mt-1.5 text-sm text-red-300">{errors.notes}</p>}
      </div>
      <div aria-live="polite" className="min-h-[1.25rem] text-sm text-red-300">{formError}</div>
      <button type="submit" disabled={pending} className="btn-gold w-full">
        {pending && <Spinner />}
        {pending ? 'Sending request' : 'Request this booking'}
      </button>
    </form>
  );
}
