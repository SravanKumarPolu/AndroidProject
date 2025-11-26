import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ScoreCard } from '@/components/ui/ScoreCard';
import { MoodImpulseGraph } from '@/components/MoodImpulseGraph';
import { formatCurrency } from '@/utils/format';
import { ArrowLeft, Calendar, TrendingUp, DollarSign, Target, Heart } from 'lucide-react';
import {
  calculateReportMetrics,
  getWeekRange,
  getMonthRange,
  getEmotionalTriggers,
  calculateImpulseScore,
} from '@/utils/reports';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const COLORS = ['#6366f1', '#d946ef', '#22d3ee', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const emotionEmojis: Record<string, string> = {
  bored: '😴',
  stressed: '😫',
  hungry: '🤤',
  excited: '🤩',
  sad: '😢',
  tired: '😵',
  fomo: '😰',
  neutral: '😐',
};

type ReportPeriod = 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'all-time';

export function Reports() {
  const navigate = useNavigate();
  const { impulses } = useImpulseStore();
  const [period, setPeriod] = useState<ReportPeriod>('this-week');

  const { startTime, endTime, label } = useMemo(() => {
    switch (period) {
      case 'this-week':
        const thisWeek = getWeekRange(0);
        return {
          startTime: thisWeek.start,
          endTime: thisWeek.end,
          label: 'This Week',
        };
      case 'last-week':
        const lastWeek = getWeekRange(1);
        return {
          startTime: lastWeek.start,
          endTime: lastWeek.end,
          label: 'Last Week',
        };
      case 'this-month':
        const thisMonth = getMonthRange(0);
        return {
          startTime: thisMonth.start,
          endTime: thisMonth.end,
          label: 'This Month',
        };
      case 'last-month':
        const lastMonth = getMonthRange(1);
        return {
          startTime: lastMonth.start,
          endTime: lastMonth.end,
          label: 'Last Month',
        };
      case 'all-time':
        return {
          startTime: 0,
          endTime: Date.now(),
          label: 'All Time',
        };
      default:
        return { startTime: 0, endTime: Date.now(), label: 'All Time' };
    }
  }, [period]);

  const metrics = useMemo(
    () => calculateReportMetrics(impulses, startTime, endTime),
    [impulses, startTime, endTime]
  );

  const emotionalTriggers = useMemo(() => getEmotionalTriggers(impulses), [impulses]);

  // Calculate impulse score
  const thisWeekMetrics = useMemo(
    () => calculateReportMetrics(impulses, getWeekRange(0).start, getWeekRange(0).end),
    [impulses]
  );
  const impulseScore = useMemo(
    () =>
      calculateImpulseScore({
        skipRate: thisWeekMetrics.skipRate,
        avgRegret: thisWeekMetrics.avgRegretScore,
        weeklyImpulseCount: thisWeekMetrics.totalLogged,
      }),
    [thisWeekMetrics]
  );

  // Improvement calculation (this week vs last week)
  const lastWeekMetrics = useMemo(
    () => calculateReportMetrics(impulses, getWeekRange(1).start, getWeekRange(1).end),
    [impulses]
  );
  const improvement = useMemo(() => {
    if (lastWeekMetrics.totalLogged === 0) return null;
    const skipRateDiff = thisWeekMetrics.skipRate - lastWeekMetrics.skipRate;
    return {
      skipRateDiff: skipRateDiff * 100,
      isImproving: skipRateDiff > 0,
    };
  }, [thisWeekMetrics, lastWeekMetrics]);

  // Category chart data
  const categoryData = metrics.topCategories.map((cat) => ({
    name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
    count: cat.count,
  }));

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="btn btn-circle btn-ghost"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">Reports</h1>
        </div>

        {/* Period Selector */}
        <Card>
          <div className="flex flex-wrap gap-2">
            {(['this-week', 'last-week', 'this-month', 'last-month', 'all-time'] as ReportPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`btn btn-sm ${
                  period === p ? 'btn-primary' : 'btn-outline'
                }`}
              >
                {p === 'this-week' && 'This Week'}
                {p === 'last-week' && 'Last Week'}
                {p === 'this-month' && 'This Month'}
                {p === 'last-month' && 'Last Month'}
                {p === 'all-time' && 'All Time'}
              </button>
            ))}
          </div>
          <div className="mt-2 text-sm text-base-content/70">
            <Calendar className="w-4 h-4 inline mr-1" />
            {label}
          </div>
        </Card>

        {/* Impulse Score */}
        <ScoreCard
          score={impulseScore}
          showTrend={improvement !== null}
          trendValue={improvement?.skipRateDiff}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{metrics.totalLogged}</div>
            <div className="text-xs text-base-content/70">Impulses Logged</div>
          </Card>
          <Card className="text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold text-success">
              {formatCurrency(metrics.totalSaved)}
            </div>
            <div className="text-xs text-base-content/70">Money Saved</div>
          </Card>
          <Card className="text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold text-accent">
              {(metrics.skipRate * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-base-content/70">Skip Rate</div>
          </Card>
          <Card className="text-center">
            <Heart className="w-6 h-6 mx-auto mb-2 text-error" />
            <div className="text-2xl font-bold text-error">
              {metrics.avgRegretScore !== null
                ? metrics.avgRegretScore.toFixed(0)
                : 'N/A'}
            </div>
            <div className="text-xs text-base-content/70">Avg Regret</div>
          </Card>
        </div>

        {/* Improvement */}
        {improvement && (
          <Card className={improvement.isImproving ? 'bg-success/10' : 'bg-warning/10'}>
            <div className="flex items-center gap-2">
              <TrendingUp
                className={`w-5 h-5 ${
                  improvement.isImproving ? 'text-success' : 'text-warning'
                }`}
              />
              <div>
                <h3 className="font-semibold">Best Improvement</h3>
                <p className="text-sm text-base-content/70">
                  Your skip rate is{' '}
                  <span
                    className={`font-bold ${
                      improvement.isImproving ? 'text-success' : 'text-warning'
                    }`}
                  >
                    {improvement.skipRateDiff > 0 ? '+' : ''}
                    {improvement.skipRateDiff.toFixed(1)}%
                  </span>{' '}
                  compared to last week
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Top Categories */}
        {categoryData.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold mb-4">Top Categories</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Emotional Triggers */}
        {emotionalTriggers.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold mb-4">Top Emotional Triggers</h2>
            <div className="space-y-3">
              {emotionalTriggers.map((trigger) => (
                <div
                  key={trigger.emotion}
                  className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {emotionEmojis[trigger.emotion] || '😐'}
                    </span>
                    <div>
                      <div className="font-semibold capitalize">{trigger.emotion}</div>
                      <div className="text-xs text-base-content/70">
                        {trigger.count} impulses
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {(trigger.buyRate * 100).toFixed(0)}% bought
                    </div>
                    {trigger.avgRegret !== null && (
                      <div className="text-xs text-base-content/70">
                        Avg regret: {trigger.avgRegret.toFixed(0)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Mood-Impulse Graph */}
        <MoodImpulseGraph impulses={impulses} />

        {impulses.length === 0 && (
            <Card>
              <p className="text-center text-base-content/70">
                No data yet. Start adding impulses to see your reports!
              </p>
            </Card>
          )}
        </div>
      </div>
    );
  }

