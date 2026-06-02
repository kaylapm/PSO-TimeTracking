'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { Button } from '@/components/ui/button';

/**
 * ThemeToggle renders a button that switches between light and dark mode.
 * Uses lucide-react icons for Sun/Moon with a smooth transition.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label={
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      }
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative"
    >
      {/* Sun icon — visible in dark mode, triggers switch to light */}
      <Sun
        className={`h-4 w-4 transition-all duration-300 ${
          theme === 'dark'
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0 absolute'
        }`}
      />
      {/* Moon icon — visible in light mode, triggers switch to dark */}
      <Moon
        className={`h-4 w-4 transition-all duration-300 ${
          theme === 'light'
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0 absolute'
        }`}
      />
    </Button>
  );
}
