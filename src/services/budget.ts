import AsyncStorage from '@react-native-async-storage/async-storage';
import { Budget, BudgetProgress, BudgetAlert, BudgetPeriod, BudgetType } from '@/types/budget';
import { Impulse } from '@/types/impulse';
import { logger } from '@/utils/logger';

const BUDGETS_KEY = '@impulsevault:budgets';

/**
 * Budget service
 * Manages user budgets and tracks spending
 */

export const budgetService = {
  /**
   * Get all budgets
   */
  async getBudgets(): Promise<Budget[]> {
    try {
      const data = await AsyncStorage.getItem(BUDGETS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.error('Error getting budgets', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  },

  /**
   * Get active budgets
   */
  async getActiveBudgets(): Promise<Budget[]> {
    const budgets = await this.getBudgets();
    return budgets.filter(b => b.isActive);
  },

  /**
   * Save budgets
   */
  async saveBudgets(budgets: Budget[]): Promise<void> {
    try {
      await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    } catch (error) {
      logger.error('Error saving budgets', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },

  /**
   * Create a new budget
   */
  async createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'startDate' | 'endDate'>): Promise<Budget> {
    const budgets = await this.getBudgets();
    
    // Calculate period dates
    const now = Date.now();
    const { startDate, endDate } = this.calculatePeriodDates(budget.period, now);
    
    const newBudget: Budget = {
      ...budget,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      startDate,
      endDate,
      isActive: true,
    };

    budgets.push(newBudget);
    await this.saveBudgets(budgets);
    return newBudget;
  },

  /**
   * Update a budget
   */
  async updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
    const budgets = await this.getBudgets();
    const index = budgets.findIndex(b => b.id === id);
    
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updates };
      await this.saveBudgets(budgets);
    }
  },

  /**
   * Delete a budget
   */
  async deleteBudget(id: string): Promise<void> {
    const budgets = await this.getBudgets();
    const filtered = budgets.filter(b => b.id !== id);
    await this.saveBudgets(filtered);
  },

  /**
   * Calculate period dates
   */
  calculatePeriodDates(period: BudgetPeriod, referenceDate: number): { startDate: number; endDate: number } {
    const date = new Date(referenceDate);
    const start = new Date(date);
    const end = new Date(date);

    switch (period) {
      case 'WEEKLY':
        const dayOfWeek = date.getDay();
        start.setDate(date.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;

      case 'MONTHLY':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(start.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;

      case 'YEARLY':
        start.setMonth(0);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11);
        end.setDate(31);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return {
      startDate: start.getTime(),
      endDate: end.getTime(),
    };
  },

  /**
   * Calculate spending for a budget period
   */
  calculateSpending(budget: Budget, impulses: Impulse[]): number {
    const periodImpulses = impulses.filter(
      i => i.createdAt >= budget.startDate && i.createdAt <= budget.endDate
    );

    if (budget.type === 'TOTAL') {
      // Sum all executed impulses in period
      return periodImpulses
        .filter(i => i.status === 'EXECUTED')
        .reduce((sum, i) => sum + (i.price || 0), 0);
    } else {
      // Sum executed impulses in category
      return periodImpulses
        .filter(i => i.status === 'EXECUTED' && i.category === budget.category)
        .reduce((sum, i) => sum + (i.price || 0), 0);
    }
  },

  /**
   * Get budget progress
   */
  getBudgetProgress(budget: Budget, impulses: Impulse[]): BudgetProgress {
    const spent = this.calculateSpending(budget, impulses);
    const remaining = Math.max(0, budget.amount - spent);
    const percentageUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const isOverBudget = spent > budget.amount;

    // Calculate days remaining
    const now = Date.now();
    const daysRemaining = Math.max(0, Math.ceil((budget.endDate - now) / (24 * 60 * 60 * 1000)));

    return {
      budget,
      spent,
      remaining,
      percentageUsed,
      isOverBudget,
      daysRemaining,
    };
  },

  /**
   * Get all budget progresses
   */
  getAllBudgetProgresses(budgets: Budget[], impulses: Impulse[]): BudgetProgress[] {
    return budgets
      .filter(b => b.isActive)
      .map(budget => this.getBudgetProgress(budget, impulses));
  },

  /**
   * Check for budget alerts
   */
  getBudgetAlerts(budgets: Budget[], impulses: Impulse[]): BudgetAlert[] {
    const alerts: BudgetAlert[] = [];

    for (const budget of budgets.filter(b => b.isActive)) {
      const progress = this.getBudgetProgress(budget, impulses);
      
      if (progress.isOverBudget) {
        alerts.push({
          budgetId: budget.id,
          type: 'EXCEEDED',
          message: `Budget exceeded! You've spent ${progress.percentageUsed.toFixed(0)}% of your ${budget.period.toLowerCase()} budget.`,
          threshold: 100,
        });
      } else if (progress.percentageUsed >= 90) {
        alerts.push({
          budgetId: budget.id,
          type: 'CRITICAL',
          message: `Warning: You've used ${progress.percentageUsed.toFixed(0)}% of your ${budget.period.toLowerCase()} budget.`,
          threshold: 90,
        });
      } else if (progress.percentageUsed >= 75) {
        alerts.push({
          budgetId: budget.id,
          type: 'WARNING',
          message: `You've used ${progress.percentageUsed.toFixed(0)}% of your ${budget.period.toLowerCase()} budget.`,
          threshold: 75,
        });
      }
    }

    return alerts;
  },

  /**
   * Reset budget for new period
   */
  async resetBudgetPeriod(budgetId: string): Promise<Budget | null> {
    const budgets = await this.getBudgets();
    const budget = budgets.find(b => b.id === budgetId);
    
    if (!budget) {
      return null;
    }

    const now = Date.now();
    const { startDate, endDate } = this.calculatePeriodDates(budget.period, now);

    budget.startDate = startDate;
    budget.endDate = endDate;

    await this.saveBudgets(budgets);
    return budget;
  },

  /**
   * Auto-reset expired budgets
   */
  async autoResetExpiredBudgets(): Promise<void> {
    const budgets = await this.getActiveBudgets();
    const now = Date.now();
    
    for (const budget of budgets) {
      if (now > budget.endDate) {
        await this.resetBudgetPeriod(budget.id);
      }
    }
  },
};

