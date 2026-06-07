import { isHalloweenSeason, getSeasonalTheme } from '../themeManager';

describe('isHalloweenSeason', () => {
  describe('returns true during Halloween season (Oct 25–31)', () => {
    const halloweenDays = [25, 26, 27, 28, 29, 30, 31];

    it.each(halloweenDays)('October %i', (day) => {
      expect(isHalloweenSeason(new Date(2024, 9, day))).toBe(true);
    });
  });

  describe('returns false outside Halloween season', () => {
    it('October 24 — one day before', () => {
      expect(isHalloweenSeason(new Date(2024, 9, 24))).toBe(false);
    });

    it('October 1 — early October', () => {
      expect(isHalloweenSeason(new Date(2024, 9, 1))).toBe(false);
    });

    it('November 1 — one day after', () => {
      expect(isHalloweenSeason(new Date(2024, 10, 1))).toBe(false);
    });

    it('June 28 — unrelated month', () => {
      expect(isHalloweenSeason(new Date(2024, 5, 28))).toBe(false);
    });

    it('December 31', () => {
      expect(isHalloweenSeason(new Date(2024, 11, 31))).toBe(false);
    });
  });

  it('uses current date by default without throwing', () => {
    expect(() => isHalloweenSeason()).not.toThrow();
    expect(typeof isHalloweenSeason()).toBe('boolean');
  });
});

describe('getSeasonalTheme', () => {
  it('returns halloween on Oct 25 (season start)', () => {
    expect(getSeasonalTheme(new Date(2024, 9, 25))).toBe('halloween');
  });

  it('returns halloween on Oct 31 (season end)', () => {
    expect(getSeasonalTheme(new Date(2024, 9, 31))).toBe('halloween');
  });

  it('returns default on Oct 24 (before season)', () => {
    expect(getSeasonalTheme(new Date(2024, 9, 24))).toBe('default');
  });

  it('returns default on Nov 1 (after season)', () => {
    expect(getSeasonalTheme(new Date(2024, 10, 1))).toBe('default');
  });

  it('returns default for arbitrary non-Halloween dates', () => {
    expect(getSeasonalTheme(new Date(2024, 0, 15))).toBe('default');
    expect(getSeasonalTheme(new Date(2024, 6, 4))).toBe('default');
  });

  it('uses current date by default without throwing', () => {
    expect(() => getSeasonalTheme()).not.toThrow();
    expect(['halloween', 'default']).toContain(getSeasonalTheme());
  });
});
