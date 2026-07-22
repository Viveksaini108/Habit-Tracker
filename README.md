# HabitFlow — Habit Tracker

A full-stack habit tracker that feels alive from the first load: daily check-ins with streaks, categorized habits with start/end dates, weekly & monthly analytics, monthly reflections, a challenge library with user-centric improvement tips, and per-habit progress notes.

![Stack](https://img.shields.io/badge/Next.js%2014-App%20Router-black) ![DB](https://img.shields.io/badge/SQLite-node%3Asqlite-blue) ![UI](https://img.shields.io/badge/Tailwind%20CSS-Recharts-6366f1)

## Features

- **Android & iOS apps** — a Capacitor native shell in [`mobile/`](mobile) with custom icons, splash screens and R8-minified release builds (~5–8 MB). **No Android Studio needed:** activate the included cloud APK builder (`apk-builder.yml` → `.github/workflows/`) and GitHub Actions produces an installable APK per run. See **[MOBILE.md](MOBILE.md)**.
- **Offline mode** — the app opens without network (service-worker shell cache), check-ins queue on the device with an idempotent, replay-safe outbox, and **auto-sync to the online database** the moment you're back online. The server stays the source of truth. Details in [MOBILE.md §6](MOBILE.md#6-offline-mode-track-habits-without-network).
- **Settings** — profile editing, theme selection, full JSON data export and account controls at `/settings`.
- **Authentication** — register / login / logout with signed, encrypted session cookies (iron-session) and bcrypt password hashing; **Sign in with Google** (one-click accounts via Google Identity Services, verified server-side); **Gmail-only registration** with strict email validation on both client and server; **forgot password** with single-use, expiring reset links emailed through a free Gmail account (dev mode shows the link when mail isn't configured); **change / set password** in Settings — Google-created accounts can set their first password; show/hide password toggles.
- **Dashboard** — today's checklist with optimistic toggles, streak flames, stat cards, week-at-a-glance, active challenges, latest notes and personalized insights.
- **Habits** — full CRUD: name, description, category, color, weekly target (1–7×), **start & end dates**, archive/restore, delete with confirm. Per-habit detail page with a 6-month heatmap, 14-day backfill grid and progress notes.
- **Categories** — create / rename / recolor / delete; habits gracefully become “Uncategorized”.
- **Analytics** — weekly & monthly reports: 60-day completion trend, per-day / per-week bars, category donut, habit leaderboard (normalized to weekly targets), month intensity map, deltas vs previous period, and **personalized “ways to improve”** insights derived from your real data.
- **Monthly reflections** — wins / challenges / learnings / next-month focus + a 5-star rating, one per month, full history with edit & delete.
- **Challenges** — a seeded library of 10 challenges, each with duration, difficulty and practical tips (“ways to improve”); join, track progress, complete, give up, restart.
- **Themes** — 6 pre-installed themes (Daylight, Midnight, Ocean, Forest, Sunset, Candy) built on CSS custom properties; instant switching from the sidebar picker, persisted via cookie so there’s no flash on load.
- **Playful motion** — Bloop, an animated SVG mascot (blinks, waves, celebrates), shine-sweep buttons, springy checkbox draw animation, shimmer skeletons, hover-lift cards, and a confetti burst when you complete every habit for the day. Respects `prefers-reduced-motion`.
- **UX polish** — empty states, loading skeletons, optimistic updates with rollback, error messaging, fully responsive (mobile slide-over nav).
- **Persistent storage** — SQLite via Node 22’s built-in `node:sqlite` (zero native dependencies), auto-seeded on first boot.

## Getting started

Requires **Node.js ≥ 22.5**.

```bash
npm install
npm run dev        # http://localhost:3000
```

The database is created and seeded automatically into `data/habitflow.db` on first request.

**Demo account:** `demo@habitflow.app` / `demo1234`
(or click “Explore with the demo account” on the sign-in page).
On a public deployment, disable it with `SEED_DEMO=0` — see *Environment*.

### Other scripts

```bash
npm run build      # production build
npm start          # serve the production build
npm run seed       # wipe & re-seed the demo data
```

## Deploying (get a public https URL → then the "forever APK")

HabitFlow ships a production **`Dockerfile`** (multi-stage, standalone Next.js
output, non-root, health-checked). Any Docker-capable host can run it — and your
data survives as long as the `/app/data` volume persists.

```bash
# try it locally
docker build -t habitflow .
docker run -p 3000:3000 -e SESSION_SECRET="a-long-random-string" \
  -v habitflow-data:/app/data habitflow        # → http://localhost:3000
```

| Host | How |
| --- | --- |
| **Render** (free tier) | New → Web Service → it **auto-detects the Dockerfile** (or use Node runtime: build `npm install && npm run build`, start `npm start -- -H 0.0.0.0 -p $PORT`). Free tier sleeps when idle and has **no persistent disk** — fine for demos; the app auto-reseeds on restart. |
| **Fly.io** (~free allowances) | `fly.toml` is ready: create app & volume, `fly secrets set SESSION_SECRET=…`, `fly deploy --ha=false`. Persistent volume included. |
| **Oracle Cloud "Always Free" VM** | Free forever: install Docker on the VM, then the two `docker` commands above (put Caddy/nginx + a free DuckDNS name in front for https). |

Everywhere: set **`SESSION_SECRET`** (32+ random chars) and keep **`/app/data`**
on a persistent volume. Once deployed, build the mobile apps against that
`https://…` URL (see [MOBILE.md](MOBILE.md#2-point-the-app-at-your-server)) —
https also unlocks the full offline mode.

## Architecture

```
src/
├─ app/
│  ├─ (auth)/login|register     # split-screen auth pages
│  ├─ (app)/                    # authenticated shell (sidebar layout)
│  │  ├─ dashboard|habits|analytics|reflections|challenges
│  │  └─ habits/[id]            # habit detail (heatmap, notes, quick check-in)
│  └─ api/                      # REST-ish route handlers (JSON)
│     ├─ auth/*                 # register, login, logout, me
│     ├─ habits/[id]/entries    # daily check-ins (toggle)
│     ├─ habits/[id]/notes      # progress notes
│     ├─ categories, reflections, challenges, user-challenges, stats
├─ components/                  # design system + feature components
├─ lib/
   ├─ db.js                     # SQLite connection, schema, auto-seed
   ├─ data.js                   # queries + streak/analytics engine + insights
   ├─ seed.js                   # realistic demo data (deterministic PRNG)
   ├─ session.js                # iron-session helpers
   └─ dates.js, themes.js, validate.js …

mobile/                          # Capacitor native shell (Android + iOS)
├─ capacitor.config.json         # server.url → your HabitFlow server
├─ android/, ios/                # native projects (icons & splash generated)
└─ www/                          # branded offline fallback page
```

- **Rendering:** server components read straight from SQLite for fast first paint; client components mutate via the API with optimistic updates.
- **Auth guard:** the `(app)` layout redirects unauthenticated users; every API route checks the session cookie.
- **Insights:** a small rule engine (weekend-dip detection, habit-stacking suggestions, streak protection, category anchors) turns raw stats into user-centric advice.

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `SESSION_SECRET` | built-in dev value | 32+ char secret for cookie encryption — set it in production |
| `SEED_DEMO` | enabled | Set to `0` to skip the demo account when a fresh database seeds (the shared challenge library still seeds). The demo button on the sign-in page hides automatically. To remove a demo account from an **existing** database: `node scripts/remove-demo.mjs` |
| `GOOGLE_CLIENT_ID` | unset | Enables the **Sign in with Google** button (see below). Free at Google Cloud, no billing required. |
| `EMAIL_USER` + `EMAIL_APP_PASSWORD` | unset | Sends forgot-password emails from your own Gmail (₹0 — see below). Outside production, a missing config just makes `/forgot` show the reset link on screen. |

### Sign in with Google (₹0 — one-time ~15 min setup)

1. [console.cloud.google.com](https://console.cloud.google.com) → create a project (free).
2. **APIs & Services → OAuth consent screen** → External → fill app name + your email → Save.
3. **Credentials → Create credentials → OAuth client ID** → type **Web application**:
   - **Authorized JavaScript origins:** add `http://localhost:3000` and your deployed URL, e.g. `https://habit-tracker-xxxx.onrender.com`
   - No redirect URI needed for the button flow.
4. Copy the **Client ID** (`….apps.googleusercontent.com`) and set `GOOGLE_CLIENT_ID` — locally in `.env.local`, on Render under **Environment** → redeploy.

The button appears on both sign-in and create-account pages (verified email ⇒
Google sign-in doubles as sign-up). It hides itself wherever Google isn't
configured, and inside the native apps for now — Google refuses OAuth inside
embedded WebViews; in-app Google sign-in comes with a Custom-Tab flow (Phase 2).

Registration with email+password is **Gmail-only** (`@gmail.com`), enforced in
the form and on the server. Sign-in itself accepts any existing account email
(so the demo account and Google-workspace users keep working).

### Forgot password — free email via your own Gmail (one-time ~5 min)

Reset links are single-use, SHA-256-hashed in the DB and expire in 30 minutes.
To send them as real emails (₹0):

1. Use (or create) a Gmail account, e.g. `you@gmail.com`.
2. [myaccount.google.com/security](https://myaccount.google.com/security) → turn on **2-Step Verification**.
3. Same page → search **"App passwords"** → create one named `HabitFlow` → copy the 16-character code.
4. Set env vars — locally in `.env.local`, on Render under **Environment**:
   ```
   EMAIL_USER=you@gmail.com
   EMAIL_APP_PASSWORD=the-16-char-code
   ```
5. Restart / redeploy. Done — `/forgot` now emails a styled reset link.

Without these vars the flow still works: outside production the reset link is
shown directly on the "check your inbox" screen (dev mode). Signed-in users can
also change their password anytime in **Settings → Change password** — and
Google-created accounts get a **Set a password** box instead (no current
password needed), which unlocks email+password sign-in for them.

## License

MIT
