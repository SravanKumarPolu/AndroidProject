import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavingsGoal, GoalFormData } from '@/types/goal';
import { Impulse } from '@/types/impulse';

const GOALS_KEY = '@impulsevault:goals';
const GOAL_CONTRIBUTIONS_KEY = '@impulsevault:goalContributions'; // Maps impulse ID to goal ID

/**
 * Goals service
 * Manages savings goals and tracks contributions from cancelled impulses
 */
export const goals = {
  /**
   * Get all goals
   */
  async getGoals(): Promise<SavingsGoal[]> {
    try {
      const data = await AsyncStorage.getItem(GOALS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  },

  /**
   * Get a specific goal by ID
   */
  async getGoal(id: string): Promise<SavingsGoal | null> {
    const goals = await this.getGoals();
    return goals.find(g => g.id === id) || null;
  },

  /**
   * Create a new goal
   */
  async createGoal(formData: GoalFormData): Promise<SavingsGoal> {
    const goal: SavingsGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title,
      targetAmount: formData.targetAmount,
      currentAmount: 0,
      currency: 'USD', // TODO: Get from user settings
      createdAt: Date.now(),
      targetDate: formData.targetDate,
      category: formData.category,
      description: formData.description,
      isCompleted: false,
      color: formData.color,
    };

    const goals = await this.getGoals();
    goals.push(goal);
    await this.saveGoals(goals);
    return goal;
  },

  /**
   * Update an existing goal
   */
  async updateGoal(id: string, updates: Partial<GoalFormData>): Promise<SavingsGoal | null> {
    const goals = await this.getGoals();
    const index = goals.findIndex(g => g.id === id);
    
    if (index === -1) return null;

    goals[index] = {
      ...goals[index],
      ...updates,
      // Don't allow updating currentAmount directly - it's calculated
      currentAmount: goals[index].currentAmount,
    };

    await this.saveGoals(goals);
    return goals[index];
  },

  /**
   * Delete a goal
   */
  async deleteGoal(id: string): Promise<boolean> {
    const goals = await this.getGoals();
    const filtered = goals.filter(g => g.id !== id);
    await this.saveGoals(filtered);
    
    // Also remove any contributions linked to this goal
    await this.removeGoalContributions(id);
    return true;
  },

  /**
   * Calculate goal progress from cancelled impulses
   * This should be called whenever impulses change
   */
  async updateGoalProgress(impulses: Impulse[]): Promise<void> {
    const goals = await this.getGoals();
    const contributions = await this.getGoalContributions();

    // Reset all goal amounts
    goals.forEach(goal => {
      goal.currentAmount = 0;
      goal.isCompleted = false;
    });

    // Calculate contributions from cancelled impulses
    const cancelledImpulses = impulses.filter(i => i.status === 'CANCELLED' && i.price);
    
    for (const impulse of cancelledImpulses) {
      const contribution = contributions[impulse.id];
      
      if (contribution) {
        // This impulse is already assigned to a goal
        const goal = goals.find(g => g.id === contribution.goalId);
        if (goal && !goal.isCompleted) {
          goal.currentAmount += impulse.price || 0;
        }
      } else {
        // Auto-assign to matching goals (by category if specified)
        const matchingGoals = goals.filter(g => 
          !g.isCompleted && 
          (!g.category || g.category === impulse.category)
        );

        if (matchingGoals.length === 1) {
          // Only one matching goal, auto-assign
          matchingGoals[0].currentAmount += impulse.price || 0;
          await this.addGoalContribution(impulse.id, matchingGoals[0].id);
        } else if (matchingGoals.length > 1) {
          // Multiple matching goals - distribute evenly
          const amountPerGoal = (impulse.price || 0) / matchingGoals.length;
          for (const goal of matchingGoals) {
            goal.currentAmount += amountPerGoal;
          }
          // Assign to first goal for tracking
          await this.addGoalContribution(impulse.id, matchingGoals[0].id);
        }
      }
    }

    // Mark completed goals
    const now = Date.now();
    goals.forEach(goal => {
      if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
        goal.isCompleted = true;
        goal.completedAt = goal.completedAt || now;
      }
    });

    await this.saveGoals(goals);
  },

  /**
   * Manually assign an impulse to a goal
   */
  async assignImpulseToGoal(impulseId: string, goalId: string): Promise<void> {
    await this.addGoalContribution(impulseId, goalId);
    // Recalculate progress
    // Note: This requires impulses to be passed, so it's better to call updateGoalProgress after
  },

  /**
   * Remove assignment of an impulse from a goal
   */
  async unassignImpulseFromGoal(impulseId: string): Promise<void> {
    await this.removeGoalContribution(impulseId);
  },

  /**
   * Get goal contributions map
   */
  async getGoalContributions(): Promise<Record<string, { goalId: string }>> {
    try {
      const data = await AsyncStorage.getItem(GOAL_CONTRIBUTIONS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.error('Error getting goal contributions:', error);
      return {};
    }
  },

  /**
   * Save goals to storage
   */
  async saveGoals(goals: SavingsGoal[]): Promise<void> {
    try {
      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving goals:', error);
      throw error;
    }
  },

  /**
   * Add a goal contribution
   */
  async addGoalContribution(impulseId: string, goalId: string): Promise<void> {
    const contributions = await this.getGoalContributions();
    contributions[impulseId] = { goalId };
    await AsyncStorage.setItem(GOAL_CONTRIBUTIONS_KEY, JSON.stringify(contributions));
  },

  /**
   * Remove a goal contribution
   */
  async removeGoalContribution(impulseId: string): Promise<void> {
    const contributions = await this.getGoalContributions();
    delete contributions[impulseId];
    await AsyncStorage.setItem(GOAL_CONTRIBUTIONS_KEY, JSON.stringify(contributions));
  },

  /**
   * Remove all contributions for a goal
   */
  async removeGoalContributions(goalId: string): Promise<void> {
    const contributions = await this.getGoalContributions();
    const filtered = Object.fromEntries(
      Object.entries(contributions).filter(([_, value]) => value.goalId !== goalId)
    );
    await AsyncStorage.setItem(GOAL_CONTRIBUTIONS_KEY, JSON.stringify(filtered));
  },
};

