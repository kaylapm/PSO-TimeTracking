import type { Metadata } from 'next';
import '@/app/globals.css';
import { GraphQLProvider } from '@/lib/graphql-client';
import { AuthProvider } from '@/lib/auth-context';
import { TeamProvider } from '@/lib/team-context';
import { ThemeProvider } from '@/lib/theme-context';

export const metadata: Metadata = {
  title: 'Ardine - Time Tracking & Invoicing',
  description:
    'Self-hosted time tracking and invoicing for freelancers and teams',
};

/**
 * Inline script to prevent flash of wrong theme on initial page load.
 * Reads the saved theme from localStorage (or OS preference) and applies
 * the `dark` class to <html> before React hydrates.
 */
const themeInitScript = `
  (function() {
    try {
      var theme = localStorage.getItem('ardine_theme');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of unstyled content (FOUC) for dark mode */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <TeamProvider>
              <GraphQLProvider>{children}</GraphQLProvider>
            </TeamProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
