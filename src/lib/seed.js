import bcrypt from 'bcryptjs';
import { toKey, addDaysKey, todayKey, monthKeyOf, shiftMonth, weekKeys } from './dates.js';

/** Deterministic PRNG so every fresh database looks intentionally alive. */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const CHALLENGE_LIBRARY = [
  {
    title: '21-Day Morning Walk',
    description:
      'Start every day with a brisk 20-minute walk. Three weeks is the classic window to wire a habit in — keep the barrier low and the timing fixed.',
    category: 'Health',
    duration_days: 21,
    difficulty: 'Easy',
    tips: [
      'Lay out your shoes and clothes the night before — remove the morning friction.',
      'Walk at the same time daily; anchoring beats motivation.',
      'Pair the walk with a podcast or playlist you only allow during walks.',
      'Start with 10 minutes if 20 feels heavy — consistency first, duration later.',
      'Track your streak visibly and never miss twice in a row.',
    ],
  },
  {
    title: 'No-Sugar Sprint',
    description:
      'Cut added sugar for two weeks. Expect cravings around days 3–5; after that, taste buds recalibrate and the urge drops sharply.',
    category: 'Health',
    duration_days: 14,
    difficulty: 'Hard',
    tips: [
      'Clear the pantry on day zero — willpower loses to availability every time.',
      'Keep fruit and nuts within reach for the 3pm craving window.',
      'Tell one friend; social accountability raises follow-through by ~65%.',
      'Drink a glass of water and wait 10 minutes before acting on any craving.',
      'Plan one planned exception for a social event instead of breaking the sprint.',
    ],
  },
  {
    title: 'Read 20 Pages a Day',
    description:
      'Twenty pages a day is roughly 30 books a year. Attach it to an existing routine and keep the book visible.',
    category: 'Learning',
    duration_days: 21,
    difficulty: 'Medium',
    tips: [
      'Keep the book on your pillow — you will trip over your own intention.',
      'Read right after a stable anchor: morning coffee or lights-out.',
      'Use a visible page tracker; progress you can see is progress you repeat.',
      'Always stop mid-chapter so starting tomorrow is effortless.',
      'Two short sessions count the same as one long one — split when busy.',
    ],
  },
  {
    title: 'Digital Sunset',
    description:
      'No screens for the last hour before bed for 30 days. Blue light and doom-scrolling are the two biggest thieves of sleep quality.',
    category: 'Mindfulness',
    duration_days: 30,
    difficulty: 'Medium',
    tips: [
      'Charge your phone in another room — out of arm’s reach means out of mind.',
      'Automate it: set a daily "wind down" focus mode that kicks in at 9:30pm.',
      'Replace, don’t remove: keep a book, journal or stretching mat by the bed.',
      'Prepare a fallback for "just one quick check" — write the thought on paper instead.',
      'Track your sleep quality each morning to make the benefit visible.',
    ],
  },
  {
    title: '5-Minute Meditation',
    description:
      'Five quiet minutes daily for three weeks. Small enough to never skip, long enough to measurably lower stress.',
    category: 'Mindfulness',
    duration_days: 21,
    difficulty: 'Easy',
    tips: [
      'Attach it to waking up or to brushing your teeth — never leave it floating.',
      'Sit in the same spot; place becomes the cue.',
      'Count breaths to ten and restart — wandering is the exercise, not the failure.',
      'Use a timer so you never watch the clock.',
      'If you miss the morning, do it before lunch rather than skipping the day.',
    ],
  },
  {
    title: 'Two-Litre Hydration',
    description:
      'Drink two litres of water daily for two weeks. Hydration is the cheapest upgrade to focus and energy there is.',
    category: 'Health',
    duration_days: 14,
    difficulty: 'Easy',
    tips: [
      'Fill a 1-litre bottle twice — seeing the goal beats counting glasses.',
      'Drink one full glass immediately after waking; front-loading works.',
      'Keep the bottle in your line of sight at your desk.',
      'Add lemon or mint if plain water bores you.',
      'Link each refill to a bathroom break or a meeting to build the loop.',
    ],
  },
  {
    title: 'Deep-Work Blocks',
    description:
      'Two protected 45-minute single-tasking blocks every workday for two weeks. No tabs, no notifications, one clear deliverable per block.',
    category: 'Productivity',
    duration_days: 14,
    difficulty: 'Medium',
    tips: [
      'Calendar the blocks and treat them like meetings you cannot move.',
      'Write the single outcome of each block on a sticky note before starting.',
      'Silence notifications and close every tab that is not the task.',
      'Keep a "distraction pad" — jot the urge, return to it after the block.',
      'End each block by noting the next tiny step; starting tomorrow is then trivial.',
    ],
  },
  {
    title: 'Gratitude Journal',
    description:
      'Write down three things you are grateful for every night for three weeks. One of the best-evidenced wellbeing habits in psychology.',
    category: 'Mindfulness',
    duration_days: 21,
    difficulty: 'Easy',
    tips: [
      'Keep the notebook and pen on your pillow so it is the last thing you see.',
      'Be specific: "the barista remembered my order" beats "my job".',
      'Vary categories — people, moments, comforts, abilities — to avoid repetition fatigue.',
      'Reread the week’s entries on Sunday; it doubles the effect.',
      'Write at the same time nightly, right before lights out.',
    ],
  },
  {
    title: 'Skill Sprint: 30 Minutes Daily',
    description:
      'Pick one skill — a language, an instrument, a tool — and practice deliberately for 30 minutes a day for a month.',
    category: 'Learning',
    duration_days: 30,
    difficulty: 'Medium',
    tips: [
      'Define the skill narrowly: "play three songs" beats "learn guitar".',
      'Practice at a fixed time with the materials already set out.',
      'Deliberate practice: work on the hard parts, not the fun ones.',
      'Record a baseline on day one and a re-test on day 30 — progress is the reward.',
      'Missed a day? Do 10 minutes anyway; the ritual matters more than the dose.',
    ],
  },
  {
    title: 'Reach Out Weekly',
    description:
      'Message or call one friend or family member each week for four weeks. Relationships are habits too — small touches compound.',
    category: 'Social',
    duration_days: 28,
    difficulty: 'Easy',
    tips: [
      'Keep a short list of people to cycle through so choosing is effortless.',
      'Schedule it: Friday lunch or Sunday evening works well.',
      'Reference something specific — "how did the interview go?" beats "hey".',
      'Voice notes count and take two minutes.',
      'Pair it with an existing weekly ritual like Sunday coffee.',
    ],
  },
];

