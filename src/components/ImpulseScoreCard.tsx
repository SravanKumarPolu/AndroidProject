/**
 * Impulse Control Score Card
 * Displays user's impulse control score and improvement
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useStats } from '@/hooks/useStats';
import { useImpulses } from '@/hooks/useImpulses';
import { calculateImpulseScore, getScoreInsights, ImpulseScore } from '@/utils/impulseScore';
import { Card } from './ui/Card';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';

interface ImpulseScoreCardProps {
  onPress?: () => void;
}

export function ImpulseScoreCard({ onPress }: ImpulseScoreCardProps) {
  const { colors } = useTheme();
  const { impulses } = useImpulses();
  const { stats } = useStats(impulses);
  
  const scoreData = React.useMemo(() => {
    return calculateImpulseScore(impulses, stats);
  }, [impulses, stats]);
  
  const insights = React.useMemo(() => {
    return getScoreInsights(scoreData, stats);
  }, [scoreData, stats]);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success[600];
    if (score >= 60) return colors.primary[600];
    if (score >= 40) return colors.accent[600];
    return colors.error[600];
  };
  
  const getTrendIcon = (trend: ImpulseScore['trend']) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      default:
        return '➡️';
    }
  };
  
  const scoreColor = getScoreColor(scoreData.score);
  
  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Impulse Control Score</Text>
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            {scoreData.message}
          </Text>
        </View>
        <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {scoreData.score}
          </Text>
          <Text style={[styles.scoreLabel, { color: colors.textLight }]}>/100</Text>
        </View>
      </View>
      
      {/* Improvement indicator */}
      {scoreData.improvement !== 0 && (
        <View style={[styles.improvementContainer, { backgroundColor: colors.primary[50] }]}>
          <Text style={styles.trendIcon}>{getTrendIcon(scoreData.trend)}</Text>
          <Text style={[styles.improvementText, { color: colors.primary[700] }]}>
            {scoreData.improvement > 0 ? '+' : ''}{scoreData.improvement} points
            {scoreData.trend === 'improving' ? ' this week!' : ' this week'}
          </Text>
        </View>
      )}
      
      {/* Progress to next milestone */}
      <View style={styles.milestoneContainer}>
        <View style={styles.milestoneHeader}>
          <Text style={[styles.milestoneLabel, { color: colors.textLight }]}>
            Next milestone: {scoreData.milestones.nextMilestone}
          </Text>
          <Text style={[styles.milestoneProgress, { color: colors.text }]}>
            {Math.round(scoreData.milestones.progressToNext)}%
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.gray[200] }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${scoreData.milestones.progressToNext}%`,
                backgroundColor: scoreColor,
              },
            ]}
          />
        </View>
      </View>
      
      {/* Insights */}
      {insights.length > 0 && (
        <View style={styles.insightsContainer}>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Ionicons name="bulb-outline" size={16} color={colors.primary[600]} />
              <Text style={[styles.insightText, { color: colors.text }]}>{insight}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Level badge */}
      <View style={[styles.levelBadge, { backgroundColor: scoreColor + '20' }]}>
        <Text style={[styles.levelText, { color: scoreColor }]}>
          {scoreData.level.replace('_', ' ').toUpperCase()}
        </Text>
      </View>
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card>{content}</Card>
      </TouchableOpacity>
    );
  }
  
  return <Card>{content}</Card>;
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.base,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize['2xl'],
  },
  scoreLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: -4,
  },
  improvementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.md,
    marginBottom: spacing.base,
  },
  trendIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  improvementText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  milestoneContainer: {
    marginBottom: spacing.base,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  milestoneLabel: {
    fontSize: typography.fontSize.sm,
  },
  milestoneProgress: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  insightsContainer: {
    marginTop: spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  insightText: {
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.xs,
    flex: 1,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    marginTop: spacing.sm,
  },
  levelText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});

