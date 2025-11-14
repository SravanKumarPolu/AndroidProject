import { ImpulseCategory } from '@/types/impulse';

export const CATEGORIES: ImpulseCategory[] = [
  'FOOD',
  'SHOPPING',
  'ENTERTAINMENT',
  'TRADING',
  'CRYPTO',
  'COURSE',
  'SUBSCRIPTION',
  'OTHER',
];

export const CATEGORY_LABELS: Record<ImpulseCategory, string> = {
  FOOD: 'Food & Delivery',
  SHOPPING: 'Shopping',
  ENTERTAINMENT: 'Entertainment',
  TRADING: 'Trading',
  CRYPTO: 'Crypto',
  COURSE: 'Courses',
  SUBSCRIPTION: 'Subscriptions',
  OTHER: 'Other',
};

// Legacy emoji icons (deprecated - use CategoryIcon component instead)
export const CATEGORY_ICONS: Record<ImpulseCategory, string> = {
  FOOD: '🍔',
  SHOPPING: '🛍️',
  ENTERTAINMENT: '🎬',
  TRADING: '📈',
  CRYPTO: '₿',
  COURSE: '📚',
  SUBSCRIPTION: '📱',
  OTHER: '📦',
};

export const EMOTION_LABELS: Record<string, string> = {
  BORED: 'Bored',
  STRESSED: 'Stressed',
  FOMO: 'FOMO',
  HAPPY: 'Happy',
  LONELY: 'Lonely',
  NONE: 'None',
};

export const URGENCY_LABELS: Record<string, string> = {
  ESSENTIAL: 'Essential',
  NICE_TO_HAVE: 'Nice to Have',
  IMPULSE: 'Impulsive / Luxury',
};

