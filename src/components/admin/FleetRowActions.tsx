'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteFleetItem, setFleetActive } from '@/app/admin/(panel)/actions';

export function FleetRowActions({ id, name, isActive, bookingCount }: { id: string; name: string; isActive: boolean; bookingCount: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, start] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; message?: string }>) {
    setMessage('');
    start(async () => {
      const res = await fn();
      if (!res.ok) setMessage(res.message ?? 'Something went wrong.');
      setConfirming(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <Link href={`/admin/fleet/${id}`} className="btn-ghost !px-3 !py-1.5 !text-xs">Edit</Link>
        <button type="button" disabled={pending} onClick={() => run(() => setFleetActive(id, !isActive))} className="btn-ghost !px-3 !py-1.5 !text-xs">
          {isActive ? 'Deactivate' : 'Activate'}
        </button>
        {!confirming && (
          <button type="button" disabled={pending} onClick={() => setConfirming(true)} className="btn-danger !px-3 !py-1.5 !text-xs">Delete</button>
        )}
      </div>
      {confirming && (
        <div role="alertdialog" aria-label={`Delete ${name}`} className="max-w-xs border border-red-400/50 p-3 text-right text-sm">
          {bookingCount > 0 ? (
            <>
              <p className="text-ivory">{name} has {bookingCount} booking{bookingCount === 1 ? '' : 's'}, so it cannot be deleted. Deactivate it instead?</p>
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" disabled={pending} onClick={() => run(() => setFleetActive(id, false))} className="btn-gold !px-3 !py-1.5 !text-xs">Deactivate</button>
                <button type="button" onClick={() => setConfirming(false)} className="btn-ghost !px-3 !py-1.5 !text-xs">Keep</button>
              </div>
            </>
          ) : (
            <>
              <p className="text-ivory">Delete {name} permanently?</p>
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" disabled={pending} onClick={() => run(() => deleteFleetItem(id))} className="btn-danger !px-3 !py-1.5 !text-xs">Yes, delete</button>
                <button type="button" onClick={() => setConfirming(false)} className="btn-ghost !px-3 !py-1.5 !text-xs">Keep</button>
              </div>
            </>
          )}
        </div>
      )}
      {message && <p role="alert" className="max-w-xs text-right text-sm text-red-300">{message}</p>}
    </div>
  );
}
