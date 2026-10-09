'use client';

import { useState, useTransition } from 'react';
import { cancelMyBooking } from '@/app/(public)/account/actions';
import { Spinner } from '@/components/Spinner';

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  function cancel() {
    setError('');
    start(async () => {
      const res = await cancelMyBooking(bookingId);
      if (!res.ok) {
        setError(res.message ?? 'Could not cancel.');
        setConfirming(false);
      }
    });
  }

  if (!confirming) {
    return (
      <div>
        <button type="button" onClick={() => setConfirming(true)} className="btn-danger !px-4 !py-2">Cancel booking</button>
        {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Confirm cancellation">
      <span className="text-sm text-ivory">Cancel this booking?</span>
      <button type="button" onClick={cancel} disabled={pending} className="btn-danger !px-4 !py-2">
        {pending && <Spinner />} Yes, cancel
      </button>
      <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="btn-ghost !px-4 !py-2">Keep it</button>
    </div>
  );
}
