import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useImpulses } from '@/hooks/useImpulses';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { CATEGORIES, CATEGORY_LABELS } from '@/constants/categories';
import { CategoryIcon } from '@/components/CategoryIcon';
import { ImpulseCategory } from '@/types/impulse';
import { safeValidateCreateImpulse } from '@/utils/validation';

/**
 * Quick-add screen - Simplified form for fast impulse logging
 * Reduces friction for adoption risk mitigation
 */
export default function QuickAddScreen() {
  const router = useRouter();
  const { createImpulse } = useImpulses();
  const { showError, showSuccess } = useToast();
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ImpulseCategory>('FOOD');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      showError('Please enter what you want to buy');
      return;
    }

    // Validate input data
    const priceValue = price ? parseFloat(price.replace(/[₹,\s]/g, '')) : undefined;
    const formData = {
      title: title.trim(),
      category,
      price: priceValue && !isNaN(priceValue) ? priceValue : undefined,
      urgency: 'IMPULSE' as const, // Default for quick-add
      coolDownPeriod: '24H' as const, // Default 24h for quick-add
    };

    const validation = safeValidateCreateImpulse(formData);
    if (!validation.success) {
      const errors = validation.errors;
      if (errors) {
        const errorMessages = Object.values(errors)
          .flatMap(field => field?._errors || [])
          .filter(Boolean);
        showError(errorMessages[0] || 'Please check your input');
      } else {
        showError('Invalid input. Please check your data.');
      }
      return;
    }

    setLoading(true);
    try {
      await createImpulse(validation.data!);
      showSuccess('Impulse locked! You\'ll be notified in 24 hours.');
      router.back();
    } catch (error) {
      console.error('Error creating impulse:', error);
      showError('Failed to lock impulse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Quick Add</Text>
            <Text style={styles.subtitle}>Log an impulse in seconds</Text>
          </View>

          <Input
            label="What do you want to buy?"
            placeholder="e.g., Swiggy burger, New headset"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <Input
            label="Price (optional)"
            placeholder="₹0"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.slice(0, 4).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                  ]}
                >
                  <CategoryIcon
                    category={cat}
                    size={18}
                    color={category === cat ? colors.textDark : colors.primary[600]}
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.submitContainer}>
            <Button
              title="Lock It"
              onPress={handleSubmit}
              disabled={!title.trim() || loading}
              loading={loading}
              fullWidth
              size="lg"
            />
            <Text style={styles.hint}>
              This will lock for 24 hours. You can add more details later.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary[300],
    backgroundColor: 'transparent',
    gap: spacing.xs,
    minWidth: '45%',
  },
  categoryButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  categoryButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
  },
  categoryButtonTextActive: {
    color: colors.textDark,
  },
  submitContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  hint: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});

