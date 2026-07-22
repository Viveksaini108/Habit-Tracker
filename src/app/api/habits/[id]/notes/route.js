import { ok, fail, guard, asInt, cleanText } from '@/lib/api';
import { getHabit, createNote, listNotes } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  const id = asInt(params.id);
  if (!getHabit(user.id, id)) return fail('Habit not found', 404);
  return ok({ notes: listNotes(user.id, id) });
}

export async function POST(request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  const id = asInt(params.id);
  if (!getHabit(user.id, id)) return fail('Habit not found', 404);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body');
  }
  const text = cleanText(body.body, 500);
  if (!text) return fail('Note text is required');

  const note = createNote(user.id, id, text);
  return ok({ note: { ...note } });
}
