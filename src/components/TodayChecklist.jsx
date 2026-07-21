'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge, EmptyState, Spinner } from './ui';
import { IconClock, IconFlame, IconPlus } from './icons';
import ConfettiBurst from './ConfettiBurst';
import { submitEntry, queuedForDate, subscribe } from '@/lib/offline';

function CheckDraw({ checked }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${checked ? 'is-checked' : ''}`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path className="check-path" d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

/** Overlay queued (not-yet-synced) check-ins onto the server snapshot. */
function withQueued(list, today) {
  const queued = queuedForDate(today);
  if (!queued.length) return list;
  const latest = new Map(); // habitId → completed (FIFO → last write wins)
  for (const op of queued) latest.set(op.habitId, op.completed);
  return list.map((h) => (latest.has(h.id) ? { ...h, done: latest.get(h.id), queued: true } : h));
}

/**
 * Today's habit checklist with optimistic toggles + offline queueing.
 * Props: initialList (habit + done + streak), today
 */
export default function TodayChecklist({ initialList, today, onNewHabit }) {
  const [items, setItems] = useState(() => withQueued(initialList, today));
  const [pending, setPending] = useState(new Set());
  const [error, setError] = useState('');

  // Fresh server snapshot (e.g. after an outbox flush → router.refresh):
  // adopt it, re-applying anything still queued on this device.
  useEffect(() => {
    setItems(withQueued(initialList, today));
  }, [initialList, today]);

  // Keep the overlay in step with outbox changes (flushes, other tabs).
  useEffect(() => subscribe(() => setItems((list) => withQueued(list, today))), [today]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const h of items) {
      const name = h.category_name || 'Uncategorized';
      if (!map.has(name)) map.set(name, { name, color: h.category_color || '#94a3b8', habits: [] });
      map.get(name).habits.push(h);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const doneCount = items.filter((h) => h.done).length;

  const toggle = async (habit) => {
    const next = !habit.done;
    setError('');
    // Optimistic update
    setItems((list) =>
      list.map((h) =>
        h.id === habit.id
          ? { ...h, done: next, streak: next ? h.streak + 1 : Math.max(0, h.streak - 1) }
          : h
      )
    );
    setPending((s) => new Set(s).add(habit.id));
    try {
      const res = await submitEntry({ habitId: habit.id, date: today, completed: next });
      if (res.status === 'synced') {
        // Reconcile streak with server truth
        setItems((list) => list.map((h) => (h.id === habit.id ? { ...h, streak: res.streak } : h)));
      } else if (res.status === 'queued') {
        // Offline: the check-in is saved on this device and will sync itself
        setItems((list) => list.map((h) => (h.id === habit.id ? { ...h, queued: true } : h)));
      } else {
        throw new Error(res.error);
      }
    } catch (e) {
      // Server rejected → rollback
      setItems((list) =>
        list.map((h) =>
          h.id === habit.id
            ? { ...h, done: !next, streak: next ? Math.max(0, h.streak - 1) : h.streak + 1 }
            : h
        )
      );
      setError(e.message || 'Could not save your check-in. Please try again.');
    } finally {
      setPending((s) => {
        const copy = new Set(s);
        copy.delete(habit.id);
        return copy;
      });
    }
  };

  if (!items.length) {
    return (
      <EmptyState
        mascot="wave"
        title="No habits scheduled for today"
        body="Create your first habit and it will appear here every day it’s active — ready to be checked off."
        action={
          <button
            onClick={onNewHabit}
            className="btn-shine inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-strong"
          >
            <IconPlus className="h-4 w-4" /> Create your first habit
          </button>
        }
      />
    );
  }

  const allDone = doneCount === items.length && items.length > 0;

  return (
    <div className="relative">
      <ConfettiBurst fire={allDone} />
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">
          <span className="tnum text-base font-extrabold text-ink">{doneCount}</span>
          <span className="tnum"> / {items.length}</span> done today
        </p>
        {allDone ? (
          <span className="animate-pop rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
            All done — amazing! 🎉
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>
      ) : null}

      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.name}>
            <div className="mb-1.5 flex items-center gap-2 px-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: g.color }} />
              <p className="text-xs font-bold uppercase tracking-wide text-faint">{g.name}</p>
            </div>
            <div className="space-y-1.5">
              {g.habits.map((h) => {
                const isPending = pending.has(h.id);
                return (
                  <div
                    key={h.id}
                    className={`group flex items-center gap-3 rounded-xl border bg-surface px-3 py-2.5 transition-all ${
                      h.done ? 'border-line-soft bg-soft/60' : 'border-line hover:border-line-strong'
                    }`}
                  >
                    <button
                      onClick={() => toggle(h)}
                      disabled={isPending}
                      aria-pressed={h.done}
                      aria-label={`Mark ${h.name} as ${h.done ? 'not done' : 'done'}`}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90 ${h.done ? 'animate-pop' : 'hover:scale-110 hover:border-accent'}`}
                      style={
                        h.done
                          ? { backgroundColor: h.color, borderColor: h.color, color: '#fff' }
                          : { borderColor: 'rgb(var(--line-strong))', color: 'transparent' }
                      }
                    >
                      {isPending ? <Spinner className="h-3.5 w-3.5" /> : <CheckDraw checked={h.done} />}
                    </button>

                    <Link href={`/habits/${h.id}`} className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-semibold transition ${
                          h.done ? 'text-faint line-through' : 'text-ink group-hover:text-accent-strong'
                        }`}
                      >
                        {h.name}
                      </p>
                      {h.target_per_week < 7 ? (
                        <p className="text-[11px] text-faint">{h.target_per_week}× per week</p>
                      ) : null}
                    </Link>

                    {h.queued ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
                        style={{ backgroundColor: '#fff7e6', color: '#d97706' }}
                        title="Saved on this device — syncs automatically when you're back online"
                      >
                        <IconClock className="h-3 w-3" />
                        queued
                      </span>
                    ) : null}

                    {h.streak > 0 ? (
                      <span
                        className="tnum inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
                        style={
                          h.streak >= 7
                            ? { backgroundColor: '#fff1e6', color: '#ea580c' }
                            : { backgroundColor: '#f1f5f9', color: '#64748b' }
                        }
                        title={`${h.streak}-day streak`}
                      >
                        <IconFlame className="h-3.5 w-3.5" />
                        {h.streak}
                      </span>
                    ) : null}

                    {h.category_name ? <Badge color={h.category_color || '#94a3b8'} className="hidden sm:inline-flex">{h.category_name}</Badge> : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
