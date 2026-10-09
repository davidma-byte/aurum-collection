import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';
import { AuthPanel } from '@/components/AuthPanel';
import { getSession } from '@/lib/auth';
import { safeCallbackUrl } from '@/lib/safeCallback';

export const metadata = { title: 'Sign in' };

export default async function LoginPage({ searchParams }: { searchParams: { callbackUrl?: string } }) {
  const session = await getSession();
  if (session?.user) redirect(session.user.role === 'ADMIN' ? '/admin' : safeCallbackUrl(searchParams.callbackUrl, 'CLIENT'));
  const callbackUrl = safeCallbackUrl(searchParams.callbackUrl, 'CLIENT');
  return (
    <AuthShell heading="Welcome back" sub="Sign in to request bookings and see your hires.">
      <AuthPanel initialMode="login" callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
