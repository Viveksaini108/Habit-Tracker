import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { seedDatabase } from './seed.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT NOT NULL DEFAULT 'dot',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#6366f1',
  target_per_week INTEGER NOT NULL DEFAULT 7,
  start_date TEXT NOT NULL,
  end_date TEXT,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(habit_id, date)
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reflections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  highlights TEXT NOT NULL DEFAULT '',
  challenges TEXT NOT NULL DEFAULT '',
  learnings TEXT NOT NULL DEFAULT '',
  next_focus TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 3,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, month)
);

CREATE TABLE IF NOT EXISTS challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Wellness',
  duration_days INTEGER NOT NULL DEFAULT 21,
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  tips TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS user_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TEXT NOT NULL,
  ended_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id, archived);
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_entries_habit ON entries(habit_id);
CREATE INDEX IF NOT EXISTS idx_notes_habit ON notes(habit_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenges(user_id, status);
`;

const globalRef = globalThis;

/**
 * Lazily open (and memoize) the SQLite database.
 * Lazy so that `next build` never creates the data directory.
 */
export function getDb() {
  if (globalRef.__habitflowDb) return globalRef.__habitflowDb;

  const dataDir = path.join(process.cwd(), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, 'habitflow.db'));
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);

  // Seed on first boot so the app "feels alive" immediately.
  // "Virgin" = no users AND no challenge library — so a database seeded with
  // SEED_DEMO=0, or one whose demo account was later removed, never triggers
  // a re-seed (which would also duplicate the challenge library).
  const users = Number(db.prepare('SELECT COUNT(*) AS c FROM users').get().c);
  const challenges = Number(db.prepare('SELECT COUNT(*) AS c FROM challenges').get().c);
  if (users === 0 && challenges === 0) {
    seedDatabase(db);
  }

  globalRef.__habitflowDb = db;
  return db;
}

/** Reset the database (used by `npm run seed`). */
export function resetDb() {
  const dataDir = path.join(process.cwd(), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, 'habitflow.db'));
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(`
    DROP TABLE IF EXISTS user_challenges;
    DROP TABLE IF EXISTS challenges;
    DROP TABLE IF EXISTS reflections;
    DROP TABLE IF EXISTS notes;
    DROP TABLE IF EXISTS entries;
    DROP TABLE IF EXISTS habits;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS users;
  `);
  db.exec(SCHEMA);
  seedDatabase(db);
  db.close();
}