const CATEGORY_SEED = [
  { name: 'Health', color: '#10b981' },
  { name: 'Fitness', color: '#f97316' },
  { name: 'Learning', color: '#3b82f6' },
  { name: 'Mindfulness', color: '#8b5cf6' },
  { name: 'Productivity', color: '#6366f1' },
  { name: 'Social', color: '#ec4899' },
];

/**
 * habit seed descriptors.
 * p = base probability per day; week = {dow: multiplier} adjustments;
 * note examples per habit.
 */
const HABIT_SEED = [
  {
    name: 'Sleep by 11 PM',
    description: 'Lights out before 11 to protect 7.5+ hours of sleep.',
    category: 'Health',
    color: '#10b981',
    target: 7,
    start: 118,
    p: 0.62,
    week: { 5: 0.75, 6: 0.7 },
    notes: [
      'Shifted dinner 1h earlier — falling asleep faster since.',
      'Weekend slip again. Plan: wind-down alarm at 10:15pm on Fri/Sat too.',
    ],
  },
  {
    name: 'No added sugar',
    description: 'Skip sweets, sodas and sweetened drinks.',
    category: 'Health',
    color: '#14b8a6',
    target: 7,
    start: 45,
    end: 17, // ends in 17 days from today — challenge-style habit
    p: 0.66,
    notes: ['Cravings basically gone after week 2. Fruit works as a substitute.'],
  },
  {
    name: 'Drink 2L of water',
    description: 'Two litres spread through the day.',
    category: 'Health',
    color: '#0ea5e9',
    target: 7,
    start: 118,
    p: 0.82,
  },
  {
    name: 'Morning run (5K)',
    description: 'Easy pace 5K before breakfast.',
    category: 'Fitness',
    color: '#f97316',
    target: 4,
    start: 110,
    p: 0.55,
    daysOnly: [1, 3, 5, 6], // Mon / Wed / Fri / Sat
    notes: [
      'Ran 5K under 27 min for the first time!',
      'Knee felt tight — switching Wed run to a walk until it settles.',
    ],
  },
  {
    name: 'Strength training',
    description: 'Push / pull / legs rotation at the gym.',
    category: 'Fitness',
    color: '#ef4444',
    target: 3,
    start: 96,
    p: 0.78,
    daysOnly: [1, 3, 5],
    notes: ['Added 5kg to the squat. Progressive overload is working.'],
  },
  {
    name: '10,000 steps',
    description: 'Hit 10k steps (walk commute helps a lot).',
    category: 'Fitness',
    color: '#f59e0b',
    target: 6,
    start: 118,
    p: 0.72,
    week: { 0: 0.55 },
  },
  {
    name: 'Read 20 pages',
    description: 'Mostly non-fiction in the morning, fiction at night.',
    category: 'Learning',
    color: '#3b82f6',
    target: 7,
    start: 118,
    p: 0.74,
    notes: [
      'Finished "Atomic Habits" — implementing habit stacking already.',
      'Evening reading works better for me than morning.',
    ],
  },
  {
    name: 'Practice Spanish',
    description: 'Duolingo + 10 flashcards. A2 → B1 this year.',
    category: 'Learning',
    color: '#60a5fa',
    target: 6,
    start: 88,
    p: 0.7,
  },
  {
    name: 'One lecture / course video',
    description: 'CS course, 30 minutes.',
    category: 'Learning',
    color: '#2563eb',
    target: 3,
    start: 60,
    p: 0.6,
    daysOnly: [2, 4, 6],
  },
  {
    name: 'Meditate 10 minutes',
    description: 'Breath-focused, right after waking up.',
    category: 'Mindfulness',
    color: '#8b5cf6',
    target: 7,
    start: 118,
    p: 0.85,
    notes: ['Noticed real focus gains on work days after meditating.'],
  },
  {
    name: 'Gratitude journal',
    description: 'Three specific things before bed.',
    category: 'Mindfulness',
    color: '#a78bfa',
    target: 5,
    start: 75,
    p: 0.66,
    week: { 0: 0.9 },
  },
  {
    name: 'Plan the day (top 3)',
    description: 'Write the 3 priorities before opening email.',
    category: 'Productivity',
    color: '#6366f1',
    target: 7,
    start: 118,
    p: 0.88,
    week: { 5: 0.5, 6: 0.5 },
    notes: ['Planning before opening Slack changed everything — fewer reactive days.'],
  },
  {
    name: 'Inbox zero',
    description: 'Process email to zero once a day, no grazing.',
    category: 'Productivity',
    color: '#818cf8',
    target: 5,
    start: 52,
    p: 0.58,
    week: { 5: 0.4, 6: 0.4 },
  },
  {
    name: 'Call / text someone I care about',
    description: 'Small touch, big relationship compounding.',
    category: 'Social',
    color: '#ec4899',
    target: 3,
    start: 90,
    p: 0.62,
    notes: ['Called grandma — 25 minutes, she was so happy. Do this more.'],
  },
  {
    name: 'Wake up at 6 AM',
    description: 'Retired: shifted to a sleep-based routine instead.',
    category: 'Health',
    color: '#94a3b8',
    target: 7,
    start: 118,
    end: 40,
    archived: true,
    p: 0.5,
  },
];

