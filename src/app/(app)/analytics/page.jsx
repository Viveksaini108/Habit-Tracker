import { getCurrentUser } from '@/lib/session';
import { analyticsData } from '@/lib/data';
import { monthKeyOf } from '@/lib/dates';
import PageHeader from '@/components/PageHeader';
import AnalyticsClient from '@/components/AnalyticsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analytics' };

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  // Preload the current week so the page is useful before the first client fetch.
  const initialData = analyticsData(user.id, { period: 'week', offset: 0 });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Analytics"
        subtitle="Weekly & monthly reports that show what’s working — and where to adjust."
      />
      <AnalyticsClient initialData={initialData} initialMonth={monthKeyOf()} />
    </div>
  );
}
