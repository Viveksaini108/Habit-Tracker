import '@fontsource-variable/inter';
import './globals.css';
import { cookies } from 'next/headers';
import { THEME_COOKIE, THEME_IDS, DEFAULT_THEME } from '@/lib/themes';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata = {
  title: {
    default: 'HabitFlow — Track habits that stick',
    template: '%s · HabitFlow',
  },
  description:
    'A full-stack habit tracker with daily check-ins, weekly & monthly analytics, reflections, challenges and progress notes.',
  applicationName: 'HabitFlow',
  appleWebApp: {
    capable: true,
    title: 'HabitFlow',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // iOS notch / Android display-cutout support
};

export default function RootLayout({ children }) {
  const stored = cookies().get(THEME_COOKIE)?.value;
  const theme = stored && THEME_IDS.has(stored) ? stored : DEFAULT_THEME;

  return (
    <html lang="en" data-theme={theme}>
      <body className="min-h-screen font-sans">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
