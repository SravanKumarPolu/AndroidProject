export type ImpulseStatus = 'pending' | 'cooldown' | 'decision' | 'skipped' | 'bought';

export type ImpulseCategory = 
  | 'food'
  | 'shopping'
  | 'entertainment'
  | 'subscription'
  | 'gadget'
  | 'clothing'
  | 'other';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export type EmotionAtImpulse = 'bored' | 'stressed' | 'hungry' | 'excited' | 'sad' | 'tired' | 'fomo' | 'neutral';

export interface Impulse {
  id: string;
  title: string;
  price: number;
  category: ImpulseCategory;
  reason?: string;
  urgency: UrgencyLevel;
  urgeStrength?: number; // 1-10 scale (Revolut-style)
  urgeStrengthAfterCooldown?: number; // Urge strength after cooldown period (captured in Decision screen)
  createdAt: number;
  cooldownEndsAt: number;
  status: ImpulseStatus;
  decisionAt?: number;
  finalDecision?: 'skip' | 'buy' | 'save-later';
  // Phase 2 fields
  emotionAtImpulse?: EmotionAtImpulse;
  decisionAtEnd?: 'skipped' | 'bought' | 'saved_for_later';
  regretCheckAt?: number | null;
  regretScore?: number | null;
  notesAfterPurchase?: string | null;
  isInfluenced?: boolean; // Whether the impulse was influenced by friends/social media
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  defaultCooldownHours: number;
  // Notification nudges
  reminderToLog: boolean;
  weeklyReportSummary: boolean;
  regretCheckReminders: boolean;
  nightlyReminder?: boolean;
  reminderTime?: string; // Time in HH:mm format
  shoppingAppPrompt?: boolean; // Future feature
  // Cloud Sync
  cloudSyncEnabled: boolean;
  cloudSyncUrl?: string;
  cloudSyncKey?: string;
  // Smart Alerts
  smartAlertsEnabled: boolean;
  // Appearance
  accentColor?: 'blue' | 'purple' | 'teal';
  // Category Limits
  categoryLimits?: Record<ImpulseCategory, { weekly?: number; monthly?: number }>;
}

