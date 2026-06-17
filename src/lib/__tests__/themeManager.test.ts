import { getSeasonalTheme } from '../themeManager';

describe('getSeasonalTheme', () => {
  it('returns christmas as the static theme', () => {
    expect(getSeasonalTheme()).toBe('christmas');
  });
});
