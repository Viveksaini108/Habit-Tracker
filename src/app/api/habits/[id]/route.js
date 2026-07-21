import { ok, fail, guard, asInt } from '@/lib/api';
import { getHabit, updateHabit, deleteHabit, listEntryRows, listNotes, getCategoryOwner } from '@/lib/api-helpers';
import { getEntryMap, habitStats } from '@/lib/data';
import { habitPayload } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  const id = asInt(params.id);
  const habit = getHabit(user.id, id);
  if (!habit) return fail('Habit not found', 404);

  const entryMap = getEntryMap(user.id);
  return ok({
    habit: { ...habit, stats: habitStats(habit, entryMap) },
    entries: listEntryRows(user.id, id),
    notes: listNotes(user.id, id),
  });
}

export async function PATCH(request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  const id = asInt(params.id);
  const habit = getHabit(user.id, id);
  if (!habit) return fail('Habit not found', 404);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body');
  }

  const { data, error } = habitPayload(body, { partial: true });
  if (error) return fail(error);

  if (data.category_id && !getCategoryOwner(user.id, data.category_id)) {
    return fail('Category not found', 404);
  }

  // Cross-field date check against the merged result.
  const start = data.start_date ?? habit.start_date;
  const end = data.end_date !== undefined ? data.end_date : habit.end_date;
  if (end && end < start) return fail('End date cannot be before the start date');

  updateHabit(user.id, id, data);
  return ok({ habit: getHabit(user.id, id) });
}

export async function DELETE(_request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  const id = asInt(params.id);
  if (!getHabit(user.id, id)) return fail('Habit not found', 404);
  deleteHabit(user.id, id);
  return ok();
}
