import { ContactForm } from '@/components/ContactForm';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="font-serif text-5xl text-ivory">Tell us what you are planning</h1>
        <p className="mt-5 text-ivory/85">
          Weddings, events, a weekend away or a week at sea. Describe the occasion, the dates and the kind of car or
          yacht you have in mind, and we will come back to you.
        </p>
        <p className="mt-4 text-sm text-ivory-dim">
          To hire a specific item, open it from the fleet and send a booking request. It shows the dates already taken.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
