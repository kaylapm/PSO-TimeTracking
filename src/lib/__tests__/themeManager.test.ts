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

  it('returns halloween when NEXT_PUBLIC_SEASONAL_THEME=halloween', () => {
    process.env.NEXT_PUBLIC_SEASONAL_THEME = 'halloween';
    const { getSeasonalTheme: get } = require('../themeManager');
    expect(get()).toBe('halloween');
  });

  it('returns default when NEXT_PUBLIC_SEASONAL_THEME is not set', () => {
    delete process.env.NEXT_PUBLIC_SEASONAL_THEME;
    const { getSeasonalTheme: get } = require('../themeManager');
    expect(get()).toBe('default');
  });

  it('returns default when NEXT_PUBLIC_SEASONAL_THEME is empty string', () => {
    process.env.NEXT_PUBLIC_SEASONAL_THEME = '';
    const { getSeasonalTheme: get } = require('../themeManager');
    expect(get()).toBe('default');
  });

  it('returns default for unrecognized theme values', () => {
    process.env.NEXT_PUBLIC_SEASONAL_THEME = 'easter';
    const { getSeasonalTheme: get } = require('../themeManager');
    expect(get()).toBe('default');
  });
});
