import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { ok, fail } from '@/lib/api';
import {
  findPasswordResetByTokenHash,
  updateUserPassword,
  deletePasswordResetsForUser,
} from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body');
  }

  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!token) return fail('Missing reset token');
  if (password.length < 8) return fail('Password must be at least 8 characters');

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const row = findPasswordResetByTokenHash(tokenHash);

  if (!row || new Date(row.expires_at).getTime() <= Date.now()) {
    return fail('This reset link is invalid or has expired — please request a new one', 400);
  }

  updateUserPassword(row.user_id, bcrypt.hashSync(password, 10));
  deletePasswordResetsForUser(row.user_id); // single-use

  return ok({});
}
