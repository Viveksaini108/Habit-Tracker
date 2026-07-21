/* HabitFlow service worker — makes the app openable & readable offline.
 *
 * Caching strategy
 * ────────────────
 *   /_next/static/*     cache-first   (content-hashed, immutable)
 *   page navigations    network-first → cached copy when offline → fallback page
 *   GET /api/*          network-first → cached copy when offline (read-only data)
 *   non-GET requests    untouched     → network errors surface to the app, which
 *                                       queues the change in the on-device outbox
 *                                       (src/lib/offline.js) and replays it later.
 *
 * Note: service workers require a secure context (https or localhost). When the
 * app is served over plain http on a LAN IP, registration is skipped gracefully
 * and the app stays online-only but fully functional.
 */

const VERSION = 'hf-v1';
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const API_CACHE = `${VERSION}-api`;
const LIVE_CACHES = [STATIC_CACHE, PAGE_CACHE, API_CACHE];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !LIVE_CACHES.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function cacheFirst(cacheName, request) {
  return caches.match(request).then(
    (hit) =>
      hit ||
      fetch(request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(cacheName).then((cache) => cache.put(request, clone));
        }
        return res;
      })
  );
}

function networkFirst(cacheName, request) {
  return fetch(request)
    .then((res) => {
      // Never cache redirects (auth bounces) or cross-origin content.
      if (res.ok && res.type === 'basic') {
        const clone = res.clone();
        caches.open(cacheName).then((cache) => cache.put(request, clone));
      }
      return res;
    })
    .catch(() =>
      caches.match(request).then((hit) => {
        if (hit) return hit;
        if (request.mode === 'navigate') return offlineFallback(request.url);
        return new Response(JSON.stringify({ ok: false, error: 'You are offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
}

/** Branded page shown when a screen was never cached and the server is unreachable. */
function offlineFallback(url) {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>HabitFlow · Offline</title>
    <style>
      body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
             background: #101226; color: #e2e8f0; padding: 24px;
             font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }
      .card { max-width: 420px; padding: 32px 28px; text-align: center; background: #171a33;
              border-radius: 20px; border: 1px solid #2d3154; }
      .logo { width: 56px; height: 56px; border-radius: 16px; display: inline-flex; align-items: center;
              justify-content: center; background: linear-gradient(135deg, #6366f1, #8b5cf6);
              font-size: 28px; margin-bottom: 14px; }
      h1 { font-size: 19px; margin: 0 0 8px; }
      p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 18px; }
      a, button { display: inline-block; border: 0; border-radius: 12px; padding: 10px 18px; cursor: pointer;
              background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-weight: 700;
              font-size: 14px; text-decoration: none; }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="logo">✓</div>
      <h1>You&rsquo;re offline</h1>
      <p>This screen isn&rsquo;t saved on your device yet, but anything you already opened still works &mdash;
         and every check-in you make is queued here on the device and syncs automatically when you&rsquo;re
         back online.</p>
      <button onclick="location.reload()">Try again</button>
    </main>
    <script>addEventListener('online', () => location.assign(${JSON.stringify(url)}));</script>
  </body>
</html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // mutations → handled by the app's outbox

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(STATIC_CACHE, request));
  } else if (request.mode === 'navigate' || url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request.mode === 'navigate' ? PAGE_CACHE : API_CACHE, request));
  }
});
