import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGoals } from '@/hooks/useGoals';
import { useImpulses } from '@/hooks/useImpulses';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GoalsCard } from '@/components/GoalsCard';
import { GoalFormData } from '@/types/goal';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { formatCurrency } from '@/utils/currency';

export default function GoalsScreen() {
  const router = useRouter();
  const { impulses } = useImpulses();
  const { colors } = useTheme();
  const {
    goals: allGoals,
    activeGoals,
    completedGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    getGoalProgress,
  } = useGoals(impulses);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    targetAmount: 0,
    description: '',
  });

  const handleCreateGoal = async () => {
    if (!formData.title.trim() || formData.targetAmount <= 0) {
      Alert.alert('Invalid Input', 'Please provide a title and a target amount greater than 0.');
      return;
    }

    try {
      await createGoal(formData);
      setFormData({ title: '', targetAmount: 0, description: '' });
      setShowCreateForm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    }
  };

  const handleDeleteGoal = (goalId: string, title: string) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${title}"? This will not affect your saved money.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteGoal(goalId);
          },
        },
      ]
    );
  };

  const goalProgresses = allGoals.map(goal => getGoalProgress(goal));

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
            <Text style={[styles.title, { color: colors.text }]}>Savings Goals</Text>
            <Text style={[styles.subtitle, { color: colors.textLight }]}>
              Track your progress towards financial goals
            </Text>
          </View>
        </View>

        {/* Create Goal Form */}
        {showCreateForm && (
          <Card variant="elevated" style={styles.formCard}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Create New Goal</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Goal title (e.g., New Laptop)"
              placeholderTextColor={colors.textLight}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Target amount"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={formData.targetAmount > 0 ? formData.targetAmount.toString() : ''}
              onChangeText={(text) => {
                const amount = parseFloat(text) || 0;
                setFormData({ ...formData, targetAmount: amount });
              }}
            />
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
            <View style={styles.formActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowCreateForm(false);
                  setFormData({ title: '', targetAmount: 0, description: '' });
                }}
                variant="outline"
                size="md"
                style={styles.formButton}
              />
              <Button
                title="Create Goal"
                onPress={handleCreateGoal}
                variant="primary"
                size="md"
                style={styles.formButton}
              />
            </View>
          </Card>
        )}

        {/* Create Button */}
        {!showCreateForm && (
          <Button
            title="Create New Goal"
            onPress={() => setShowCreateForm(true)}
            variant="primary"
            size="md"
            fullWidth
            style={styles.createButton}
          />
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Goals</Text>
            {activeGoals.map((goal) => {
              const progress = getGoalProgress(goal);
              return (
                <Card key={goal.id} variant="elevated" style={styles.goalCard}>
                  <View style={styles.goalCardHeader}>
                    <View style={styles.goalCardTitleRow}>
                      {goal.color && (
                        <View
                          style={[styles.colorIndicator, { backgroundColor: goal.color }]}
                        />
                      )}
                      <Text style={[styles.goalCardTitle, { color: colors.text }]}>
                        {goal.title}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteGoal(goal.id, goal.title)}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error[500]} />
                    </TouchableOpacity>
                  </View>
                  {goal.description && (
                    <Text style={[styles.goalDescription, { color: colors.textLight }]}>
                      {goal.description}
                    </Text>
                  )}
                  <View style={styles.goalCardProgress}>
                    <Text style={[styles.goalCardAmount, { color: colors.text }]}>
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </Text>
                    <View style={[styles.progressBarContainer, { backgroundColor: colors.borderLight }]}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${Math.min(100, progress.progress)}%`,
                            backgroundColor: progress.onTrack
                              ? colors.primary[500]
                              : colors.warning[500],
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressPercentage, { color: colors.textLight }]}>
                      {progress.progress.toFixed(1)}% complete
                    </Text>
                    {progress.remaining > 0 && (
                      <Text style={[styles.remainingAmount, { color: colors.textLight }]}>
                        {formatCurrency(progress.remaining)} remaining
                      </Text>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Completed Goals</Text>
            {completedGoals.map((goal) => {
              const progress = getGoalProgress(goal);
              return (
                <Card key={goal.id} variant="elevated" style={styles.goalCard}>
                  <View style={styles.goalCardHeader}>
                    <View style={styles.goalCardTitleRow}>
                      {goal.color && (
                        <View
                          style={[styles.colorIndicator, { backgroundColor: goal.color }]}
                        />
                      )}
                      <Text style={[styles.goalCardTitle, { color: colors.text }]}>
                        {goal.title}
                      </Text>
                      <Ionicons name="checkmark-circle" size={20} color={colors.success[500]} />
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteGoal(goal.id, goal.title)}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error[500]} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.goalCardProgress}>
                    <Text style={[styles.goalCardAmount, { color: colors.text }]}>
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </Text>
                    <View style={[styles.progressBarContainer, { backgroundColor: colors.borderLight }]}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: '100%',
                            backgroundColor: colors.success[500],
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.completedText, { color: colors.success[600] }]}>
                      ✓ Goal completed!
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {allGoals.length === 0 && !showCreateForm && (
          <Card variant="elevated" style={styles.emptyCard}>
            <Ionicons name="flag-outline" size={48} color={colors.textLight} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Goals Yet</Text>
            <Text style={[styles.emptyText, { color: colors.textLight }]}>
              Create a savings goal to track your progress. Money saved from cancelled impulses
              will automatically contribute to matching goals.
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
  formCard: {
    marginBottom: spacing.base,
  },
  formTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.base,
  },
  input: {
    borderWidth: 1,
    borderRadius: spacing.md,
    padding: spacing.sm,
    marginBottom: spacing.base,
    fontSize: typography.fontSize.base,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  formButton: {
    flex: 1,
  },
  createButton: {
    marginBottom: spacing.base,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.base,
  },
  goalCard: {
    marginBottom: spacing.base,
  },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  goalCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  goalCardTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  goalDescription: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  goalCardProgress: {
    marginTop: spacing.sm,
  },
  goalCardAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  remainingAmount: {
    fontSize: typography.fontSize.sm,
  },
  completedText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
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

