import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-soft2 px-4 text-center">
      <p className="text-6xl">🧭</p>
      <h1 className="mt-4 text-2xl font-extrabold text-ink">This page took a day off</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex h-10 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-strong"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
