'use client';

import { useEffect } from 'react';
import { IconX } from './icons';

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
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-500/30 disabled:bg-brand-300',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-slate-400/20',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400/20',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500/30 disabled:bg-rose-300',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-500/20',
};

const BUTTON_SIZES = {
  xs: 'h-8 px-2.5 text-xs gap-1.5 rounded-lg',
  sm: 'h-9 px-3.5 text-sm gap-2 rounded-xl',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
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
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all outline-none focus-visible:ring-4 active:scale-[0.98] disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function Badge({ color = '#6366f1', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

export function ProgressBar({ value, color = '#6366f1', className = '', height = 'h-2' }) {
  return (
    <div className={`w-full overflow-hidden rounded-full bg-slate-100 ${height} ${className}`}>
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
        className={`relative w-full animate-scale-in overflow-hidden rounded-t-2xl bg-white shadow-pop sm:rounded-2xl ${
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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

export function EmptyState({ icon, title, body, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center ${className}`}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      {body ? <p className="mt-1 max-w-sm text-sm text-slate-500">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />;
}

export function StatCard({ icon, label, value, sub, accent = '#6366f1' }) {
  return (
    <div className="card flex items-center gap-4 p-4 sm:p-5">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="tnum truncate text-xl font-extrabold text-slate-900">{value}</p>
        {sub ? <p className="truncate text-xs text-slate-500">{sub}</p> : null}
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
          className={`transition ${readOnly ? 'cursor-default' : 'hover:scale-110'}`}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <svg
            className={`h-5 w-5 ${n <= value ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
            viewBox="0 0 24 24"
          >
            <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9 2.9-6z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
