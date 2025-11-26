import { Card } from './Card';
import { Button } from './Button';
import { SavingsGoal } from '@/types/goal';
import { formatCurrency } from '@/utils/format';
import { Target, CheckCircle } from 'lucide-react';

interface GoalProgressCardProps {
  goal: SavingsGoal;
  currentAmount: number;
  onViewDetails?: () => void;
  className?: string;
}

export function GoalProgressCard({ 
  goal, 
  currentAmount, 
  onViewDetails,
  className = '' 
}: GoalProgressCardProps) {
  const progress = goal.targetAmount > 0
    ? Math.min(100, (currentAmount / goal.targetAmount) * 100)
    : 0;

  const isAchieved = progress >= 100;
  const remaining = Math.max(0, goal.targetAmount - currentAmount);

  return (
    <Card className={`bg-gradient-to-br from-primary/10 to-accent/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isAchieved ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : (
            <Target className="w-5 h-5 text-primary" />
          )}
          <h3 className="font-semibold text-lg">{goal.title}</h3>
        </div>
        {isAchieved && (
          <span className="badge badge-success badge-sm">Achieved!</span>
        )}
      </div>

      {goal.description && (
        <p className="text-sm text-base-content/70 mb-4">{goal.description}</p>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-base-content/70">Progress</span>
          <span className="text-sm font-bold">
            {formatCurrency(currentAmount)} / {formatCurrency(goal.targetAmount)}
          </span>
        </div>
        <div className="w-full bg-base-300 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              isAchieved
                ? 'bg-gradient-to-r from-success to-success/80'
                : 'bg-gradient-to-r from-primary to-accent'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-base-content/60 mt-2">
          <span>{progress.toFixed(1)}% complete</span>
          {!isAchieved && (
            <span>{formatCurrency(remaining)} to go</span>
          )}
        </div>
      </div>

      {onViewDetails && (
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={onViewDetails}
        >
          {isAchieved ? 'View Details' : 'Track Progress'}
        </Button>
      )}
    </Card>
  );
}

