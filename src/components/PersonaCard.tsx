/**
 * Persona Card Component
 * Displays detected user persona and persona-specific insights
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from './ui/Card';
import { TerminalGlow } from './TerminalGlow';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { PersonaInsight, formatPersonaName, getPersonaEmoji } from '@/utils/personaInsights';
import { CATEGORY_LABELS } from '@/constants/categories';
import { Ionicons } from '@expo/vector-icons';

interface PersonaCardProps {
  insight: PersonaInsight;
  onPress?: () => void;
}

export function PersonaCard({ insight, onPress }: PersonaCardProps) {
  const { colors } = useTheme();
  
  if (insight.persona === 'UNKNOWN') {
    return null;
  }
  
  const getPersonaColor = () => {
    switch (insight.persona) {
      case 'STUDENT':
        return colors.primary[600];
      case 'IT_PROFESSIONAL':
        return colors.accent[600];
      case 'CRYPTO_TRADER':
        return colors.warning[600];
      case 'GENERAL_PUBLIC':
        return colors.success[600];
      default:
        return colors.textLight;
    }
  };
  
  return (
    <TerminalGlow color="primary" intensity="low">
      <Card variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.personaHeader}>
            <Text style={styles.emoji}>{getPersonaEmoji(insight.persona)}</Text>
            <View style={styles.personaInfo}>
              <Text style={[styles.personaName, { color: getPersonaColor() }]}>
                {formatPersonaName(insight.persona)}
              </Text>
              <Text style={[styles.confidence, { color: colors.textLight }]}>
                {insight.confidence}% confidence
              </Text>
            </View>
          </View>
          {onPress && (
            <Ionicons 
              name="chevron-forward-outline" 
              size={20} 
              color={colors.textLight} 
            />
          )}
        </View>
        
        {/* Top Categories */}
        {insight.topCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textLight }]}>
              Top Categories
            </Text>
            <View style={styles.chipContainer}>
              {insight.topCategories.map((category) => (
                <View 
                  key={category} 
                  style={[styles.chip, { backgroundColor: colors.primary[50] }]}
                >
                  <Text style={[styles.chipText, { color: colors.primary[700] }]}>
                    {CATEGORY_LABELS[category]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Top Source Apps */}
        {insight.topSourceApps.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textLight }]}>
              Most Used Apps
            </Text>
            <View style={styles.chipContainer}>
              {insight.topSourceApps.map((app) => (
                <View 
                  key={app} 
                  style={[styles.chip, { backgroundColor: colors.accent[50] }]}
                >
                  <Text style={[styles.chipText, { color: colors.accent[700] }]}>
                    {app}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Insights */}
        {insight.insights.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textLight }]}>
              Insights
            </Text>
            {insight.insights.map((insightText, index) => (
              <View key={index} style={styles.insightItem}>
                <Ionicons name="bulb-outline" size={16} color={colors.primary[600]} />
                <Text style={[styles.insightText, { color: colors.text }]}>
                  {insightText}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Recommendations */}
        {insight.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textLight }]}>
              Recommendations
            </Text>
            {insight.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.success[600]} />
                <Text style={[styles.recommendationText, { color: colors.text }]}>
                  {rec}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </TerminalGlow>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  personaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  emoji: {
    fontSize: typography.fontSize['2xl'],
  },
  personaInfo: {
    flex: 1,
  },
  personaName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs / 2,
  },
  confidence: {
    fontSize: typography.fontSize.sm,
  },
  section: {
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  insightText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  recommendationText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});

