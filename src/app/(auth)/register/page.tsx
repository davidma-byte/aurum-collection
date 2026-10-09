import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';
import { AuthPanel } from '@/components/AuthPanel';
import { getSession } from '@/lib/auth';
import { safeCallbackUrl } from '@/lib/safeCallback';

export const metadata = { title: 'Create account' };

export default async function RegisterPage({ searchParams }: { searchParams: { callbackUrl?: string } }) {
  const session = await getSession();
  if (session?.user) redirect(session.user.role === 'ADMIN' ? '/admin' : '/account');
  const callbackUrl = safeCallbackUrl(searchParams.callbackUrl, 'CLIENT');
  return (
    <AuthShell heading="Create your account" sub="Register once to request bookings and track them.">
      <AuthPanel initialMode="register" callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
