import Link from 'next/link';
import { Logo } from '@/components/Logo';

/** Split layout: image panel on desktop, single column with the logo on top for mobile. */
export function AuthShell({ children, heading, sub }: { children: React.ReactNode; heading: string; sub: string }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" aria-label="Aurum Collection home">
            <Logo size={96} />
          </Link>
          <div>
            <p className="max-w-md font-serif text-4xl leading-tight text-ivory">
              Rare cars and private yachts, hired directly from the owner.
            </p>
          </div>
        </div>
      </aside>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" aria-label="Aurum Collection home" className="mb-8 flex justify-center lg:hidden">
            <Logo size={88} />
          </Link>
          <div className="border border-gold/40 bg-surface p-7 sm:p-10">
            <h1 className="font-serif text-3xl text-ivory">{heading}</h1>
            <p className="mb-8 mt-2 text-sm text-ivory-dim">{sub}</p>
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
