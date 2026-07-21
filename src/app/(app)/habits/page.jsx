import { getCurrentUser } from '@/lib/session';
import { listHabits, listCategories, getEntryMap, habitStats } from '@/lib/data';
import { todayKey } from '@/lib/dates';
import PageHeader from '@/components/PageHeader';
import HabitsClient from '@/components/HabitsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Habits' };

export default async function HabitsPage() {
  const user = await getCurrentUser();
  const habits = listHabits(user.id, { includeArchived: true });
  const entryMap = getEntryMap(user.id);
  const categories = listCategories(user.id);
  const archivedTotal = habits.filter((h) => h.archived).length;

  const hydrated = habits.map((h) => ({ ...h, stats: habitStats(h, entryMap) }));

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Habits"
        subtitle={`${hydrated.length - archivedTotal} active · ${archivedTotal} archived — click a card for details, notes and history.`}
      />
      <HabitsClient
        initialHabits={hydrated}
        categories={categories}
        today={todayKey()}
        archivedTotal={archivedTotal}
      />
    </div>
  );
}
