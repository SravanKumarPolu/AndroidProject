import { useState, useEffect, useCallback, useMemo } from 'react';
import { achievements } from '@/services/achievements';
import { useStats } from '@/hooks/useStats';
import { useImpulses } from '@/hooks/useImpulses';
import {
  Achievement,
  AchievementProgress,
  UserLevel,
  GamificationStats,
} from '@/types/achievement';
import { promptRatingIfAppropriate } from '@/services/rating';

/**
 * Custom hook for achievements and gamification
 * Efficiently checks achievements only when relevant data changes
 */
export function useAchievements() {
  const { impulses } = useImpulses();
  const { stats } = useStats(impulses);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Record<string, Achievement>>({});
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [gamificationStats, setGamificationStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  // Load initial data
  useEffect(() => {
    loadAchievements();
  }, []);

  // Check achievements when stats or impulses change
  useEffect(() => {
    if (stats && impulses && !loading) {
      checkAchievements();
    }
  }, [stats.totalSaved, stats.totalCancelled, stats.currentStreak, stats.longestStreak, impulses.length]);

  const loadAchievements = useCallback(async () => {
    try {
      const [unlocked, progress, level, gamification] = await Promise.all([
        achievements.getUnlockedAchievements(),
        achievements.getAchievementProgress(stats, impulses),
        achievements.getUserLevel(),
        achievements.getGamificationStats(),
      ]);

      setUnlockedAchievements(unlocked);
      setAchievementProgress(progress);
      setUserLevel(level);
      setGamificationStats(gamification);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [stats, impulses]);

  const checkAchievements = useCallback(async () => {
    try {
      const result = await achievements.checkAchievements(stats, impulses);
      
      if (result.newlyUnlocked.length > 0) {
        setNewlyUnlocked(result.newlyUnlocked);
        // Clear after 5 seconds
        setTimeout(() => setNewlyUnlocked([]), 5000);
        
        // Reload achievements
        await loadAchievements();

        // Prompt for rating after milestone achievements
        // Only prompt for significant achievements (RARE, EPIC, LEGENDARY)
        const significantAchievements = result.newlyUnlocked.filter(
          a => a.rarity === 'RARE' || a.rarity === 'EPIC' || a.rarity === 'LEGENDARY'
        );
        if (significantAchievements.length > 0) {
          // Delay the prompt slightly to not interrupt the celebration
          setTimeout(() => {
            promptRatingIfAppropriate();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, [stats, impulses, loadAchievements]);

  const refreshAchievements = useCallback(async () => {
    await loadAchievements();
    await checkAchievements();
  }, [loadAchievements, checkAchievements]);

  // Memoized computed values
  const unlockedCount = useMemo(() => Object.keys(unlockedAchievements).length, [unlockedAchievements]);
  const totalCount = useMemo(() => achievementProgress.length, [achievementProgress]);
  const unlockedProgress = useMemo(() => {
    return achievementProgress.filter(ap => ap.isUnlocked);
  }, [achievementProgress]);
  const lockedProgress = useMemo(() => {
    return achievementProgress.filter(ap => !ap.isUnlocked);
  }, [achievementProgress]);

  // Group by category
  const achievementsByCategory = useMemo(() => {
    const grouped: Record<string, AchievementProgress[]> = {};
    achievementProgress.forEach(ap => {
      if (!grouped[ap.achievement.category]) {
        grouped[ap.achievement.category] = [];
      }
      grouped[ap.achievement.category].push(ap);
    });
    return grouped;
  }, [achievementProgress]);

  return {
    // State
    unlockedAchievements,
    achievementProgress,
    userLevel,
    gamificationStats,
    loading,
    newlyUnlocked,
    
    // Computed
    unlockedCount,
    totalCount,
    unlockedProgress,
    lockedProgress,
    achievementsByCategory,
    
    // Actions
    refreshAchievements,
    checkAchievements,
  };
}

