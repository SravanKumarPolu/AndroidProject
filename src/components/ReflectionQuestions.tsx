/**
 * Reflection Questions Component
 * Displays key reflection questions before user makes decision
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from './ui/Card';
import { TerminalGlow } from './TerminalGlow';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { formatCurrency } from '@/utils/currency';
import { SavingsGoal } from '@/types/goal';

interface ReflectionQuestionsProps {
  impulsePrice?: number;
  activeGoals?: SavingsGoal[];
}

export function ReflectionQuestions({ impulsePrice, activeGoals }: ReflectionQuestionsProps) {
  const { colors } = useTheme();
  
  const questions = [
    {
      id: 'need',
      icon: '🤔',
      question: 'Do you really need it?',
      description: 'Think about whether this is a want or a need.',
    },
    {
      id: 'tomorrow',
      icon: '⏰',
      question: 'How will you feel tomorrow?',
      description: 'Will you still want this, or will you regret it?',
    },
    {
      id: 'goal',
      icon: '🎯',
      question: 'Is it worth your savings goal?',
      description: impulsePrice && activeGoals && activeGoals.length > 0
        ? `This ${formatCurrency(impulsePrice)} could go toward your goals instead.`
        : 'Consider your long-term financial goals.',
    },
  ];
  
  return (
    <TerminalGlow color="primary" intensity="low">
      <Card variant="outlined" style={[styles.container, { borderColor: colors.primary[200] }]}>
        <Text style={[styles.title, { color: colors.text }]}>💭 Reflect Before You Decide</Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          Take a moment to think about these questions:
        </Text>
        
        <View style={styles.questionsContainer}>
          {questions.map((q, index) => (
            <View key={q.id} style={styles.questionItem}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionIcon}>{q.icon}</Text>
                <Text style={[styles.questionText, { color: colors.text }]}>
                  {q.question}
                </Text>
              </View>
              <Text style={[styles.questionDescription, { color: colors.textLight }]}>
                {q.description}
              </Text>
              {index < questions.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
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
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  questionsContainer: {
    gap: spacing.sm,
  },
  questionItem: {
    paddingVertical: spacing.sm,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
    gap: spacing.xs,
  },
  questionIcon: {
    fontSize: 24,
  },
  questionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
  },
  questionDescription: {
    fontSize: typography.fontSize.sm,
    marginLeft: 32, // Align with question text (icon width + gap)
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  divider: {
    height: 1,
    marginTop: spacing.sm,
    marginLeft: 32,
  },
});

