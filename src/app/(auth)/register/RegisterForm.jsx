'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Could not create your account');
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

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label className="label" htmlFor="name">Name</label>
        <input
          id="name"
          className="input"
          placeholder="Ada Lovelace"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          autoComplete="name"
          required
        />
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
          placeholder="8+ characters"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          autoComplete="new-password"
          required
        />
        <p className="mt-1.5 text-xs text-slate-400">At least 8 characters. We start you off with four starter categories.</p>
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={loading} className="w-full">
        Create account
      </Button>
    </form>
  );
}
