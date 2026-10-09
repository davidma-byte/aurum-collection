import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { SignOutButton } from '@/components/SignOutButton';

const links = [
  { href: '/fleet', label: 'Fleet' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/**
 * Server component. The Admin link is only rendered when the server-side
 * session role is ADMIN; for everyone else it is not in the HTML at all.
 */
export async function Navbar() {
  const session = await getSession();
  const user = session?.user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 border-b border-gold/20" style={{ backgroundColor: '#111111' }}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 sm:px-8" aria-label="Main">
        <Link href="/" aria-label="Aurum Collection home" className="shrink-0">
          <Logo size={56} />
        </Link>
        <ul className="flex items-center gap-5 text-sm sm:gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="link-gold">
                {l.label}
              </Link>
            </li>
          ))}
          {isAdmin && (
            <li>
              <Link href="/admin" className="link-gold text-gold-soft">
                Admin
              </Link>
            </li>
          )}
          {user ? (
            <>
              <li>
                <Link href="/account" className="link-gold">
                  My bookings
                </Link>
              </li>
              <li>
                <SignOutButton />
              </li>
            </>
          ) : (
            <li>
              <Link href="/login" className="btn-ghost !px-4 !py-2">
                Sign in
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
