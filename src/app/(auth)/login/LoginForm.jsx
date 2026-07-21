'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { IconSparkles } from '@/components/icons';

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
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
      <button
        type="button"
        onClick={useDemo}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:border-brand-300 hover:bg-brand-100"
      >
        <IconSparkles className="h-4 w-4" />
        Explore with the demo account
      </button>

      <div className="relative flex items-center gap-3 text-xs font-medium text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or sign in with your email
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div>
        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className="input"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="input"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          autoComplete="current-password"
          required
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={loading} className="w-full">
        Sign in
      </Button>
      <p className="text-center text-xs text-slate-400">
        Demo account: demo@habitflow.app · demo1234
      </p>
    </form>
  );
}
