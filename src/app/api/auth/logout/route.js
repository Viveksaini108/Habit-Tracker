import { ok } from '@/lib/api';
import { getSession, signOut } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getSession();
  await signOut(session);
  return ok();
}
