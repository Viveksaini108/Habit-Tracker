'use client';

import { useMemo, useState } from 'react';
import { TrendChart, CompletionBars, CategoryDonut } from './AnalyticsCharts';
import { Skeleton, StatCard } from './ui';
import {
  ICON_MAP, IconCheck, IconTrendingUp, IconSparkles, IconFlame,
  IconChevronLeft, IconChevronRight, IconCalendar,
} from './icons';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function MonthGrid({ heatmap }) {
  const firstDow = useMemo(() => {
    if (!heatmap.length) return 0;
    const d = new Date(`${heatmap[0].key}T12:00:00`);
    return (d.getDay() + 6) % 7; // 0 = Monday
  }, [heatmap]);

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-1 text-center text-[10px] font-bold uppercase text-faint">
            {d.slice(0, 2)}
          </span>
        ))}
        {Array.from({ length: firstDow }).map((_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {heatmap.map((d) => {
          const intensity = d.isFuture ? 0 : d.pct;
          return (
            <div
              key={d.key}
              title={`${d.key} — ${d.isFuture ? 'upcoming' : d.active ? `${d.pct}% complete` : 'no habits scheduled'}`}
              className="tnum flex aspect-square items-center justify-center rounded-md text-[10px] font-bold transition hover:ring-2 hover:ring-accent/50"
              style={{
                backgroundColor: d.isFuture
                  ? 'rgb(var(--soft))'
                  : intensity >= 80
                    ? 'rgb(var(--accent))'
                    : intensity >= 50
                      ? 'rgb(var(--accent) / 0.45)'
                      : intensity > 0
                        ? 'rgb(var(--accent) / 0.14)'
                        : 'rgb(var(--soft2))',
                color: intensity >= 80 && !d.isFuture ? '#fff' : intensity >= 50 ? 'rgb(var(--accent))' : 'rgb(var(--faint))',
                border: d.isFuture ? '1px dashed rgb(var(--line))' : 'none',
              }}
            >
              {d.dateNum}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsClient({ initialData, initialMonth }) {
  const [period, setPeriod] = useState('week');
  const [offset, setOffset] = useState(0);
  const [month, setMonth] = useState(initialMonth);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (p, o, m) => {
    setLoading(true);
    setError('');
    try {
      const qs = p === 'week' ? `period=week&offset=${o}` : `period=month&month=${m}`;
      const res = await fetch(`/api/stats?${qs}`);
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error);
      setData(json.data);
    } catch (e) {
      setError(e.message || 'Could not load analytics');
    } finally {
      setLoading(false);
    }
  };

  const switchPeriod = (p) => {
    if (p === period) return;
    setPeriod(p);
    load(p, offset, month);
  };
  const shiftWeek = (d) => {
    const next = Math.min(0, offset + d);
    setOffset(next);
    load('week', next, month);
  };
  const changeMonth = (m) => {
    if (!m) return;
    setMonth(m);
    load('month', offset, m);
  };

  const delta = data.totals.pct - data.prevPct;
  const bars = period === 'week' ? data.days : data.weeks ?? [];
  const barLabelKey = period === 'week' ? 'day' : 'label';

  return (
    <div>
      {/* Controls */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl bg-surface p-1 ring-1 ring-line">
          {['week', 'month'].map((p) => (
            <button
              key={p}
              onClick={() => switchPeriod(p)}
              className={`rounded-lg px-4 py-1.5 text-sm font-bold capitalize transition ${
                period === p ? 'bg-ink text-page shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {period === 'week' ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => shiftWeek(-1)}
              className="rounded-lg bg-surface p-2 text-muted ring-1 ring-line transition hover:text-ink"
              aria-label="Previous week"
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[150px] text-center text-sm font-bold text-ink2">
              {offset === 0 ? 'This week' : offset === -1 ? 'Last week' : `${-offset} weeks ago`}
            </span>
            <button
              onClick={() => shiftWeek(1)}
              disabled={offset === 0}
              className="rounded-lg bg-surface p-2 text-muted ring-1 ring-line transition hover:text-ink disabled:opacity-40"
              aria-label="Next week"
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4 text-faint" />
            <input
              type="month"
              className="input h-9 w-[170px] py-1"
              value={month}
              max={initialMonth}
              onChange={(e) => changeMonth(e.target.value)}
            />
          </div>
        )}

        <span className="ml-auto text-xs font-semibold text-faint">{data.label}</span>
      </div>

      {error ? <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}

      {/* Stat cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          icon={<IconTrendingUp className="h-5 w-5" />}
          label="Completion"
          value={`${data.totals.pct}%`}
          sub={
            delta === 0
              ? 'same as previous period'
              : `${delta > 0 ? '▲' : '▼'} ${Math.abs(delta)} pts vs previous ${data.period}`
          }
          accent="rgb(var(--accent))"
        />
        <StatCard
          icon={<IconCheck className="h-5 w-5" />}
          label="Check-ins"
          value={data.totals.done}
          sub={`of ${data.totals.active} scheduled`}
          accent="#10b981"
        />
        <StatCard
          icon={<IconSparkles className="h-5 w-5" />}
          label="Perfect days"
          value={data.perfectDays}
          sub="100% of scheduled habits"
          accent="#f59e0b"
        />
        <StatCard
          icon={<IconFlame className="h-5 w-5" />}
          label="Best streak ever"
          value={`${data.bestStreakAny}d`}
          sub="across all habits"
          accent="#f97316"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-1 text-sm font-bold text-ink">60-day completion trend</h3>
          <p className="mb-3 text-xs text-faint">Daily percentage of scheduled habits completed.</p>
          {loading ? <Skeleton className="h-[220px]" /> : <TrendChart data={data.trend} />}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-sm font-bold text-ink">
            {period === 'week' ? 'Completions by day' : 'Completions by week'}
          </h3>
          {loading ? <Skeleton className="h-[220px]" /> : <CompletionBars data={bars} labelKey={barLabelKey} />}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-sm font-bold text-ink">Check-ins by category</h3>
          {loading ? <Skeleton className="h-[220px]" /> : <CategoryDonut data={data.categories} />}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-bold text-ink">Habit leaderboard</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          ) : data.perHabit.length === 0 ? (
            <p className="rounded-xl bg-soft px-4 py-6 text-center text-sm text-faint">
              No habits were active in this period.
            </p>
          ) : (
            <div className="space-y-3">
              {data.perHabit.map((h) => (
                <div key={h.id} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: h.color }} />
                  <span className="w-40 truncate text-sm font-semibold text-ink2" title={h.name}>
                    {h.name}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-soft2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${h.pct}%`, backgroundColor: h.color }}
                    />
                  </div>
                  <span className="tnum w-10 text-right text-xs font-bold text-ink2">{h.pct}%</span>
                  <span className="tnum inline-flex w-12 items-center justify-end gap-0.5 text-xs font-bold text-orange-500">
                    {h.streak > 0 ? (
                      <>
                        <IconFlame className="h-3 w-3" /> {h.streak}
                      </>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-[11px] text-faint">
            Percentage is normalized to each habit’s weekly target — a 3×/week habit that hit 3 sessions shows 100%.
          </p>
        </div>

        <div className="card p-5">
          <h3 className="mb-1 text-sm font-bold text-ink">{data.label} — intensity map</h3>
          <p className="mb-4 text-xs text-faint">Darker squares mean a fuller day.</p>
          <MonthGrid heatmap={data.heatmap} />
        </div>
      </div>

      {/* Insights */}
      {data.insights?.length ? (
        <div className="card mt-4 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <span className="text-base">🚀</span> Ways to improve — personalized for you
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.insights.map((ins) => {
              const Icon = ICON_MAP[ins.icon] ?? ICON_MAP.sparkles;
              return (
                <div key={ins.title} className="rounded-xl border border-line-soft bg-soft/60 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-ink">
                    <span className="text-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    {ins.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">{ins.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
