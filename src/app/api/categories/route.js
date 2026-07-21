import { ok, fail, guard, cleanText, isHexColor } from '@/lib/api';
import { listCategories, createCategory } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { user, response } = await guard();
  if (!user) return response;
  return ok({ categories: listCategories(user.id) });
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
  const name = cleanText(body.name, 40);
  if (name.length < 2) return fail('Category name is required (min 2 characters)');
  if (!isHexColor(body.color ?? '')) return fail('Pick a color');

  const { id, error } = createCategory(user.id, { name, color: body.color });
  if (error) return fail(error, 409);
  return ok({ id });
}
