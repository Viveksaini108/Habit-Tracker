'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { IconCheck } from '@/components/icons';
import PasswordInput from '@/components/PasswordInput';

export default function ResetForm({ token }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          This reset link is incomplete — please open the full link from your email.
        </p>
        <Link href="/forgot" className="block text-center text-sm font-semibold text-accent-strong hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
            <IconCheck className="h-4 w-4" /> Password updated
          </p>
          <p className="mt-1.5 text-sm text-emerald-700/90">
            You can now sign in with your email and new password.
          </p>
        </div>
        <Link
          href="/login"
          className="flex h-10 w-full items-center justify-center rounded-xl bg-accent px-4 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords don’t match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not reset your password');
      setDone(true);
    } catch (err) {
      setError(err.message || 'Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <PasswordInput
        id="new-password"
        label="New password"
        placeholder="8+ characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />
      <PasswordInput
        id="confirm-password"
        label="Confirm new password"
        placeholder="Type it again"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="new-password"
      />

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={loading} className="w-full">
        Save new password
      </Button>

      <p className="text-center text-xs text-faint">
        Link expired?{' '}
        <Link href="/forgot" className="font-semibold text-accent-strong hover:underline">
          Request a new one
        </Link>
      </p>
    </form>
  );
}
