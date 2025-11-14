import { useState, useEffect, useCallback } from 'react';
import { goals } from '@/services/goals';
import { SavingsGoal, GoalFormData, GoalProgress } from '@/types/goal';
import { Impulse } from '@/types/impulse';

/**
 * Custom hook for managing savings goals
 */
export function useGoals(impulses?: Impulse[]) {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  // Update goal progress when impulses change
  useEffect(() => {
    if (impulses && impulses.length > 0) {
      goals.updateGoalProgress(impulses).then(() => {
        loadGoals();
      });
    }
  }, [impulses?.length]); // Only recalculate when impulses count changes

  const loadGoals = useCallback(async () => {
    try {
      const data = await goals.getGoals();
      setSavingsGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGoal = useCallback(async (formData: GoalFormData): Promise<SavingsGoal> => {
    const newGoal = await goals.createGoal(formData);
    await loadGoals();
    // Recalculate progress if impulses are available
    if (impulses) {
      await goals.updateGoalProgress(impulses);
      await loadGoals();
    }
    return newGoal;
  }, [loadGoals, impulses]);

  const updateGoal = useCallback(async (id: string, updates: Partial<GoalFormData>): Promise<boolean> => {
    const updated = await goals.updateGoal(id, updates);
    if (updated) {
      await loadGoals();
      // Recalculate progress if impulses are available
      if (impulses) {
        await goals.updateGoalProgress(impulses);
        await loadGoals();
      }
      return true;
    }
    return false;
  }, [loadGoals, impulses]);

  const deleteGoal = useCallback(async (id: string): Promise<boolean> => {
    const success = await goals.deleteGoal(id);
    if (success) {
      await loadGoals();
      // Recalculate progress if impulses are available
      if (impulses) {
        await goals.updateGoalProgress(impulses);
        await loadGoals();
      }
    }
    return success;
  }, [loadGoals, impulses]);

  const assignImpulseToGoal = useCallback(async (impulseId: string, goalId: string): Promise<void> => {
    await goals.assignImpulseToGoal(impulseId, goalId);
    if (impulses) {
      await goals.updateGoalProgress(impulses);
      await loadGoals();
    }
  }, [loadGoals, impulses]);

  // Calculate progress for each goal
  const getGoalProgress = useCallback((goal: SavingsGoal): GoalProgress => {
    const progress = goal.targetAmount > 0 
      ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
      : 0;
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    
    let daysRemaining: number | undefined;
    let onTrack = true;
    
    if (goal.targetDate) {
      const now = Date.now();
      daysRemaining = Math.ceil((goal.targetDate - now) / (24 * 60 * 60 * 1000));
      
      if (daysRemaining > 0 && goal.currentAmount > 0) {
        const dailyRate = goal.currentAmount / Math.max(1, Math.ceil((now - goal.createdAt) / (24 * 60 * 60 * 1000)));
        const projectedAmount = goal.currentAmount + (dailyRate * daysRemaining);
        onTrack = projectedAmount >= goal.targetAmount;
      } else if (daysRemaining <= 0) {
        onTrack = goal.isCompleted;
      }
    }

    return {
      goal,
      progress: Math.round(progress * 10) / 10,
      remaining,
      daysRemaining,
      onTrack,
    };
  }, []);

  const activeGoals = savingsGoals.filter(g => !g.isCompleted);
  const completedGoals = savingsGoals.filter(g => g.isCompleted);

  return {
    goals: savingsGoals,
    activeGoals,
    completedGoals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    assignImpulseToGoal,
    getGoalProgress,
    reload: loadGoals,
  };
}

