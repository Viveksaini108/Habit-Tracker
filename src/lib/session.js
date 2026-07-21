import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

const PASSWORD =
  process.env.SESSION_SECRET ||
  'habitflow-dev-secret-please-override-in-production!';

export const sessionOptions = {
  password: PASSWORD,
  cookieName: 'habitflow_session',
  ttl: 60 * 60 * 24 * 30, // 30 days
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' && process.env.INSECURE_COOKIES !== '1'
      ? false // many self-hosted/demo deploys run over http behind proxies; allow unless explicitly forced
      : false,
    path: '/',
  },
};

export async function getSession() {
  const store = cookies();
  return getIronSession(store, sessionOptions);
}

/** Current authenticated user (from the session cookie) or null. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  return { id: Number(session.userId), name: session.name, email: session.email };
}

export async function signIn(session, user) {
  session.userId = user.id;
  session.name = user.name;
  session.email = user.email;
  await session.save();
}

export async function signOut(session) {
  session.destroy();
}
