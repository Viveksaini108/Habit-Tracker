/** Practical email format check (no deps, safe for client bundles). */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmail = (v) => typeof v === 'string' && EMAIL_RE.test(v.trim());
export const normalizeEmail = (v) => (typeof v === 'string' ? v.trim().toLowerCase().slice(0, 120) : '');

/**
 * Registration is Gmail-only (keeps the user base on verified-looking
 * addresses and matches the "Sign in with Google" flow).
 * Gmail accepts dots and +aliases in the local part — both pass endsWith.
 */
export const isGmail = (v) => isEmail(v) && v.trim().toLowerCase().endsWith('@gmail.com');
