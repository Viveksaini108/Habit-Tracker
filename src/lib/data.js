import { getDb } from './db.js';
import {
  todayKey,
  addDaysKey,
  diffDays,
  weekKeys,
  lastNDays,
  daysOfMonth,
  shiftMonth,
  monthKeyOf,
  shortDay,
  shortDate,
  monthLabel,
  parseKey,
} from './dates.js';

const R = (row) => ({ ...row });
const clamp01 = (n) => Math.max(0, Math.min(1, n));
const pct = (done, expected) => (expected <= 0 ? 0 : Math.round(clamp01(done / expected) * 100));

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------
export function findUserByEmail(email) {
  const row = getDb().prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(email);
  return row ? R(row) : null;
}

export function createUser({ name, email, passwordHash }) {
  const db = getDb();
  const id = Number(
    db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, passwordHash).lastInsertRowid
  );
  return { id, name, email };
}

export function getUserById(id) {
  const row = getDb().prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(id);
  return row ? R(row) : null;
}

/** True when the account signs in with a password (Google-only accounts: false). */
export function userHasPassword(id) {
  const row = getDb().prepare('SELECT password_hash FROM users WHERE id = ?').get(id);
  return Boolean(row?.password_hash);
}

export function updateUserPassword(id, passwordHash) {
  getDb().prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);
}

// ---------------------------------------------------------------------------
// password resets (forgot-password tokens; we store only the SHA-256 hash)
// ---------------------------------------------------------------------------
export function createPasswordReset(userId, tokenHash, expiresAtIso) {
  const db = getDb();
  db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(userId); // one active link per user
  db.prepare('INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)')
    .run(userId, tokenHash, expiresAtIso);
}

export function findPasswordResetByTokenHash(tokenHash) {
  return getDb().prepare('SELECT * FROM password_resets WHERE token_hash = ?').get(tokenHash) ?? null;
}

export function deletePasswordResetsForUser(userId) {
  getDb().prepare('DELETE FROM password_resets WHERE user_id = ?').run(userId);
}

// ---------------------------------------------------------------------------
// categories
// ---------------------------------------------------------------------------
export function listCategories(userId) {
  return getDb()
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM habits h WHERE h.category_id = c.id) AS habit_count
       FROM categories c WHERE c.user_id = ? ORDER BY c.created_at`
    )
    .all(userId)
    .map(R);
}

export function createCategory(userId, { name, color }) {
  const db = getDb();
  const exists = db
    .prepare('SELECT id FROM categories WHERE user_id = ? AND lower(name) = lower(?)')
    .get(userId, name);
  if (exists) return { error: 'A category with this name already exists' };
  const id = Number(
    db.prepare('INSERT INTO categories (user_id, name, color) VALUES (?, ?, ?)').run(userId, name, color).lastInsertRowid
  );
  return { id };
}

export function updateCategory(userId, id, { name, color }) {
  getDb()
    .prepare('UPDATE categories SET name = ?, color = ? WHERE id = ? AND user_id = ?')
    .run(name, color, id, userId);
}

export function deleteCategory(userId, id) {
  getDb().prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(id, userId);
}

// ---------------------------------------------------------------------------
// habits
// ---------------------------------------------------------------------------
export const inWindow = (h, key) => h.start_date <= key && (!h.end_date || key <= h.end_date);

export function listHabits(userId, { includeArchived = true } = {}) {
  const sql = `
    SELECT h.*, c.name AS category_name, c.color AS category_color
    FROM habits h LEFT JOIN categories c ON c.id = h.category_id
    WHERE h.user_id = ? ${includeArchived ? '' : 'AND h.archived = 0'}
    ORDER BY h.archived, c.name IS NULL, c.name, h.created_at`;
  return getDb().prepare(sql).all(userId).map((r) => ({ ...R(r), archived: !!r.archived }));
}

export function getHabit(userId, id) {
  const row = getDb()
    .prepare(
      `SELECT h.*, c.name AS category_name, c.color AS category_color
       FROM habits h LEFT JOIN categories c ON c.id = h.category_id
       WHERE h.id = ? AND h.user_id = ?`
    )
    .get(id, userId);
  return row ? { ...R(row), archived: !!row.archived } : null;
}

export function createHabit(userId, fields) {
  const db = getDb();
  const id = Number(
    db
      .prepare(
        `INSERT INTO habits (user_id, category_id, name, description, color, target_per_week, start_date, end_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        userId,
        fields.category_id ?? null,
        fields.name,
        fields.description ?? '',
        fields.color ?? '#6366f1',
        fields.target_per_week ?? 7,
        fields.start_date,
        fields.end_date ?? null
      ).lastInsertRowid
  );
  return { id };
}

