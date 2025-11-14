import { useState, useEffect, useCallback } from 'react';
import { Budget, BudgetProgress, BudgetAlert } from '@/types/budget';
import { Impulse } from '@/types/impulse';
import { budgetService } from '@/services/budget';

/**
 * Custom hook for managing budgets
 */
export function useBudget(impulses: Impulse[] = []) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadBudgets();
  }, []);

  // Auto-reset expired budgets on load
  useEffect(() => {
    budgetService.autoResetExpiredBudgets().then(() => {
      loadBudgets();
    });
  }, []);

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await budgetService.getBudgets();
      setBudgets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load budgets'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createBudget = useCallback(async (budgetData: Omit<Budget, 'id' | 'createdAt' | 'startDate' | 'endDate'>) => {
    try {
      const newBudget = await budgetService.createBudget(budgetData);
      setBudgets(prev => [...prev, newBudget]);
      return newBudget;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create budget'));
      throw err;
    }
  }, []);

  const updateBudget = useCallback(async (id: string, updates: Partial<Budget>) => {
    try {
      await budgetService.updateBudget(id, updates);
      setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update budget'));
      throw err;
    }
  }, []);

  const deleteBudget = useCallback(async (id: string) => {
    try {
      await budgetService.deleteBudget(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete budget'));
      throw err;
    }
  }, []);

  const budgetProgresses = budgets
    .filter(b => b.isActive)
    .map(budget => budgetService.getBudgetProgress(budget, impulses));

  const budgetAlerts = budgetService.getBudgetAlerts(budgets, impulses);

  const activeBudgets = budgets.filter(b => b.isActive);

  return {
    budgets,
    activeBudgets,
    budgetProgresses,
    budgetAlerts,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    reload: loadBudgets,
  };
}

