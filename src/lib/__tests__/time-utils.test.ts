import {
  formatDuration,
  formatDecimalHours,
  formatDateRange,
  getWeekRange,
  getWeekDays,
  formatGridDate,
  formatTime,
  formatDateISO,
  isToday,
  calculatePercentage,
  formatElapsedTime,
  parseDuration,
  getRelativeTime,
} from '../time-utils';

describe('time-utils', () => {
  describe('formatDuration', () => {
    it('returns "0m" for null, undefined, or 0', () => {
      expect(formatDuration(null)).toBe('0m');
      expect(formatDuration(undefined)).toBe('0m');
      expect(formatDuration(0)).toBe('0m');
    });

    it('formats hours only correctly', () => {
      expect(formatDuration(3600)).toBe('1h');
      expect(formatDuration(7200)).toBe('2h');
    });

    it('formats minutes only correctly', () => {
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(600)).toBe('10m');
    });

    it('formats both hours and minutes correctly', () => {
      expect(formatDuration(3660)).toBe('1h 1m');
      expect(formatDuration(7500)).toBe('2h 5m');
    });
  });

  describe('formatDecimalHours', () => {
    it('returns "0.00" for null, undefined, or 0', () => {
      expect(formatDecimalHours(null)).toBe('0.00');
      expect(formatDecimalHours(undefined)).toBe('0.00');
      expect(formatDecimalHours(0)).toBe('0.00');
    });

    it('formats decimal hours correctly', () => {
      expect(formatDecimalHours(3600)).toBe('1.00');
      expect(formatDecimalHours(5400)).toBe('1.50');
      expect(formatDecimalHours(1800)).toBe('0.50');
    });
  });

  describe('formatDateRange', () => {
    it('formats a date range correctly', () => {
      const from = new Date('2024-01-01T12:00:00Z');
      const to = new Date('2024-01-07T12:00:00Z');
      const formatted = formatDateRange(from, to);

      // Verification using regex because of potential locale differences in test environment
      expect(formatted).toMatch(
        /^[A-Za-z]+, [A-Za-z]+ \d+ - [A-Za-z]+, [A-Za-z]+ \d+, \d{4}$/
      );
    });
  });

  describe('getWeekRange', () => {
    it('calculates start and end of week (Monday to Sunday) correctly', () => {
      // June 3, 2026 is Wednesday
      const inputDate = new Date('2026-06-03T12:00:00');
      const { start, end } = getWeekRange(inputDate);

      // June 1, 2026 is Monday
      expect(start.getFullYear()).toBe(2026);
      expect(start.getMonth()).toBe(5); // 0-indexed, June is 5
      expect(start.getDate()).toBe(1);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);

      // June 7, 2026 is Sunday
      expect(end.getFullYear()).toBe(2026);
      expect(end.getMonth()).toBe(5);
      expect(end.getDate()).toBe(7);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
    });

    it('handles Sunday correctly', () => {
      // June 7, 2026 is Sunday
      const inputDate = new Date('2026-06-07T12:00:00');
      const { start, end } = getWeekRange(inputDate);

      expect(start.getDate()).toBe(1); // Should still start on Monday June 1st
      expect(end.getDate()).toBe(7);
    });
  });

  describe('getWeekDays', () => {
    it('returns 7 consecutive days starting from start date', () => {
      const start = new Date('2026-06-01T00:00:00');
      const days = getWeekDays(start);

      expect(days).toHaveLength(7);
      expect(days[0].getDate()).toBe(1);
      expect(days[6].getDate()).toBe(7);
    });
  });

  describe('formatGridDate', () => {
    it('formats date to Grid Date correctly', () => {
      const date = new Date('2026-06-01T12:00:00');
      const formatted = formatGridDate(date);
      expect(formatted).toMatch(/^[A-Za-z]+ \d+$/); // e.g. "Mon 1"
    });
  });

  describe('formatTime', () => {
    it('formats time to 12 hour AM/PM correctly', () => {
      const date = new Date('2026-06-01T14:30:00');
      const formatted = formatTime(date);
      expect(formatted).toMatch(/^\d{1,2}:\d{2}\s?(AM|PM)$/i);
    });
  });

  describe('formatDateISO', () => {
    it('formats date into YYYY-MM-DD', () => {
      const date = new Date('2024-05-15T12:00:00');
      const formatted = formatDateISO(date);
      expect(formatted).toBe('2024-05-15');
    });
  });

  describe('isToday', () => {
    it('returns true for today', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('returns false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('calculatePercentage', () => {
    it('returns 0 if target is 0', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
    });

    it('calculates rounded percentage correctly', () => {
      expect(calculatePercentage(5, 10)).toBe(50);
      expect(calculatePercentage(1, 3)).toBe(33); // 33.33% rounded to 33
      expect(calculatePercentage(2, 3)).toBe(67); // 66.67% rounded to 67
    });
  });

  describe('formatElapsedTime', () => {
    it('formats elapsed seconds to HH:MM:SS format', () => {
      expect(formatElapsedTime(0)).toBe('00:00:00');
      expect(formatElapsedTime(45)).toBe('00:00:45');
      expect(formatElapsedTime(65)).toBe('00:01:05');
      expect(formatElapsedTime(3665)).toBe('01:01:05');
      expect(formatElapsedTime(360000)).toBe('100:00:00');
    });
  });

  describe('parseDuration', () => {
    it('parses decimal hours correctly', () => {
      expect(parseDuration('2.5')).toBe(9000);
      expect(parseDuration('2.5h')).toBe(9000);
      expect(parseDuration('1')).toBe(3600);
    });

    it('parses Xh Ym format correctly', () => {
      expect(parseDuration('2h 30m')).toBe(9000);
      expect(parseDuration('2h30m')).toBe(9000);
      expect(parseDuration('2h')).toBe(7200);
      expect(parseDuration('30m')).toBe(1800);
    });

    it('returns 0 for invalid inputs', () => {
      expect(parseDuration('invalid')).toBe(0);
      expect(parseDuration('')).toBe(0);
    });
  });

  describe('getRelativeTime', () => {
    it('returns "just now" for dates less than 1 minute ago', () => {
      const now = new Date();
      expect(getRelativeTime(now)).toBe('just now');

      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
      expect(getRelativeTime(thirtySecondsAgo)).toBe('just now');
    });

    it('returns minutes ago format correctly', () => {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000 - 500); // add a slight buffer
      expect(getRelativeTime(oneMinuteAgo)).toBe('1 minute ago');

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000 - 500);
      expect(getRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('returns hours ago format correctly', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000 - 1000);
      expect(getRelativeTime(oneHourAgo)).toBe('1 hour ago');

      const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000 - 1000);
      expect(getRelativeTime(fiveHoursAgo)).toBe('5 hours ago');
    });

    it('returns days ago format correctly', () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000 - 1000);
      expect(getRelativeTime(oneDayAgo)).toBe('1 day ago');

      const threeDaysAgo = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000 - 1000
      );
      expect(getRelativeTime(threeDaysAgo)).toBe('3 days ago');
    });

    it('returns actual date for dates older than 7 days', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const formatted = getRelativeTime(tenDaysAgo);
      expect(formatted).not.toMatch(/days ago/);
      expect(formatted).toMatch(/^[A-Za-z]+ \d+$/); // e.g. "May 28"
    });

    it('includes year for dates from a different year', () => {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      lastYear.setDate(lastYear.getDate() - 10);
      const formatted = getRelativeTime(lastYear);
      expect(formatted).toMatch(/\d{4}/); // Expect year to be present
    });
  });
});
