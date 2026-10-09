'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Field } from '@/components/Field';
import { Spinner } from '@/components/Spinner';
import { loginSchema, passwordStrength, registerSchema } from '@/lib/validation/auth';
import { fieldErrors } from '@/lib/validation/fleet';
import { TOO_MANY_MESSAGE } from '@/lib/rateLimit';

type Mode = 'login' | 'register';
const GENERIC = 'Invalid email or password.';

export function AuthPanel({
  initialMode,
  callbackUrl,
  portal = 'client',
}: {
  initialMode: Mode;
  callbackUrl: string;
  portal?: 'client' | 'admin';
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdminPortal = portal === 'admin';
  const strength = passwordStrength(values.password);
  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
    setFormError('');
    window.history.replaceState(null, '', next === 'login' ? '/login' : '/register');
  }

  async function finishSignIn() {
    const res = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
      portal,
    });
    if (res?.error) {
      setFormError(res.error === 'RATE_LIMITED' ? TOO_MANY_MESSAGE : GENERIC);
      return false;
    }
    router.push(`/post-login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    router.refresh();
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setErrors({});

    if (mode === 'login') {
      const parsed = loginSchema.safeParse({ email: values.email, password: values.password, portal });
      if (!parsed.success) {
        const fe = fieldErrors(parsed.error);
        setErrors({ email: fe.email ?? '', password: fe.password ? 'Enter your password.' : '' });
        return;
      }
      setLoading(true);
      try {
        const ok = await finishSignIn();
        if (!ok) setLoading(false);
      } catch {
        setFormError('Something went wrong. Please try again.');
        setLoading(false);
      }
      return;
    }

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setFormError(data.error ?? 'Could not create your account.');
        setLoading(false);
        return;
      }
      setToast('Account created. Signing you in…');
      const ok = await finishSignIn();
      if (!ok) {
        setToast('');
        switchMode('login');
        setLoading(false);
      }
    } catch {
      setFormError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const barColors = ['bg-red-400', 'bg-red-400', 'bg-gold-deep', 'bg-gold', 'bg-gold-soft'];

  return (
    <div className="relative">
      {toast && (
        <div role="status" className="mb-4 border border-gold bg-gold/10 px-4 py-3 text-sm text-gold-soft">
          {toast}
        </div>
      )}

      {!isAdminPortal && (
        <div className="mb-8 grid grid-cols-2 border-b border-gold/20" role="tablist" aria-label="Account">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`pb-3 font-serif text-xl transition-colors ${
                mode === m ? 'border-b-2 border-gold text-gold-soft' : 'text-ivory-dim hover:text-ivory'
              }`}
            >
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>
      )}

      <form key={mode} onSubmit={onSubmit} noValidate className="swap-in space-y-5">
        {mode === 'register' && (
          <Field label="Full name" name="name" autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} />
        )}
        <Field label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={values.password}
          onChange={set('password')}
          error={errors.password}
          hint={
            mode === 'register' ? (
              <div>
                <div className="mb-1.5 flex gap-1" aria-hidden="true">
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className={`h-1 flex-1 ${strength.score >= i ? barColors[strength.score] : 'bg-ivory/15'}`} />
                  ))}
                </div>
                <span>
                  At least 8 characters with a letter and a number.
                  {strength.label && <> Strength: <strong className="text-ivory">{strength.label}</strong>.</>}
                </span>
              </div>
            ) : undefined
          }
        />
        {mode === 'register' && (
          <Field
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
          />
        )}

        <div aria-live="polite" className="min-h-[1.25rem] text-sm text-red-300">
          {formError}
        </div>

        <button type="submit" disabled={loading} className="btn-gold w-full">
          {loading && <Spinner />}
          {loading ? 'Please wait' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
