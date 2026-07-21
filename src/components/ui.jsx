'use client';

import { useEffect } from 'react';
import { IconX } from './icons';
import Mascot from './Mascot';

export function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

const BUTTON_VARIANTS = {
  primary:
    'btn-shine bg-accent text-white shadow-sm hover:bg-accent-strong hover:-translate-y-0.5 hover:shadow-pop focus-visible:ring-accent/30 disabled:bg-accent/40 disabled:hover:translate-y-0 disabled:hover:shadow-sm',
  secondary:
    'bg-surface text-ink2 border border-line-strong/70 hover:bg-soft hover:text-ink focus-visible:ring-faint/30',
  ghost: 'text-ink2 hover:bg-soft2 hover:text-ink focus-visible:ring-faint/20',
  danger:
    'bg-rose-600 text-white shadow-sm hover:bg-rose-700 hover:-translate-y-0.5 focus-visible:ring-rose-500/30 disabled:bg-rose-300',
  soft: 'bg-accent/10 text-accent-strong hover:bg-accent/15 focus-visible:ring-accent/20',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}) {
  const sizes = {
    xs: 'h-8 px-2.5 text-xs gap-1.5 rounded-lg',
    sm: 'h-9 px-3.5 text-sm gap-2 rounded-xl',
    md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  };
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 outline-none focus-visible:ring-4 active:scale-[0.98] disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function Badge({ color = '#94a3b8', children, className = '' }) {
  const isVar = color.startsWith('rgb(');
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${className}`}
      style={{
        backgroundColor: isVar ? color.replace('rgb(', 'rgb(').replace(')', ' / 0.1)') : `${color}1a`,
        color,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

export function ProgressBar({ value, color = 'rgb(var(--accent))', className = '', height = 'h-2' }) {
  return (
    <div className={`w-full overflow-hidden rounded-full bg-soft2 ${height} ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full animate-scale-in overflow-hidden rounded-t-2xl bg-surface shadow-pop sm:rounded-2xl ${
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
          <h2 className="text-base font-bold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-faint transition hover:bg-soft hover:text-ink2"
            aria-label="Close"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, mascot, title, body, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-surface/60 px-6 py-12 text-center ${className}`}
    >
      {mascot ? (
        <Mascot mood={mascot} size={96} className="mb-3 drop-shadow-sm" />
      ) : (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-2xl">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      {body ? <p className="mt-1 max-w-sm text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

// Translucent tint behind a solid accent — works for hex and rgb(var(...)) pairs.
const tint = (color) =>
  color.startsWith('rgb(var(') ? color.replace('))', ' / 0.12))') : `${color}1a`;

export function StatCard({ icon, label, value, sub, accent = 'rgb(var(--accent))' }) {
  return (
    <div className="card group flex items-center gap-4 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pop sm:p-5">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:rotate-6 group-hover:scale-105"
        style={{ backgroundColor: tint(accent), color: accent }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-faint">{label}</p>
        <p className="tnum truncate text-xl font-extrabold text-ink">{value}</p>
        {sub ? <p className="truncate text-xs text-muted">{sub}</p> : null}
      </div>
    </div>
  );
}

export function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="flex items-center gap-1" role={readOnly ? undefined : 'radiogroup'} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={`transition ${readOnly ? 'cursor-default' : 'hover:scale-125 active:scale-95'}`}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <svg
            className={`h-5 w-5 transition-colors ${n <= value ? 'fill-amber-400 text-amber-400' : 'fill-soft2 text-soft2'}`}
            viewBox="0 0 24 24"
          >
            <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9 2.9-6z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
