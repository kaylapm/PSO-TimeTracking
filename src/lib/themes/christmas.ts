// HSL values without the hsl() wrapper — matches the format used in globals.css
export const CHRISTMAS_CSS_VARS = {
  '--background': '148 25% 8%',
  '--foreground': '0 0% 95%',
  '--card': '148 25% 11%',
  '--card-foreground': '0 0% 95%',
  '--popover': '148 25% 11%',
  '--popover-foreground': '0 0% 95%',
  '--primary': '0 100% 40%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '148 61% 22%',
  '--secondary-foreground': '0 0% 95%',
  '--muted': '148 20% 15%',
  '--muted-foreground': '0 0% 65%',
  '--accent': '51 100% 50%',
  '--accent-foreground': '0 0% 10%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 100%',
  '--border': '148 30% 20%',
  '--input': '148 20% 15%',
  '--ring': '0 100% 40%',
} as const;

export const CHRISTMAS_COLORS = {
  red: '#CC0000',
  green: '#165B33',
  gold: '#FFD700',
  white: '#FFFFFF',
} as const;

export const CHRISTMAS_SEASON = {
  month: 12, // December (1-indexed, human-readable)
  startDay: 20,
  endDay: 31,
} as const;
