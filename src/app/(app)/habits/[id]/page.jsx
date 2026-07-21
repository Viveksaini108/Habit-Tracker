import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import {
  getHabit,
  listCategories,
  getEntryMap,
  habitStats,
  listEntryRows,
  listNotes,
  rangeRate,
} from '@/lib/data';
import { todayKey, lastNDays, addDaysKey } from '@/lib/dates';
import HabitDetailClient from '@/components/HabitDetailClient';
import { IconChevronLeft } from '@/components/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Habit details' };

export default async function HabitDetailPage({ params }) {
  const user = await getCurrentUser();
  const id = Number(params.id);
  const habit = getHabit(user.id, id);
  if (!habit) notFound();

  const today = todayKey();
  const entryMap = getEntryMap(user.id);
  const stats = habitStats(habit, entryMap);

  // Overall rate since start (capped look-back for the display).
  const set = entryMap.get(habit.id) ?? new Set();
  const lookback = [];
  const from = addDaysKey(today, -400);
  const start = habit.start_date > from ? habit.start_date : from;
  for (let k = start; k <= today; k = addDaysKey(k, 1)) lookback.push(k);
  stats.overallRate = rangeRate(habit, set, lookback.length ? lookback : lastNDays(1, today)).rate;

  const entries = listEntryRows(user.id, id, 400).map((e) => e.date);
  const notes = listNotes(user.id, id);
  const categories = listCategories(user.id);

  return (
    <div className="animate-fade-up">
      <Link
        href="/habits"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-faint transition hover:text-ink2"
      >
        <IconChevronLeft className="h-4 w-4" /> All habits
      </Link>
      <HabitDetailClient
        habit={{ ...habit, stats }}
        entries={entries}
        notes={notes}
        categories={categories}
        today={today}
      />
    </div>
  );
}
