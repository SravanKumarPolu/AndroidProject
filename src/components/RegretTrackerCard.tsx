import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useImpulses } from '@/hooks/useImpulses';
import { Card } from './ui/Card';
import { formatCurrency } from '@/utils/currency';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { TerminalGlow } from './TerminalGlow';

export function RegretTrackerCard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { impulses } = useImpulses();

  const regrettedImpulses = impulses.filter(i => 
    i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
  );

  const totalWasted = regrettedImpulses.reduce((sum, i) => sum + (i.price || 0), 0);
  const avgRegretRating = regrettedImpulses.length > 0
    ? regrettedImpulses.reduce((sum, i) => sum + (i.regretRating || (i.finalFeeling === 'REGRET' ? 5 : 0)), 0) / regrettedImpulses.length
    : 0;

  if (regrettedImpulses.length === 0) {
    return null; // Don't show if no regrets
  }

  return (
    <TerminalGlow color="error" intensity="low">
      <Card variant="elevated" style={styles.card}>
        <TouchableOpacity
          onPress={() => router.push('/regret-tracker')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View regret tracker"
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.error[50] }]}>
                <Ionicons name="sad-outline" size={24} color={colors.error[600]} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: colors.text }]}>Regret Tracker</Text>
                <Text style={[styles.subtitle, { color: colors.textLight }]}>
                  Learn from past decisions
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.error[600] }]}>
                {regrettedImpulses.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>
                Regretted
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.error[600] }]}>
                {formatCurrency(totalWasted)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>
                Wasted
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.error[600] }]}>
                {avgRegretRating.toFixed(1)}/5
              </Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>
                Avg Rating
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    </TerminalGlow>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
  },
});

