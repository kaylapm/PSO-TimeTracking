export type SeasonalTheme = 'default' | 'halloween' | 'christmas';

/**
 * Returns the active seasonal theme set by the developer via NEXT_PUBLIC_SEASONAL_THEME.
 * No automatic date detection — the developer explicitly activates a theme.
 *
 * To activate: set NEXT_PUBLIC_SEASONAL_THEME=halloween in .env.local and restart dev server.
 * To activate: set NEXT_PUBLIC_SEASONAL_THEME=christmas in .env.local and restart dev server.
 * To deactivate: remove the variable or set it to an empty string.
 */
export function getSeasonalTheme(): SeasonalTheme {
  const theme = process.env.NEXT_PUBLIC_SEASONAL_THEME;
  if (theme === 'halloween') return 'halloween';
  if (theme === 'christmas') return 'christmas';
  return 'default';
}
