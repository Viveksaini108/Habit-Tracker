'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import HabitCard from './HabitCard';
import HabitForm from './HabitForm';
import CategoryManager from './CategoryManager';
import { Button, EmptyState, Modal } from './ui';
import { IconPlus, IconTrash } from './icons';

export default function HabitsClient({ initialHabits, categories, today, archivedTotal }) {
  const router = useRouter();
  const [habits, setHabits] = useState(initialHabits);
  const [filter, setFilter] = useState('active'); // 'active' | 'archived' | category name
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [error, setError] = useState('');

  const filters = useMemo(() => {
    const cats = [...new Set(habits.map((h) => h.category_name || 'Uncategorized'))].sort();
    return ['active', ...cats, 'archived'];
  }, [habits]);

  const visible = useMemo(() => {
    if (filter === 'active') return habits.filter((h) => !h.archived);
    if (filter === 'archived') return habits.filter((h) => h.archived);
    return habits.filter((h) => (h.category_name || 'Uncategorized') === filter);
  }, [habits, filter]);

  const refresh = () => router.refresh();

  const archive = async (habit) => {
    const next = !habit.archived;
    const prev = habits;
    setError('');
    setHabits((list) => list.map((h) => (h.id === habit.id ? { ...h, archived: next } : h)));
    try {
      const res = await fetch(`/api/habits/${habit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error);
    } catch (e) {
      setHabits(prev);
      setError(e.message || 'Could not update the habit');
    }
  };

  const confirmDelete = async () => {
    const habit = deleting;
    if (!habit) return;
    const prev = habits;
    setBusy(true);
    setHabits((list) => list.filter((h) => h.id !== habit.id)); // optimistic
    try {
      const res = await fetch(`/api/habits/${habit.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error);
      setDeleting(null);
    } catch (e) {
      setHabits(prev);
      setError(e.message || 'Could not delete the habit');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition ${
              filter === f
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-slate-300'
            }`}
          >
            {f}
            {f === 'archived' && archivedTotal > 0 ? ` (${archivedTotal})` : ''}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setCatsOpen(true)}>
            Categories
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <IconPlus className="h-4 w-4" /> New habit
          </Button>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          icon={filter === 'archived' ? '🗄️' : '✨'}
          title={filter === 'archived' ? 'Nothing archived' : filter === 'active' ? 'No habits yet' : `No habits in “${filter}”`}
          body={
            filter === 'active'
              ? 'Start small: one habit you can do in under two minutes. You can always raise the bar later.'
              : 'Habits that match this filter will appear here.'
          }
          action={
            filter === 'active' ? (
              <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
                <IconPlus className="h-4 w-4" /> Create a habit
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              onEdit={(habit) => { setEditing(habit); setFormOpen(true); }}
              onArchive={archive}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <HabitForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={refresh}
        habit={editing}
        categories={categories}
        today={today}
      />
      <CategoryManager open={catsOpen} onClose={() => setCatsOpen(false)} categories={categories} onChanged={refresh} />

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete habit?">
        <p className="text-sm text-slate-600">
          <strong className="text-slate-900">{deleting?.name}</strong> and all of its check-ins and notes will be
          permanently removed. If you want to keep the history, archive it instead.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} loading={busy}>
            <IconTrash className="h-4 w-4" /> Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
