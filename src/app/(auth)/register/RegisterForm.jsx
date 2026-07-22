'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import PasswordInput from '@/components/PasswordInput';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import { isEmail } from '@/lib/email';

export default function RegisterForm({ googleClientId = '' }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      <GoogleAuthButton clientId={googleClientId} text="signup_with" onError={setError} />

      {googleClientId ? (
        <div className="relative flex items-center gap-3 text-xs font-medium text-faint">
          <span className="h-px flex-1 bg-soft2" />
          or sign up with email
          <span className="h-px flex-1 bg-soft2" />
        </div>
      ) : null}

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
      <PasswordInput
        placeholder="8+ characters"
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        autoComplete="new-password"
        hint="At least 8 characters. We start you off with four starter categories."
      />

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
