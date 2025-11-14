/**
 * Recurring Impulse Pattern Types
 * Identifies patterns and habits in user behavior
 */

import { Impulse, ImpulseCategory } from './impulse';

export type PatternType = 
  | 'DAILY'      // Same impulse every day
  | 'WEEKLY'     // Same impulse on same day of week
  | 'MONTHLY'    // Same impulse on same day of month
  | 'FREQUENT'   // High frequency, irregular timing
  | 'TIME_BASED' // Same time of day
  | 'CATEGORY'   // Same category, similar price
  | 'PRICE'      // Similar price range
  | 'SOURCE';    // Same source app

export type PatternStrength = 'WEAK' | 'MODERATE' | 'STRONG' | 'VERY_STRONG';

export interface RecurringPattern {
  id: string;
  type: PatternType;
  strength: PatternStrength;
  confidence: number; // 0-100
  
  // Pattern characteristics
  title?: string; // Common title/keywords
  category?: ImpulseCategory;
  priceRange?: { min: number; max: number; avg: number };
  timeOfDay?: number; // Hour 0-23
  dayOfWeek?: number; // 0-6 (Sunday = 0)
  dayOfMonth?: number; // 1-31
  sourceApp?: string;
  
  // Pattern metrics
  frequency: number; // Impulses per period
  period: 'day' | 'week' | 'month';
  totalOccurrences: number;
  firstSeen: number; // Timestamp
  lastSeen: number; // Timestamp
  avgInterval: number; // Average days between occurrences
  
  // Impact metrics
  totalSpent: number;
  totalRegretted: number;
  regretRate: number;
  avgPrice: number;
  
  // Related impulses
  impulseIds: string[];
  
  // Predictions
  nextPredictedDate?: number;
  predictedPrice?: number;
  
  // Insights
  insights: string[];
  suggestions: string[];
}

export interface PatternMatch {
  pattern: RecurringPattern;
  matchScore: number; // 0-100
  matchedImpulses: Impulse[];
}

export interface PatternInsight {
  type: 'WARNING' | 'SUCCESS' | 'INFO' | 'SUGGESTION';
  title: string;
  message: string;
  action?: {
    label: string;
    type: 'SET_GOAL' | 'EXTEND_COOLDOWN' | 'VIEW_PATTERN' | 'BREAK_PATTERN';
  };
}

