import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAchievements } from '@/hooks/useAchievements';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { AchievementProgress, AchievementCategory } from '@/types/achievement';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { createAchievementShareContent, shareContent } from '@/utils/share';

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  STREAK: 'Streaks',
  SAVINGS: 'Savings',
  CANCELLATIONS: 'Cancellations',
  CATEGORY: 'Categories',
  TIME: 'Time-Based',
  SPECIAL: 'Special',
};

const CATEGORY_ICONS: Record<AchievementCategory, keyof typeof Ionicons.glyphMap> = {
  STREAK: 'flame',
  SAVINGS: 'cash',
  CANCELLATIONS: 'checkmark-circle',
  CATEGORY: 'grid',
  TIME: 'time',
  SPECIAL: 'star',
};

export default function AchievementsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    achievementProgress,
    userLevel,
    gamificationStats,
    unlockedCount,
    totalCount,
    achievementsByCategory,
  } = useAchievements();

  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'ALL'>('ALL');

  const categories: (AchievementCategory | 'ALL')[] = ['ALL', ...Object.keys(CATEGORY_LABELS) as AchievementCategory[]];

  const displayAchievements: AchievementProgress[] =
    selectedCategory === 'ALL'
      ? achievementProgress
      : achievementsByCategory[selectedCategory] || [];

  const rarityColors = {
    COMMON: colors.gray[500],
    RARE: colors.primary[500],
    EPIC: colors.accent[500],
    LEGENDARY: colors.success[500],
  };

  const handleShareAchievement = async (ap: AchievementProgress) => {
    if (!ap.isUnlocked || !userLevel || !gamificationStats) {
      return;
    }

    try {
      const shareData = createAchievementShareContent(
        ap.achievement.title,
        userLevel.level,
        gamificationStats.totalXP
      );
      await shareContent(shareData);
    } catch (error) {
      console.error('Error sharing achievement:', error);
      Alert.alert('Error', 'Failed to share achievement. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>Achievements</Text>
            <Text style={[styles.subtitle, { color: colors.textLight }]}>
              {unlockedCount} of {totalCount} unlocked
            </Text>
          </View>
        </View>

        {/* Level Card */}
        {userLevel && (
          <Card variant="elevated" style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={[styles.levelBadge, { backgroundColor: colors.primary[500] }]}>
                <Text style={[styles.levelNumber, { color: colors.textDark }]}>
                  {userLevel.level}
                </Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={[styles.levelLabel, { color: colors.text }]}>
                  Level {userLevel.level}
                </Text>
                <Text style={[styles.levelXP, { color: colors.textLight }]}>
                  {userLevel.currentXP} / {userLevel.xpForNextLevel} XP
                </Text>
              </View>
              {gamificationStats && (
                <View style={styles.totalXP}>
                  <Text style={[styles.totalXPValue, { color: colors.primary[600] }]}>
                    {gamificationStats.totalXP}
                  </Text>
                  <Text style={[styles.totalXPLabel, { color: colors.textLight }]}>Total XP</Text>
                </View>
              )}
            </View>
            <View style={[styles.progressBarContainer, { backgroundColor: colors.borderLight }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${userLevel.progress}%`,
                    backgroundColor: colors.primary[500],
                  },
                ]}
              />
            </View>
          </Card>
        )}

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                {
                  backgroundColor:
                    selectedCategory === category ? colors.primary[500] : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              {category !== 'ALL' && (
                <Ionicons
                  name={CATEGORY_ICONS[category]}
                  size={16}
                  color={selectedCategory === category ? colors.textDark : colors.textLight}
                />
              )}
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      selectedCategory === category
                        ? colors.textDark
                        : colors.textLight,
                  },
                ]}
              >
                {category === 'ALL' ? 'All' : CATEGORY_LABELS[category]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Achievements List */}
        <View style={styles.achievementsList}>
          {displayAchievements.map((ap) => {
            const isUnlocked = ap.isUnlocked;
            const rarityColor = rarityColors[ap.achievement.rarity];

            return (
              <Card
                key={ap.achievement.id}
                variant="elevated"
                style={[
                  styles.achievementCard,
                  !isUnlocked && { opacity: 0.6 },
                ]}
              >
                <View style={styles.achievementContent}>
                  <View
                    style={[
                      styles.achievementIcon,
                      {
                        backgroundColor: isUnlocked
                          ? rarityColor
                          : colors.gray[200],
                      },
                    ]}
                  >
                    <Text style={styles.iconText}>{ap.achievement.icon}</Text>
                  </View>
                  <View style={styles.achievementText}>
                    <View style={styles.achievementHeader}>
                      <Text style={[styles.achievementTitle, { color: colors.text }]}>
                        {ap.achievement.title}
                      </Text>
                      {isUnlocked && (
                        <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
                          <Text style={[styles.rarityText, { color: colors.textDark }]}>
                            {ap.achievement.rarity}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.achievementDescription, { color: colors.textLight }]}>
                      {ap.achievement.description}
                    </Text>
                    {!isUnlocked && (
                      <View style={styles.progressInfo}>
                        <View style={[styles.progressBarContainer, { backgroundColor: colors.borderLight }]}>
                          <View
                            style={[
                              styles.progressBar,
                              {
                                width: `${ap.progress}%`,
                                backgroundColor: colors.primary[500],
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.progressText, { color: colors.textLight }]}>
                          {ap.current} / {ap.target}
                        </Text>
                      </View>
                    )}
                    <View style={styles.xpInfo}>
                      <Ionicons name="star" size={14} color={colors.accent[500]} />
                      <Text style={[styles.xpText, { color: colors.textLight }]}>
                        +{ap.achievement.xpReward} XP
                      </Text>
                    </View>
                  </View>
                  <View style={styles.achievementActions}>
                    {isUnlocked && (
                      <>
                        <Ionicons name="checkmark-circle" size={24} color={colors.success[500]} />
                        <TouchableOpacity
                          onPress={() => handleShareAchievement(ap)}
                          style={styles.shareButton}
                        >
                          <Ionicons name="share-outline" size={20} color={colors.primary[600]} />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Empty State */}
        {displayAchievements.length === 0 && (
          <Card variant="elevated" style={styles.emptyCard}>
            <Ionicons name="trophy-outline" size={48} color={colors.textLight} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Achievements</Text>
            <Text style={[styles.emptyText, { color: colors.textLight }]}>
              Keep using the app to unlock achievements!
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    marginRight: spacing.base,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
  },
  levelCard: {
    marginBottom: spacing.base,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
    gap: spacing.base,
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  levelInfo: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  levelLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  levelXP: {
    fontSize: typography.fontSize.sm,
  },
  totalXP: {
    alignItems: 'flex-end',
  },
  totalXPValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  totalXPLabel: {
    fontSize: typography.fontSize.xs,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryScroll: {
    marginBottom: spacing.base,
  },
  categoryContainer: {
    gap: spacing.sm,
    paddingRight: spacing.base,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  achievementsList: {
    gap: spacing.base,
  },
  achievementCard: {
    marginBottom: spacing.base,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.base,
  },
  achievementActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shareButton: {
    padding: spacing.xs,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 28,
  },
  achievementText: {
    flex: 1,
    gap: spacing.xs,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  achievementTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  rarityBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.xs,
  },
  rarityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  achievementDescription: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  progressInfo: {
    gap: spacing.xs,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
  },
  xpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  xpText: {
    fontSize: typography.fontSize.xs,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
});

