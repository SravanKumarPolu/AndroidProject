import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { formatCurrency } from '@/utils/currency';
import { getBestEquivalent, formatFunEquivalent } from '@/utils/funEquivalents';

interface SkipCelebrationProps {
  visible: boolean;
  amount: number;
  onClose: () => void;
}

export function SkipCelebration({ visible, amount, onClose }: SkipCelebrationProps) {
  const { colors } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const confettiAnim = React.useRef(new Animated.Value(0)).current;

  const funEquivalent = getBestEquivalent(amount);

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
        Animated.sequence([
          Animated.timing(confettiAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(confettiAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      confettiAnim.setValue(0);
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

  const confettiOpacity = confettiAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Confetti Effect */}
        <Animated.View
          style={[
            styles.confettiContainer,
            { opacity: confettiOpacity },
          ]}
          pointerEvents="none"
        >
          {[...Array(20)].map((_, i) => (
            <Text
              key={i}
              style={[
                styles.confetti,
                {
                  left: `${(i * 5) % 100}%`,
                  top: `${(i * 7) % 100}%`,
                  transform: [{ rotate: `${i * 18}deg` }],
                },
              ]}
            >
              🎉
            </Text>
          ))}
        </Animated.View>

        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              borderColor: colors.success[500],
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Text style={styles.icon}>🎉</Text>
          <Text style={[styles.title, { color: colors.text }]}>Great Decision!</Text>
          <Text style={[styles.amount, { color: colors.success[700] }]}>
            You kept {formatCurrency(amount)}
          </Text>
          
          {funEquivalent && (
            <View style={[styles.equivalentContainer, { backgroundColor: colors.success[50] }]}>
              <Text style={[styles.equivalentText, { color: colors.success[700] }]}>
                {formatFunEquivalent(funEquivalent)}
              </Text>
            </View>
          )}

          <Text style={[styles.message, { color: colors.textLight }]}>
            Every skip brings you closer to your goals! 💪
          </Text>

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
  confettiContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  confetti: {
    position: 'absolute',
    fontSize: 24,
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
  amount: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  equivalentContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    marginBottom: spacing.base,
  },
  equivalentText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  tapToClose: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.sm,
  },
});

