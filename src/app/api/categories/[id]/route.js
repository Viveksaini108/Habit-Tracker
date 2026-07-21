import { ok, fail, guard, asInt, cleanText, isHexColor } from '@/lib/api';
import { updateCategory, deleteCategory, getCategoryOwner } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  const id = asInt(params.id);
  if (!getCategoryOwner(user.id, id)) return fail('Category not found', 404);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body');
  }
  const name = cleanText(body.name, 40);
  if (name.length < 2) return fail('Category name is required (min 2 characters)');
  if (!isHexColor(body.color ?? '')) return fail('Pick a color');

  updateCategory(user.id, id, { name, color: body.color });
  return ok();
}

export async function DELETE(_request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  const id = asInt(params.id);
  if (!getCategoryOwner(user.id, id)) return fail('Category not found', 404);
  deleteCategory(user.id, id); // habits keep their data, category becomes "Uncategorized"
  return ok();
}
