import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, AchievementProgress, UserLevel, GamificationStats } from '@/types/achievement';
import { ACHIEVEMENT_DEFINITIONS, calculateLevel } from '@/constants/achievements';
import { UserStats, CategoryStats, Impulse } from '@/types/impulse';
import { computeCategoryStats } from '@/utils/stats';

const ACHIEVEMENTS_KEY = '@impulsevault:achievements';
const XP_KEY = '@impulsevault:totalXP';
const RECENT_ACHIEVEMENTS_KEY = '@impulsevault:recentAchievements';

/**
 * Achievements Service
 * Efficient achievement checking - only checks when stats change
 */
export const achievements = {
  /**
   * Get all unlocked achievements
   */
  async getUnlockedAchievements(): Promise<Record<string, Achievement>> {
    try {
      const data = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.error('Error getting achievements:', error);
      return {};
    }
  },

  /**
   * Get total XP
   */
  async getTotalXP(): Promise<number> {
    try {
      const data = await AsyncStorage.getItem(XP_KEY);
      return data ? parseInt(data, 10) : 0;
    } catch (error) {
      console.error('Error getting XP:', error);
      return 0;
    }
  },

  /**
   * Get recent achievements (last 5)
   */
  async getRecentAchievements(): Promise<Achievement[]> {
    try {
      const data = await AsyncStorage.getItem(RECENT_ACHIEVEMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting recent achievements:', error);
      return [];
    }
  },

  /**
   * Check and unlock achievements based on current stats
   * This is the main function - call it when stats change
   */
  async checkAchievements(
    stats: UserStats,
    impulses: Impulse[]
  ): Promise<{ newlyUnlocked: Achievement[]; totalXP: number }> {
    const unlocked = await this.getUnlockedAchievements();
    const categoryStats = computeCategoryStats(impulses);
    const newlyUnlocked: Achievement[] = [];
    let xpGained = 0;

    // Check each achievement definition
    for (const definition of ACHIEVEMENT_DEFINITIONS) {
      // Skip if already unlocked
      if (unlocked[definition.id]) continue;

      // Check condition
      const currentValue = definition.checkCondition(stats, impulses, categoryStats);
      
      if (currentValue >= definition.threshold) {
        // Achievement unlocked!
        const achievement: Achievement = {
          id: definition.id,
          title: definition.title,
          description: definition.description,
          category: definition.category,
          rarity: definition.rarity,
          icon: definition.icon,
          threshold: definition.threshold,
          xpReward: definition.xpReward,
          unlockedAt: Date.now(),
        };

        unlocked[definition.id] = achievement;
        newlyUnlocked.push(achievement);
        xpGained += definition.xpReward;
      }
    }

    // Save unlocked achievements
    if (newlyUnlocked.length > 0) {
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
      
      // Update recent achievements
      const recent = await this.getRecentAchievements();
      const updated = [...newlyUnlocked, ...recent].slice(0, 5);
      await AsyncStorage.setItem(RECENT_ACHIEVEMENTS_KEY, JSON.stringify(updated));

      // Update total XP
      const currentXP = await this.getTotalXP();
      const newTotalXP = currentXP + xpGained;
      await AsyncStorage.setItem(XP_KEY, newTotalXP.toString());
      
      return { newlyUnlocked, totalXP: newTotalXP };
    }

    const currentXP = await this.getTotalXP();
    return { newlyUnlocked: [], totalXP: currentXP };
  },

  /**
   * Get achievement progress for all achievements
   */
  async getAchievementProgress(
    stats: UserStats,
    impulses: Impulse[]
  ): Promise<AchievementProgress[]> {
    const unlocked = await this.getUnlockedAchievements();
    const categoryStats = computeCategoryStats(impulses);

    return ACHIEVEMENT_DEFINITIONS.map(definition => {
      const currentValue = definition.checkCondition(stats, impulses, categoryStats);
      const isUnlocked = !!unlocked[definition.id];
      const unlockedAchievement = unlocked[definition.id];

      const progress = definition.threshold > 0
        ? Math.min(100, (currentValue / definition.threshold) * 100)
        : 0;

      return {
        achievement: {
          id: definition.id,
          title: definition.title,
          description: definition.description,
          category: definition.category,
          rarity: definition.rarity,
          icon: definition.icon,
          threshold: definition.threshold,
          xpReward: definition.xpReward,
          unlockedAt: unlockedAchievement?.unlockedAt,
          progress: isUnlocked ? 100 : progress,
        },
        current: currentValue,
        target: definition.threshold,
        progress,
        isUnlocked,
        unlockedAt: unlockedAchievement?.unlockedAt,
      };
    });
  },

  /**
   * Get user level
   */
  async getUserLevel(): Promise<UserLevel> {
    const totalXP = await this.getTotalXP();
    return calculateLevel(totalXP);
  },

  /**
   * Get gamification stats
   */
  async getGamificationStats(): Promise<GamificationStats> {
    const unlocked = await this.getUnlockedAchievements();
    const totalXP = await this.getTotalXP();
    const level = calculateLevel(totalXP);
    const recent = await this.getRecentAchievements();

    return {
      totalXP,
      level: level.level,
      achievementsUnlocked: Object.keys(unlocked).length,
      achievementsTotal: ACHIEVEMENT_DEFINITIONS.length,
      recentAchievements: recent,
    };
  },

  /**
   * Reset all achievements (for testing)
   */
  async resetAchievements(): Promise<void> {
    await AsyncStorage.removeItem(ACHIEVEMENTS_KEY);
    await AsyncStorage.removeItem(XP_KEY);
    await AsyncStorage.removeItem(RECENT_ACHIEVEMENTS_KEY);
  },
};

