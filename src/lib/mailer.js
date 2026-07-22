import nodemailer from 'nodemailer';

/**
 * Outgoing mail via a free Gmail account + App Password
 * (Google Account → Security → 2-Step Verification → App passwords).
 *
 *   EMAIL_USER          you@gmail.com
 *   EMAIL_APP_PASSWORD  the 16-character app password
 *
 * When unset, mail is "not configured": /api/auth/forgot still behaves
 * identically to users, and returns a dev reset link outside production.
 */
export function mailConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD);
}

let transporter = null;

function getTransporter() {
  if (!mailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        // Google displays app passwords with spaces; strip them just in case.
        pass: String(process.env.EMAIL_APP_PASSWORD).replace(/\s+/g, ''),
      },
    });
  }
  return transporter;
}

/** Returns true if the email was handed to Gmail, false when unconfigured. */
export async function sendPasswordResetEmail({ to, name, url }) {
  const t = getTransporter();
  if (!t) return false;

  const greeting = name ? `Hi ${name},` : 'Hi there,';
  const text = [
    greeting,
    '',
    'Someone (hopefully you) asked to reset your HabitFlow password.',
    'Open this link within 30 minutes to choose a new one:',
    '',
    url,
    '',
    "If it wasn't you, you can ignore this email — your password stays the same.",
    '',
    '— the HabitFlow team',
  ].join('\n');

  const html = `
  <div style="margin:0;padding:24px;background:#f4f3fb;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1e1e2f">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e6e5f5">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;letter-spacing:.08em;color:#6366f1;text-transform:uppercase">HabitFlow</p>
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3">Reset your password</h1>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.6">${greeting}</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6">
        Someone (hopefully you) asked to reset your HabitFlow password.
        This link is valid for <strong>30 minutes</strong>:
      </p>
      <p style="margin:0 0 24px;text-align:center">
        <a href="${url}" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 28px;border-radius:999px">Choose a new password</a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#6b6b85">
        Button not working? Paste this link into your browser:<br />
        <a href="${url}" style="color:#6366f1;word-break:break-all">${url}</a>
      </p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#6b6b85">
        If it wasn&rsquo;t you, you can ignore this email &mdash; your password stays the same.
      </p>
    </div>
    <p style="max-width:520px;margin:12px auto 0;font-size:11px;color:#9a9ab0;text-align:center">
      You received this because an account exists for this address on HabitFlow.
    </p>
  </div>`.trim();

  await t.sendMail({
    from: `HabitFlow <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your HabitFlow password',
    text,
    html,
  });
  return true;
}
