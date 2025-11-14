import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Impulse } from '@/types/impulse';
import { formatCurrency } from '@/utils/currency';
import { CATEGORY_LABELS, EMOTION_LABELS, URGENCY_LABELS } from '@/constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { formatRelativeTime } from '@/utils/date';

interface ImpulseDetailSheetProps {
  visible: boolean;
  impulse: Impulse | null;
  onClose: () => void;
}

export function ImpulseDetailSheet({ visible, impulse, onClose }: ImpulseDetailSheetProps) {
  const { colors } = useTheme();

  if (!impulse) return null;

  const getStatusInfo = () => {
    if (impulse.status === 'CANCELLED') {
      return { label: 'Skipped', color: colors.success[700], emoji: '✅' };
    }
    if (impulse.status === 'EXECUTED') {
      if (impulse.regretRating) {
        if (impulse.regretRating >= 4) {
          return { label: 'Regretted', color: colors.error[600], emoji: '😭' };
        } else if (impulse.regretRating <= 2) {
          return { label: 'Worth It', color: colors.success[600], emoji: '😌' };
        } else {
          return { label: 'Neutral', color: colors.textLight, emoji: '😐' };
        }
      } else if (impulse.finalFeeling === 'REGRET') {
        return { label: 'Regretted', color: colors.error[600], emoji: '😭' };
      } else if (impulse.finalFeeling === 'WORTH_IT') {
        return { label: 'Worth It', color: colors.success[600], emoji: '😌' };
      }
      return { label: 'Executed', color: colors.textLight, emoji: '✓' };
    }
    return { label: 'Locked', color: colors.warning[600], emoji: '🔒' };
  };

  const statusInfo = getStatusInfo();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Impulse Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Status */}
            <View style={[styles.section, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Status</Text>
              <View style={styles.statusRow}>
                <Text style={styles.statusEmoji}>{statusInfo.emoji}</Text>
                <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
                {impulse.regretRating && (
                  <Text style={[styles.regretRating, { color: colors.error[600] }]}>
                    Regret: {impulse.regretRating}/5
                  </Text>
                )}
              </View>
            </View>

            {/* Title */}
            <View style={[styles.section, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.textLight }]}>What</Text>
              <Text style={[styles.sectionValue, { color: colors.text }]}>{impulse.title}</Text>
            </View>

            {/* Price */}
            {impulse.price && (
              <View style={[styles.section, { backgroundColor: colors.background }]}>
                <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Price</Text>
                <Text style={[styles.sectionValue, { color: colors.primary[700] }]}>
                  {formatCurrency(impulse.price)}
                </Text>
              </View>
            )}

            {/* Category */}
            <View style={[styles.section, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Category</Text>
              <View style={styles.categoryRow}>
                <CategoryIcon category={impulse.category} size={20} />
                <Text style={[styles.sectionValue, { color: colors.text }]}>
                  {CATEGORY_LABELS[impulse.category]}
                </Text>
              </View>
            </View>

            {/* Mood */}
            {impulse.emotion && impulse.emotion !== 'NONE' && (
              <View style={[styles.section, { backgroundColor: colors.background }]}>
                <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Mood</Text>
                <Text style={[styles.sectionValue, { color: colors.text }]}>
                  {EMOTION_LABELS[impulse.emotion]}
                </Text>
              </View>
            )}

            {/* Urgency */}
            <View style={[styles.section, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Urgency</Text>
              <Text style={[styles.sectionValue, { color: colors.text }]}>
                {URGENCY_LABELS[impulse.urgency]}
              </Text>
            </View>

            {/* Notes */}
            {impulse.notes && (
              <View style={[styles.section, { backgroundColor: colors.background }]}>
                <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Notes</Text>
                <Text style={[styles.sectionValue, { color: colors.text }]}>{impulse.notes}</Text>
              </View>
            )}

            {/* Date */}
            <View style={[styles.section, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Created</Text>
              <Text style={[styles.sectionValue, { color: colors.text }]}>
                {formatRelativeTime(impulse.createdAt)}
              </Text>
            </View>

            {/* Outcome */}
            {impulse.status === 'CANCELLED' && impulse.skippedFeeling && (
              <View style={[styles.section, { backgroundColor: colors.background }]}>
                <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Feeling After Skipping</Text>
                <Text style={[styles.sectionValue, { color: colors.text }]}>
                  {impulse.skippedFeeling === 'RELIEVED' ? 'Relieved 😌' :
                   impulse.skippedFeeling === 'STILL_CRAVING' ? 'Still Craving 😩' :
                   'Neutral 😐'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    maxHeight: '90%',
    paddingBottom: spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  section: {
    padding: spacing.base,
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusEmoji: {
    fontSize: typography.fontSize.xl,
  },
  statusLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  regretRating: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: 'auto',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

