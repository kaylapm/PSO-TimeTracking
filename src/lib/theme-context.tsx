'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type Theme = 'light' | 'dark' | 'system' | 'halloween' | 'christmas';

interface ThemeContextType {
  /** Current active theme */
  theme: Theme;
  /** Set a specific theme */
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'ardine_theme';

/**
 * ThemeProvider manages theme state and persists it to localStorage.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const getInitialTheme = (): Theme => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        if (
          stored &&
          ['light', 'dark', 'system', 'halloween', 'christmas'].includes(stored)
        ) {
          return stored;
        }
      }
    } catch (e) {
      // ignore and fall through
    }
    return 'system';
  };

  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  // Apply the theme class to <html> whenever the theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'halloween', 'christmas');

    let activeTheme = theme;
    if (theme === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    if (activeTheme !== 'light' && activeTheme !== 'system') {
      root.classList.add(activeTheme);
    }

    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context.
 * Must be used within a ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
