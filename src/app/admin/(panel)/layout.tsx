import Link from 'next/link';
import { requireAdmin } from '@/lib/requireAdmin';
import { Logo } from '@/components/Logo';
import { SignOutButton } from '@/components/SignOutButton';

export const metadata = { title: { default: 'Admin', template: '%s | Admin' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const nav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/fleet', label: 'Fleet' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/inquiries', label: 'Inquiries' },
  { href: '/admin/audit', label: 'Audit log' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen">
      <header className="border-b border-gold/20" style={{ backgroundColor: '#111111' }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-2 sm:px-8">
          <Link href="/admin" aria-label="Admin dashboard"><Logo size={48} /></Link>
          <nav aria-label="Admin" className="flex flex-wrap items-center gap-6 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="link-gold">{n.label}</Link>
            ))}
            <Link href="/" className="link-gold text-ivory-dim">View site</Link>
            <span className="text-ivory-dim">{admin.name}</span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">{children}</div>
    </div>
  );
}
