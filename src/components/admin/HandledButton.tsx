'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { markInquiryHandled } from '@/app/admin/(panel)/actions';

export function HandledButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} className="btn-ghost !px-3 !py-1.5 !text-xs"
      onClick={() => start(async () => { await markInquiryHandled(id); router.refresh(); })}>
      Mark as handled
    </button>
  );
}
