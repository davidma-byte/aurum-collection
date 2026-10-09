import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { safeCallbackUrl } from '@/lib/safeCallback';

/** Role-based landing after sign-in: ADMIN -> /admin, CLIENT -> safe callback or /account. */
export default async function PostLogin({ searchParams }: { searchParams: { callbackUrl?: string } }) {
  const session = await getSession();
  if (!session?.user) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin');
  redirect(safeCallbackUrl(searchParams.callbackUrl, 'CLIENT'));
}
