'use client';

import { useEffect } from 'react';
import { startSyncLoop } from '@/lib/offline';

/**
 * Registers the offline service worker (once, silently) and starts the
 * outbox auto-sync loop. Degrades gracefully where service workers are
 * unavailable (plain-http LAN testing, very old WebViews).
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    startSyncLoop();
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[habitflow] service worker registration failed — offline shell disabled:', err);
    });
  }, []);

  return null;
}
