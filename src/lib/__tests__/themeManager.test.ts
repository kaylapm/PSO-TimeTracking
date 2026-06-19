import { getSeasonalTheme } from '../themeManager';

describe('getSeasonalTheme', () => {
  it('returns halloween as the static theme', () => {
    expect(getSeasonalTheme()).toBe('halloween');
  });
});
