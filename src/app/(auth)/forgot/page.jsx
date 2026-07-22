import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import AuthScreen, { AuthFooterLink } from '@/components/AuthScreen';
import ForgotForm from './ForgotForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Forgot password' };

export default async function ForgotPage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  return (
    <AuthScreen
      title="Forgot your password?"
      subtitle="Enter your Gmail and we'll send you a reset link."
      footer={<AuthFooterLink text="Remembered it?" href="/login" linkText="Back to sign in" />}
    >
      <ForgotForm />
    </AuthScreen>
  );
}
