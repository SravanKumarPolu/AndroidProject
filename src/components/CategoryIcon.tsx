import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ImpulseCategory } from '@/types/impulse';
import { colors } from '@/constants/colors';

interface CategoryIconProps {
  category: ImpulseCategory;
  size?: number;
  color?: string;
}

/**
 * Category icon component using Ionicons
 */
export function CategoryIcon({ category, size = 24, color = colors.text }: CategoryIconProps) {
  const iconMap: Record<ImpulseCategory, keyof typeof Ionicons.glyphMap> = {
    FOOD: 'fast-food-outline',
    SHOPPING: 'bag-outline',
    TRAVEL: 'airplane-outline',
    DIGITAL: 'laptop-outline',
    GAMING: 'game-controller-outline',
    ENTERTAINMENT: 'play-circle-outline',
    TRADING: 'trending-up-outline',
    CRYPTO: 'logo-bitcoin',
    COURSE: 'book-outline',
    SUBSCRIPTION: 'card-outline',
    OTHER: 'ellipse-outline',
  };

  return <Ionicons name={iconMap[category]} size={size} color={color} />;
}

