import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import AppShell from '@/components/AppShell';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <AppShell user={user}>{children}</AppShell>;
}
