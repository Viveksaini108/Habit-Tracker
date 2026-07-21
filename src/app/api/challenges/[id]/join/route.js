import { ok, fail, guard, asInt } from '@/lib/api';
import { joinChallenge } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function POST(_request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  const id = asInt(params.id);
  if (!id) return fail('Invalid challenge');
  const { id: ucId, error } = joinChallenge(user.id, id);
  if (error) return fail(error, 409);
  return ok({ id: ucId });
}