export function updateHabit(userId, id, fields) {
  const allowed = ['category_id', 'name', 'description', 'color', 'target_per_week', 'start_date', 'end_date', 'archived'];
  const sets = [];
  const vals = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      vals.push(fields[key] === null || typeof fields[key] === 'number' || typeof fields[key] === 'string' ? fields[key] : String(fields[key]));
    }
  }
  if (!sets.length) return;
  vals.push(id, userId);
  getDb().prepare(`UPDATE habits SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`).run(...vals);
}

export function deleteHabit(userId, id) {
  getDb().prepare('DELETE FROM habits WHERE id = ? AND user_id = ?').run(id, userId);
}

// ---------------------------------------------------------------------------
// entries
// ---------------------------------------------------------------------------
/** habitId -> Set('yyyy-MM-dd') for the whole user history. */
export function getEntryMap(userId) {
  const rows = getDb().prepare('SELECT habit_id, date FROM entries WHERE user_id = ?').all(userId);
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.habit_id)) map.set(r.habit_id, new Set());
    map.get(r.habit_id).add(r.date);
  }
  return map;
}

export function listEntryRows(userId, habitId, limit = 240) {
  return getDb()
    .prepare('SELECT date, note FROM entries WHERE user_id = ? AND habit_id = ? ORDER BY date DESC LIMIT ?')
    .all(userId, habitId, limit)
    .map(R);
}

export function setEntry(userId, habitId, date, completed, note = '') {
  const db = getDb();
  if (completed) {
    db.prepare(
      `INSERT INTO entries (habit_id, user_id, date, note) VALUES (?, ?, ?, ?)
       ON CONFLICT(habit_id, date) DO NOTHING`
    ).run(habitId, userId, date, note);
  } else {
    db.prepare('DELETE FROM entries WHERE habit_id = ? AND user_id = ? AND date = ?').run(habitId, userId, date);
  }
}

// ---------------------------------------------------------------------------
// notes
// ---------------------------------------------------------------------------
export function listNotes(userId, habitId) {
  return getDb()
    .prepare('SELECT * FROM notes WHERE user_id = ? AND habit_id = ? ORDER BY created_at DESC')
    .all(userId, habitId)
    .map(R);
}

export function listRecentNotes(userId, limit = 5) {
  return getDb()
    .prepare(
      `SELECT n.*, h.name AS habit_name, h.color AS habit_color
       FROM notes n JOIN habits h ON h.id = n.habit_id
       WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT ?`
    )
    .all(userId, limit)
    .map(R);
}

export function createNote(userId, habitId, body) {
  const id = Number(
    getDb().prepare('INSERT INTO notes (habit_id, user_id, body) VALUES (?, ?, ?)').run(habitId, userId, body).lastInsertRowid
  );
  return getDb().prepare('SELECT * FROM notes WHERE id = ?').get(id);
}

export function updateNote(userId, id, body) {
  getDb().prepare('UPDATE notes SET body = ? WHERE id = ? AND user_id = ?').run(body, id, userId);
}

export function deleteNote(userId, id) {
  getDb().prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(id, userId);
}

// ---------------------------------------------------------------------------
// reflections
// ---------------------------------------------------------------------------
export function listReflections(userId) {
  return getDb()
    .prepare('SELECT * FROM reflections WHERE user_id = ? ORDER BY month DESC')
    .all(userId)
    .map(R);
}

export function getReflection(userId, month) {
  const row = getDb().prepare('SELECT * FROM reflections WHERE user_id = ? AND month = ?').get(userId, month);
  return row ? R(row) : null;
}

