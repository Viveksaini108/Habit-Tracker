/** Practical email format check (no deps, safe for client bundles). */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmail = (v) => typeof v === 'string' && EMAIL_RE.test(v.trim());
export const normalizeEmail = (v) => (typeof v === 'string' ? v.trim().toLowerCase().slice(0, 120) : '');
