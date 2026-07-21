import './globals.css';

export const metadata = {
  title: {
    default: 'HabitFlow — Track habits that stick',
    template: '%s · HabitFlow',
  },
  description:
    'A full-stack habit tracker with daily check-ins, weekly & monthly analytics, reflections, challenges and progress notes.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4f46e5',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
