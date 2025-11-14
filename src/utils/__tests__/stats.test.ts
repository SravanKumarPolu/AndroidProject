import { computeStats, computeCategoryStats } from '../stats';
import { Impulse } from '@/types/impulse';

describe('stats utilities', () => {
  describe('computeStats', () => {
    it('should calculate total saved from cancelled impulses', () => {
      const impulses: Impulse[] = [
        {
          id: '1',
          title: 'Test 1',
          category: 'FOOD',
          price: 100,
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: Date.now(),
          reviewAt: Date.now(),
          status: 'CANCELLED',
        },
        {
          id: '2',
          title: 'Test 2',
          category: 'SHOPPING',
          price: 200,
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: Date.now(),
          reviewAt: Date.now(),
          status: 'CANCELLED',
        },
      ];

      const stats = computeStats(impulses);
      expect(stats.totalSaved).toBe(300);
      expect(stats.totalCancelled).toBe(2);
    });

    it('should calculate regret rate correctly', () => {
      const now = Date.now();
      const impulses: Impulse[] = [
        {
          id: '1',
          title: 'Test 1',
          category: 'FOOD',
          price: 100,
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: now,
          reviewAt: now,
          status: 'EXECUTED',
          executedAt: now,
          finalFeeling: 'REGRET',
        },
        {
          id: '2',
          title: 'Test 2',
          category: 'SHOPPING',
          price: 200,
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: now,
          reviewAt: now,
          status: 'EXECUTED',
          executedAt: now,
          finalFeeling: 'WORTH_IT',
        },
      ];

      const stats = computeStats(impulses);
      expect(stats.totalExecuted).toBe(2);
      expect(stats.regretRate).toBe(50);
    });

    it('should handle empty impulses array', () => {
      const stats = computeStats([]);
      expect(stats.totalSaved).toBe(0);
      expect(stats.totalCancelled).toBe(0);
      expect(stats.totalExecuted).toBe(0);
      expect(stats.regretRate).toBe(0);
      expect(stats.currentStreak).toBe(0);
    });

    it('should calculate today stats correctly', () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const todayTimestamp = today.getTime();

      const impulses: Impulse[] = [
        {
          id: '1',
          title: 'Test 1',
          category: 'FOOD',
          price: 100,
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: todayTimestamp,
          reviewAt: todayTimestamp,
          status: 'CANCELLED',
        },
      ];

      const stats = computeStats(impulses);
      expect(stats.todaySaved).toBe(100);
      expect(stats.todayLogged).toBe(1);
    });

    it('should handle impulses without price', () => {
      const impulses: Impulse[] = [
        {
          id: '1',
          title: 'Test 1',
          category: 'FOOD',
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: Date.now(),
          reviewAt: Date.now(),
          status: 'CANCELLED',
        },
      ];

      const stats = computeStats(impulses);
      expect(stats.totalSaved).toBe(0);
      expect(stats.totalCancelled).toBe(1);
    });
  });

  describe('computeCategoryStats', () => {
    it('should calculate category stats correctly', () => {
      const now = Date.now();
      const impulses: Impulse[] = [
        {
          id: '1',
          title: 'Food 1',
          category: 'FOOD',
          price: 100,
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: now,
          reviewAt: now,
          status: 'CANCELLED',
        },
        {
          id: '2',
          title: 'Food 2',
          category: 'FOOD',
          price: 200,
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: now,
          reviewAt: now,
          status: 'EXECUTED',
          executedAt: now,
          finalFeeling: 'REGRET',
        },
        {
          id: '3',
          title: 'Shopping 1',
          category: 'SHOPPING',
          price: 300,
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: now,
          reviewAt: now,
          status: 'CANCELLED',
        },
      ];

      const categoryStats = computeCategoryStats(impulses);
      
      const foodStats = categoryStats.find(s => s.category === 'FOOD');
      expect(foodStats).toBeDefined();
      expect(foodStats?.totalLogged).toBe(2);
      expect(foodStats?.totalCancelled).toBe(1);
      expect(foodStats?.totalRegretted).toBe(1);
      expect(foodStats?.avgPrice).toBe(150);
      expect(foodStats?.regretRate).toBe(100);

      const shoppingStats = categoryStats.find(s => s.category === 'SHOPPING');
      expect(shoppingStats).toBeDefined();
      expect(shoppingStats?.totalLogged).toBe(1);
    });

    it('should filter out categories with no impulses', () => {
      const categoryStats = computeCategoryStats([]);
      expect(categoryStats.length).toBe(0);
    });

    it('should calculate average price correctly', () => {
      const now = Date.now();
      const impulses: Impulse[] = [
        {
          id: '1',
          title: 'Test 1',
          category: 'FOOD',
          price: 100,
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: now,
          reviewAt: now,
          status: 'LOCKED',
        },
        {
          id: '2',
          title: 'Test 2',
          category: 'FOOD',
          price: 200,
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: now,
          reviewAt: now,
          status: 'LOCKED',
        },
        {
          id: '3',
          title: 'Test 3',
          category: 'FOOD',
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: now,
          reviewAt: now,
          status: 'LOCKED',
        },
      ];

      const categoryStats = computeCategoryStats(impulses);
      const foodStats = categoryStats.find(s => s.category === 'FOOD');
      // Average of 100, 200, and 0 (undefined price) = 100
      expect(foodStats?.avgPrice).toBe(100);
    });
  });
});

