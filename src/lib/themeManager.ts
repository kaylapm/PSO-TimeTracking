export type SeasonalTheme = 'default' | 'halloween';

/** Returns true if the given date falls in the Halloween season (Oct 25–31). */
export function isHalloweenSeason(date: Date = new Date()): boolean {
  if (process.env.NEXT_PUBLIC_FORCE_HALLOWEEN === 'true') return true;
  const month = date.getMonth(); // 0-indexed; 9 = October
  const day = date.getDate();
  return month === 9 && day >= 25 && day <= 31;
}

/** Returns the seasonal theme name for the given date. */
export function getSeasonalTheme(date: Date = new Date()): SeasonalTheme {
  if (isHalloweenSeason(date)) return 'halloween';
  return 'default';
}
