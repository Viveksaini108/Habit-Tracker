'use client';

import { useEffect, useRef, useState } from 'react';
import { THEMES, THEME_COOKIE, DEFAULT_THEME } from '@/lib/themes';
import { IconCheck, IconSparkles } from './icons';

function IconPalette({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="8.5" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <path d="M12 21a9 9 0 0 1 0-18c4.97 0 9 3.58 9 8 0 2.76-2.69 4-5 4h-2a2 2 0 0 0-1.5 3.31c.41.46.1 1.19-.5 1.19z" />
    </svg>
  );
}

/**
 * Theme picker — button + pop-up grid of pre-installed themes.
 * Variants: 'shell' (on the dark sidebar) | 'inline' (on light surfaces).
 */
export default function ThemePicker({ initialTheme = DEFAULT_THEME, variant = 'shell' }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(initialTheme);
  const anchorRef = useRef(null);

  useEffect(() => {
    // Trust the DOM if something else already switched the theme.
    const current = document.documentElement.dataset.theme;
    if (current && current !== theme) setTheme(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const apply = (id) => {
    setTheme(id);
    document.documentElement.dataset.theme = id;
    document.cookie = `${THEME_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(new CustomEvent('hf-theme-change', { detail: id }));
  };

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];
  const shell = variant === 'shell';

  return (
    <div className="relative" ref={anchorRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
          shell ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-ink2 bg-soft ring-1 ring-line hover:ring-line-strong'
        }`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <IconPalette className="h-[18px] w-[18px]" />
        <span className="flex-1 text-left">Theme: {current.name}</span>
        <span className="flex -space-x-1">
          {current.swatch.map((c) => (
            <span key={c} className="h-3 w-3 rounded-full ring-2 ring-slate-900/10" style={{ backgroundColor: c }} />
          ))}
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose a theme"
          className="absolute bottom-full left-0 z-50 mb-2 w-[300px] animate-fade-up rounded-2xl border border-line bg-surface p-3 shadow-pop"
        >
          <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wide text-muted">
            <IconSparkles className="h-3.5 w-3.5 text-accent" /> Pick your vibe
          </p>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => {
              const active = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => { apply(t.id); setOpen(false); }}
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
          <p className="mt-2 px-1 text-[10px] text-faint">Saved to this device — applies instantly, no reload needed.</p>
        </div>
      ) : null}
    </div>
  );
}
