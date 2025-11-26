/**
 * Regret Analysis Component
 * Shows detailed regret analysis after 3 days of purchase
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from './ui/Card';
import { TerminalGlow } from './TerminalGlow';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { formatCurrency } from '@/utils/currency';
import { Impulse } from '@/types/impulse';
import { formatDateTime } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';

interface RegretAnalysisProps {
  impulse: Impulse;
  similarRegrets?: Impulse[];
  totalWastedOnSimilar?: number;
}

export function RegretAnalysis({ 
  impulse, 
  similarRegrets = [], 
  totalWastedOnSimilar = 0 
}: RegretAnalysisProps) {
  const { colors } = useTheme();
  
  if (!impulse.executedAt || !impulse.finalFeeling) {
    return null;
  }
  
  const isRegret = impulse.finalFeeling === 'REGRET' || (impulse.regretRating !== undefined && impulse.regretRating >= 3);
  const regretRating = impulse.regretRating || 0;
  const daysSincePurchase = Math.floor((Date.now() - impulse.executedAt) / (24 * 60 * 60 * 1000));
  
  return (
    <TerminalGlow color={isRegret ? "error" : "success"} intensity="low">
      <Card variant="outlined" style={[styles.container, { 
        borderColor: isRegret ? colors.error[200] : colors.success[200] 
      }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {isRegret ? '😔 Regret Analysis' : '😌 Purchase Analysis'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            {daysSincePurchase} days after purchase
          </Text>
        </View>
        
        {/* Regret Rating */}
        {regretRating > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={[styles.ratingLabel, { color: colors.text }]}>Regret Rating</Text>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= regretRating ? 'star' : 'star-outline'}
                  size={24}
                  color={star <= regretRating 
                    ? (isRegret ? colors.error[600] : colors.success[600])
                    : colors.gray[300]
                  }
                />
              ))}
            </View>
            <Text style={[styles.ratingText, { 
              color: isRegret ? colors.error[600] : colors.success[600] 
            }]}>
              {regretRating}/5 {isRegret ? '(High Regret)' : '(Low Regret)'}
            </Text>
          </View>
        )}
        
        {/* Purchase Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textLight }]}>Purchased:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDateTime(impulse.executedAt)}
            </Text>
          </View>
          {impulse.price && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textLight }]}>Amount:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatCurrency(impulse.price)}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textLight }]}>Feeling:</Text>
            <Text style={[styles.detailValue, { 
              color: isRegret ? colors.error[600] : colors.success[600] 
            }]}>
              {impulse.finalFeeling === 'REGRET' ? 'Regretted' :
               impulse.finalFeeling === 'WORTH_IT' ? 'Worth It' :
               'Neutral'}
            </Text>
          </View>
        </View>
        
        {/* Similar Regrets Warning */}
        {isRegret && similarRegrets.length > 0 && (
          <View style={[styles.warningContainer, { backgroundColor: colors.error[50] }]}>
            <Ionicons name="warning-outline" size={20} color={colors.error[600]} />
            <View style={styles.warningTextContainer}>
              <Text style={[styles.warningTitle, { color: colors.error[700] }]}>
                Pattern Detected
              </Text>
              <Text style={[styles.warningText, { color: colors.error[600] }]}>
                You've regretted {similarRegrets.length} similar purchase{similarRegrets.length > 1 ? 's' : ''} before.
                Consider logging similar items before buying next time.
              </Text>
            </View>
          </View>
        )}
        
        {/* Total Wasted on Similar */}
        {isRegret && totalWastedOnSimilar > 0 && (
          <View style={[styles.wasteContainer, { backgroundColor: colors.warning[50] }]}>
            <Text style={[styles.wasteTitle, { color: colors.warning[700] }]}>
              💰 Total Wasted on Similar Items
            </Text>
            <Text style={[styles.wasteAmount, { color: colors.warning[800] }]}>
              {formatCurrency(totalWastedOnSimilar)}
            </Text>
            <Text style={[styles.wasteHint, { color: colors.warning[600] }]}>
              Including this purchase and {similarRegrets.length} similar regret{similarRegrets.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
        
        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={[styles.insightsTitle, { color: colors.text }]}>💡 Insights</Text>
          {isRegret ? (
            <View style={styles.insightsList}>
              <Text style={[styles.insightItem, { color: colors.text }]}>
                • This purchase didn't meet your expectations
              </Text>
              {impulse.price && (
                <Text style={[styles.insightItem, { color: colors.text }]}>
                  • You spent {formatCurrency(impulse.price)} that could have been saved
                </Text>
              )}
              <Text style={[styles.insightItem, { color: colors.text }]}>
                • Use this experience to make better decisions next time
              </Text>
            </View>
          ) : (
            <View style={styles.insightsList}>
              <Text style={[styles.insightItem, { color: colors.text }]}>
                • This purchase was worth it for you
              </Text>
              <Text style={[styles.insightItem, { color: colors.text }]}>
                • Good decision-making! Keep it up
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TerminalGlow>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
  },
  header: {
    marginBottom: spacing.base,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: spacing.base,
    paddingVertical: spacing.base,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  ratingLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  detailsContainer: {
    marginBottom: spacing.base,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  warningContainer: {
    flexDirection: 'row',
    padding: spacing.base,
    borderRadius: spacing.md,
    marginBottom: spacing.base,
    gap: spacing.xs,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs / 2,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  wasteContainer: {
    padding: spacing.base,
    borderRadius: spacing.md,
    marginBottom: spacing.base,
    alignItems: 'center',
  },
  wasteTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  wasteAmount: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  wasteHint: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  insightsContainer: {
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  insightsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  insightsList: {
    gap: spacing.xs,
  },
  insightItem: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});

