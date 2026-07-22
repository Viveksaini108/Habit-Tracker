'use client';

import { useEffect, useRef, useState } from 'react';
import { subscribe, flushQueue, startSyncLoop } from '@/lib/offline';
import { Spinner } from './ui';
import { IconCheck } from './icons';

/**
 * Floating status pill for offline mode:
 *   offline            → "You're offline — check-ins save on this device and sync automatically"
 *   online + pending   → "Back online — syncing N change(s)…"
 *   flush finished     → brief "All changes synced" confirmation
 *   online + no queue  → hidden
 */
export default function OfflineSyncBar() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [doneFlash, setDoneFlash] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    startSyncLoop();
    setOnline(navigator.onLine);
    const unsub = subscribe((n) => setPending(n));

    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    mounted.current = true;
    return () => {
      unsub();
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      mounted.current = false;
    };
  }, []);

  // Sync as soon as we're back online with queued changes.
  useEffect(() => {
    if (!online || pending === 0) return;
    let cancelled = false;
    setSyncing(true);
    flushQueue().then(({ synced }) => {
      if (cancelled) return;
      setSyncing(false);
      if (synced > 0) {
        setDoneFlash((c) => c + 1);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [online, pending]);

  // Auto-hide the "synced" flash.
  useEffect(() => {
    if (!doneFlash) return undefined;
    const t = setTimeout(() => setDoneFlash(0), 3000);
    return () => clearTimeout(t);
  }, [doneFlash]);

  const visible = !online || pending > 0 || syncing || doneFlash > 0;
  if (!visible) return null;

  let dot = '#fbbf24'; // amber — offline
  let text = 'You’re offline — check-ins save on this device and sync automatically';
  if (online && (syncing || pending > 0)) {
    dot = null; // spinner instead
    text = `Back online — syncing ${pending} change${pending === 1 ? '' : 's'}…`;
  } else if (online && doneFlash) {
    dot = '#34d399'; // green — done
    text = 'All changes synced';
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2.5 shadow-[0_8px_30px_-6px_rgb(var(--shadow-clr)/0.5)] animate-fade-up"
      >
        {dot ? (
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full" style={{ backgroundColor: dot }} />
        ) : (
          <Spinner className="h-3.5 w-3.5 shrink-0 text-accent" />
        )}
        <p className="truncate text-xs font-semibold text-ink">{text}</p>
        {doneFlash && !syncing && pending === 0 ? <IconCheck className="h-3.5 w-3.5 shrink-0 text-[#34d399]" /> : null}
      </div>
    </div>
  );
}
