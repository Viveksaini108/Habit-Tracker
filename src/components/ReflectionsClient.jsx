'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Button, EmptyState, Modal, StarRating } from './ui';
import { IconTrash, IconCheck, IconChevronDown, IconJournal } from './icons';

const monthLabels = (mk) =>
  format(new Date(Number(mk.slice(0, 4)), Number(mk.slice(5, 7)) - 1, 1), 'MMMM yyyy');

const FIELDS = [
  {
    key: 'highlights',
    label: '🌟 Highlights & wins',
    placeholder: 'What went well? Which streaks or moments are you proud of?',
  },
  {
    key: 'challenges',
    label: '🧗 Challenges faced',
    placeholder: 'Where did you struggle? What got in the way?',
  },
  {
    key: 'learnings',
    label: '🎓 Lessons learned',
    placeholder: 'What did the month teach you about how you build habits?',
  },
  {
    key: 'next_focus',
    label: '🎯 Focus for next month',
    placeholder: 'One or two concrete adjustments to try next…',
  },
];

const EMPTY = { highlights: '', challenges: '', learnings: '', next_focus: '', rating: 3 };

function ReflectionCard({ reflection, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card p-4">
      <div className="flex w-full items-center justify-between gap-3">
        <button onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 text-left" aria-expanded={open}>
          <p className="text-sm font-bold text-slate-900">{reflection.label}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Updated {reflection.updated_at?.slice(0, 10)}
          </p>
        </button>
        <div className="flex items-center gap-3">
          <StarRating value={reflection.rating} readOnly />
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            <IconChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      {open ? (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          {FIELDS.map((f) =>
            reflection[f.key] ? (
              <div key={f.key}>
                <p className="text-xs font-bold text-slate-500">{f.label}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{reflection[f.key]}</p>
              </div>
            ) : null
          )}
          <div className="flex gap-2 pt-1">
            <Button size="xs" variant="soft" onClick={() => onEdit(reflection)}>
              Edit this reflection
            </Button>
            <Button size="xs" variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => onDelete(reflection)}>
              <IconTrash className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ReflectionsClient({ initialReflections, currentMonth }) {
  const [reflections, setReflections] = useState(
    initialReflections.map((r) => ({ ...r, label: monthLabels(r.month) }))
  );
  const [month, setMonth] = useState(currentMonth);
  const [draft, setDraft] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const byMonth = useMemo(() => new Map(reflections.map((r) => [r.month, r])), [reflections]);

  const loadMonth = async (m) => {
    setMonth(m);
    setError('');
    if (byMonth.has(m)) {
      const r = byMonth.get(m);
      setDraft({ highlights: r.highlights, challenges: r.challenges, learnings: r.learnings, next_focus: r.next_focus, rating: r.rating });
      return;
    }
    // Try the server (handles edge cases) then fall back to a blank form.
    try {
      const res = await fetch(`/api/reflections/${m}`);
      const json = await res.json();
      if (json.ok && json.reflection) {
        const r = json.reflection;
        setDraft({ highlights: r.highlights, challenges: r.challenges, learnings: r.learnings, next_focus: r.next_focus, rating: r.rating });
      } else {
        setDraft(EMPTY);
      }
    } catch {
      setDraft(EMPTY);
    }
  };

  // Initial load — must run in an effect: calling setState during render
  // loops on exact re-mounts (React error #301).
  const initialLoaded = useRef(false);
  useEffect(() => {
    if (initialLoaded.current) return;
    initialLoaded.current = true;
    loadMonth(currentMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = (p) => setDraft((d) => ({ ...d, ...p }));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/reflections/${month}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error);
      const r = { ...json.reflection, label: monthLabels(json.reflection.month) };
      setReflections((list) => {
        const others = list.filter((x) => x.month !== r.month);
        return [r, ...others].sort((a, b) => (a.month < b.month ? 1 : -1));
      });
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 2200);
    } catch (e) {
      setError(e.message || 'Could not save the reflection');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const m = deleting.month;
    const prev = reflections;
    setReflections((list) => list.filter((x) => x.month !== m));
    setDeleting(null);
    try {
      const res = await fetch(`/api/reflections/${m}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error);
      if (m === month) setDraft(EMPTY);
    } catch (e) {
      setReflections(prev);
      setError(e.message || 'Could not delete the reflection');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      {/* Editor */}
      <div className="card h-fit p-5 lg:col-span-3">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly reflection</h3>
            <p className="text-xs text-slate-400">Two honest minutes a month will teach you more than any chart.</p>
          </div>
          <input
            type="month"
            className="input h-9 w-[160px] py-1"
            value={month}
            max={currentMonth}
            onChange={(e) => e.target.value && loadMonth(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="label normal-case">{f.label}</label>
              <textarea
                className="input min-h-[84px] resize-y"
                placeholder={f.placeholder}
                value={draft[f.key]}
                onChange={(e) => patch({ [f.key]: e.target.value })}
                maxLength={2000}
              />
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">How was the month overall?</p>
              <StarRating value={draft.rating} onChange={(n) => patch({ rating: n })} />
            </div>
            <Button onClick={save} loading={saving}>
              {byMonth.has(month) ? 'Update reflection' : 'Save reflection'}
            </Button>
          </div>

          {savedTick ? (
            <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              <IconCheck className="h-4 w-4" /> Saved — see you next month.
            </p>
          ) : null}
          {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
        </div>
      </div>

      {/* Past reflections */}
      <div className="lg:col-span-2">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
          <IconJournal className="h-4 w-4 text-brand-500" /> Past reflections
        </h3>
        {reflections.length === 0 ? (
          <EmptyState
            icon="📔"
            title="No reflections yet"
            body="Write your first monthly reflection on the left — it only takes a couple of minutes and future-you will thank you."
          />
        ) : (
          <div className="space-y-3">
            {reflections.map((r) => (
              <ReflectionCard
                key={r.month}
                reflection={r}
                onEdit={(ref) => loadMonth(ref.month)}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete reflection?">
        <p className="text-sm text-slate-600">
          Your reflection for <strong className="text-slate-900">{deleting?.label}</strong> will be permanently removed.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>
            <IconTrash className="h-4 w-4" /> Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
