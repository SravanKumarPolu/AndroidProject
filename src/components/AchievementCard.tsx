import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { AchievementProgress, UserLevel } from '@/types/achievement';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { createAchievementShareContent, shareContent } from '@/utils/share';

interface AchievementCardProps {
  level?: UserLevel;
  recentAchievements?: AchievementProgress[];
  onPress?: () => void;
}

export function AchievementCard({ level, recentAchievements = [], onPress }: AchievementCardProps) {
  const { colors } = useTheme();

  const handleShareAchievement = async (achievement: AchievementProgress) => {
    try {
      const shareData = createAchievementShareContent(
        achievement.achievement.title,
        level?.level || 1,
        level?.totalXP || 0
      );
      await shareContent(shareData);
    } catch (error) {
      const { logger } = require('@/utils/logger');
      logger.error('Error sharing achievement', error instanceof Error ? error : new Error(String(error)));
      Alert.alert('Error', 'Failed to share achievement. Please try again.');
    }
  };

  if (!level) {
    return null;
  }

  const rarityColors = {
    COMMON: colors.gray[500],
    RARE: colors.primary[500],
    EPIC: colors.accent[500],
    LEGENDARY: colors.success[500],
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.levelBadge, { backgroundColor: colors.primary[500] }]}>
            <Text style={[styles.levelText, { color: colors.textDark }]}>Lv.{level.level}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.levelLabel, { color: colors.text }]}>Level {level.level}</Text>
            <Text style={[styles.xpText, { color: colors.textLight }]}>
              {level.currentXP} / {level.xpForNextLevel} XP
            </Text>
          </View>
        </View>
        {onPress && (
          <TouchableOpacity onPress={onPress}>
            <Ionicons name="trophy" size={24} color={colors.primary[600]} />
          </TouchableOpacity>
        )}
      </View>

      {/* XP Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: colors.borderLight }]}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${level.progress}%`,
              backgroundColor: colors.primary[500],
            },
          ]}
        />
      </View>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={[styles.recentTitle, { color: colors.textLight }]}>Recent</Text>
          <View style={styles.recentList}>
            {recentAchievements.slice(0, 3).map((ap) => (
              <View key={ap.achievement.id} style={styles.recentItem}>
                <Text style={styles.recentIcon}>{ap.achievement.icon}</Text>
                <View style={styles.recentText}>
                  <Text style={[styles.recentName, { color: colors.text }]} numberOfLines={1}>
                    {ap.achievement.title}
                  </Text>
                  <Text style={[styles.recentXP, { color: colors.textLight }]}>
                    +{ap.achievement.xpReward} XP
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleShareAchievement(ap)}
                  style={styles.shareButton}
                >
                  <Ionicons name="share-outline" size={16} color={colors.primary[600]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {onPress && (
        <TouchableOpacity
          style={[styles.viewAllButton, { borderColor: colors.border }]}
          onPress={onPress}
        >
          <Text style={[styles.viewAllText, { color: colors.primary[600] }]}>View All Achievements</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.primary[600]} />
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  headerText: {
    gap: spacing.xs / 2,
  },
  levelLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  xpText: {
    fontSize: typography.fontSize.sm,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.base,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  recentSection: {
    marginTop: spacing.sm,
  },
  recentTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  recentList: {
    gap: spacing.xs,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shareButton: {
    padding: spacing.xs / 2,
  },
  recentIcon: {
    fontSize: 24,
  },
  recentText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  recentName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  recentXP: {
    fontSize: typography.fontSize.xs,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.base,
    borderTopWidth: 1,
    gap: spacing.xs,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});

