import { ok, fail, guard, cleanText } from '@/lib/api';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { user, response } = await guard();
  if (!user) return response;
  const row = getDb().prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(user.id);
  return ok({ profile: { ...row } });
}

export async function PATCH(request) {
  const { user, response } = await guard();
  if (!user) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body');
  }

  const name = cleanText(body.name, 80);
  if (name.length < 2) return fail('Name must be at least 2 characters');

  getDb().prepare('UPDATE users SET name = ? WHERE id = ?').run(name, user.id);

  // Keep the session cookie in sync so the UI greeting updates immediately.
  const session = await getSession();
  session.name = name;
  await session.save();

  return ok({ profile: { id: user.id, name, email: user.email } });
}
