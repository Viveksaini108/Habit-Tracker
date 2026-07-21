import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/session';
import { getUserById } from '@/lib/data';
import { THEME_COOKIE, THEME_IDS, DEFAULT_THEME } from '@/lib/themes';
import PageHeader from '@/components/PageHeader';
import SettingsClient from '@/components/SettingsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const sessionUser = await getCurrentUser();
  const profile = getUserById(sessionUser.id);
  const stored = cookies().get(THEME_COOKIE)?.value;
  const theme = stored && THEME_IDS.has(stored) ? stored : DEFAULT_THEME;

  return (
    <div className="animate-fade-up">
      <PageHeader title="Settings" subtitle="Your profile, appearance and data — all in one place." />
      <SettingsClient user={profile} theme={theme} />
    </div>
  );
}
