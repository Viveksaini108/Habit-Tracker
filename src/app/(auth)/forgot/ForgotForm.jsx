'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { IconCheck } from '@/components/icons';
import { isEmail } from '@/lib/email';

export default function ForgotForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null); // { devUrl?, devNote? } once done

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Something went wrong');
      setSent({ devUrl: data.devUrl, devNote: data.devNote });
    } catch (err) {
      setError(err.message || 'Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
            <IconCheck className="h-4 w-4" /> Check your inbox
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-emerald-700/90">
            If an account exists for <strong>{email}</strong>, a reset link is on its way.
            It&rsquo;s valid for 30 minutes.
          </p>
        </div>

        {sent.devUrl ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-bold">🛠 Dev mode</p>
            <p className="mt-1">{sent.devNote}:</p>
            <Link href={sent.devUrl} className="mt-1 block break-all font-semibold text-accent-strong underline">
              {sent.devUrl}
            </Link>
          </div>
        ) : null}

        <p className="text-xs leading-relaxed text-muted">
          No email after a few minutes? Check spam, or request again — and if you originally
          signed up with Google, simply use the <strong>Continue with Google</strong> button instead.
        </p>

        <Link
          href="/login"
          className="flex h-10 w-full items-center justify-center rounded-xl border border-line-strong bg-panel px-4 text-sm font-semibold text-ink2 transition hover:bg-soft"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label className="label" htmlFor="forgot-email">Email</label>
        <input
          id="forgot-email"
          type="email"
          inputMode="email"
          className="input"
          placeholder="you@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <p className="mt-1 text-[11px] text-faint">
          Signed up with Google? You can skip this — just use “Continue with Google” on the sign-in page.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={loading} className="w-full">
        Email me a reset link
      </Button>
    </form>
  );
}
