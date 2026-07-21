import { getCurrentUser } from '@/lib/session';
import { listChallengeState } from '@/lib/data';
import PageHeader from '@/components/PageHeader';
import ChallengesClient from '@/components/ChallengesClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Challenges' };

export default async function ChallengesPage() {
  const user = await getCurrentUser();
  const state = listChallengeState(user.id);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Challenges"
        subtitle="Structured sprints with concrete, user-centric tips to make the habit stick."
      />
      <ChallengesClient initial={state} />
    </div>
  );
}
