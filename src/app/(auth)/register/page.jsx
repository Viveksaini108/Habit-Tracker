import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import AuthScreen, { AuthFooterLink } from '@/components/AuthScreen';
import RegisterForm from './RegisterForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Create account' };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  const googleClientId = process.env.GOOGLE_CLIENT_ID || '';

  return (
    <AuthScreen
      title="Create your account"
      subtitle="Start tracking in under a minute."
      footer={<AuthFooterLink text="Already have an account?" href="/login" linkText="Sign in" />}
    >
      <RegisterForm googleClientId={googleClientId} />
    </AuthScreen>
  );
}
