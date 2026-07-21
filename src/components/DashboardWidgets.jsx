import Link from 'next/link';
import { ProgressBar } from './ui';
import { ICON_MAP, IconTrophy, IconChevronRight } from './icons';
import { prettyDateTime } from '@/lib/dates';

/** Pure-CSS weekly bars (no chart lib needed on the dashboard). */
export function WeekGlance({ week }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">This week at a glance</h3>
        <Link href="/analytics" className="inline-flex items-center gap-0.5 text-xs font-semibold text-accent hover:text-accent-strong">
          Full report <IconChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="flex items-end justify-between gap-1.5 sm:gap-2">
        {week.map((d) => (
          <div key={d.key} className="group flex flex-1 flex-col items-center gap-1.5">
            <div
              className="flex h-28 w-full items-end rounded-lg bg-soft2/80 p-0.5"
              title={`${d.done}/${d.active} habits (${d.pct}%)`}
            >
              <div
                className={`w-full rounded-md transition-all duration-500 group-hover:opacity-80 ${d.isToday ? 'ring-2 ring-accent/70 ring-offset-1' : ''}`}
                style={{
                  height: `${Math.max(d.pct, 4)}%`,
                  backgroundColor:
                    d.pct >= 80
                      ? '#10b981'
                      : d.pct >= 50
                        ? 'rgb(var(--accent))'
                        : d.done > 0
                          ? 'rgb(var(--accent) / 0.45)'
                          : 'rgb(var(--line))',
                }}
              />
            </div>
            <span className={`text-[10px] font-bold uppercase ${d.isToday ? 'text-accent' : 'text-faint'}`}>
              {d.day.slice(0, 3)}
            </span>
            <span className="tnum text-[10px] text-faint">
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
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
        <span className="text-base">💡</span> Personalized insights
      </h3>
      <div className="space-y-3">
        {insights.map((ins) => {
          const Icon = ICON_MAP[ins.icon] ?? ICON_MAP.sparkles;
          return (
            <div
              key={ins.title}
              className="rounded-xl border border-line-soft bg-soft/60 p-3.5 transition hover:border-accent/30 hover:bg-accent/5"
            >
              <p className="flex items-center gap-2 text-sm font-bold text-ink2">
                <span className="text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                {ins.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{ins.body}</p>
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
        <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
          <span className="text-amber-500">
            <IconTrophy className="h-4 w-4" />
          </span>
          Active challenges
        </h3>
        <Link href="/challenges" className="inline-flex items-center gap-0.5 text-xs font-semibold text-accent hover:text-accent-strong">
          View all <IconChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {challenges.length ? (
        <div className="space-y-3">
          {challenges.map((c) => (
            <div key={c.uc_id} className="rounded-xl border border-line-soft p-3.5 transition hover:border-line">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-ink2">{c.title}</p>
                <span className="tnum shrink-0 text-xs font-bold text-accent">{c.progress}%</span>
              </div>
              <ProgressBar value={c.progress} color="#f59e0b" className="mt-2" />
              <p className="mt-1.5 text-[11px] text-faint">
                Day {c.elapsed} of {c.duration_days} · {c.daysLeft} left
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-soft px-3.5 py-4 text-center text-xs text-muted">
          No active challenges.{' '}
          <Link href="/challenges" className="font-semibold text-accent hover:text-accent-strong">
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
      <h3 className="mb-3 text-sm font-bold text-ink">Latest progress notes</h3>
      <div className="space-y-3">
        {notes.map((n) => (
          <Link
            key={n.id}
            href={`/habits/${n.habit_id}`}
            className="block rounded-xl border border-line-soft p-3.5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accent/5"
          >
            <p className="flex items-center gap-2 text-xs font-bold text-ink2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: n.habit_color }} />
              {n.habit_name}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{n.body}</p>
            <p className="mt-1 text-[11px] text-faint">{prettyDateTime(n.created_at)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
