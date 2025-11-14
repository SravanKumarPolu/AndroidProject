import { addHours, getTimeRemaining, isTimePast, formatDateTime, formatRelativeTime } from '../date';

describe('date utilities', () => {
  describe('addHours', () => {
    it('should add hours to timestamp', () => {
      const timestamp = 1000000000000; // Fixed timestamp
      const result = addHours(timestamp, 24);
      expect(result).toBe(timestamp + 24 * 60 * 60 * 1000);
    });

    it('should handle negative hours', () => {
      const timestamp = 1000000000000;
      const result = addHours(timestamp, -12);
      expect(result).toBe(timestamp - 12 * 60 * 60 * 1000);
    });
  });

  describe('isTimePast', () => {
    it('should return true for past timestamps', () => {
      const pastTime = Date.now() - 1000;
      expect(isTimePast(pastTime)).toBe(true);
    });

    it('should return false for future timestamps', () => {
      const futureTime = Date.now() + 1000;
      expect(isTimePast(futureTime)).toBe(false);
    });
  });

  describe('getTimeRemaining', () => {
    it('should calculate remaining time correctly', () => {
      const futureTime = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
      const remaining = getTimeRemaining(futureTime);
      expect(remaining.hours).toBeGreaterThanOrEqual(1);
      expect(remaining.hours).toBeLessThanOrEqual(2);
    });

    it('should return zero for past timestamps', () => {
      const pastTime = Date.now() - 1000;
      const remaining = getTimeRemaining(pastTime);
      expect(remaining.hours).toBe(0);
      expect(remaining.minutes).toBe(0);
      expect(remaining.seconds).toBe(0);
    });
  });

  describe('formatDateTime', () => {
    it('should format timestamp correctly', () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime();
      const formatted = formatDateTime(timestamp);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('Jan');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative time', () => {
      const pastTime = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago
      const formatted = formatRelativeTime(pastTime);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('getTimeRemaining', () => {
    it('should calculate remaining time for future timestamp', () => {
      const futureTime = Date.now() + 2 * 60 * 60 * 1000; // 2 hours from now
      const remaining = getTimeRemaining(futureTime);
      expect(remaining.hours).toBeGreaterThanOrEqual(1);
      expect(remaining.hours).toBeLessThanOrEqual(2);
      expect(remaining.totalSeconds).toBeGreaterThan(0);
    });

    it('should return zero for past timestamps', () => {
      const pastTime = Date.now() - 1000;
      const remaining = getTimeRemaining(pastTime);
      expect(remaining.hours).toBe(0);
      expect(remaining.minutes).toBe(0);
      expect(remaining.seconds).toBe(0);
      expect(remaining.totalSeconds).toBe(0);
    });
  });
});

