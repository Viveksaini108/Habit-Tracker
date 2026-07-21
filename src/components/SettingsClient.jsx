'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { THEMES, THEME_COOKIE } from '@/lib/themes';
import { Button, Spinner } from './ui';
import {
  IconUser, IconCheck, IconLogout, IconSparkles, IconChevronRight, IconJournal,
} from './icons';

function IconDownload({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function Section({ icon, title, subtitle, children }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">{icon}</span>
        <div>
          <h3 className="text-sm font-bold text-ink">{title}</h3>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ProfileSection({ user }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (name.trim() === user.name) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section icon={<IconUser className="h-5 w-5" />} title="Profile" subtitle="How you appear inside HabitFlow.">
      <form onSubmit={save} className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent2 text-xl font-extrabold text-white shadow-[0_6px_16px_-4px_rgb(var(--accent)/0.55)]">
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{user.email}</p>
            <p className="text-xs text-faint">Member since {user.created_at?.slice(0, 10)}</p>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="st-name">Display name</label>
          <input
            id="st-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="st-email">Email</label>
          <input id="st-email" className="input" value={user.email} disabled />
          <p className="mt-1 text-[11px] text-faint">Email is your sign-in identifier and can’t be changed.</p>
        </div>
        {error ? <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-600">{error}</p> : null}
        <div className="flex items-center justify-end gap-2">
          {saved ? (
            <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
              <IconCheck className="h-4 w-4" /> Saved
            </span>
          ) : null}
          <Button type="submit" size="sm" loading={saving} disabled={name.trim().length < 2 || name.trim() === user.name}>
            Save changes
          </Button>
        </div>
      </form>
    </Section>
  );
}

function AppearanceSection({ initialTheme }) {
  const [theme, setTheme] = useState(initialTheme);
  const apply = (id) => {
    setTheme(id);
    document.documentElement.dataset.theme = id;
    document.cookie = `${THEME_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(new CustomEvent('hf-theme-change', { detail: id }));
  };

  return (
    <Section icon={<IconSparkles className="h-5 w-5" />} title="Appearance" subtitle="Pick a theme — applies instantly across the app.">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {THEMES.map((t) => {
          const active = t.id === theme;
          return (
            <button
              key={t.id}
              onClick={() => apply(t.id)}
              className={`group rounded-xl border p-2.5 text-left transition hover:-translate-y-0.5 ${
                active ? 'border-accent ring-2 ring-accent/30' : 'border-line hover:border-line-strong'
              }`}
            >
              <span
                className="mb-2 flex h-9 items-end gap-1 rounded-lg p-1"
                style={{ backgroundColor: t.swatch[0], border: '1px solid rgb(var(--line))' }}
              >
                <span className="h-5 w-5 rounded-md shadow-sm" style={{ backgroundColor: t.swatch[1] }} />
                <span className="h-5 w-5 rounded-full" style={{ backgroundColor: t.swatch[2] }} />
              </span>
              <span className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">{t.name}</span>
                {active ? <IconCheck className="h-3.5 w-3.5 text-accent" /> : null}
              </span>
              <span className="block text-[10px] text-faint">{t.description}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

function DataSection() {
  const [downloading, setDownloading] = useState(false);
  const exportData = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habitflow-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Section icon={<IconJournal className="h-5 w-5" />} title="Your data" subtitle="You own your data — take it with you anytime.">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line-soft bg-soft/60 p-4">
        <div>
          <p className="text-sm font-semibold text-ink2">Export everything</p>
          <p className="text-xs text-muted">Habits, check-ins, notes, reflections & challenges as JSON.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={exportData} loading={downloading}>
          <IconDownload className="h-4 w-4" /> Export JSON
        </Button>
      </div>
    </Section>
  );
}

function AccountSection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section icon={<IconLogout className="h-5 w-5" />} title="Account" subtitle="Session & sign-in options.">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line-soft bg-soft/60 p-4">
        <div>
          <p className="text-sm font-semibold text-ink2">Sign out of HabitFlow</p>
          <p className="text-xs text-muted">Your data stays safely on this server.</p>
        </div>
        <Button variant="danger" size="sm" onClick={logout} loading={loading}>
          <IconLogout className="h-4 w-4" /> Sign out
        </Button>
      </div>
      <p className="mt-4 flex items-center justify-between rounded-xl bg-accent/5 px-4 py-3 text-xs text-muted">
        <span className="inline-flex items-center gap-2 font-semibold text-ink2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent2 text-[10px] font-extrabold text-white">HF</span>
          HabitFlow
        </span>
        <span className="inline-flex items-center gap-1">
          v1.0.0 · Web + Android + iOS <IconChevronRight className="h-3 w-3" />
        </span>
      </p>
    </Section>
  );
}

export default function SettingsClient({ user, theme }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <ProfileSection user={user} />
        <DataSection />
      </div>
      <div className="space-y-4">
        <AppearanceSection initialTheme={theme} />
        <AccountSection />
      </div>
    </div>
  );
}

