import Link from 'next/link';
import { ProgressBar } from './ui';
import { ICON_MAP, IconTrophy, IconChevronRight } from './icons';
import { prettyDateTime } from '@/lib/dates';

/** Pure-CSS weekly bars (no chart lib needed on the dashboard). */
export function WeekGlance({ week }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">This week at a glance</h3>
        <Link href="/analytics" className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-600 hover:text-brand-700">
          Full report <IconChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="flex items-end justify-between gap-1.5 sm:gap-2">
        {week.map((d) => (
          <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="flex h-28 w-full items-end rounded-lg bg-slate-100/80 p-0.5"
              title={`${d.done}/${d.active} habits (${d.pct}%)`}
            >
              <div
                className={`w-full rounded-md transition-all duration-500 ${d.isToday ? 'ring-2 ring-brand-400 ring-offset-1' : ''}`}
                style={{
                  height: `${Math.max(d.pct, 4)}%`,
                  backgroundColor: d.pct >= 80 ? '#10b981' : d.pct >= 50 ? '#6366f1' : d.done > 0 ? '#a5b4fc' : '#e2e8f0',
                }}
              />
            </div>
            <span className={`text-[10px] font-bold uppercase ${d.isToday ? 'text-brand-600' : 'text-slate-400'}`}>
              {d.day.slice(0, 3)}
            </span>
            <span className="tnum text-[10px] text-slate-400">
              {d.done}/{d.active}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InsightsPanel({ insights }) {
  if (!insights?.length) return null;
  return (
    <div className="card p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
        <span className="text-base">💡</span> Personalized insights
      </h3>
      <div className="space-y-3">
        {insights.map((ins) => {
          const Icon = ICON_MAP[ins.icon] ?? ICON_MAP.sparkles;
          return (
            <div key={ins.title} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <span className="text-brand-500">
                  <Icon className="h-4 w-4" />
                </span>
                {ins.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{ins.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ActiveChallenges({ challenges }) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="text-amber-500">
            <IconTrophy className="h-4 w-4" />
          </span>
          Active challenges
        </h3>
        <Link href="/challenges" className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-600 hover:text-brand-700">
          View all <IconChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {challenges.length ? (
        <div className="space-y-3">
          {challenges.map((c) => (
            <div key={c.uc_id} className="rounded-xl border border-slate-100 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-slate-800">{c.title}</p>
                <span className="tnum shrink-0 text-xs font-bold text-brand-600">{c.progress}%</span>
              </div>
              <ProgressBar value={c.progress} color="#f59e0b" className="mt-2" />
              <p className="mt-1.5 text-[11px] text-slate-400">
                Day {c.elapsed} of {c.duration_days} · {c.daysLeft} left
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-slate-50 px-3.5 py-4 text-center text-xs text-slate-500">
          No active challenges.{' '}
          <Link href="/challenges" className="font-semibold text-brand-600 hover:text-brand-700">
            Find one to join →
          </Link>
        </p>
      )}
    </div>
  );
}

export function RecentNotes({ notes }) {
  if (!notes.length) return null;
  return (
    <div className="card p-5">
      <h3 className="mb-3 text-sm font-bold text-slate-900">Latest progress notes</h3>
      <div className="space-y-3">
        {notes.map((n) => (
          <Link key={n.id} href={`/habits/${n.habit_id}`} className="block rounded-xl border border-slate-100 p-3.5 transition hover:border-brand-200 hover:bg-brand-50/40">
            <p className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: n.habit_color }} />
              {n.habit_name}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{n.body}</p>
            <p className="mt-1 text-[11px] text-slate-400">{prettyDateTime(n.created_at)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
