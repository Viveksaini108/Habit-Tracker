import { ok, fail, guard, asInt, isDateKey, cleanText } from '@/lib/api';
import { getHabit, setEntry } from '@/lib/api-helpers';
import { getEntryMap, currentStreak, inWindow } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
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

  const date = body.date;
  if (!isDateKey(date)) return fail('date must be YYYY-MM-DD');
  const completed = !!body.completed;
  const note = cleanText(body.note ?? '', 200);

  if (completed && !inWindow(habit, date)) {
    return fail('This date is outside the habit’s active window');
  }

  setEntry(user.id, id, date, completed, note);

  const entryMap = getEntryMap(user.id);
  const set = entryMap.get(id) ?? new Set();
  return ok({
    date,
    completed,
    streak: currentStreak(habit, set),
    total: [...set].filter((k) => inWindow(habit, k)).length,
  });
}
