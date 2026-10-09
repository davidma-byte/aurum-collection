import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { AuthPanel } from '@/components/AuthPanel';
import { getSession } from '@/lib/auth';

export const metadata = { title: 'Staff sign in', robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.user?.role === 'ADMIN') redirect('/admin');
  if (session?.user) notFound(); // a signed-in client sees the ordinary 404
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm text-center">
        <Link href="/" aria-label="Aurum Collection home" className="mb-6 inline-block">
          <Logo size={88} />
        </Link>
        <p className="mb-8 font-serif text-xl text-gold-soft">Authorised staff only</p>
        <div className="border border-gold/40 bg-surface p-7 text-left">
          <AuthPanel initialMode="login" callbackUrl="/admin" portal="admin" />
        </div>
      </div>
    </main>
  );
}
