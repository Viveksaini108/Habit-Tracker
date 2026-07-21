'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge, ProgressBar } from './ui';
import { IconFlame, IconPencil, IconTrash, IconArchive, IconRefresh } from './icons';

function SevenDots({ last7, color }) {
  return (
    <div className="flex gap-1">
      {last7.map((d) => (
        <span
          key={d.key}
          title={`${d.key} — ${d.done ? 'done' : d.active ? 'missed' : 'inactive'}`}
          className="h-2.5 w-2.5 rounded-full transition"
          style={{
            backgroundColor: d.done ? color : d.active ? '#e2e8f0' : '#f1f5f9',
            outline: d.done ? 'none' : d.active ? '1px solid #e2e8f0' : '1px dashed #e2e8f0',
          }}
        />
      ))}
    </div>
  );
}

export default function HabitCard({ habit, onEdit, onArchive, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const s = habit.stats;

  return (
    <div className={`card group relative flex flex-col p-4 transition hover:shadow-pop ${habit.archived ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <Link href={`/habits/${habit.id}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: habit.color }} />
            <p className="truncate text-sm font-bold text-slate-900 transition group-hover:text-brand-700">
              {habit.name}
            </p>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {habit.category_name ? (
              <Badge color={habit.category_color || '#94a3b8'}>{habit.category_name}</Badge>
            ) : (
              <Badge color="#94a3b8">Uncategorized</Badge>
            )}
            {habit.archived ? <Badge color="#64748b">Archived</Badge> : null}
            {s.streak >= 3 && !habit.archived ? (
              <span className="tnum inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-600">
                <IconFlame className="h-3 w-3" /> {s.streak}
              </span>
            ) : null}
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Habit actions"
          >
            <IconPencil className="h-4 w-4" />
          </button>
          {menuOpen ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-40 animate-scale-in overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-pop">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(habit); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <IconPencil className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onArchive(habit); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {habit.archived ? <IconRefresh className="h-4 w-4" /> : <IconArchive className="h-4 w-4" />}
                  {habit.archived ? 'Restore' : 'Archive'}
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(habit); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <IconTrash className="h-4 w-4" /> Delete
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <Link href={`/habits/${habit.id}`} className="mt-3 flex-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Last 7 days</span>
          <SevenDots last7={s.last7} color={habit.color} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <ProgressBar value={Math.round(s.weekRate * 100)} color={habit.color} className="flex-1" />
          <span className="tnum text-xs font-bold text-slate-600">{Math.round(s.weekRate * 100)}%</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>this week ({habit.target_per_week}× target)</span>
          <span className="tnum">{s.total} total check-ins</span>
        </div>
      </Link>
    </div>
  );
}
