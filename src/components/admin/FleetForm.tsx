'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Field } from '@/components/Field';
import { Spinner } from '@/components/Spinner';
import { fieldErrors, fleetItemSchema } from '@/lib/validation/fleet';
import { saveFleetItem } from '@/app/admin/(panel)/actions';

export interface FleetFormValues {
  name: string;
  collection: string;
  description: string;
  specifications: string;
  history: string;
  condition: string;
  pricePerDay: string;
  imageUrl: string;
  isActive: boolean;
}

export const EMPTY_FLEET: FleetFormValues = {
  name: '', collection: 'CLASSIC', description: '', specifications: '', history: '', condition: '',
  pricePerDay: '', imageUrl: '/images/', isActive: true,
};

export function FleetForm({ id, initial }: { id: string | null; initial: FleetFormValues }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [pending, start] = useTransition();
  const set = (k: keyof FleetFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV((s) => ({ ...s, [k]: e.target.value }));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    const parsed = fleetItemSchema.safeParse(v);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    start(async () => {
      const res = await saveFleetItem(id, v);
      if (res.ok) {
        router.push('/admin/fleet');
        router.refresh();
      } else {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.message);
      }
    });
  }

  const area = (k: 'description' | 'specifications' | 'history' | 'condition', label: string, rows: number) => (
    <div>
      <label htmlFor={k} className="mb-1.5 block text-sm text-ivory-dim">{label}</label>
      <textarea id={k} rows={rows} value={v[k]} onChange={set(k)} aria-invalid={errors[k] ? true : undefined}
        className={`field ${errors[k] ? 'field-error' : ''}`} />
      {errors[k] && <p className="mt-1.5 text-sm text-red-300">{errors[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-3xl space-y-5">
      <Field label="Name" value={v.name} onChange={set('name')} error={errors.name} />
      <div>
        <label htmlFor="collection" className="mb-1.5 block text-sm text-ivory-dim">Collection</label>
        <select id="collection" value={v.collection} onChange={set('collection')} className="field">
          <option value="CLASSIC">Classic cars</option>
          <option value="MODERN">Modern cars</option>
          <option value="YACHT">Yachts</option>
        </select>
        {errors.collection && <p className="mt-1.5 text-sm text-red-300">{errors.collection}</p>}
      </div>
      {area('description', 'Description', 4)}
      {area('specifications', 'Specifications', 4)}
      {area('history', 'History', 4)}
      {area('condition', 'Condition', 3)}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Price per day (USD)" type="number" min="0" step="1" value={v.pricePerDay} onChange={set('pricePerDay')} error={errors.pricePerDay} />
        <Field label="Image path" value={v.imageUrl} onChange={set('imageUrl')} error={errors.imageUrl} hint="A file inside public/images, for example /images/classic-7-main.jpg" />
      </div>
      <label className="flex items-center gap-3 text-ivory">
        <input type="checkbox" checked={v.isActive} onChange={(e) => setV((s) => ({ ...s, isActive: e.target.checked }))} className="h-4 w-4 accent-[#D4B05C]" />
        Active (visible to clients and open for booking)
      </label>
      <div aria-live="polite" className="min-h-[1.25rem] text-sm text-red-300">{formError}</div>
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn-gold">{pending && <Spinner />}{pending ? 'Saving' : 'Save item'}</button>
        <button type="button" className="btn-ghost" onClick={() => router.push('/admin/fleet')}>Cancel</button>
      </div>
    </form>
  );
}
