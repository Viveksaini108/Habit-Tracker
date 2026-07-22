'use client';

/**
 * Offline outbox — the heart of HabitFlow's offline mode.
 *
 * When the network drops, check-ins are written to a small local queue on the
 * device (localStorage — works in the browser and inside the Capacitor apps).
 * Each queued operation is the *absolute state* of a check-in
 * ({ habitId, date, completed }), which matches the server API's upsert
 * semantics, so replaying the queue in FIFO order is idempotent and cannot
 * double-apply. As soon as connectivity returns the queue flushes to the
 * online database automatically, then the UI refreshes from the server truth.
 * The server always remains the source of truth.
 */

const KEY = 'hf-outbox-v1';
const FLUSH_INTERVAL_MS = 30_000;

const subscribers = new Set();
let flushing = false;
let loopStarted = false;

/* ------------------------------- storage -------------------------------- */

export function getQueue() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(queue));
  } catch {
    /* storage full / private mode — keep the in-memory behaviour correct */
  }
  emit();
}

export function pendingCount() {
  return getQueue().length;
}

/* ------------------------------ pub / sub ------------------------------- */

function emit() {
  const n = pendingCount();
  subscribers.forEach((fn) => {
    try {
      fn(n);
    } catch {
      /* ignore subscriber errors */
    }
  });
}

/** Subscribe to pending-count changes: subscribe(fn) → unsubscribe. */
export function subscribe(fn) {
  subscribers.add(fn);
  fn(pendingCount());
  return () => subscribers.delete(fn);
}

/* ------------------------------- queueing ------------------------------- */

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function enqueueEntry({ habitId, date, completed, note = '' }) {
  writeQueue([
    ...getQueue(),
    { id: newId(), kind: 'entry', habitId, date, completed: !!completed, note, ts: Date.now() },
  ]);
  startSyncLoop();
}

/** Queued check-ins for one date, oldest first (used to overlay server snapshots). */
export function queuedForDate(date) {
  return getQueue().filter((op) => op.kind === 'entry' && op.date === date);
}

/** Queued check-ins for one habit, oldest first (used by the backfill grid). */
export function queuedForHabit(habitId) {
  return getQueue().filter((op) => op.kind === 'entry' && op.habitId === habitId);
}

/* ------------------------------ submitting ------------------------------ */

/**
 * Submit a check-in.
 *  - online        → straight to the server: { status: 'synced', ...server payload }
 *  - server rejects → { status: 'error', error } (caller rolls back the UI)
 *  - offline / network failure → queued on-device: { status: 'queued' }
 */
export async function submitEntry({ habitId, date, completed, note = '' }) {
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (!offline) {
    try {
      const res = await fetch(`/api/habits/${habitId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, completed, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) return { status: 'synced', ...data };
      return { status: 'error', error: data.error || 'Could not save your check-in. Please try again.' };
    } catch {
      /* network dropped mid-flight → fall through to the outbox */
    }
  }
  enqueueEntry({ habitId, date, completed, note });
  return { status: 'queued' };
}

/* ------------------------------- syncing -------------------------------- */

/**
 * Replay the outbox to the server, oldest first. Stops at the first network
 * failure (still offline). Server rejections are dropped so one bad op can
 * never deadlock the queue (the server remains the source of truth).
 * Fires the 'hf-synced' window event when anything was flushed.
 */
export async function flushQueue() {
  if (flushing) return { synced: 0 };
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { synced: 0 };
  flushing = true;
  let synced = 0;
  try {
    for (;;) {
      const [op] = getQueue();
      if (!op) break;
      try {
        const res = await fetch(`/api/habits/${op.habitId}/entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: op.date, completed: op.completed, note: op.note ?? '' }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          console.warn('[habitflow] offline op dropped — rejected by server:', data.error || res.status);
        }
        writeQueue(getQueue().slice(1));
        synced += 1;
      } catch {
        break; // network still down — retry on the next loop tick
      }
    }
  } finally {
    flushing = false;
    emit();
  }
  if (synced > 0 && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hf-synced', { detail: { synced } }));
  }
  return { synced };
}

/** Idempotent wiring: flush on reconnect + a periodic safety-net retry. */
export function startSyncLoop() {
  if (loopStarted || typeof window === 'undefined') return;
  loopStarted = true;
  window.addEventListener('online', () => {
    flushQueue();
  });
  window.setInterval(() => {
    if (navigator.onLine) flushQueue();
  }, FLUSH_INTERVAL_MS);
}

/* ------------------------------ hygiene --------------------------------- */

/** Best-effort cleanup on sign-out: cached pages hold user data. The outbox is
 *  flushed first; anything that could not be sent stays queued so it can sync
 *  on the next sign-in rather than being lost. */
export async function clearOfflineCaches() {
  try {
    await flushQueue();
  } catch {
    /* offline sign-out — nothing we can flush right now */
  }
  try {
    if ('caches' in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((k) => window.caches.delete(k)));
    }
  } catch {
    /* ignore */
  }
}
