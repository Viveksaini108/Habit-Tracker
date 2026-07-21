/**
 * Reset + reseed the demo database.
 * Usage: npm run seed
 */
import { resetDb } from '../src/lib/db.js';

resetDb();
console.log('✅ Database reseeded.');
console.log('   Demo login: demo@habitflow.app / demo1234');