export function upsertReflection(userId, month, fields) {
  getDb()
    .prepare(
      `INSERT INTO reflections (user_id, month, highlights, challenges, learnings, next_focus, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, month) DO UPDATE SET
         highlights = excluded.highlights,
         challenges = excluded.challenges,
         learnings = excluded.learnings,
         next_focus = excluded.next_focus,
         rating = excluded.rating,
         updated_at = datetime('now')`
    )
    .run(
      userId,
      month,
      fields.highlights ?? '',
      fields.challenges ?? '',
      fields.learnings ?? '',
      fields.next_focus ?? '',
      fields.rating ?? 3
    );
  return getReflection(userId, month);
}

export function deleteReflection(userId, month) {
  getDb().prepare('DELETE FROM reflections WHERE user_id = ? AND month = ?').run(userId, month);
}

// ---------------------------------------------------------------------------
// challenges
// ---------------------------------------------------------------------------
const parseChallenge = (c) => ({ ...R(c), tips: JSON.parse(c.tips || '[]') });

export function listChallengeState(userId) {
  const db = getDb();
  const library = db.prepare('SELECT * FROM challenges ORDER BY id').all().map(parseChallenge);
  const mine = db
    .prepare(
      `SELECT uc.id AS uc_id, uc.status, uc.started_at, uc.ended_at, c.*
       FROM user_challenges uc JOIN challenges c ON c.id = uc.challenge_id
       WHERE uc.user_id = ? ORDER BY uc.started_at DESC`
    )
    .all(userId)
    .map(parseChallenge);

  const today = todayKey();
  const decorate = (uc) => {
    const elapsed = Math.max(0, diffDays(today, uc.started_at) + (uc.status === 'active' ? 1 : 0));
    const progress = uc.status === 'completed' ? 1 : clamp01(elapsed / uc.duration_days);
    const daysLeft = Math.max(0, uc.duration_days - elapsed);
    return { ...uc, elapsed, progress: Math.round(progress * 100), daysLeft };
  };

  const activeIds = new Set(mine.filter((m) => m.status === 'active').map((m) => m.id));
  return {
    library: library.map((c) => ({ ...c, joined: activeIds.has(c.id) })),
    active: mine.filter((m) => m.status === 'active').map(decorate),
    history: mine.filter((m) => m.status !== 'active').map(decorate),
  };
}

export function joinChallenge(userId, challengeId) {
  const db = getDb();
  const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(challengeId);
  if (!challenge) return { error: 'Challenge not found' };
  const active = db
    .prepare(
      `SELECT uc.id FROM user_challenges uc WHERE uc.user_id = ? AND uc.challenge_id = ? AND uc.status = 'active'`
    )
    .get(userId, challengeId);
  if (active) return { error: 'You already joined this challenge' };
  const id = Number(
    db.prepare('INSERT INTO user_challenges (user_id, challenge_id, started_at) VALUES (?, ?, ?)').run(userId, challengeId, todayKey()).lastInsertRowid
  );
  return { id };
}

export function setUserChallengeStatus(userId, ucId, status) {
  getDb()
    .prepare('UPDATE user_challenges SET status = ?, ended_at = ? WHERE id = ? AND user_id = ?')
    .run(status, status === 'active' ? null : todayKey(), ucId, userId);
}

export function leaveChallenge(userId, ucId) {
  getDb().prepare('DELETE FROM user_challenges WHERE id = ? AND user_id = ?').run(ucId, userId);
}

// ---------------------------------------------------------------------------
// statistics
// ---------------------------------------------------------------------------
export function currentStreak(habit, set, today = todayKey()) {
  let cursor = today;
  if (habit.end_date && habit.end_date < cursor) cursor = habit.end_date;
  if (!set.has(cursor)) cursor = addDaysKey(cursor, -1);
  let streak = 0;
  while (inWindow(habit, cursor) && set.has(cursor)) {
    streak += 1;
    cursor = addDaysKey(cursor, -1);
  }
  return streak;
}

export function bestStreak(habit, set) {
  const dates = [...set].filter((k) => inWindow(habit, k)).sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const k of dates) {
    run = prev && diffDays(k, prev) === 1 ? run + 1 : 1;
    if (run > best) best = run;
    prev = k;
  }
  return best;
}

