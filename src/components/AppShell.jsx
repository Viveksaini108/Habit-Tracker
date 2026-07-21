'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconLogo,
  IconDashboard,
  IconHabits,
  IconChart,
  IconJournal,
  IconTrophy,
  IconLogout,
  IconMenu,
  IconX,
} from './icons';
import ThemePicker from './ThemePicker';
import Mascot from './Mascot';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { href: '/habits', label: 'Habits', icon: IconHabits },
  { href: '/analytics', label: 'Analytics', icon: IconChart },
  { href: '/reflections', label: 'Reflections', icon: IconJournal },
  { href: '/challenges', label: 'Challenges', icon: IconTrophy },
];

function SidebarContent({ user, theme, pathname, onNavigate, onLogout, loggingOut }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
        <IconLogo className="h-9 w-9 drop-shadow-[0_2px_8px_rgb(var(--accent)/0.4)]" />
        <div className="flex-1">
          <p className="text-lg font-extrabold tracking-tight text-white">HabitFlow</p>
          <p className="text-[11px] font-medium text-slate-400">Small steps, big change</p>
        </div>
        <Mascot mood="happy" size={38} className="drop-shadow" />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-accent/90 text-white shadow-[0_4px_14px_-2px_rgb(var(--accent)/0.5)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              {item.label}
              {active ? <span className="absolute -left-1 h-5 w-1 rounded-full bg-white/70" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/10 p-4">
        <ThemePicker initialTheme={theme} variant="shell" />
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent2 text-sm font-bold text-white shadow-[0_4px_12px_-2px_rgb(var(--accent)/0.55)]">
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          <button
            onClick={onLogout}
            disabled={loggingOut}
            title="Sign out"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <IconLogout className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ user, theme, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-shell lg:block">
        <SidebarContent user={user} theme={theme} pathname={pathname} onLogout={logout} loggingOut={loggingOut} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/10 bg-shell px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10"
          aria-label="Open menu"
        >
          <IconMenu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <IconLogo className="h-7 w-7" />
          <span className="text-base font-extrabold text-white">HabitFlow</span>
        </div>
      </header>

      {/* Mobile slide-over */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 animate-fade-up bg-shell shadow-pop">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <IconX className="h-5 w-5" />
            </button>
            <SidebarContent
              user={user}
              theme={theme}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              onLogout={logout}
              loggingOut={loggingOut}
            />
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
