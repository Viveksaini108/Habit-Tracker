'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { IconSparkles } from '@/components/icons';
import PasswordInput from '@/components/PasswordInput';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import { isEmail } from '@/lib/email';

function Divider({ children }) {
  return (
    <div className="relative flex items-center gap-3 text-xs font-medium text-faint">
      <span className="h-px flex-1 bg-soft2" />
      {children}
      <span className="h-px flex-1 bg-soft2" />
    </div>
  );
}

export default function LoginForm({ demoEnabled = true, googleClientId = '' }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isEmail(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Sign in failed');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  const useDemo = () => setForm({ email: 'demo@habitflow.app', password: 'demo1234' });

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <GoogleAuthButton clientId={googleClientId} text="continue_with" onError={setError} />

      {googleClientId ? <Divider>or continue with email</Divider> : null}

      <div>
        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          inputMode="email"
          className="input"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          autoComplete="email"
          required
        />
      </div>
      <PasswordInput
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        autoComplete="current-password"
      />

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={loading} className="w-full">
        Sign in
      </Button>

      {demoEnabled ? (
        <>
          <button
            type="button"
            onClick={useDemo}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent-strong transition hover:border-accent/50 hover:bg-accent/15"
          >
            <IconSparkles className="h-4 w-4" />
            Explore with the demo account
          </button>
          <p className="text-center text-xs text-faint">
            Demo account: demo@habitflow.app · demo1234
          </p>
        </>
      ) : null}
    </form>
  );
}
