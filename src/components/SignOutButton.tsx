'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton({ className = 'link-gold text-sm' }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => signOut({ callbackUrl: '/' })}>
      Sign out
    </button>
  );
}
