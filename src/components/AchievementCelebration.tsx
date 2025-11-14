import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Modal } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Achievement } from '@/types/achievement';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface AchievementCelebrationProps {
  achievement: Achievement;
  visible: boolean;
  onClose: () => void;
}

export function AchievementCelebration({ achievement, visible, onClose }: AchievementCelebrationProps) {
  const { colors } = useTheme();
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Start animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const rarityColors = {
    COMMON: colors.gray[500],
    RARE: colors.primary[500],
    EPIC: colors.accent[500],
    LEGENDARY: colors.success[500],
  };

  const rarityLabels = {
    COMMON: 'Common',
    RARE: 'Rare',
    EPIC: 'Epic',
    LEGENDARY: 'Legendary',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              borderColor: rarityColors[achievement.rarity],
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={[styles.rarityBadge, { backgroundColor: rarityColors[achievement.rarity] }]}>
            <Text style={[styles.rarityText, { color: colors.textDark }]}>
              {rarityLabels[achievement.rarity]}
            </Text>
          </View>

          <Text style={styles.icon}>{achievement.icon}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{achievement.title}</Text>
          <Text style={[styles.description, { color: colors.textLight }]}>
            {achievement.description}
          </Text>

          <View style={[styles.xpBadge, { backgroundColor: colors.primary[50] }]}>
            <Text style={[styles.xpText, { color: colors.primary[700] }]}>
              +{achievement.xpReward} XP
            </Text>
          </View>

          <Text style={[styles.tapToClose, { color: colors.textLight }]}>Tap to close</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    borderRadius: spacing.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 3,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  rarityBadge: {
    position: 'absolute',
    top: spacing.base,
    right: spacing.base,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
  },
  rarityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  xpBadge: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
  },
  xpText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  tapToClose: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.sm,
  },
});

