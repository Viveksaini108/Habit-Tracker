import { NextResponse } from 'next/server';
import { getCurrentUser } from './session.js';

export const ok = (data = {}) => NextResponse.json({ ok: true, ...data });

export const fail = (error, status = 400) =>
  NextResponse.json({ ok: false, error }, { status });

/** Returns { user } or { response } — use in every protected route. */
export async function guard() {
  const user = await getCurrentUser();
  if (!user) return { response: fail('Not authenticated', 401) };
  return { user };
}

export const asInt = (v, fallback = null) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

export const cleanText = (v, max = 500) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

export const isDateKey = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

export const isMonthKey = (v) => typeof v === 'string' && /^\d{4}-\d{2}$/.test(v);

export const isHexColor = (v) => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);

/** Practical email format check used by auth routes + client forms. */
export { EMAIL_RE, isEmail, normalizeEmail } from './email.js';
