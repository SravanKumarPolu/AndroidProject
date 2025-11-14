/**
 * Savings Goal types
 * Allows users to set financial goals and track progress from cancelled impulses
 */

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number; // Calculated from cancelled impulses
  currency?: string; // Defaults to user's currency
  createdAt: number;
  targetDate?: number; // Optional deadline
  category?: string; // Optional category filter (e.g., "FOOD", "SHOPPING")
  description?: string;
  isCompleted: boolean;
  completedAt?: number;
  color?: string; // Optional color for UI customization
}

export interface GoalProgress {
  goal: SavingsGoal;
  progress: number; // 0-100 percentage
  remaining: number; // Amount remaining to reach goal
  daysRemaining?: number; // Days until target date
  onTrack: boolean; // Whether goal is on track to be completed by target date
}

/**
 * Form data for creating/editing a goal
 */
export interface GoalFormData {
  title: string;
  targetAmount: number;
  targetDate?: number;
  category?: string;
  description?: string;
  color?: string;
}

