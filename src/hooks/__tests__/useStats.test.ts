import { renderHook } from '@testing-library/react-native';
import { useStats } from '../useStats';
import { Impulse } from '@/types/impulse';

describe('useStats', () => {
  it('should compute stats from impulses', () => {
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
        status: 'CANCELLED',
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
        finalFeeling: 'REGRET',
      },
    ];

    const { result } = renderHook(() => useStats(impulses));

    expect(result.current.stats.totalSaved).toBe(100);
    expect(result.current.stats.totalExecuted).toBe(1);
    expect(result.current.stats.totalCancelled).toBe(1);
    expect(result.current.stats.regretRate).toBe(100);
  });

  it('should filter active impulses', () => {
    const now = Date.now();
    const impulses: Impulse[] = [
      {
        id: '1',
        title: 'Active 1',
        category: 'FOOD',
        urgency: 'IMPULSE',
        coolDownPeriod: '24H',
        createdAt: now,
        reviewAt: now + 1000,
        status: 'LOCKED',
      },
      {
        id: '2',
        title: 'Cancelled',
        category: 'FOOD',
        urgency: 'IMPULSE',
        coolDownPeriod: '24H',
        createdAt: now,
        reviewAt: now,
        status: 'CANCELLED',
      },
    ];

    const { result } = renderHook(() => useStats(impulses));

    expect(result.current.activeImpulses.length).toBe(1);
    expect(result.current.activeImpulses[0].id).toBe('1');
  });

  it('should identify ready to review impulses', () => {
    const now = Date.now();
    const impulses: Impulse[] = [
      {
        id: '1',
        title: 'Ready',
        category: 'FOOD',
        urgency: 'IMPULSE',
        coolDownPeriod: '24H',
        createdAt: now - 100000,
        reviewAt: now - 1000, // Past review time
        status: 'LOCKED',
      },
      {
        id: '2',
        title: 'Not Ready',
        category: 'FOOD',
        urgency: 'IMPULSE',
        coolDownPeriod: '24H',
        createdAt: now,
        reviewAt: now + 100000, // Future review time
        status: 'LOCKED',
      },
    ];

    const { result } = renderHook(() => useStats(impulses));

    expect(result.current.readyToReview.length).toBe(1);
    expect(result.current.readyToReview[0].id).toBe('1');
  });

  it('should compute category stats', () => {
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
        status: 'CANCELLED',
      },
    ];

    const { result } = renderHook(() => useStats(impulses));

    const foodStats = result.current.categoryStats.find(s => s.category === 'FOOD');
    expect(foodStats).toBeDefined();
    expect(foodStats?.totalLogged).toBe(2);
  });

  it('should handle empty impulses array', () => {
    const { result } = renderHook(() => useStats([]));

    expect(result.current.stats.totalSaved).toBe(0);
    expect(result.current.activeImpulses.length).toBe(0);
    expect(result.current.readyToReview.length).toBe(0);
    expect(result.current.categoryStats.length).toBe(0);
  });
});