const REFLECTION_SEED = [
  {
    offset: -3,
    highlights:
      'Built the first real streaks — 12 days straight on reading and 9 on meditation. Morning runs became the default, not the exception. Felt noticeably more energetic by month-end.',
    challenges:
      'Over-scoped the plan: 16 habits at once was too many and I dropped half of them in week 2. Late-night screens kept sabotaging the 11pm bedtime.',
    learnings:
      'Environment beats willpower — leaving the book on the pillow worked better than any reminder. Fewer habits, executed daily, compound faster than a long wishlist.',
    next_focus: 'Cut the list to 12 core habits. Protect the evening shutdown routine.',
    rating: 4,
  },
  {
    offset: -2,
    highlights:
      'Hit a 21-day meditation streak and finished my first book of the year. The "plan the day" ritual stuck almost every single workday.',
    challenges:
      'Travel in week 3 broke the gym rhythm and it took a full week to recover. Inbox zero kept slipping whenever meetings piled up.',
    learnings:
      'Travel days need a "minimum viable" version of each habit (5-minute meditation still counts). Recovery speed after a break matters more than the break itself.',
    next_focus: 'Create travel-mode versions of fitness habits. Batch email to one 4pm slot.',
    rating: 4,
  },
  {
    offset: -1,
    highlights:
      'Best month so far: 78% overall completion. Spanish finally feels fun — switched to podcasts during runs. Completed the Gratitude Journal challenge.',
    challenges:
      'Weekend consistency dipped (58% vs 82% on weekdays). The no-sugar habit is genuinely hard around social events.',
    learnings:
      'Anchoring habits to fixed anchors (waking up, lunch, lights-out) is everything. Weekends need their own looser anchors instead of the workday ones.',
    next_focus: 'Build a weekend version of the routine. One planned sugar exception per week.',
    rating: 5,
  },
];

/**
 * Seed an empty database with the demo account, rich history and the
 * challenge library. `db` is an open DatabaseSync.
 */
