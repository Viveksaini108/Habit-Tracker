import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import AuthScreen, { AuthFooterLink } from '@/components/AuthScreen';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in' };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  const demoEnabled = process.env.SEED_DEMO !== '0';
  const googleClientId = process.env.GOOGLE_CLIENT_ID || '';

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to keep your streaks alive."
      footer={<AuthFooterLink text="New to HabitFlow?" href="/register" linkText="Create an account" />}
    >
      <LoginForm demoEnabled={demoEnabled} googleClientId={googleClientId} />
    </AuthScreen>
  );
}
