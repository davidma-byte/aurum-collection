import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-6xl text-gold">404</h1>
      <p className="mt-4 text-xl text-ivory">This page could not be found.</p>
      <Link href="/" className="btn-ghost mt-8">
        Back to home
      </Link>
    </main>
  );
}
