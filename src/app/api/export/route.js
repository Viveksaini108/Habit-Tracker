import { guard } from '@/lib/api';
import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Full JSON export of everything the user owns. */
export async function GET() {
  const { user, response } = await guard();
  if (!user) return response;

  const db = getDb();
  const exportData = {
    app: 'HabitFlow',
    exported_at: new Date().toISOString(),
    user: db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(user.id),
    categories: db.prepare('SELECT * FROM categories WHERE user_id = ?').all(user.id),
    habits: db.prepare('SELECT * FROM habits WHERE user_id = ?').all(user.id),
    entries: db.prepare('SELECT * FROM entries WHERE user_id = ? ORDER BY date').all(user.id),
    notes: db.prepare('SELECT * FROM notes WHERE user_id = ?').all(user.id),
    reflections: db.prepare('SELECT * FROM reflections WHERE user_id = ? ORDER BY month').all(user.id),
    challenges: db.prepare('SELECT * FROM user_challenges WHERE user_id = ?').all(user.id),
  };
  for (const key of Object.keys(exportData)) {
    if (Array.isArray(exportData[key])) {
      exportData[key] = exportData[key].map((r) => ({ ...r }));
    }
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="habitflow-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
