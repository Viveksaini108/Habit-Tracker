import { ok, fail, guard } from '@/lib/api';
import { listHabits, createHabit, getCategoryOwner } from '@/lib/api-helpers';
import { getEntryMap, habitStats } from '@/lib/data';
import { habitPayload } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { user, response } = await guard();
  if (!user) return response;

  const habits = listHabits(user.id, { includeArchived: true });
  const entryMap = getEntryMap(user.id);
  return ok({
    habits: habits.map((h) => ({ ...h, stats: habitStats(h, entryMap) })),
  });
}

export async function POST(request) {
  const { user, response } = await guard();
  if (!user) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body');
  }

  const { data, error } = habitPayload(body);
  if (error) return fail(error);

  if (data.category_id && !getCategoryOwner(user.id, data.category_id)) {
    return fail('Category not found', 404);
  }

  if (!data.start_date) data.start_date = new Date().toISOString().slice(0, 10);
  const { id } = createHabit(user.id, data);
  return ok({ id });
}
