import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { RecurringPattern } from '@/types/pattern';
import { CATEGORY_LABELS } from '@/constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '@/utils/currency';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface PatternCardProps {
  pattern: RecurringPattern;
  onPress?: () => void;
  showPrediction?: boolean;
}

const PATTERN_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  DAILY: 'calendar',
  WEEKLY: 'calendar-outline',
  MONTHLY: 'calendar-number',
  FREQUENT: 'flash',
  TIME_BASED: 'time',
  CATEGORY: 'grid',
  PRICE: 'cash',
  SOURCE: 'apps',
};

const PATTERN_LABELS: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  FREQUENT: 'Frequent',
  TIME_BASED: 'Time-Based',
  CATEGORY: 'Category',
  PRICE: 'Price',
  SOURCE: 'Source',
};

const STRENGTH_COLORS = {
  WEAK: 'gray',
  MODERATE: 'primary',
  STRONG: 'accent',
  VERY_STRONG: 'error',
} as const;

export function PatternCard({ pattern, onPress, showPrediction = true }: PatternCardProps) {
  const { colors } = useTheme();
  
  const strengthColor = colors[STRENGTH_COLORS[pattern.strength]][600];
  const iconName = PATTERN_ICONS[pattern.type] || 'pulse';
  
  const formatNextOccurrence = () => {
    if (!pattern.nextPredictedDate) return null;
    const now = Date.now();
    const daysUntil = Math.ceil((pattern.nextPredictedDate - now) / (24 * 60 * 60 * 1000));
    
    if (daysUntil < 0) return null;
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil <= 7) return `In ${daysUntil} days`;
    return new Date(pattern.nextPredictedDate).toLocaleDateString();
  };

  const nextOccurrence = formatNextOccurrence();
  const dayName = pattern.dayOfWeek !== undefined 
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][pattern.dayOfWeek]
    : null;
  
  const timeLabel = pattern.timeOfDay !== undefined
    ? `${pattern.timeOfDay < 12 ? pattern.timeOfDay : pattern.timeOfDay === 12 ? 12 : pattern.timeOfDay - 12}${pattern.timeOfDay < 12 ? 'AM' : 'PM'}`
    : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: strengthColor + '20' }]}>
              <Ionicons name={iconName} size={20} color={strengthColor} />
            </View>
            <View style={styles.headerText}>
              <View style={styles.titleRow}>
                <Text style={[styles.patternType, { color: colors.text }]}>
                  {PATTERN_LABELS[pattern.type]} Pattern
                </Text>
                <View style={[styles.strengthBadge, { backgroundColor: strengthColor }]}>
                  <Text style={[styles.strengthText, { color: colors.textDark }]}>
                    {pattern.strength.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              {pattern.category && (
                <View style={styles.categoryRow}>
                  <CategoryIcon category={pattern.category} size={14} />
                  <Text style={[styles.categoryLabel, { color: colors.textLight }]}>
                    {CATEGORY_LABELS[pattern.category]}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={[styles.confidenceBadge, { backgroundColor: colors.primary[50] }]}>
            <Text style={[styles.confidenceText, { color: colors.primary[700] }]}>
              {Math.round(pattern.confidence)}%
            </Text>
          </View>
        </View>

        {/* Pattern Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="repeat" size={16} color={colors.textLight} />
            <Text style={[styles.detailText, { color: colors.textLight }]}>
              {pattern.totalOccurrences} occurrences
            </Text>
            {pattern.frequency > 0 && (
              <>
                <Text style={[styles.separator, { color: colors.textLight }]}>•</Text>
                <Text style={[styles.detailText, { color: colors.textLight }]}>
                  {pattern.frequency.toFixed(1)}/{pattern.period}
                </Text>
              </>
            )}
          </View>

          {pattern.priceRange && (
            <View style={styles.detailRow}>
              <Ionicons name="cash" size={16} color={colors.textLight} />
              <Text style={[styles.detailText, { color: colors.textLight }]}>
                Avg: {formatCurrency(pattern.priceRange.avg)}
              </Text>
              {pattern.totalSpent > 0 && (
                <>
                  <Text style={[styles.separator, { color: colors.textLight }]}>•</Text>
                  <Text style={[styles.detailText, { color: colors.textLight }]}>
                    Total: {formatCurrency(pattern.totalSpent)}
                  </Text>
                </>
              )}
            </View>
          )}

          {(dayName || timeLabel) && (
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={colors.textLight} />
              <Text style={[styles.detailText, { color: colors.textLight }]}>
                {dayName && `${dayName}s`}
                {dayName && timeLabel && ' at '}
                {timeLabel}
              </Text>
            </View>
          )}

          {pattern.regretRate > 0 && (
            <View style={styles.detailRow}>
              <Ionicons 
                name="alert-circle" 
                size={16} 
                color={pattern.regretRate > 50 ? colors.error[500] : colors.warning[500]} 
              />
              <Text style={[
                styles.detailText,
                { color: pattern.regretRate > 50 ? colors.error[600] : colors.warning[600] }
              ]}>
                {Math.round(pattern.regretRate)}% regret rate
              </Text>
            </View>
          )}
        </View>

        {/* Prediction */}
        {showPrediction && nextOccurrence && (
          <View style={[styles.prediction, { backgroundColor: colors.primary[50] }]}>
            <Ionicons name="calendar" size={16} color={colors.primary[600]} />
            <Text style={[styles.predictionText, { color: colors.primary[700] }]}>
              Predicted: {nextOccurrence}
              {pattern.predictedPrice && ` (~${formatCurrency(pattern.predictedPrice)})`}
            </Text>
          </View>
        )}

        {/* Insights */}
        {pattern.insights.length > 0 && (
          <View style={styles.insights}>
            {pattern.insights.slice(0, 2).map((insight, idx) => (
              <View key={idx} style={styles.insightItem}>
                <Ionicons name="bulb-outline" size={14} color={colors.primary[600]} />
                <Text style={[styles.insightText, { color: colors.textLight }]}>
                  {insight}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  patternType: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  strengthBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.xs,
  },
  strengthText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'capitalize',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  categoryLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: spacing.sm,
  },
  confidenceText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  details: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: typography.fontSize.sm,
  },
  separator: {
    fontSize: typography.fontSize.sm,
  },
  prediction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  predictionText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  insights: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  insightText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
  },
});

