import type { Metadata } from 'next';
import '@/app/globals.css';
import { GraphQLProvider } from '@/lib/graphql-client';
import { AuthProvider } from '@/lib/auth-context';
import { TeamProvider } from '@/lib/team-context';
import { ThemeProvider } from '@/lib/theme-context';
import { HalloweenEffects } from '@/components/seasonal/HalloweenEffects';
import { ChristmasEffects } from '@/components/seasonal/ChristmasEffects';

export const metadata: Metadata = {
  title: 'Ardine - Time Tracking & Invoicing',
  description:
    'Self-hosted time tracking and invoicing for freelancers and teams',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const seasonalTheme = 'christmas';

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={seasonalTheme || undefined}
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme-init.js" />
      </head>
      <body className="antialiased bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>
          <HalloweenEffects />
          <ChristmasEffects />
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
