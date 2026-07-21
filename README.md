# HabitFlow — Habit Tracker

A full-stack habit tracker that feels alive from the first load: daily check-ins with streaks, categorized habits with start/end dates, weekly & monthly analytics, monthly reflections, a challenge library with user-centric improvement tips, and per-habit progress notes.

![Stack](https://img.shields.io/badge/Next.js%2014-App%20Router-black) ![DB](https://img.shields.io/badge/SQLite-node%3Asqlite-blue) ![UI](https://img.shields.io/badge/Tailwind%20CSS-Recharts-6366f1)

## Features

- **Authentication** — register / login / logout with signed, encrypted session cookies (iron-session) and bcrypt password hashing.
- **Dashboard** — today's checklist with optimistic toggles, streak flames, stat cards, week-at-a-glance, active challenges, latest notes and personalized insights.
- **Habits** — full CRUD: name, description, category, color, weekly target (1–7×), **start & end dates**, archive/restore, delete with confirm. Per-habit detail page with a 6-month heatmap, 14-day backfill grid and progress notes.
- **Categories** — create / rename / recolor / delete; habits gracefully become “Uncategorized”.
- **Analytics** — weekly & monthly reports: 60-day completion trend, per-day / per-week bars, category donut, habit leaderboard (normalized to weekly targets), month intensity map, deltas vs previous period, and **personalized “ways to improve”** insights derived from your real data.
- **Monthly reflections** — wins / challenges / learnings / next-month focus + a 5-star rating, one per month, full history with edit & delete.
- **Challenges** — a seeded library of 10 challenges, each with duration, difficulty and practical tips (“ways to improve”); join, track progress, complete, give up, restart.
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
(or click “Explore with the demo account” on the sign-in page)

### Other scripts

```bash
npm run build      # production build
npm start          # serve the production build
npm run seed       # wipe & re-seed the demo data
```

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
└─ lib/
   ├─ db.js                     # SQLite connection, schema, auto-seed
   ├─ data.js                   # queries + streak/analytics engine + insights
   ├─ seed.js                   # realistic demo data (deterministic PRNG)
   ├─ session.js                # iron-session helpers
   └─ dates.js, validate.js …
```

- **Rendering:** server components read straight from SQLite for fast first paint; client components mutate via the API with optimistic updates.
- **Auth guard:** the `(app)` layout redirects unauthenticated users; every API route checks the session cookie.
- **Insights:** a small rule engine (weekend-dip detection, habit-stacking suggestions, streak protection, category anchors) turns raw stats into user-centric advice.

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `SESSION_SECRET` | built-in dev value | 32+ char secret for cookie encryption — set it in production |

## License

MIT
