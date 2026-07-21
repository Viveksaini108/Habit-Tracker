import { ok, guard } from '@/lib/api';
import { listChallengeState } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { user, response } = await guard();
  if (!user) return response;
  return ok(listChallengeState(user.id));
}
