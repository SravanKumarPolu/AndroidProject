import { Impulse } from '@/types/impulse';

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt: number | null;
  category: 'streak' | 'skip' | 'time' | 'milestone';
}

export const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt'>[] = [
  // Time-based badges
  {
    id: '30min-hold',
    name: '30-Minute Hold',
    description: 'Resisted an impulse for 30 minutes',
    emoji: '⏰',
    category: 'time',
  },
  {
    id: '1hour-hold',
    name: '1-Hour Warrior',
    description: 'Resisted an impulse for 1 hour',
    emoji: '🛡️',
    category: 'time',
  },
  {
    id: '24hour-hold',
    name: '24-Hour Champion',
    description: 'Resisted an impulse for 24 hours',
    emoji: '👑',
    category: 'time',
  },
  
  // Streak badges
  {
    id: '3day-streak',
    name: '3-Day Streak',
    description: 'Skipped impulses for 3 consecutive days',
    emoji: '🔥',
    category: 'streak',
  },
  {
    id: '7day-streak',
    name: 'Week Warrior',
    description: 'Skipped impulses for 7 consecutive days',
    emoji: '💪',
    category: 'streak',
  },
  {
    id: '30day-streak',
    name: 'Month Master',
    description: 'Skipped impulses for 30 consecutive days',
    emoji: '🏆',
    category: 'streak',
  },
  
  // Skip count badges
  {
    id: 'first-skip',
    name: 'First Skip',
    description: 'Skipped your first impulse',
    emoji: '🎯',
    category: 'skip',
  },
  {
    id: '10-skips',
    name: 'Decade Skipper',
    description: 'Skipped 10 impulses',
    emoji: '⭐',
    category: 'skip',
  },
  {
    id: '50-skips',
    name: 'Half Century',
    description: 'Skipped 50 impulses',
    emoji: '🌟',
    category: 'skip',
  },
  {
    id: '100-skips',
    name: 'Century Club',
    description: 'Skipped 100 impulses',
    emoji: '💎',
    category: 'skip',
  },
  
  // Milestone badges
  {
    id: 'save-100',
    name: '$100 Saver',
    description: 'Saved $100 by skipping impulses',
    emoji: '💰',
    category: 'milestone',
  },
  {
    id: 'save-1000',
    name: '$1K Saver',
    description: 'Saved $1,000 by skipping impulses',
    emoji: '💵',
    category: 'milestone',
  },
  {
    id: 'save-5000',
    name: '$5K Saver',
    description: 'Saved $5,000 by skipping impulses',
    emoji: '💸',
    category: 'milestone',
  },
];

/**
 * Calculate which badges should be unlocked based on impulses
 */
export function calculateBadges(impulses: Impulse[]): Badge[] {
  const badges: Badge[] = BADGE_DEFINITIONS.map((def) => ({
    ...def,
    unlockedAt: null,
  }));

  const skippedImpulses = impulses.filter(
    (imp) => imp.decisionAtEnd === 'skipped' || imp.status === 'skipped'
  );
  const totalSaved = skippedImpulses.reduce((sum, imp) => sum + imp.price, 0);
  const skipCount = skippedImpulses.length;

  // Calculate streak
  const sortedSkips = skippedImpulses
    .map((imp) => imp.decisionAt || imp.createdAt)
    .sort((a, b) => b - a);
  
  const daysWithSkips = new Set<number>();
  sortedSkips.forEach((timestamp) => {
    const date = new Date(timestamp);
    const dayKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    daysWithSkips.add(dayKey);
  });
  
  const sortedDays = Array.from(daysWithSkips).sort((a, b) => b - a);
  let currentStreak = 0;
  const today = new Date();
  const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  
  if (sortedDays.length > 0) {
    let currentDay = sortedDays[0];
    if (currentDay === todayKey) {
      currentStreak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const expectedDay = currentDay - (24 * 60 * 60 * 1000);
        if (sortedDays[i] === expectedDay) {
          currentStreak++;
          currentDay = sortedDays[i];
        } else {
          break;
        }
      }
    } else {
      const yesterday = todayKey - (24 * 60 * 60 * 1000);
      if (sortedDays[0] === yesterday) {
        currentStreak = 1;
        currentDay = sortedDays[0];
        for (let i = 1; i < sortedDays.length; i++) {
          const expectedDay = currentDay - (24 * 60 * 60 * 1000);
          if (sortedDays[i] === expectedDay) {
            currentStreak++;
            currentDay = sortedDays[i];
          } else {
            break;
          }
        }
      }
    }
  }

  // Check time-based badges (30min, 1hr, 24hr holds)
  impulses.forEach((imp) => {
    if (imp.status === 'cooldown' || imp.status === 'decision') {
      const cooldownDuration = imp.cooldownEndsAt - imp.createdAt;
      const hours = cooldownDuration / (1000 * 60 * 60);
      
      if (hours >= 24) {
        const badge = badges.find((b) => b.id === '24hour-hold');
        if (badge && !badge.unlockedAt) {
          badge.unlockedAt = imp.cooldownEndsAt;
        }
      } else if (hours >= 1) {
        const badge = badges.find((b) => b.id === '1hour-hold');
        if (badge && !badge.unlockedAt) {
          badge.unlockedAt = imp.cooldownEndsAt;
        }
      } else if (hours >= 0.5) {
        const badge = badges.find((b) => b.id === '30min-hold');
        if (badge && !badge.unlockedAt) {
          badge.unlockedAt = imp.cooldownEndsAt;
        }
      }
    }
  });

  // Check skip count badges
  if (skipCount >= 100) {
    const badge = badges.find((b) => b.id === '100-skips');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = Date.now();
    }
  } else if (skipCount >= 50) {
    const badge = badges.find((b) => b.id === '50-skips');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = Date.now();
    }
  } else if (skipCount >= 10) {
    const badge = badges.find((b) => b.id === '10-skips');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = Date.now();
    }
  } else if (skipCount >= 1) {
    const badge = badges.find((b) => b.id === 'first-skip');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = Date.now();
    }
  }

  // Check streak badges
  if (currentStreak >= 30) {
    const badge = badges.find((b) => b.id === '30day-streak');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = Date.now();
    }
  } else if (currentStreak >= 7) {
    const badge = badges.find((b) => b.id === '7day-streak');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = Date.now();
    }
  } else if (currentStreak >= 3) {
    const badge = badges.find((b) => b.id === '3day-streak');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = Date.now();
    }
  }

  // Check savings milestones
  if (totalSaved >= 5000) {
    const badge = badges.find((b) => b.id === 'save-5000');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = Date.now();
    }
  } else if (totalSaved >= 1000) {
    const badge = badges.find((b) => b.id === 'save-1000');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = Date.now();
    }
  } else if (totalSaved >= 100) {
    const badge = badges.find((b) => b.id === 'save-100');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = Date.now();
    }
  }

  return badges;
}

