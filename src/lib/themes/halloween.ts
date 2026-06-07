// HSL values without the hsl() wrapper — matches the format used in globals.css
export const HALLOWEEN_CSS_VARS = {
  '--background': '0 0% 10%',
  '--foreground': '30 100% 95%',
  '--card': '0 0% 13%',
  '--card-foreground': '30 100% 95%',
  '--popover': '0 0% 13%',
  '--popover-foreground': '30 100% 95%',
  '--primary': '25 100% 50%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '280 51% 20%',
  '--secondary-foreground': '30 100% 95%',
  '--muted': '0 0% 18%',
  '--muted-foreground': '30 30% 65%',
  '--accent': '280 51% 36%',
  '--accent-foreground': '30 100% 95%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 100%',
  '--border': '280 30% 25%',
  '--input': '0 0% 18%',
  '--ring': '25 100% 50%',
} as const;

export const HALLOWEEN_COLORS = {
  orange: '#FF6B00',
  dark: '#1A1A1A',
  purple: '#6B2D8B',
} as const;

export const HALLOWEEN_SEASON = {
  month: 10, // October (1-indexed, human-readable)
  startDay: 25,
  endDay: 31,
} as const;
