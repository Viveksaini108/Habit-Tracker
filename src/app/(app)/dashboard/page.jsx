import { format } from 'date-fns';
import { getCurrentUser } from '@/lib/session';
import { dashboardData } from '@/lib/data';
import { parseKey } from '@/lib/dates';
import { StatCard } from '@/components/ui';
import Mascot from '@/components/Mascot';
import TodayCard from '@/components/TodayCard';
import { WeekGlance, InsightsPanel, ActiveChallenges, RecentNotes } from '@/components/DashboardWidgets';
import { IconCheck, IconTrendingUp, IconHabits, IconFlame } from '@/components/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard' };

function greeting(hour) {
  if (hour < 5) return 'Burning the midnight oil';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const data = dashboardData(user.id);
  const today = parseKey(data.today);

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent">{format(today, 'EEEE, MMMM d')}</p>
          <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-ink">
            {greeting(new Date().getHours())}, {user.name.split(' ')[0]} 👋
          </h1>
        <p className="mt-1 text-sm text-muted">
          {data.atRisk.length
            ? `${data.atRisk.length} streak${data.atRisk.length > 1 ? 's' : ''} need${data.atRisk.length > 1 ? '' : 's'} your attention today — keep the chain alive.`
            : 'Here’s your progress at a glance. One checkmark at a time.'}
        </p>
        </div>
        <Mascot mood="wave" size={74} className="hidden shrink-0 sm:block" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          icon={<IconCheck className="h-5 w-5" />}
          label="Today"
          value={`${data.totals.doneToday}/${data.totals.totalToday}`}
          sub="habits checked off"
          accent="#10b981"
        />
        <StatCard
          icon={<IconTrendingUp className="h-5 w-5" />}
          label="This week"
          value={`${data.totals.weekPct}%`}
          sub="average completion"
          accent="rgb(var(--accent))"
        />
        <StatCard
          icon={<IconHabits className="h-5 w-5" />}
          label="Active habits"
          value={data.totals.activeHabits}
          sub="currently tracked"
          accent="#0ea5e9"
        />
        <StatCard
          icon={<IconFlame className="h-5 w-5" />}
          label="Best streak"
          value={`${data.totals.bestStreak}d`}
          sub="among today’s habits"
          accent="#f97316"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodayCard todayList={data.todayList} today={data.today} categories={data.categories} />
        </div>
        <div className="space-y-4">
          <WeekGlance week={data.week} />
          <InsightsPanel insights={data.insights} />
          <ActiveChallenges challenges={data.challenges} />
          <RecentNotes notes={data.recentNotes} />
        </div>
      </div>
    </div>
  );
}
