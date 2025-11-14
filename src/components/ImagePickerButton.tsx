import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { photos } from '@/services/photos';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface ImagePickerButtonProps {
  onImageSelected: (uri: string) => void;
  onImageRemoved?: () => void;
  currentImageUri?: string;
  disabled?: boolean;
}

export function ImagePickerButton({
  onImageSelected,
  onImageRemoved,
  currentImageUri,
  disabled = false,
}: ImagePickerButtonProps) {
  const { colors } = useTheme();
  const [picking, setPicking] = useState(false);

  const handlePickImage = async (source: 'camera' | 'library') => {
    if (disabled || picking) return;

    setPicking(true);
    try {
      const uri = await photos.pickImage(source);
      if (uri) {
        onImageSelected(uri);
      }
    } catch (error) {
      const { logger } = await import('@/utils/logger');
      logger.error('Error picking image', error instanceof Error ? error : new Error(String(error)));
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to pick image. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setPicking(false);
    }
  };

  const handleShowOptions = () => {
    if (disabled || picking) return;

    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Camera',
          onPress: () => handlePickImage('camera'),
        },
        {
          text: 'Photo Library',
          onPress: () => handlePickImage('library'),
        },
      ]
    );
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            onImageRemoved?.();
          },
        },
      ]
    );
  };

  if (currentImageUri) {
    return (
      <View style={styles.container}>
        <View style={[styles.imageContainer, { borderColor: colors.border }]}>
          <Image source={{ uri: currentImageUri }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: colors.error[500] }]}
            onPress={handleRemove}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Remove photo"
            accessibilityHint="Removes the attached photo"
          >
            <Ionicons name="close" size={16} color={colors.textDark} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.changeButton, { borderColor: colors.border }]}
          onPress={handleShowOptions}
          disabled={disabled || picking}
          accessibilityRole="button"
          accessibilityLabel="Change photo"
          accessibilityHint="Opens options to take a new photo or select from library"
          accessibilityState={{ disabled: disabled || picking }}
        >
          {picking ? (
            <ActivityIndicator size="small" color={colors.primary[600]} />
          ) : (
            <>
              <Ionicons name="camera" size={16} color={colors.primary[600]} />
              <Text style={[styles.changeButtonText, { color: colors.primary[600] }]}>
                Change Photo
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.pickerButton,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        disabled && styles.pickerButtonDisabled,
      ]}
      onPress={handleShowOptions}
      disabled={disabled || picking}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Add photo"
      accessibilityHint="Opens options to take a photo or select from library"
      accessibilityState={{ disabled: disabled || picking }}
    >
      {picking ? (
        <ActivityIndicator size="small" color={colors.primary[600]} />
      ) : (
        <>
          <Ionicons name="camera-outline" size={24} color={colors.primary[600]} />
          <Text style={[styles.pickerButtonText, { color: colors.primary[600] }]}>
            Add Photo
          </Text>
          <Text style={[styles.pickerButtonHint, { color: colors.textLight }]}>
            Visual memory helps decision-making
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  pickerButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: spacing.md,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pickerButtonDisabled: {
    opacity: 0.5,
  },
  pickerButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  pickerButtonHint: {
    fontSize: typography.fontSize.xs,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    aspectRatio: 4 / 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  changeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});

