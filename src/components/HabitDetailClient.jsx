'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseISO, startOfWeek, addDays, format } from 'date-fns';
import HabitForm from './HabitForm';
import { Badge, Button, Modal, ProgressBar, Spinner } from './ui';
import {
  IconCheck, IconFlame, IconPencil, IconTrash, IconArchive, IconRefresh, IconCalendar, IconTarget,
} from './icons';

const toKey = (d) => format(d, 'yyyy-MM-dd');
const inWindow = (h, key) => h.start_date <= key && (!h.end_date || key <= h.end_date);

/* ---------------------------------- heatmap ---------------------------------- */
export function HabitHeatmap({ habit, entries, today }) {
  const { weeks, future } = useMemo(() => {
    const monday = startOfWeek(parseISO(today), { weekStartsOn: 1 });
    const out = [];
    for (let w = 23; w >= 0; w -= 1) {
      const start = addDays(monday, -7 * w);
      out.push(Array.from({ length: 7 }, (_, i) => toKey(addDays(start, i))));
    }
    return { weeks: out, future: (k) => k > today };
  }, [today]);

  const entrySet = useMemo(() => new Set(entries), [entries]);

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[560px] gap-[3px]">
        <div className="mr-1 flex flex-col justify-between py-0.5 text-[9px] font-semibold uppercase text-slate-400">
          {['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((d, i) => (
            <span key={i} className="flex h-[13px] items-center">{d}</span>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={week[0]} className="flex flex-col gap-[3px]">
            {week.map((key) => {
              const active = inWindow(habit, key);
              const done = entrySet.has(key) && active;
              const isFuture = future(key);
              return (
                <span
                  key={key}
                  title={`${format(parseISO(key), 'EEE, MMM d')} — ${!active ? 'not scheduled' : done ? 'done ✓' : isFuture ? 'upcoming' : 'missed'}`}
                  className="h-[13px] w-[13px] rounded-[3px] transition hover:ring-1 hover:ring-slate-400"
                  style={{
                    backgroundColor: !active || isFuture ? '#f1f5f9' : done ? habit.color : '#e2e8f0',
                    opacity: !active && !done ? 0.55 : 1,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] font-medium text-slate-400">
        Less
        <span className="h-[10px] w-[10px] rounded-[3px] bg-slate-100" />
        <span className="h-[10px] w-[10px] rounded-[3px]" style={{ backgroundColor: `${habit.color}66` }} />
        <span className="h-[10px] w-[10px] rounded-[3px]" style={{ backgroundColor: habit.color }} />
        More
      </div>
    </div>
  );
}

/* ------------------------------ quick check range ----------------------------- */
function QuickCheck({ habit, initialEntries, today }) {
  const [entrySet, setEntrySet] = useState(() => new Set(initialEntries));
  const [pending, setPending] = useState('');
  const days = useMemo(
    () => Array.from({ length: 14 }, (_, i) => toKey(addDays(parseISO(today), -(13 - i)))),
    [today]
  );

  const toggle = async (key) => {
    const next = !entrySet.has(key);
    setPending(key);
    setEntrySet((s) => {
      const copy = new Set(s);
      if (next) copy.add(key);
      else copy.delete(key);
      return copy;
    });
    try {
      const res = await fetch(`/api/habits/${habit.id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: key, completed: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error);
    } catch {
      setEntrySet((s) => {
        const copy = new Set(s);
        if (next) copy.delete(key);
        else copy.add(key);
        return copy;
      });
    } finally {
      setPending('');
    }
  };

  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {days.map((key) => {
        const active = inWindow(habit, key);
        const done = entrySet.has(key) && active;
        const disabled = !active || pending === key;
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            disabled={disabled}
            title={!active ? 'Not in the habit’s active window' : key}
            className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-center transition-all ${
              done
                ? 'border-transparent text-white'
                : active
                  ? 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
            }`}
            style={done ? { backgroundColor: habit.color } : undefined}
          >
            <span className="text-[9px] font-bold uppercase">{format(parseISO(key), 'EEE')}</span>
            <span className="tnum text-xs font-extrabold">{Number(key.slice(8, 10))}</span>
            <span className="flex h-3.5 w-3.5 items-center justify-center">
              {pending === key ? <Spinner className="h-3 w-3" /> : done ? <IconCheck className="h-3.5 w-3.5" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------ notes ----------------------------------- */
function NotesSection({ habit, initialNotes }) {
  const [notes, setNotes] = useState(initialNotes);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const add = async () => {
    const body = draft.trim();
    if (!body) return;
    setSaving(true);
    setError('');
    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      body,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      pending: true,
    };
    setNotes((n) => [optimistic, ...n]);
    setDraft('');
    try {
      const res = await fetch(`/api/habits/${habit.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error);
      setNotes((n) => n.map((x) => (x.id === tempId ? { ...data.note } : x)));
    } catch (e) {
      setNotes((n) => n.filter((x) => x.id !== tempId));
      setDraft(body);
      setError(e.message || 'Could not save the note');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (note) => {
    const prev = notes;
    setNotes((n) => n.filter((x) => x.id !== note.id));
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error);
    } catch (e) {
      setNotes(prev);
      setError(e.message || 'Could not delete the note');
    }
  };

  return (
    <div>
      <div className="mb-3">
        <textarea
          className="input min-h-[72px] resize-y"
          placeholder={`How is “${habit.name}” going? Wins, obstacles, adjustments…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="tnum text-[11px] text-slate-400">{draft.length}/500</span>
          <Button size="sm" onClick={add} loading={saving} disabled={!draft.trim()}>
            Add note
          </Button>
        </div>
      </div>

      {error ? <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}

      {notes.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
          No progress notes yet — they’re gold when you review the month.
        </p>
      ) : (
        <div className="space-y-2.5">
          {notes.map((n) => (
            <div key={n.id} className={`group rounded-xl border border-slate-100 bg-slate-50/50 p-3 ${n.pending ? 'opacity-60' : ''}`}>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{n.body}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{n.created_at?.slice(0, 16) ?? ''}</span>
                <button
                  onClick={() => remove(n)}
                  className="rounded-lg p-1 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500"
                  aria-label="Delete note"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------- main client -------------------------------- */
export default function HabitDetailClient({ habit, entries, notes, categories, today }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const s = habit.stats;

  const archive = async () => {
    await fetch(`/api/habits/${habit.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: !habit.archived }),
    });
    router.refresh();
  };

  const destroy = async () => {
    setBusy(true);
    try {
      await fetch(`/api/habits/${habit.id}`, { method: 'DELETE' });
      router.push('/habits');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const dateRange = habit.end_date
    ? `${habit.start_date} → ${habit.end_date}`
    : `Since ${habit.start_date} · ongoing`;

  return (
    <div>
      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: habit.color }} />
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">{habit.name}</h1>
              {habit.category_name ? <Badge color={habit.category_color || '#94a3b8'}>{habit.category_name}</Badge> : null}
              {habit.archived ? <Badge color="#64748b">Archived</Badge> : null}
            </div>
            {habit.description ? <p className="mt-2 max-w-xl text-sm text-slate-500">{habit.description}</p> : null}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
              <span className="inline-flex items-center gap-1.5"><IconCalendar className="h-3.5 w-3.5" /> {dateRange}</span>
              <span className="inline-flex items-center gap-1.5"><IconTarget className="h-3.5 w-3.5" /> {habit.target_per_week}× per week</span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <IconPencil className="h-4 w-4" /> Edit
            </Button>
            <Button variant="secondary" size="sm" onClick={archive}>
              {habit.archived ? <IconRefresh className="h-4 w-4" /> : <IconArchive className="h-4 w-4" />}
              {habit.archived ? 'Restore' : 'Archive'}
            </Button>
            <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50" onClick={() => setDeleteOpen(true)}>
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Current streak', value: `${s.streak}d`, icon: <IconFlame className="h-4 w-4" /> },
            { label: 'Best streak', value: `${s.best}d`, icon: <IconTarget className="h-4 w-4" /> },
            { label: 'Total check-ins', value: s.total, icon: <IconCheck className="h-4 w-4" /> },
            { label: 'Completion', value: `${Math.round((s.overallRate ?? 0) * 100)}%`, icon: <IconCalendar className="h-4 w-4" /> },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-slate-50 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <span className="text-brand-500">{stat.icon}</span>
                {stat.label}
              </p>
              <p className="tnum mt-1 text-lg font-extrabold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <ProgressBar value={Math.round(s.weekRate * 100)} color={habit.color} className="flex-1" />
          <span className="tnum text-xs font-bold text-slate-500">{Math.round(s.weekRate * 100)}% this week</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-900">Last 6 months</h3>
            <HabitHeatmap habit={habit} entries={entries} today={today} />
          </div>
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-900">Quick check-in — last 14 days</h3>
            <QuickCheck habit={habit} initialEntries={entries} today={today} />
            <p className="mt-3 text-[11px] text-slate-400">
              Missed a day? Tap to backfill it — honest history keeps the analytics useful.
            </p>
          </div>
        </div>
        <div className="card h-fit p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Progress notes</h3>
          <NotesSection habit={habit} initialNotes={notes} />
        </div>
      </div>

      <HabitForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => router.refresh()}
        habit={habit}
        categories={categories}
        today={today}
      />

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete habit?">
        <p className="text-sm text-slate-600">
          <strong className="text-slate-900">{habit.name}</strong> and all its check-ins and notes will be permanently
          removed. Archive it instead to keep the history.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={destroy} loading={busy}>
            <IconTrash className="h-4 w-4" /> Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
