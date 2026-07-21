import bcrypt from 'bcryptjs';
import { ok, fail, cleanText } from '@/lib/api';
import { findUserByEmail, createUser } from '@/lib/data';
import { getDb } from '@/lib/db';
import { seedStarterCategories } from '@/lib/seed';
import { getSession, signIn } from '@/lib/session';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body');
  }

  const name = cleanText(body.name, 80);
  const email = cleanText(body.email, 120).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';

  if (name.length < 2) return fail('Please enter your name (min 2 characters)');
  if (!EMAIL_RE.test(email)) return fail('Please enter a valid email address');
  if (password.length < 8) return fail('Password must be at least 8 characters');

  if (findUserByEmail(email)) return fail('An account with this email already exists', 409);

  const user = createUser({ name, email, passwordHash: bcrypt.hashSync(password, 10) });
  seedStarterCategories(getDb(), user.id);

  const session = await getSession();
  await signIn(session, user);

  return ok({ user });
}
