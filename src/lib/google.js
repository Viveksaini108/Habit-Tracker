import { OAuth2Client } from 'google-auth-library';

/**
 * Google sign-in (Phase 1 — web). The browser's "Sign in with Google"
 * button produces an ID token (JWT); we verify it locally against Google's
 * keys and this app's client id. One env var powers everything:
 *
 *   GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
 *
 * Free: Google Cloud OAuth consent screen + Web OAuth client, no billing.
 */

let client;

export function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID || '';
}

/**
 * Verify an ID token from the Google button.
 * Returns the token payload ({ sub, email, name, email_verified, ... }).
 * Throws on any signature / audience / expiry problem.
 */
export async function verifyGoogleCredential(credential) {
  const clientId = getGoogleClientId();
  if (!clientId) throw new Error('Google sign-in is not configured');
  if (!client) client = new OAuth2Client(clientId);

  const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload?.email) throw new Error('Google token is missing identity fields');
  return payload;
}
