import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBudget } from '@/hooks/useBudget';
import { useImpulses } from '@/hooks/useImpulses';
import { useTheme } from '@/contexts/ThemeContext';
import { BudgetCard } from '@/components/BudgetCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Budget, BudgetType, BudgetPeriod } from '@/types/budget';
import { CATEGORIES, CATEGORY_LABELS } from '@/constants/categories';
import { ImpulseCategory } from '@/types/impulse';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { useToast } from '@/contexts/ToastContext';

export default function BudgetScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { impulses } = useImpulses();
  const { showSuccess, showError } = useToast();
  const {
    budgets,
    activeBudgets,
    budgetProgresses,
    budgetAlerts,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useBudget(impulses);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [budgetType, setBudgetType] = useState<BudgetType>('TOTAL');
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>('MONTHLY');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ImpulseCategory | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreateBudget = async () => {
    if (!budgetAmount.trim()) {
      showError('Please enter a budget amount');
      return;
    }

    const amount = parseFloat(budgetAmount.replace(/[₹,\s]/g, ''));
    if (isNaN(amount) || amount <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    if (budgetType === 'CATEGORY' && !selectedCategory) {
      showError('Please select a category');
      return;
    }

    setCreating(true);
    try {
      await createBudget({
        type: budgetType,
        period: budgetPeriod,
        amount,
        category: budgetType === 'CATEGORY' ? (selectedCategory ?? undefined) : undefined,
        isActive: true,
      });

      showSuccess('Budget created successfully!');
      setShowCreateForm(false);
      setBudgetAmount('');
      setSelectedCategory(null);
    } catch (error) {
      showError('Failed to create budget. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBudget = (budget: Budget) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete this ${budget.period.toLowerCase()} budget?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget(budget.id);
              showSuccess('Budget deleted');
            } catch (error) {
              showError('Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textLight },
    sectionTitle: { color: colors.text },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, dynamicStyles.title]}>Budget Tracking</Text>
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
              Set spending limits and track your progress
            </Text>
          </View>
        </View>

        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <View style={styles.section}>
            {budgetAlerts.map(alert => {
              const progress = budgetProgresses.find(p => p.budget.id === alert.budgetId);
              if (!progress) return null;
              return (
                <BudgetCard
                  key={alert.budgetId}
                  progress={progress}
                  alert={alert}
                />
              );
            })}
          </View>
        )}

        {/* Active Budgets */}
        {budgetProgresses.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Active Budgets</Text>
            {budgetProgresses.map(progress => {
              const alert = budgetAlerts.find(a => a.budgetId === progress.budget.id);
              return (
                <View key={progress.budget.id} style={styles.budgetItem}>
                  <BudgetCard progress={progress} alert={alert} />
                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: colors.error[50] }]}
                    onPress={() => handleDeleteBudget(progress.budget)}
                    accessibilityRole="button"
                    accessibilityLabel="Delete budget"
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error[600]} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Create Budget Form */}
        {showCreateForm ? (
          <Card variant="elevated" style={styles.createCard}>
            <View style={styles.formHeader}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Create Budget</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateForm(false);
                  setBudgetAmount('');
                  setSelectedCategory(null);
                }}
                accessibilityRole="button"
                accessibilityLabel="Close form"
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Budget Type */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Budget Type</Text>
              <View style={styles.typeRow}>
                <Button
                  title="Total"
                  onPress={() => {
                    setBudgetType('TOTAL');
                    setSelectedCategory(null);
                  }}
                  variant={budgetType === 'TOTAL' ? 'primary' : 'outline'}
                  size="sm"
                  style={styles.typeButton}
                />
                <Button
                  title="Category"
                  onPress={() => setBudgetType('CATEGORY')}
                  variant={budgetType === 'CATEGORY' ? 'primary' : 'outline'}
                  size="sm"
                  style={styles.typeButton}
                />
              </View>
            </View>

            {/* Category Selection */}
            {budgetType === 'CATEGORY' && (
              <View style={styles.formSection}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Category</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        {
                          backgroundColor: selectedCategory === category
                            ? colors.primary[500]
                            : colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          {
                            color: selectedCategory === category
                              ? colors.textDark
                              : colors.text,
                          },
                        ]}
                      >
                        {CATEGORY_LABELS[category]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Period Selection */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Period</Text>
              <View style={styles.periodRow}>
                {(['WEEKLY', 'MONTHLY', 'YEARLY'] as BudgetPeriod[]).map(period => (
                  <Button
                    key={period}
                    title={period.charAt(0) + period.slice(1).toLowerCase()}
                    onPress={() => setBudgetPeriod(period)}
                    variant={budgetPeriod === period ? 'primary' : 'outline'}
                    size="sm"
                    style={styles.periodButton}
                  />
                ))}
              </View>
            </View>

            {/* Amount Input */}
            <View style={styles.formSection}>
              <Input
                label="Budget Amount"
                placeholder="₹0"
                value={budgetAmount}
                onChangeText={setBudgetAmount}
                keyboardType="numeric"
              />
            </View>

            {/* Create Button */}
            <Button
              title={creating ? 'Creating...' : 'Create Budget'}
              onPress={handleCreateBudget}
              disabled={creating}
              loading={creating}
              fullWidth
              size="lg"
            />
          </Card>
        ) : (
          <Button
            title="+ Create Budget"
            onPress={() => setShowCreateForm(true)}
            variant="primary"
            fullWidth
            size="lg"
            style={styles.createButton}
          />
        )}

        {/* Empty State */}
        {budgetProgresses.length === 0 && !showCreateForm && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={[styles.emptyTitle, dynamicStyles.title]}>No budgets yet</Text>
            <Text style={[styles.emptyText, dynamicStyles.subtitle]}>
              Create a budget to track your spending and stay within limits.
            </Text>
          </View>
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
    padding: spacing.xs,
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.base,
  },
  budgetItem: {
    position: 'relative',
    marginBottom: spacing.base,
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCard: {
    marginBottom: spacing.base,
    padding: spacing.base,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  formSection: {
    marginBottom: spacing.base,
  },
  formLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
    minWidth: '30%',
  },
  categoryButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
  },
  createButton: {
    marginBottom: spacing.base,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.base,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
});

