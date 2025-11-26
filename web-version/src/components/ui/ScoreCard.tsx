import { Card } from './Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreCardProps {
  score: number; // 0-100
  label?: string;
  showTrend?: boolean;
  trendValue?: number; // Positive or negative change
  className?: string;
}

export function ScoreCard({ 
  score, 
  label = 'Impulse Score', 
  showTrend = false,
  trendValue,
  className = '' 
}: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-error';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-success to-success/80';
    if (score >= 60) return 'from-primary to-accent';
    if (score >= 40) return 'from-warning to-warning/80';
    return 'from-error to-error/80';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <Card className={`bg-gradient-to-br from-primary/20 to-accent/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold mb-1">{label}</h2>
          <p className="text-sm text-base-content/70">Your self-control rating</p>
        </div>
        {showTrend && trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            trendValue > 0 ? 'text-success' : trendValue < 0 ? 'text-error' : 'text-base-content/70'
          }`}>
            {trendValue > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : trendValue < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span>{Math.abs(trendValue).toFixed(0)}</span>
          </div>
        )}
      </div>
      
      <div className="text-center mb-4">
        <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
          {score}
        </div>
        <div className="text-sm text-base-content/70">/ 100</div>
        <div className={`text-xs font-semibold mt-1 ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${getScoreGradient(score)} h-3 rounded-full transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-base-content/50 mt-2">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
    </Card>
  );
}

