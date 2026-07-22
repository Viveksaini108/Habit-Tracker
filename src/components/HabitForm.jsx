'use client';

import { useEffect, useState } from 'react';
import { Modal, Button } from './ui';

export const PALETTE = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#14b8a6',
  '#0ea5e9',
  '#64748b',
];

const EMPTY = {
  name: '',
  description: '',
  category_id: '',
  color: '#6366f1',
  target_per_week: 7,
  start_date: '',
  end_date: '',
};

/**
 * Create/edit habit modal.
 * Props: open, onClose, onSaved, habit (null = create), categories, today
 */
export default function HabitForm({ open, onClose, onSaved, habit, categories, today }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [newCat, setNewCat] = useState(null); // { name, color } while creating inline
  const [localCats, setLocalCats] = useState(categories ?? []);

  useEffect(() => setLocalCats(categories ?? []), [categories]);

  useEffect(() => {
    if (!open) return;
    setError('');
    setNewCat(null);
    setForm(
      habit
        ? {
            name: habit.name,
            description: habit.description ?? '',
            category_id: habit.category_id ?? '',
            color: habit.color,
            target_per_week: habit.target_per_week,
            start_date: habit.start_date,
            end_date: habit.end_date ?? '',
          }
        : { ...EMPTY, start_date: today }
    );
  }, [open, habit, today]);

  const patch = (p) => setForm((f) => ({ ...f, ...p }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    let categoryId = form.category_id === '' ? null : Number(form.category_id);

    // Inline "new category" creation
    if (form.category_id === '__new__') {
      if (!newCat?.name || newCat.name.trim().length < 2) {
        setError('Give your new category a name (min 2 characters)');
        return;
      }
      setSaving(true);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCat.name.trim(), color: newCat.color }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSaving(false);
        setError(data.error || 'Could not create the category');
        return;
      }
      categoryId = data.id;
      setLocalCats((cats) => [...cats, { id: data.id, name: newCat.name.trim(), color: newCat.color }]);
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        category_id: categoryId,
        color: form.color,
        target_per_week: form.target_per_week,
        start_date: form.start_date,
        end_date: form.end_date || null,
      };
      const res = await fetch(habit ? `/api/habits/${habit.id}` : '/api/habits', {
        method: habit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      onSaved?.();
      onClose?.();
    } catch {
      setError('Network error — please try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={habit ? 'Edit habit' : 'New habit'}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="hf-name">Name</label>
          <input
            id="hf-name"
            className="input"
            placeholder="e.g. Read 20 pages"
            value={form.name}
            onChange={(e) => patch({ name: e.target.value })}
            maxLength={100}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="label" htmlFor="hf-desc">
            Description <span className="font-normal normal-case text-faint">(optional)</span>
          </label>
          <textarea
            id="hf-desc"
            className="input min-h-[68px] resize-y"
            placeholder="Why this habit matters to you…"
            value={form.description}
            onChange={(e) => patch({ description: e.target.value })}
            maxLength={400}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="hf-cat">Category</label>
            <select
              id="hf-cat"
              className="input"
              value={form.category_id}
              onChange={(e) => patch({ category_id: e.target.value })}
            >
              <option value="">Uncategorized</option>
              {localCats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="__new__">＋ New category…</option>
            </select>
          </div>
          <div>
            <label className="label">Weekly target</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => patch({ target_per_week: n })}
                  className={`tnum h-9 flex-1 rounded-lg text-sm font-bold transition ${
                    form.target_per_week === n
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-soft2 text-muted hover:bg-soft2'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-faint">times per week</p>
          </div>
        </div>

        {form.category_id === '__new__' ? (
          <div className="animate-fade-up rounded-xl border border-accent/20 bg-accent/10 p-3">
            <label className="label" htmlFor="hf-newcat">New category name</label>
            <div className="flex items-center gap-2">
              <input
                id="hf-newcat"
                className="input"
                placeholder="e.g. Finance"
                value={newCat?.name ?? ''}
                onChange={(e) => setNewCat((c) => ({ color: '#6366f1', ...c, name: e.target.value }))}
                maxLength={40}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PALETTE.slice(0, 8).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Category color ${c}`}
                  onClick={() => setNewCat((nc) => ({ name: '', ...nc, color: c }))}
                  className={`h-6 w-6 rounded-full transition ${newCat?.color === c ? 'ring-2 ring-ink ring-offset-2' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <label className="label">Color</label>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                onClick={() => patch({ color: c })}
                className={`h-8 w-8 rounded-full transition hover:scale-110 ${form.color === c ? 'ring-2 ring-ink ring-offset-2' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="hf-start">Start date</label>
            <input
              id="hf-start"
              type="date"
              className="input"
              value={form.start_date}
              onChange={(e) => patch({ start_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="hf-end">
              End date <span className="font-normal normal-case text-faint">(optional)</span>
            </label>
            <input
              id="hf-end"
              type="date"
              className="input"
              min={form.start_date}
              value={form.end_date}
              onChange={(e) => patch({ end_date: e.target.value })}
            />
          </div>
        </div>

        {error ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {habit ? 'Save changes' : 'Create habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
