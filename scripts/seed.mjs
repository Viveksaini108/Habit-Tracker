/**
 * Reset + reseed the demo database.
 * Usage: npm run seed
 */
import { resetDb } from '../src/lib/db.js';

resetDb();
console.log('✅ Database reseeded.');
if (process.env.SEED_DEMO === '0') {
  console.log('   Demo account skipped (SEED_DEMO=0) — challenge library seeded only.');
} else {
  console.log('   Demo login: demo@habitflow.app / demo1234');
}
