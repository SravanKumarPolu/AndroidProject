import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Impulse } from '@/types/impulse';
import { Card } from './ui/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { statusColors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';
import { CATEGORY_LABELS } from '@/constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '@/utils/currency';
import { formatRelativeTime, getTimeRemaining, isTimePast } from '@/utils/date';
import { COOL_DOWN_LABELS } from '@/constants/coolDown';
import { PhotoViewer } from './PhotoViewer';

interface ImpulseCardProps {
  impulse: Impulse;
  onPress?: () => void;
  showCountdown?: boolean;
}

export function ImpulseCard({ impulse, onPress, showCountdown = true }: ImpulseCardProps) {
  const { colors } = useTheme();
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const isReady = isTimePast(impulse.reviewAt);
  const timeRemaining = getTimeRemaining(impulse.reviewAt);
  
  const statusColor = impulse.status === 'LOCKED'
    ? statusColors.locked
    : impulse.status === 'CANCELLED'
    ? statusColors.cancelled
    : statusColors.executed;

  const handlePhotoPress = (e: any) => {
    e.stopPropagation();
    if (impulse.photoUri) {
      setShowPhotoViewer(true);
    }
  };

  const formatCountdown = () => {
    if (isReady) return 'Ready to review';
    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m left`;
    }
    return `${timeRemaining.minutes}m ${timeRemaining.seconds}s left`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.categoryRow}>
            <CategoryIcon category={impulse.category} size={20} />
            <Text style={styles.categoryLabel}>
              {CATEGORY_LABELS[impulse.category]}
            </Text>
          </View>
          {impulse.status === 'LOCKED' && (
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>
                {isReady ? 'Ready' : 'Locked'}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{impulse.title}</Text>

        {/* Photo Preview */}
        {impulse.photoUri && (
          <TouchableOpacity
            onPress={handlePhotoPress}
            activeOpacity={0.8}
            style={[styles.photoContainer, { borderColor: colors.border }]}
          >
            <Image
              source={{ uri: impulse.photoUri }}
              style={styles.photo}
              resizeMode="cover"
            />
            <View style={[styles.photoOverlay, { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
              <Text style={[styles.photoHint, { color: colors.textDark }]}>Tap to view</Text>
            </View>
          </TouchableOpacity>
        )}

        {impulse.price && (
          <Text style={[styles.price, { color: colors.primary[600] }]}>{formatCurrency(impulse.price)}</Text>
        )}

        {impulse.coolDownPeriod && (
          <Text style={styles.coolDownPeriod}>
            Cool-down: {COOL_DOWN_LABELS[impulse.coolDownPeriod]}
          </Text>
        )}

        {showCountdown && impulse.status === 'LOCKED' && (
          <View style={styles.countdownContainer}>
            <Text style={[
              styles.countdown,
              isReady && styles.countdownReady,
            ]}>
              {formatCountdown()}
            </Text>
          </View>
        )}

        {impulse.status === 'CANCELLED' && impulse.skippedFeeling && (
          <View style={styles.feelingContainer}>
            <Text style={styles.feelingLabel}>
              Feeling: {impulse.skippedFeeling === 'RELIEVED' ? '😌 Relieved' :
                       impulse.skippedFeeling === 'STILL_CRAVING' ? '😩 Still craving' :
                       '😐 Neutral'}
            </Text>
          </View>
        )}

        {impulse.status === 'EXECUTED' && impulse.finalFeeling && (
          <View style={styles.feelingContainer}>
            <Text style={[
              styles.feelingLabel,
              { color: colors.textLight },
              impulse.finalFeeling === 'REGRET' && { color: colors.error[600] },
            ]}>
              {impulse.finalFeeling === 'REGRET' ? '😔 Regretted' :
               impulse.finalFeeling === 'WORTH_IT' ? '😊 Worth it' :
               '😐 Neutral'}
            </Text>
          </View>
        )}
      </Card>

      {/* Photo Viewer Modal */}
      {impulse.photoUri && (
        <PhotoViewer
          uri={impulse.photoUri}
          visible={showPhotoViewer}
          onClose={() => setShowPhotoViewer(false)}
        />
      )}
    </TouchableOpacity>
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
    marginBottom: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  photoContainer: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderWidth: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xs,
    alignItems: 'flex-end',
  },
  photoHint: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  price: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  coolDownPeriod: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  countdownContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  countdown: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  countdownReady: {
    fontWeight: typography.fontWeight.bold,
  },
  feelingContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  feelingLabel: {
    fontSize: typography.fontSize.sm,
  },
});

