import Link from 'next/link';

export const metadata = { title: 'About and services' };

const steps = [
  { t: 'Choose', d: 'Browse the classic cars, modern cars and yachts, and read each item\u2019s history and condition.' },
  { t: 'Check dates', d: 'The item page lists the dates already taken, including the preparation day after each hire.' },
  { t: 'Request', d: 'Create an account and send a booking request. It is held as pending while we review it.' },
  { t: 'Confirm', d: 'We confirm your booking and you see its status under My bookings.' },
];

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
        <div>
          <h1 className="font-serif text-5xl text-ivory">From everyday hire to a collection worth asking for</h1>
          <div className="mt-6 space-y-4 text-ivory/85">
            <p>
              Aurum Collection began by hiring out ordinary vehicles. We are now shifting to an exclusive collection:
              restored classic cars, modern high-end cars and private yachts, for clients who cannot easily get access
              to such things.
            </p>
            <p>
              Until now, hiring a rare car or a yacht usually meant going through a broker. Brokers add commission and
              delay confirmation, and clients could not check an item&rsquo;s condition or availability before paying.
              Owners, understandably, hesitated to hand irreplaceable assets to strangers.
            </p>
            <p>
              Aurum Collection is the direct route. You deal with the company, you see the item&rsquo;s condition and
              the dates already taken, and every booking is recorded and accountable.
            </p>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/about.jpg" alt="A sailing yacht at sunset" className="aspect-[3/2] w-full border border-gold/30 object-cover" />
      </section>

      <section className="border-y border-gold/20 bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/services-wedding.jpg" alt="A wedding car decorated for the day" className="aspect-square w-full max-w-md border border-gold/30 object-cover" />
          <div>
            <h2 className="font-serif text-4xl text-ivory">What we do</h2>
            <dl className="mt-8 space-y-6">
              <div>
                <dt className="font-serif text-2xl text-gold">Weddings</dt>
                <dd className="mt-1 text-ivory-dim">A restored classic for the arrival, or a yacht for the celebration afterwards.</dd>
              </div>
              <div>
                <dt className="font-serif text-2xl text-gold">Events</dt>
                <dd className="mt-1 text-ivory-dim">Launches, anniversaries and private parties, with a car or vessel that suits the occasion.</dd>
              </div>
              <div>
                <dt className="font-serif text-2xl text-gold">Travel</dt>
                <dd className="mt-1 text-ivory-dim">Modern flagships for the discerning traveller, and yachts for time on the water.</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <h2 className="font-serif text-4xl text-ivory">How hiring works</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.t} className="border border-gold/25 p-6">
              <span className="font-serif text-3xl text-gold">{i + 1}</span>
              <h3 className="mt-2 font-serif text-2xl text-ivory">{s.t}</h3>
              <p className="mt-2 text-sm text-ivory-dim">{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12">
          <Link href="/fleet" className="btn-gold">Browse the fleet</Link>
        </div>
      </section>
    </>
  );
}
