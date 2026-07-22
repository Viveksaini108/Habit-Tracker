import { ok, fail, cleanText } from '@/lib/api';
import { findUserByEmail, createUser } from '@/lib/data';
import { getDb } from '@/lib/db';
import { seedStarterCategories } from '@/lib/seed';
import { getSession, signIn } from '@/lib/session';
import { verifyGoogleCredential, getGoogleClientId } from '@/lib/google';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!getGoogleClientId()) {
    return fail('Google sign-in is not configured on this server', 501);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body');
  }
  const credential = typeof body.credential === 'string' ? body.credential : '';
  if (!credential) return fail('Missing Google credential');

  let payload;
  try {
    payload = await verifyGoogleCredential(credential);
  } catch {
    return fail('Could not verify your Google account — please try again', 401);
  }
  if (!payload.email_verified) {
    return fail('Please verify your email address with Google first', 403);
  }

  const email = String(payload.email).trim().toLowerCase().slice(0, 120);
  const name = cleanText(payload.name, 80) || email.split('@')[0];

  // Find-or-create: Google sign-in doubles as sign-up (verified email).
  let user = findUserByEmail(email);
  if (!user) {
    user = createUser({
      name,
      email,
      // No password — the account authenticates via Google. The user can
      // set one later from Settings ("Set a password") or "Forgot password".
      passwordHash: null,
    });
    seedStarterCategories(getDb(), user.id);
  }

  const session = await getSession();
  await signIn(session, { id: user.id, name: user.name, email: user.email });

  return ok({ user: { id: user.id, name: user.name, email: user.email } });
}