export function seedDatabase(db) {
  const rand = mulberry32(20260721);
  const today = todayKey();

  // ---- users -------------------------------------------------------------
  const passwordHash = bcrypt.hashSync('demo1234', 10);
  const userId = Number(
    db
      .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run('Alex Carter', 'demo@habitflow.app', passwordHash).lastInsertRowid
  );

  // ---- challenge library (global) ---------------------------------------
  const challengeIds = [];
  for (const c of CHALLENGE_LIBRARY) {
    challengeIds.push(
      Number(
        db
          .prepare(
            'INSERT INTO challenges (title, description, category, duration_days, difficulty, tips) VALUES (?, ?, ?, ?, ?, ?)'
          )
          .run(c.title, c.description, c.category, c.duration_days, c.difficulty, JSON.stringify(c.tips))
          .lastInsertRowid
      )
    );
  }

  // ---- categories ---------------------------------------------------------
  const catIds = {};
  for (const c of CATEGORY_SEED) {
    catIds[c.name] = Number(
      db
        .prepare('INSERT INTO categories (user_id, name, color) VALUES (?, ?, ?)')
        .run(userId, c.name, c.color).lastInsertRowid
    );
  }

  // ---- habits + entries ----------------------------------------------------
  const insertHabit = db.prepare(
    `INSERT INTO habits (user_id, category_id, name, description, color, target_per_week, start_date, end_date, archived)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertEntry = db.prepare(
    'INSERT OR IGNORE INTO entries (habit_id, user_id, date, note) VALUES (?, ?, ?, ?)'
  );
  const insertNote = db.prepare(
    'INSERT INTO notes (habit_id, user_id, body, created_at) VALUES (?, ?, ?, ?)'
  );

  const ENTRY_NOTES = [
    'Felt great today.',
    'Tough one, but done.',
    'Almost skipped — glad I didn’t.',
    'Easy win.',
    'Did it first thing in the morning.',
  ];

  for (const h of HABIT_SEED) {
    const startKey = addDaysKey(today, -h.start);
    const endKey = h.end != null ? addDaysKey(today, h.end) : null;
    const habitId = Number(
      insertHabit.run(
        userId,
        catIds[h.category] ?? null,
        h.name,
        h.description,
        h.color,
        h.target,
        startKey,
        endKey,
        h.archived ? 1 : 0
      ).lastInsertRowid
    );

    const lastKey = endKey && endKey < today ? endKey : today;
    for (let d = 0; d <= (h.end != null ? h.start + h.end : h.start); d += 1) {
      const key = addDaysKey(startKey, d);
      if (key > lastKey) break;
      const dow = new Date(`${key}T12:00:00`).getDay();
      if (h.daysOnly && !h.daysOnly.includes(dow)) continue;
      let p = h.p * (h.week?.[dow] ?? 1);
      if (p > 0.97) p = 0.97;
      // Slight upward trend: newer days a bit more consistent ("improvement").
      p = Math.min(0.97, p + (d / Math.max(h.start, 1)) * 0.08);
      if (rand() < p) {
        const note = rand() < 0.07 ? ENTRY_NOTES[Math.floor(rand() * ENTRY_NOTES.length)] : '';
        insertEntry.run(habitId, userId, key, note);
      }
    }

    // Progress notes spread over the habit's lifetime
    (h.notes ?? []).forEach((body, i) => {
      const daysAgo = Math.max(3, Math.round(((i + 1) / ((h.notes?.length ?? 0) + 1)) * Math.min(h.start, 45)));
      const created = `${addDaysKey(today, -daysAgo)} 18:${String(10 + i * 13).padStart(2, '0')}:00`;
      insertNote.run(habitId, userId, body, created);
    });
  }

  // ---- reflections ----------------------------------------------------------
  const insRef = db.prepare(
    `INSERT INTO reflections (user_id, month, highlights, challenges, learnings, next_focus, rating, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const r of REFLECTION_SEED) {
    const mk = shiftMonth(monthKeyOf(), r.offset);
    const stamp = `${mk}-28 20:30:00`;
    insRef.run(userId, mk, r.highlights, r.challenges, r.learnings, r.next_focus, r.rating, stamp, stamp);
  }

  // ---- user challenges -------------------------------------------------------
  const insUc = db.prepare(
    'INSERT INTO user_challenges (user_id, challenge_id, status, started_at, ended_at) VALUES (?, ?, ?, ?, ?)'
  );
  // Morning Walk — active, started 9 days ago
  insUc.run(userId, challengeIds[0], 'active', addDaysKey(today, -9), null);
  // Digital Sunset — active, started 4 days ago
  insUc.run(userId, challengeIds[3], 'active', addDaysKey(today, -4), null);
  // Hydration — completed two weeks ago
  insUc.run(
    userId,
    challengeIds[5],
    'completed',
    addDaysKey(today, -30),
    addDaysKey(today, -16)
  );
  // No-Sugar Sprint — abandoned in week one of last month
  insUc.run(
    userId,
    challengeIds[1],
    'abandoned',
    addDaysKey(today, -55),
    addDaysKey(today, -49)
  );

  return { userId };
}

/** Starter categories for brand-new registered users. */
export function seedStarterCategories(db, userId) {
  const ins = db.prepare('INSERT OR IGNORE INTO categories (user_id, name, color) VALUES (?, ?, ?)');
  for (const c of CATEGORY_SEED.slice(0, 4)) ins.run(userId, c.name, c.color);
}
