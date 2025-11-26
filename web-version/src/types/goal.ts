export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  description?: string;
  createdAt: number;
  achievedAt?: number | null;
}

