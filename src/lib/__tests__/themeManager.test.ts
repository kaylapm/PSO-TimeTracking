import { getSeasonalTheme } from '../themeManager';

describe('getSeasonalTheme', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns halloween when SEASONAL_THEME=halloween', () => {
    process.env.SEASONAL_THEME = 'halloween';
    const { getSeasonalTheme: get } = require('../themeManager');
    expect(get()).toBe('halloween');
  });

  it('returns default when SEASONAL_THEME is not set', () => {
    delete process.env.SEASONAL_THEME;
    const { getSeasonalTheme: get } = require('../themeManager');
    expect(get()).toBe('default');
  });

  it('returns default when SEASONAL_THEME is empty string', () => {
    process.env.SEASONAL_THEME = '';
    const { getSeasonalTheme: get } = require('../themeManager');
    expect(get()).toBe('default');
  });

  it('returns default for unrecognized theme values', () => {
    process.env.SEASONAL_THEME = 'easter';
    const { getSeasonalTheme: get } = require('../themeManager');
    expect(get()).toBe('default');
  });

  it('returns christmas when SEASONAL_THEME=christmas', () => {
    process.env.SEASONAL_THEME = 'christmas';
    const { getSeasonalTheme: get } = require('../themeManager');
    expect(get()).toBe('christmas');
  });

  it('returns default when SEASONAL_THEME is set to another seasonal value', () => {
    process.env.SEASONAL_THEME = 'thanksgiving';
    const { getSeasonalTheme: get } = require('../themeManager');
    expect(get()).toBe('default');
  });
});
