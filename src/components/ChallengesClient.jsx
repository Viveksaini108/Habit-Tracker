'use client';

import { useState } from 'react';
import { Badge, Button, EmptyState, ProgressBar } from './ui';
import {
  IconCheck, IconFlame, IconClock, IconChevronDown, IconRefresh, IconTrash, IconSparkles,
} from './icons';

const DIFFICULTY = {
  Easy: { color: '#10b981' },
  Medium: { color: '#f59e0b' },
  Hard: { color: '#ef4444' },
};

function Tips({ tips }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-accent transition hover:text-accent-strong"
      >
        <IconSparkles className="h-3.5 w-3.5" />
        Ways to improve & stick with it
        <IconChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <ul className="mt-2 space-y-1.5 rounded-xl bg-accent/10 p-3">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-ink2">
              <span className="tnum mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[9px] font-extrabold text-accent-strong">
                {i + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function ChallengesClient({ initial }) {
  const [state, setState] = useState(initial);
  const [tab, setTab] = useState(initial.active.length ? 'active' : 'discover');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const refresh = async () => {
    setError('');
    try {
      const res = await fetch('/api/challenges');
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error);
      setState(json);
    } catch (e) {
      setError(e.message || 'Could not refresh challenges');
    }
  };

  const act = async (key, fn, optimistic) => {
    setBusy(key);
    setError('');
    const prev = state;
    if (optimistic) setState(optimistic);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setState(prev);
      setError(e.message || 'Something went wrong');
    } finally {
      setBusy('');
    }
  };

  const join = (challenge) =>
    act(
      `join-${challenge.id}`,
      async () => {
        const res = await fetch(`/api/challenges/${challenge.id}/join`, { method: 'POST' });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error);
      },
      {
        ...state,
        library: state.library.map((c) => (c.id === challenge.id ? { ...c, joined: true } : c)),
        active: [
          { ...challenge, uc_id: `tmp-${challenge.id}`, elapsed: 1, progress: Math.round(100 / challenge.duration_days), daysLeft: challenge.duration_days - 1, status: 'active', started_at: 'today' },
          ...state.active,
        ],
      }
    );

  const setStatus = (uc, status) =>
    act(
      `${status}-${uc.uc_id}`,
      async () => {
        const res = await fetch(`/api/user-challenges/${uc.uc_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error);
      },
      status === 'active'
        ? state // restart: safer to just refresh
        : { ...state, active: state.active.filter((c) => c.uc_id !== uc.uc_id) }
    );

  const remove = (uc) =>
    act(`del-${uc.uc_id}`, async () => {
      const res = await fetch(`/api/user-challenges/${uc.uc_id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error);
    }, { ...state, history: state.history.filter((c) => c.uc_id !== uc.uc_id) });

  const tabs = [
    { id: 'active', label: `Active (${state.active.length})` },
    { id: 'discover', label: 'Discover' },
    { id: 'history', label: `History (${state.history.length})` },
  ];

  return (
    <div>
      <div className="mb-5 flex gap-1 rounded-xl bg-surface p-1 ring-1 ring-line w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-1.5 text-sm font-bold transition ${
              tab === t.id ? 'bg-ink text-page shadow-sm' : 'text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}

      {tab === 'active' ? (
        state.active.length === 0 ? (
          <EmptyState
            mascot="wave"
            title="No active challenges"
            body="Challenges give your habits a finish line and a story. Pick one from the Discover tab — start with something easy."
            action={
              <Button onClick={() => setTab('discover')}>Browse challenges</Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {state.active.map((c) => (
              <div key={c.uc_id} className="card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-ink">{c.title}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge color={DIFFICULTY[c.difficulty]?.color ?? '#64748b'}>{c.difficulty}</Badge>
                      <Badge color="#64748b">{c.category}</Badge>
                    </div>
                  </div>
                  <span className="tnum text-lg font-extrabold text-accent">{c.progress}%</span>
                </div>
                <ProgressBar value={c.progress} className="mt-3" />
                <p className="mt-2 flex items-center gap-1.5 text-xs text-faint">
                  <IconClock className="h-3.5 w-3.5" />
                  Day {c.elapsed} of {c.duration_days} · {c.daysLeft} to go · started {c.started_at}
                </p>
                <Tips tips={c.tips} />
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setStatus(c, 'completed')}
                    loading={busy === `completed-${c.uc_id}`}
                    disabled={String(c.uc_id).startsWith('tmp-')}
                  >
                    <IconCheck className="h-4 w-4" /> Mark complete
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted"
                    onClick={() => setStatus(c, 'abandoned')}
                    loading={busy === `abandoned-${c.uc_id}`}
                    disabled={String(c.uc_id).startsWith('tmp-')}
                  >
                    Give up
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : null}

      {tab === 'discover' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.library.map((c) => (
            <div key={c.id} className={`card flex flex-col p-5 ${c.joined ? 'ring-2 ring-emerald-200' : ''}`}>
              <div className="flex items-center justify-between">
                <Badge color={DIFFICULTY[c.difficulty]?.color ?? '#64748b'}>{c.difficulty}</Badge>
                <span className="tnum flex items-center gap-1 text-xs font-bold text-faint">
                  <IconClock className="h-3.5 w-3.5" /> {c.duration_days} days
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-ink">{c.title}</p>
              <Badge color="#94a3b8" className="mt-1.5 w-fit">{c.category}</Badge>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted">{c.description}</p>
              <Tips tips={c.tips} />
              <div className="mt-4">
                {c.joined ? (
                  <p className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2 text-sm font-bold text-emerald-600">
                    <IconFlame className="h-4 w-4" /> In progress — you’ve got this
                  </p>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => join(c)}
                    loading={busy === `join-${c.id}`}
                  >
                    Join challenge
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {tab === 'history' ? (
        state.history.length === 0 ? (
          <EmptyState
            mascot="sleep"
            title="No past challenges"
            body="Completed and given-up challenges land here, so you can see your journey and restart anytime."
          />
        ) : (
          <div className="space-y-3">
            {state.history.map((c) => (
              <div key={c.uc_id} className="card flex flex-wrap items-center gap-3 p-4">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    c.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-soft2 text-faint'
                  }`}
                >
                  {c.status === 'completed' ? '🏆' : '⏸️'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{c.title}</p>
                  <p className="text-xs capitalize text-faint">
                    {c.status} · {c.started_at} → {c.ended_at} · {c.duration_days}-day challenge
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="xs" variant="secondary" onClick={() => setStatus(c, 'active')} loading={busy === `active-${c.uc_id}`}>
                    <IconRefresh className="h-3.5 w-3.5" /> Restart
                  </Button>
                  <Button size="xs" variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => remove(c)} loading={busy === `del-${c.uc_id}`}>
                    <IconTrash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
