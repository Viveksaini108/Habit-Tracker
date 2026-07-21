// Thin wrappers kept separate so route modules stay tidy.
export {
  listHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  setEntry,
  listEntryRows,
  createNote,
  updateNote,
  deleteNote,
  listNotes,
  createCategory,
  updateCategory,
  deleteCategory,
  listCategories,
  listReflections,
  getReflection,
  upsertReflection,
  deleteReflection,
  listChallengeState,
  joinChallenge,
  setUserChallengeStatus,
  leaveChallenge,
  analyticsData,
  dashboardData,
} from './data.js';

import { getDb } from './db.js';

export function getCategoryOwner(userId, categoryId) {
  return getDb()
    .prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?')
    .get(categoryId, userId);
}
