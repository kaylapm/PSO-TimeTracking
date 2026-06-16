export type SeasonalTheme = 'default' | 'halloween' | 'christmas';

/**
 * Returns the active seasonal theme set by the developer via SEASONAL_THEME.
 * No automatic date detection — the developer explicitly activates a theme.
 *
 * To activate: set SEASONAL_THEME=halloween in environment and restart server.
 * To activate: set SEASONAL_THEME=christmas in environment and restart server.
 * To deactivate: remove the variable or set it to an empty string.
 */
export function getSeasonalTheme(): SeasonalTheme {
  // If running in browser, read the class list from document.documentElement
  if (typeof window !== 'undefined') {
    if (document.documentElement.classList.contains('halloween'))
      return 'halloween';
    if (document.documentElement.classList.contains('christmas'))
      return 'christmas';
    return 'default';
  }

  // If running on server (Azure / Next server), read directly from env variable
  const theme = process.env.SEASONAL_THEME;
  if (theme === 'halloween') return 'halloween';
  if (theme === 'christmas') return 'christmas';
  return 'default';
}
