import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/session';
import { THEME_COOKIE, THEME_IDS, DEFAULT_THEME } from '@/lib/themes';
import AppShell from '@/components/AppShell';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const stored = cookies().get(THEME_COOKIE)?.value;
  const theme = stored && THEME_IDS.has(stored) ? stored : DEFAULT_THEME;

  return <AppShell user={user} theme={theme}>{children}</AppShell>;
}
