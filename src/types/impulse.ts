/**
 * Core types for ImpulseVault
 * Modern, type-safe data models
 */

export type ImpulseCategory =
  | 'FOOD'
  | 'SHOPPING'
  | 'ENTERTAINMENT'
  | 'TRADING'
  | 'CRYPTO'
  | 'COURSE'
  | 'SUBSCRIPTION'
  | 'OTHER';

export type EmotionTag = 'BORED' | 'STRESSED' | 'FOMO' | 'HAPPY' | 'LONELY' | 'NONE';

export type UrgencyLevel = 'ESSENTIAL' | 'NICE_TO_HAVE' | 'IMPULSE';

export type CoolDownPeriod = '1H' | '6H' | '24H' | '3D';

export type ImpulseStatus = 'LOCKED' | 'CANCELLED' | 'EXECUTED';

export type FinalFeeling = 'WORTH_IT' | 'REGRET' | 'NEUTRAL';

export type SkippedFeeling = 'RELIEVED' | 'NEUTRAL' | 'STILL_CRAVING';

/**
 * Main Impulse interface
 */
export interface Impulse {
  id: string;
  title: string;
  category: ImpulseCategory;
  price?: number;
  emotion?: EmotionTag;
  urgency: UrgencyLevel;
  coolDownPeriod: CoolDownPeriod; // Cool-down period chosen
  createdAt: number;
  reviewAt: number;
  status: ImpulseStatus;
  executedAt?: number;
  finalFeeling?: FinalFeeling;
  skippedFeeling?: SkippedFeeling;
  notes?: string;
  sourceApp?: string; // e.g., "Swiggy", "Amazon" (optional)
  photoUri?: string; // Local file URI for attached photo
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
    timestamp: number;
  };
}

/**
 * User statistics (computed)
 */
export interface UserStats {
  totalSaved: number;
  totalRegretted: number;
  totalExecuted: number;
  totalCancelled: number;
  regretRate: number;
  currentStreak: number;
  longestStreak: number;
  todaySaved: number;
  todayLogged: number;
}

/**
 * Category statistics
 */
export interface CategoryStats {
  category: ImpulseCategory;
  totalLogged: number;
  totalCancelled: number;
  totalRegretted: number;
  avgPrice: number;
  regretRate: number;
}

/**
 * Form data for creating new impulse
 */
export interface ImpulseFormData {
  title: string;
  category: ImpulseCategory;
  price?: number;
  emotion?: EmotionTag;
  urgency: UrgencyLevel;
  coolDownPeriod?: CoolDownPeriod; // Optional, defaults to 24H
  photoUri?: string; // Photo URI to attach
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
    timestamp: number;
  };
}

