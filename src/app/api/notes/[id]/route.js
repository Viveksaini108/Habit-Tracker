import { ok, fail, guard, asInt, cleanText } from '@/lib/api';
import { updateNote, deleteNote } from '@/lib/api-helpers';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

function ownNote(userId, id) {
  return getDb().prepare('SELECT id FROM notes WHERE id = ? AND user_id = ?').get(id, userId);
}

export async function PATCH(request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  const id = asInt(params.id);
  if (!ownNote(user.id, id)) return fail('Note not found', 404);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body');
  }
  const text = cleanText(body.body, 500);
  if (!text) return fail('Note text is required');
  updateNote(user.id, id, text);
  return ok();
}

export async function DELETE(_request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  const id = asInt(params.id);
  if (!ownNote(user.id, id)) return fail('Note not found', 404);
  deleteNote(user.id, id);
  return ok();
}
