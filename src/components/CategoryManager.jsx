'use client';

import { useState } from 'react';
import { Modal, Button, Spinner } from './ui';
import { IconTrash, IconPencil, IconCheck, IconX, IconPlus } from './icons';
import { PALETTE } from './HabitForm';

export default function CategoryManager({ open, onClose, categories, onChanged }) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PALETTE[0]);
  const [editing, setEditing] = useState(null); // { id, name, color }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      onChanged?.();
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const add = () =>
    run(async () => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error);
      setNewName('');
    });

  const saveEdit = () =>
    run(async () => {
      const res = await fetch(`/api/categories/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editing.name.trim(), color: editing.color }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error);
      setEditing(null);
    });

  const remove = (cat) =>
    run(async () => {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error);
    });

  return (
    <Modal open={open} onClose={onClose} title="Manage categories">
      <p className="mb-4 text-sm text-muted">
        Categories group your habits and power the analytics breakdown. Deleting one keeps the habits — they become “Uncategorized”.
      </p>

      <div className="space-y-2">
        {categories.length === 0 ? (
          <p className="rounded-xl bg-soft px-3 py-4 text-center text-sm text-faint">
            No categories yet — add your first below.
          </p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-xl border border-line bg-soft/60 px-3 py-2">
              {editing?.id === c.id ? (
                <>
                  <input
                    className="input h-9 flex-1"
                    value={editing.name}
                    onChange={(e) => setEditing((ed) => ({ ...ed, name: e.target.value }))}
                    maxLength={40}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    {PALETTE.slice(0, 6).map((p) => (
                      <button
                        key={p}
                        onClick={() => setEditing((ed) => ({ ...ed, color: p }))}
                        className={`h-5 w-5 rounded-full ${editing.color === p ? 'ring-2 ring-ink2 ring-offset-1' : ''}`}
                        style={{ backgroundColor: p }}
                        aria-label={`Color ${p}`}
                      />
                    ))}
                  </div>
                  <button onClick={saveEdit} disabled={busy} className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50" aria-label="Save">
                    <IconCheck className="h-4 w-4" />
                  </button>
                  <button onClick={() => setEditing(null)} className="rounded-lg p-1.5 text-faint hover:bg-soft2" aria-label="Cancel">
                    <IconX className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="flex-1 truncate text-sm font-semibold text-ink">{c.name}</span>
                  <span className="tnum text-xs text-faint">
                    {c.habit_count} habit{c.habit_count === 1 ? '' : 's'}
                  </span>
                  <button
                    onClick={() => setEditing({ id: c.id, name: c.name, color: c.color })}
                    className="rounded-lg p-1.5 text-faint transition hover:bg-soft2 hover:text-ink2"
                    aria-label={`Edit ${c.name}`}
                  >
                    <IconPencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(c)}
                    disabled={busy}
                    className="rounded-lg p-1.5 text-faint transition hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Delete ${c.name}`}
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-line p-3">
        <label className="label" htmlFor="cm-new">Add category</label>
        <div className="flex gap-2">
          <input
            id="cm-new"
            className="input h-10 flex-1"
            placeholder="e.g. Finance"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && newName.trim().length >= 2 && !busy && add()}
            maxLength={40}
          />
          <Button size="sm" variant="soft" onClick={add} disabled={newName.trim().length < 2 || busy}>
            {busy ? <Spinner /> : <IconPlus className="h-4 w-4" />} Add
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PALETTE.map((p) => (
            <button
              key={p}
              onClick={() => setNewColor(p)}
              className={`h-6 w-6 rounded-full transition hover:scale-110 ${newColor === p ? 'ring-2 ring-ink ring-offset-2' : ''}`}
              style={{ backgroundColor: p }}
              aria-label={`Color ${p}`}
            />
          ))}
        </div>
      </div>

      {error ? <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
    </Modal>
  );
}