/** done / expected (expected = activeDays * target/7), 0..1 */
export function rangeRate(habit, set, keys) {
  const active = keys.filter((k) => inWindow(habit, k)).length;
  const done = keys.filter((k) => inWindow(habit, k) && set.has(k)).length;
  const expected = (active / 7) * (habit.target_per_week || 7);
  return { done, active, rate: expected > 0 ? clamp01(done / expected) : 0 };
}

export function habitStats(habit, entryMap) {
  const set = entryMap.get(habit.id) ?? new Set();
  const today = todayKey();
  const last7 = lastNDays(7).map((k) => ({ key: k, done: set.has(k), active: inWindow(habit, k) }));
  return {
    streak: currentStreak(habit, set, today),
    best: bestStreak(habit, set),
    total: [...set].filter((k) => inWindow(habit, k)).length,
    doneToday: set.has(today) && inWindow(habit, today),
    last7,
    weekRate: rangeRate(habit, set, weekKeys(0)).rate,
  };
}

// ---------------------------------------------------------------------------
// dashboard
// ---------------------------------------------------------------------------
export function dashboardData(userId) {
  const today = todayKey();
  const habits = listHabits(userId, { includeArchived: false });
  const entryMap = getEntryMap(userId);
  const todaysHabits = habits.filter((h) => inWindow(h, today));

  const todayList = todaysHabits.map((h) => {
    const set = entryMap.get(h.id) ?? new Set();
    return {
      ...h,
      done: set.has(today),
      streak: currentStreak(h, set, today),
      target_per_week: h.target_per_week,
    };
  });

  const week = weekKeys(0).map((k) => {
    const activeHabits = habits.filter((h) => inWindow(h, k));
    const done = activeHabits.filter((h) => entryMap.get(h.id)?.has(k)).length;
    return {
      key: k,
      day: shortDay(k),
      date: k,
      active: activeHabits.length,
      done,
      pct: activeHabits.length ? Math.round((done / activeHabits.length) * 100) : 0,
      isToday: k === today,
    };
  });

  const weekPct = week.length
    ? Math.round(week.reduce((a, w) => a + w.pct, 0) / week.length)
    : 0;

  const bestCurrent = todayList.reduce((acc, h) => Math.max(acc, h.streak), 0);
  const atRisk = todayList.filter((h) => !h.done && h.streak >= 3);

  return {
    today,
    todayList,
    week,
    totals: {
      doneToday: todayList.filter((h) => h.done).length,
      totalToday: todayList.length,
      activeHabits: habits.filter((h) => !h.end_date || h.end_date >= today).length,
      bestStreak: bestCurrent,
      weekPct,
    },
    atRisk,
    recentNotes: listRecentNotes(userId, 5),
    challenges: listChallengeState(userId).active.slice(0, 3),
    categories: listCategories(userId),
    insights: generateInsights(habits, entryMap).slice(0, 2),
  };
}

// ---------------------------------------------------------------------------
// analytics
// ---------------------------------------------------------------------------
function periodData(habits, entryMap, keys) {
  const days = keys.map((k) => {
    const activeHabits = habits.filter((h) => inWindow(h, k));
    const done = activeHabits.filter((h) => entryMap.get(h.id)?.has(k)).length;
    return {
      key: k,
      day: shortDay(k),
      dateNum: Number(k.slice(8, 10)),
      active: activeHabits.length,
      done,
      pct: activeHabits.length ? Math.round((done / activeHabits.length) * 100) : 0,
      isFuture: k > todayKey(),
    };
  });

  const totals = days.reduce(
    (acc, d) => ({ done: acc.done + d.done, active: acc.active + d.active }),
    { done: 0, active: 0 }
  );

  const perHabit = habits
    .filter((h) => keys.some((k) => inWindow(h, k)))
    .map((h) => {
      const set = entryMap.get(h.id) ?? new Set();
      const { done, active, rate } = rangeRate(h, set, keys);
      return {
        id: h.id,
        name: h.name,
        color: h.color,
        category: h.category_name || 'Uncategorized',
        done,
        active,
        pct: Math.round(rate * 100),
        streak: currentStreak(h, set),
      };
    })
    .sort((a, b) => b.pct - a.pct);

  const catMap = new Map();
  for (const h of habits) {
    const set = entryMap.get(h.id) ?? new Set();
    const { done, active } = rangeRate(h, set, keys);
    if (!active) continue;
    const name = h.category_name || 'Uncategorized';
    const cur = catMap.get(name) ?? { name, color: h.category_color || '#94a3b8', done: 0, expected: 0 };
    cur.done += done;
    cur.expected += (active / 7) * (h.target_per_week || 7);
    catMap.set(name, cur);
  }
  const categories = [...catMap.values()]
    .map((c) => ({ ...c, pct: pct(c.done, c.expected) }))
    .sort((a, b) => b.done - a.done);

  return { days, totals: { ...totals, pct: pct(totals.done, totals.active) }, perHabit, categories };
}

