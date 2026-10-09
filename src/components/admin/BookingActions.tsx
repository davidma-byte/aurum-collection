'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cancelBookingAction, confirmBookingAction } from '@/app/admin/(panel)/actions';

export function BookingActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  const [pending, start] = useTransition();

  function run(fn: (id: string) => Promise<{ ok: boolean; message?: string }>) {
    setMsg('');
    start(async () => {
      const res = await fn(id);
      if (!res.ok) setMsg(res.message ?? 'Something went wrong.');
      router.refresh();
    });
  }

  if (status === 'CANCELLED') return <span className="text-ivory-dim">None</span>;
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {status === 'PENDING' && (
          <button type="button" disabled={pending} onClick={() => run(confirmBookingAction)} className="btn-gold !px-3 !py-1.5 !text-xs">Confirm</button>
        )}
        <button type="button" disabled={pending} onClick={() => run(cancelBookingAction)} className="btn-danger !px-3 !py-1.5 !text-xs">Cancel</button>
      </div>
      {msg && <p role="alert" className="text-xs text-red-300">{msg}</p>}
    </div>
  );
}
