import { useNavigate } from 'react-router-dom';
import { SavingsGoal } from '@/types/goal';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatCurrency } from '@/utils/format';
import { Target, Plus } from 'lucide-react';

interface GoalsCardProps {
  goals: SavingsGoal[];
  totalSaved: number;
}

export function GoalsCard({ goals, totalSaved }: GoalsCardProps) {
  const navigate = useNavigate();
  
  const activeGoals = goals.filter((g) => !g.achievedAt);
  const primaryGoal = activeGoals[0];

  if (activeGoals.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Savings Goals</h3>
            <p className="text-sm text-base-content/70">
              Set a goal to track your progress
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings?tab=goals')}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Goal
          </Button>
        </div>
      </Card>
    );
  }

  const progress = primaryGoal.targetAmount > 0
    ? Math.min(100, (totalSaved / primaryGoal.targetAmount) * 100)
    : 0;

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Savings Goal</h3>
        </div>
        {activeGoals.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings?tab=goals')}
          >
            View All ({activeGoals.length})
          </Button>
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold">{primaryGoal.title}</span>
          <span className="text-sm text-base-content/70">
            {formatCurrency(totalSaved)} / {formatCurrency(primaryGoal.targetAmount)}
          </span>
        </div>
        {primaryGoal.description && (
          <p className="text-xs text-base-content/60 mb-2">{primaryGoal.description}</p>
        )}
        <div className="w-full bg-base-300 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-base-content/70 mt-1">
          <span>{progress.toFixed(1)}% complete</span>
          <span>{formatCurrency(primaryGoal.targetAmount - totalSaved)} to go</span>
        </div>
      </div>

      {activeGoals.length === 1 && (
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => navigate('/settings?tab=goals')}
        >
          Manage Goals
        </Button>
      )}
    </Card>
  );
}

