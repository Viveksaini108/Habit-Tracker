import crypto from 'node:crypto';
import { ok, fail, isEmail, normalizeEmail } from '@/lib/api';
import { findUserByEmail, createPasswordReset } from '@/lib/data';
import { sendPasswordResetEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

const RESET_TTL_MINUTES = 30;
const THROTTLE_MS = 60_000;

/** Naive per-email throttle so the endpoint can't be used as a mail cannon. */
const lastRequestAt = new Map();

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body');
  }

  const email = normalizeEmail(body.email);
  if (!isEmail(email)) return fail('Please enter a valid email address');

  const now = Date.now();
  if (lastRequestAt.size > 5000) lastRequestAt.clear();
  const throttled = now - (lastRequestAt.get(email) || 0) < THROTTLE_MS;
  lastRequestAt.set(email, now);

  const user = findUserByEmail(email);

  // Always answer the same way — never reveal whether an account exists.
  if (!user || throttled) return ok({});

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(now + RESET_TTL_MINUTES * 60_000).toISOString();
  createPasswordReset(user.id, tokenHash, expiresAt);

  const url = `${new URL(request.url).origin}/reset?token=${token}`;

  try {
    const sent = await sendPasswordResetEmail({ to: email, name: user.name, url });
    if (!sent) {
      console.warn('[forgot] Email not configured — reset link for %s: %s', email, url);
      if (process.env.NODE_ENV !== 'production') {
        return ok({ devUrl: url, devNote: 'Email is not configured — here is your reset link (dev mode)' });
      }
    }
  } catch (err) {
    console.error('[forgot] Could not send reset email:', err.message);
    if (process.env.NODE_ENV !== 'production') {
      return ok({ devUrl: url, devNote: `Email failed to send (${err.message}) — here is your reset link (dev mode)` });
    }
  }

  return ok({});
}
