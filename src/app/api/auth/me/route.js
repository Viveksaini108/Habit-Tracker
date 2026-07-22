import { ok, fail } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail('Not authenticated', 401);
  return ok({ user });
}
