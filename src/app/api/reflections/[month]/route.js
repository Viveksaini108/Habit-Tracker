import { ok, fail, guard, isMonthKey, cleanText, asInt } from '@/lib/api';
import { upsertReflection, deleteReflection, getReflection } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  if (!isMonthKey(params.month)) return fail('Invalid month');
  return ok({ reflection: getReflection(user.id, params.month) });
}

export async function PUT(request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  if (!isMonthKey(params.month)) return fail('Invalid month');

  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body');
  }

  const rating = Math.max(1, Math.min(5, asInt(body.rating, 3)));
  const reflection = upsertReflection(user.id, params.month, {
    highlights: cleanText(body.highlights, 2000),
    challenges: cleanText(body.challenges, 2000),
    learnings: cleanText(body.learnings, 2000),
    next_focus: cleanText(body.next_focus, 2000),
    rating,
  });
  return ok({ reflection });
}

export async function DELETE(_request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  if (!isMonthKey(params.month)) return fail('Invalid month');
  deleteReflection(user.id, params.month);
  return ok();
}
