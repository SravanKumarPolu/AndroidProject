import { describe, it, expect } from 'vitest';
import { 
  calculateReportMetrics, 
  getWeekRange, 
  getMonthRange,
  calculateImpulseScore,
  getEmotionalTriggers
} from '../reports';
import { Impulse } from '@/types/impulse';

describe('Reports Utilities', () => {
  const mockImpulses: Impulse[] = [
    {
      id: '1',
      title: 'Test Impulse 1',
      price: 100,
      category: 'food',
      urgency: 'medium',
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      cooldownEndsAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      status: 'skipped',
      decisionAtEnd: 'skipped',
      emotionAtImpulse: 'stressed',
    },
    {
      id: '2',
      title: 'Test Impulse 2',
      price: 200,
      category: 'shopping',
      urgency: 'high',
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      cooldownEndsAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
      status: 'bought',
      decisionAtEnd: 'bought',
      emotionAtImpulse: 'excited',
      regretScore: 70,
    },
    {
      id: '3',
      title: 'Test Impulse 3',
      price: 50,
      category: 'entertainment',
      urgency: 'low',
      createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
      cooldownEndsAt: Date.now() - 9 * 24 * 60 * 60 * 1000,
      status: 'bought',
      decisionAtEnd: 'bought',
      emotionAtImpulse: 'neutral',
      regretScore: 20,
    },
  ];

  describe('calculateReportMetrics', () => {
    it('should calculate correct metrics for a time range', () => {
      const now = Date.now();
      const startTime = now - 7 * 24 * 60 * 60 * 1000; // Last 7 days
      const endTime = now;

      const metrics = calculateReportMetrics(mockImpulses, startTime, endTime);

      expect(metrics.totalLogged).toBeGreaterThan(0);
      expect(metrics.totalSkipped).toBeGreaterThanOrEqual(0);
      expect(metrics.totalBought).toBeGreaterThanOrEqual(0);
      expect(metrics.skipRate).toBeGreaterThanOrEqual(0);
      expect(metrics.skipRate).toBeLessThanOrEqual(1);
    });

    it('should handle empty impulses array', () => {
      const metrics = calculateReportMetrics([], 0, Date.now());
      expect(metrics.totalLogged).toBe(0);
      expect(metrics.totalSkipped).toBe(0);
      expect(metrics.totalBought).toBe(0);
      expect(metrics.skipRate).toBe(0);
    });

    it('should calculate average regret score correctly', () => {
      const now = Date.now();
      const metrics = calculateReportMetrics(mockImpulses, 0, now);
      
      const boughtWithRegret = mockImpulses.filter(
        (imp) => imp.decisionAtEnd === 'bought' && imp.regretScore !== null
      );
      
      if (boughtWithRegret.length > 0) {
        expect(metrics.avgRegretScore).not.toBeNull();
        expect(metrics.avgRegretScore).toBeGreaterThanOrEqual(0);
        expect(metrics.avgRegretScore).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('getWeekRange', () => {
    it('should return correct week range for current week', () => {
      const range = getWeekRange(0);
      expect(range.start).toBeLessThanOrEqual(range.end);
      expect(range.end - range.start).toBeLessThanOrEqual(7 * 24 * 60 * 60 * 1000);
    });

    it('should return correct week range for previous week', () => {
      const currentWeek = getWeekRange(0);
      const lastWeek = getWeekRange(1);
      
      expect(lastWeek.end).toBeLessThanOrEqual(currentWeek.start);
    });
  });

  describe('getMonthRange', () => {
    it('should return correct month range for current month', () => {
      const range = getMonthRange(0);
      expect(range.start).toBeLessThanOrEqual(range.end);
      
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);
      
      expect(startDate.getMonth()).toBe(endDate.getMonth());
    });

    it('should return correct month range for previous month', () => {
      const currentMonth = getMonthRange(0);
      const lastMonth = getMonthRange(1);
      
      expect(lastMonth.end).toBeLessThanOrEqual(currentMonth.start);
    });
  });

  describe('calculateImpulseScore', () => {
    it('should return score between 0 and 100', () => {
      const score = calculateImpulseScore({
        skipRate: 0.8,
        avgRegret: 30,
        weeklyImpulseCount: 5,
      });
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give higher score for higher skip rate', () => {
      const highSkip = calculateImpulseScore({
        skipRate: 0.9,
        avgRegret: 30,
        weeklyImpulseCount: 5,
      });
      
      const lowSkip = calculateImpulseScore({
        skipRate: 0.3,
        avgRegret: 30,
        weeklyImpulseCount: 5,
      });
      
      expect(highSkip).toBeGreaterThan(lowSkip);
    });

    it('should give higher score for lower regret', () => {
      const lowRegret = calculateImpulseScore({
        skipRate: 0.5,
        avgRegret: 20,
        weeklyImpulseCount: 5,
      });
      
      const highRegret = calculateImpulseScore({
        skipRate: 0.5,
        avgRegret: 80,
        weeklyImpulseCount: 5,
      });
      
      expect(lowRegret).toBeGreaterThan(highRegret);
    });

    it('should handle null avgRegret', () => {
      const score = calculateImpulseScore({
        skipRate: 0.5,
        avgRegret: null,
        weeklyImpulseCount: 5,
      });
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should penalize high impulse frequency', () => {
      const lowFreq = calculateImpulseScore({
        skipRate: 0.5,
        avgRegret: 30,
        weeklyImpulseCount: 3,
      });
      
      const highFreq = calculateImpulseScore({
        skipRate: 0.5,
        avgRegret: 30,
        weeklyImpulseCount: 15,
      });
      
      expect(lowFreq).toBeGreaterThan(highFreq);
    });
  });

  describe('getEmotionalTriggers', () => {
    it('should return emotional triggers with correct structure', () => {
      const triggers = getEmotionalTriggers(mockImpulses);
      
      expect(Array.isArray(triggers)).toBe(true);
      triggers.forEach((trigger) => {
        expect(trigger).toHaveProperty('emotion');
        expect(trigger).toHaveProperty('count');
        expect(trigger).toHaveProperty('skipRate');
        expect(trigger).toHaveProperty('buyRate');
        expect(trigger.skipRate).toBeGreaterThanOrEqual(0);
        expect(trigger.skipRate).toBeLessThanOrEqual(1);
        expect(trigger.buyRate).toBeGreaterThanOrEqual(0);
        expect(trigger.buyRate).toBeLessThanOrEqual(1);
      });
    });

    it('should handle impulses without emotions', () => {
      const impulsesWithoutEmotion = mockImpulses.map(imp => ({
        ...imp,
        emotionAtImpulse: undefined,
      }));
      
      const triggers = getEmotionalTriggers(impulsesWithoutEmotion);
      expect(triggers.length).toBeGreaterThan(0);
      
      const neutralTrigger = triggers.find(t => t.emotion === 'neutral');
      expect(neutralTrigger).toBeDefined();
    });
  });
});