export function analyticsData(userId, { period, month, offset = 0 }) {
  const habits = listHabits(userId, { includeArchived: true });
  const entryMap = getEntryMap(userId);
  const mk = month || monthKeyOf();
  const today = todayKey();

  let keys;
  let prevKeys;
  let label;
  if (period === 'week') {
    keys = weekKeys(offset);
    prevKeys = weekKeys(offset - 1);
    label = `${shortDate(keys[0])} → ${shortDate(keys[6])}`;
  } else {
    keys = daysOfMonth(mk);
    prevKeys = daysOfMonth(shiftMonth(mk, -1));
    label = monthLabel(mk);
  }

  const current = periodData(habits, entryMap, keys);

  // Fair comparison: when the period is still running, compare against the
  // same elapsed window in the previous period (e.g. Mon-Tue vs Mon-Tue).
  let prevCompare = prevKeys;
  if (keys.includes(today)) {
    const elapsed = keys.filter((k) => k <= today).length;
    prevCompare = prevKeys.slice(0, Math.max(1, elapsed));
  }
  const previous = periodData(habits, entryMap, prevCompare);

  // 60-day completion trend
  const trend = lastNDays(60).map((k) => {
    const activeHabits = habits.filter((h) => inWindow(h, k));
    const done = activeHabits.filter((h) => entryMap.get(h.id)?.has(k)).length;
    return {
      key: k,
      label: k.slice(5),
      pct: activeHabits.length ? Math.round((done / activeHabits.length) * 100) : null,
    };
  });

  // month heatmap cells
  const heatmap = daysOfMonth(mk).map((k) => {
    const d = current.days.find((x) => x.key === k);
    return { key: k, dateNum: Number(k.slice(8, 10)), pct: d ? d.pct : 0, active: d ? d.active : 0, isFuture: k > todayKey() };
  });

  const bestStreakAny = habits.reduce((acc, h) => Math.max(acc, bestStreak(h, entryMap.get(h.id) ?? new Set())), 0);
  const perfectDays = current.days.filter((d) => d.active > 0 && d.pct === 100).length;

  return {
    period,
    label,
    month: mk,
    days: current.days,
    weeks: period === 'month' ? weekBuckets(current.days) : null,
    totals: current.totals,
    prevPct: previous.totals.pct,
    perHabit: current.perHabit,
    categories: current.categories,
    trend,
    heatmap,
    bestStreakAny,
    perfectDays,
    insights: generateInsights(habits.filter((h) => !h.archived), entryMap),
  };
}

function weekBuckets(days) {
  const buckets = [];
  for (const d of days) {
    const idx = Math.min(4, Math.floor((d.dateNum - 1) / 7));
    if (!buckets[idx]) buckets[idx] = { label: `Week ${idx + 1}`, done: 0, active: 0, isFuture: true };
    buckets[idx].done += d.done;
    buckets[idx].active += d.active;
    if (!d.isFuture) buckets[idx].isFuture = false;
  }
  return buckets.filter(Boolean).map((b) => ({ ...b, pct: pct(b.done, b.active) }));
}

