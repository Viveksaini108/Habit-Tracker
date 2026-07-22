/**
 * Remove the demo account (and only its data) from an existing database.
 * Usage:
 *   node scripts/remove-demo.mjs
 *
 * On hosted deployments prefer the SEED_DEMO=0 env var — new databases will
 * then skip the demo account entirely. On hosts with ephemeral disks
 * (e.g. Render free tier), that + a redeploy is all you need.
 */
import { getDb } from '../src/lib/db.js';

const DEMO_EMAIL = 'demo@habitflow.app';
const db = getDb();

const demo = db.prepare('SELECT id, name FROM users WHERE email = ?').get(DEMO_EMAIL);
if (!demo) {
  console.log('ℹ️  No demo account found — nothing to do.');
  process.exit(0);
}

db.exec('BEGIN');
try {
  for (const table of ['entries', 'notes', 'reflections', 'user_challenges', 'habits', 'categories']) {
    db.prepare(`DELETE FROM ${table} WHERE user_id = ?`).run(demo.id);
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(demo.id);
  db.exec('COMMIT');
} catch (err) {
  db.exec('ROLLBACK');
  throw err;
}

console.log(`✅ Removed demo account "${demo.name}" <${DEMO_EMAIL}> and all of its data.`);
console.log('   Other users and the challenge library were left untouched.');
