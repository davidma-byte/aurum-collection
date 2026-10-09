'use client';

import { useState, useTransition } from 'react';
import { Field } from '@/components/Field';
import { Spinner } from '@/components/Spinner';
import { fieldErrors, inquirySchema } from '@/lib/validation/fleet';
import { sendInquiry } from '@/app/(public)/contact/actions';

export function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  if (sent) {
    return (
      <div role="status" className="border border-gold bg-gold/10 p-8">
        <p className="font-serif text-3xl text-gold-soft">Enquiry sent</p>
        <p className="mt-2 text-ivory">Thank you. We will reply to the email address you gave.</p>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    const parsed = inquirySchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    start(async () => {
      const res = await sendInquiry(values);
      if (res.ok) setSent(true);
      else {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 border border-gold/30 bg-surface p-7">
      <Field label="Your name" name="name" autoComplete="name" value={values.name} error={errors.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
      <Field label="Email" name="email" type="email" autoComplete="email" value={values.email} error={errors.email}
        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} />
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm text-ivory-dim">Message</label>
        <textarea id="message" rows={6} value={values.message} maxLength={2000}
          aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? 'message-err' : undefined}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          className={`field ${errors.message ? 'field-error' : ''}`} />
        {errors.message && <p id="message-err" className="mt-1.5 text-sm text-red-300">{errors.message}</p>}
      </div>
      <div aria-live="polite" className="min-h-[1.25rem] text-sm text-red-300">{formError}</div>
      <button type="submit" disabled={pending} className="btn-gold w-full">
        {pending && <Spinner />}
        {pending ? 'Sending' : 'Send enquiry'}
      </button>
    </form>
  );
}
