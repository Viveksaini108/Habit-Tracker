import bcrypt from 'bcryptjs';
import { ok, fail, isEmail, normalizeEmail } from '@/lib/api';
import { findUserByEmail } from '@/lib/data';
import { getSession, signIn } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body');
  }

  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) return fail('Email and password are required');
  if (!isEmail(email)) return fail('Please enter a valid email address');

  const user = findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return fail('Invalid email or password', 401);
  }

  const session = await getSession();
  await signIn(session, { id: user.id, name: user.name, email: user.email });

  return ok({ user: { id: user.id, name: user.name, email: user.email } });
}
