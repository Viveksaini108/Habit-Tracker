import { ok, guard } from '@/lib/api';
import { listReflections } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { user, response } = await guard();
  if (!user) return response;
  return ok({ reflections: listReflections(user.id) });
}
