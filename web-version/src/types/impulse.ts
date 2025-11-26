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
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  defaultCooldownHours: number;
  // Notification nudges
  reminderToLog: boolean;
  weeklyReportSummary: boolean;
  regretCheckReminders: boolean;
  // Cloud Sync
  cloudSyncEnabled: boolean;
  cloudSyncUrl?: string;
  cloudSyncKey?: string;
  // Smart Alerts
  smartAlertsEnabled: boolean;
}

