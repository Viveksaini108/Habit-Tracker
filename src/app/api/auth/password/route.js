import bcrypt from 'bcryptjs';
import { ok, fail, guard } from '@/lib/api';
import { findUserByEmail, updateUserPassword, deletePasswordResetsForUser } from '@/lib/data';

export const dynamic = 'force-dynamic';

/**
 * Change password (accounts with a password) or set one for the first time
 * (accounts created via Google sign-in have no password yet — an active
 * session is proof enough to let them set one).
 */
export async function POST(request) {
  const { user, response } = await guard();
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body');
  }

  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

  if (newPassword.length < 8) return fail('New password must be at least 8 characters');

  const account = findUserByEmail(user.email);
  if (!account) return fail('Account not found', 404);

  if (account.password_hash) {
    if (!currentPassword) return fail('Please enter your current password');
    if (!bcrypt.compareSync(currentPassword, account.password_hash)) {
      return fail('Your current password is incorrect', 401);
    }
  }

  updateUserPassword(user.id, bcrypt.hashSync(newPassword, 10));
  deletePasswordResetsForUser(user.id); // any outstanding reset links die here

  return ok({ hadPassword: Boolean(account.password_hash) });
}
