import { getCurrentUser } from '@/lib/session';
import { listReflections } from '@/lib/data';
import { monthKeyOf } from '@/lib/dates';
import PageHeader from '@/components/PageHeader';
import ReflectionsClient from '@/components/ReflectionsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reflections' };

export default async function ReflectionsPage() {
  const user = await getCurrentUser();
  const reflections = listReflections(user.id);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Monthly reflections"
        subtitle="Close the loop: record wins, challenges and what you’ll change next month."
      />
      <ReflectionsClient initialReflections={reflections} currentMonth={monthKeyOf()} />
    </div>
  );
}
