import Link from 'next/link';
import { Logo } from '@/components/Logo';

export function Footer() {
  return (
    <footer className="border-t border-gold/20" style={{ backgroundColor: '#111111' }}>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-3">
        <div>
          <Logo size={72} />
          <p className="mt-4 max-w-xs text-sm text-ivory-dim">
            Rare cars and private yachts, hired directly from the people who look after them.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-lg text-gold">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/fleet" className="link-gold">Fleet</Link></li>
            <li><Link href="/fleet?collection=CLASSIC" className="link-gold">Classic cars</Link></li>
            <li><Link href="/fleet?collection=MODERN" className="link-gold">Modern cars</Link></li>
            <li><Link href="/fleet?collection=YACHT" className="link-gold">Yachts</Link></li>
            <li><Link href="/about" className="link-gold">About and services</Link></li>
            <li><Link href="/contact" className="link-gold">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-lg text-gold">Your account</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/login" className="link-gold">Sign in</Link></li>
            <li><Link href="/register" className="link-gold">Create an account</Link></li>
            <li><Link href="/account" className="link-gold">My bookings</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gold/10 px-5 py-5 text-center text-xs text-ivory-dim sm:px-8">
        <p>&copy; {new Date().getFullYear()} Aurum Collection. Coursework project for CUIT216.</p>
        <p className="mt-1">
          Image credits: hero photograph (Jaguar E-Type) from Unsplash, photographer Oli Woodman. Other images are
          placeholders for coursework.
        </p>
      </div>
    </footer>
  );
}
