'use client';

import Link from 'next/link';
import { IconLogo, IconCheck } from './icons';

const SELLING_POINTS = [
  'Daily check-ins with streaks that keep you honest',
  'Weekly & monthly analytics that reveal what works',
  'Monthly reflections to turn data into insight',
  'Challenges with practical, user-centric tips',
];

export default function AuthScreen({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-slate-950 p-10 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(40rem 24rem at 20% 10%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(36rem 22rem at 90% 90%, rgba(139,92,246,0.3), transparent 60%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <IconLogo className="h-10 w-10" />
          <span className="text-xl font-extrabold tracking-tight text-white">HabitFlow</span>
        </div>

        <div className="relative">
          <h1 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight text-white">
            Build habits that actually stick.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
            Track daily check-ins, see your streaks grow, and understand your
            progress with beautiful weekly and monthly reports.
          </p>
          <ul className="mt-8 space-y-3">
            {SELLING_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                  <IconCheck className="h-3 w-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          “We are what we repeatedly do. Excellence, then, is not an act, but a habit.”
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-slate-100 px-4 py-10">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <IconLogo className="h-9 w-9" />
            <span className="text-lg font-extrabold text-slate-900">HabitFlow</span>
          </div>
          <div className="card p-7 sm:p-8">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
          <p className="mt-5 text-center text-sm text-slate-500">{footer}</p>
        </div>
      </div>
    </div>
  );
}

export function AuthFooterLink({ text, href, linkText }) {
  return (
    <span>
      {text}{' '}
      <Link href={href} className="font-semibold text-brand-600 transition hover:text-brand-700">
        {linkText}
      </Link>
    </span>
  );
}
