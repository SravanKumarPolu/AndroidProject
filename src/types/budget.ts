/**
 * Budget types for ImpulseVault
 * Supports monthly and category-based budgets
 */

export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type BudgetType = 'TOTAL' | 'CATEGORY';

export interface Budget {
  id: string;
  type: BudgetType;
  period: BudgetPeriod;
  amount: number;
  category?: string; // Required if type is CATEGORY
  startDate: number; // Timestamp for period start
  endDate: number; // Timestamp for period end
  createdAt: number;
  isActive: boolean;
}

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
  daysRemaining: number;
}

export interface BudgetAlert {
  budgetId: string;
  type: 'WARNING' | 'CRITICAL' | 'EXCEEDED';
  message: string;
  threshold: number; // Percentage threshold
}