// ---------------------------------------------------------------------------
// personalized insights ("ways to improve", user-centric)
// ---------------------------------------------------------------------------
export function generateInsights(habits, entryMap) {
  const today = todayKey();
  const insights = [];
  const activeHabits = habits.filter((h) => inWindow(h, today));
  if (!activeHabits.length) return insights;

  const last14 = lastNDays(14);

  // 1. Struggling habit
  let weakest = null;
  for (const h of activeHabits) {
    const set = entryMap.get(h.id) ?? new Set();
    const { rate, active } = rangeRate(h, set, last14);
    if (active >= 5 && rate < 0.55 && (!weakest || rate < weakest.rate)) weakest = { h, rate };
  }
  if (weakest) {
    insights.push({
      icon: 'target',
      title: `“${weakest.h.name}” needs a smaller first step`,
      body: `Only ${Math.round(weakest.rate * 100)}% complete over the last two weeks. Shrink the goal (a 2-minute version counts) and attach it to an existing routine — habit stacking beats willpower.`,
    });
  }

  // 2. Weekend dip
  let wdDone = 0;
  let wdActive = 0;
  let weDone = 0;
  let weActive = 0;
  for (const k of last14) {
    const dow = parseKey(k).getDay();
    const isWe = dow === 0 || dow === 6;
    for (const h of activeHabits) {
      if (!inWindow(h, k)) continue;
      if (isWe) weActive += 1;
      else wdActive += 1;
      if (entryMap.get(h.id)?.has(k)) {
        if (isWe) weDone += 1;
        else wdDone += 1;
      }
    }
  }
  const wdPct = wdActive ? wdDone / wdActive : 0;
  const wePct = weActive ? weDone / weActive : 0;
  if (wdPct - wePct > 0.15 && wdActive > 10) {
    insights.push({
      icon: 'calendar',
      title: 'Weekend slump detected',
      body: `You complete ${Math.round(wdPct * 100)}% of habits on weekdays but ${Math.round(wePct * 100)}% on weekends. Build a lighter weekend version of your routine — same habits, smaller doses, anchored to weekend events like breakfast.`,
    });
  }

  // 3. Streak at risk today
  const risky = activeHabits
    .map((h) => ({ h, s: currentStreak(h, entryMap.get(h.id) ?? new Set(), today) }))
    .filter((x) => x.s >= 5 && !(entryMap.get(x.h.id)?.has(today)))
    .sort((a, b) => b.s - a.s)[0];
  if (risky) {
    insights.push({
      icon: 'flame',
      title: `Don't break the ${risky.s}-day chain`,
      body: `“${risky.h.name}” is on a ${risky.s}-day streak and isn't checked off today. Schedule it in the next two hours — streaks past 5 days are 2× more likely to survive the month.`,
    });
  }

  // 4. Category strength → anchor strategy
  const catRate = new Map();
  for (const h of activeHabits) {
    const { rate, active } = rangeRate(h, entryMap.get(h.id) ?? new Set(), last14);
    if (!active) continue;
    const name = h.category_name || 'Uncategorized';
    const cur = catRate.get(name) ?? { sum: 0, n: 0 };
    cur.sum += rate;
    cur.n += 1;
    catRate.set(name, cur);
  }
  const bestCat = [...catRate.entries()].sort((a, b) => b[1].sum / b[1].n - a[1].sum / a[1].n)[0];
  if (bestCat && bestCat[1].sum / bestCat[1].n > 0.6) {
    insights.push({
      icon: 'sparkles',
      title: `${bestCat[0]} is your engine`,
      body: `${Math.round((bestCat[1].sum / bestCat[1].n) * 100)}% completion — your strongest area. Use it as an anchor: stack weaker habits right after your ${bestCat[0].toLowerCase()} routine to borrow its momentum.`,
    });
  }

  // 5. Celebrate consistency
  const overall = (() => {
    let d = 0;
    let a = 0;
    for (const h of activeHabits) {
      const r = rangeRate(h, entryMap.get(h.id) ?? new Set(), last14);
      d += r.done;
      a += r.active;
    }
    return a ? d / a : 0;
  })();
  if (overall >= 0.8) {
    insights.push({
      icon: 'trophy',
      title: 'Elite consistency',
      body: `${Math.round(overall * 100)}% completion over 14 days puts you in the top tier of habit builders. Consider raising one bar — add reps or duration to a single habit rather than adding new ones.`,
    });
  }

  return insights.slice(0, 4);
}
