import { ok, fail, guard, asInt } from '@/lib/api';
import { setUserChallengeStatus, leaveChallenge } from '@/lib/api-helpers';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const VALID = new Set(['active', 'completed', 'abandoned']);

function owns(userId, id) {
  return getDb().prepare('SELECT id FROM user_challenges WHERE id = ? AND user_id = ?').get(id, userId);
}

export async function PATCH(request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  const id = asInt(params.id);
  if (!owns(user.id, id)) return fail('Challenge not found', 404);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body');
  }
  if (!VALID.has(body.status)) return fail('Invalid status');

  // Restarting sets a fresh start date.
  if (body.status === 'active') {
    getDb()
      .prepare("UPDATE user_challenges SET status = 'active', started_at = ?, ended_at = NULL WHERE id = ? AND user_id = ?")
      .run(new Date().toISOString().slice(0, 10), id, user.id);
  } else {
    setUserChallengeStatus(user.id, id, body.status);
  }
  return ok();
}

export async function DELETE(_request, { params }) {
  const { user, response } = await guard();
  if (!user) return response;
  const id = asInt(params.id);
  if (!owns(user.id, id)) return fail('Challenge not found', 404);
  leaveChallenge(user.id, id);
  return ok();
}
