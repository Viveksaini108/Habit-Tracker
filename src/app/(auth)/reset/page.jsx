import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import AuthScreen, { AuthFooterLink } from '@/components/AuthScreen';
import ResetForm from './ResetForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Choose a new password' };

export default async function ResetPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  const token = typeof searchParams?.token === 'string' ? searchParams.token : '';

  return (
    <AuthScreen
      title="Choose a new password"
      subtitle="Almost done — pick something you'll remember."
      footer={<AuthFooterLink text="Back to" href="/login" linkText="Sign in" />}
    >
      <ResetForm token={token} />
    </AuthScreen>
  );
}
