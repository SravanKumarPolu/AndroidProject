import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing } from '@/constants/spacing';

interface PhotoViewerProps {
  uri: string;
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function PhotoViewer({ uri, visible, onClose }: PhotoViewerProps) {
  const { colors } = useTheme();
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    const aspectRatio = width / height;
    const maxWidth = SCREEN_WIDTH - spacing.base * 2;
    const maxHeight = SCREEN_HEIGHT - spacing.base * 2;

    let displayWidth = maxWidth;
    let displayHeight = maxWidth / aspectRatio;

    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = maxHeight * aspectRatio;
    }

    setImageSize({ width: displayWidth, height: displayHeight });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color={colors.textDark} />
          </TouchableOpacity>

          <Image
            source={{ uri }}
            style={[
              styles.image,
              imageSize.width > 0 && {
                width: imageSize.width,
                height: imageSize.height,
              },
            ]}
            resizeMode="contain"
            onLoad={handleImageLoad}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.base,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    maxWidth: SCREEN_WIDTH - spacing.base * 2,
    maxHeight: SCREEN_HEIGHT - spacing.base * 2,
  },
});

