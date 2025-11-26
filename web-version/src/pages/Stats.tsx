import { useNavigate } from 'react-router-dom';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GoalsCard } from '@/components/GoalsCard';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { HeatmapChart } from '@/components/ui/HeatmapChart';
import { formatCurrency } from '@/utils/format';
import { useMemo } from 'react';
import { ArrowLeft, TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ImpulseCategory } from '@/types/impulse';
import { getEmotionalTriggers } from '@/utils/reports';

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

export function Stats() {
  const navigate = useNavigate();
  const { impulses, goals } = useImpulseStore();
  
  const emotionalTriggers = useMemo(() => getEmotionalTriggers(impulses), [impulses]);
  
  const totalSaved = impulses
    .filter((i) => i.status === 'skipped' || i.decisionAtEnd === 'skipped')
    .reduce((sum, i) => sum + i.price, 0);

  const stats = {
    totalSaved: impulses.filter((i) => i.status === 'skipped').reduce((sum, i) => sum + i.price, 0),
    totalBought: impulses.filter((i) => i.status === 'bought').reduce((sum, i) => sum + i.price, 0),
    totalSkipped: impulses.filter((i) => i.status === 'skipped').length,
    totalBoughtCount: impulses.filter((i) => i.status === 'bought').length,
  };

  // Category breakdown for pie chart
  const categoryData = Object.entries(
    impulses.reduce((acc, imp) => {
      acc[imp.category] = (acc[imp.category] || 0) + imp.price;
      return acc;
    }, {} as Record<ImpulseCategory, number>)
  ).map(([category, total]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: total,
  }));

  // Category cards data (Revolut-style)
  const categoryCardsData = useMemo(() => {
    const categoryMap = new Map<ImpulseCategory, {
      totalSpent: number;
      totalSaved: number;
      impulseCount: number;
      skipped: number;
      bought: number;
    }>();

    impulses.forEach((imp) => {
      const current = categoryMap.get(imp.category) || {
        totalSpent: 0,
        totalSaved: 0,
        impulseCount: 0,
        skipped: 0,
        bought: 0,
      };

      current.impulseCount++;
      
      if (imp.decisionAtEnd === 'bought' || imp.status === 'bought') {
        current.totalSpent += imp.price;
        current.bought++;
      } else if (imp.decisionAtEnd === 'skipped' || imp.status === 'skipped') {
        current.totalSaved += imp.price;
        current.skipped++;
      }

      categoryMap.set(imp.category, current);
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        ...data,
        skipRate: data.impulseCount > 0 ? data.skipped / data.impulseCount : 0,
      }))
      .filter((data) => data.impulseCount > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [impulses]);

  // Monthly spending trend
  const monthlyData = impulses
    .filter((i) => i.status === 'bought')
    .reduce((acc, imp) => {
      const month = new Date(imp.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + imp.price;
      return acc;
    }, {} as Record<string, number>);

  const monthlyChartData = Object.entries(monthlyData)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6);

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="btn btn-circle btn-ghost"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold">Statistics</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Reports
          </Button>
        </div>

        {/* Goals Card */}
        <GoalsCard goals={goals} totalSaved={totalSaved} />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold text-success">{formatCurrency(stats.totalSaved)}</div>
            <div className="text-sm text-base-content/70">Total Saved</div>
            <div className="text-xs text-base-content/50 mt-1">{stats.totalSkipped} impulses skipped</div>
          </Card>
          <Card className="text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-error" />
            <div className="text-2xl font-bold text-error">{formatCurrency(stats.totalBought)}</div>
            <div className="text-sm text-base-content/70">Total Spent</div>
            <div className="text-xs text-base-content/50 mt-1">{stats.totalBoughtCount} purchases</div>
          </Card>
        </div>

        {/* Category Cards (Revolut-style) */}
        {categoryCardsData.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5" />
              <h2 className="text-xl font-bold">Category Breakdown</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {categoryCardsData.map((data) => (
                <CategoryCard
                  key={data.category}
                  category={data.category}
                  totalSpent={data.totalSpent}
                  totalSaved={data.totalSaved}
                  impulseCount={data.impulseCount}
                  skipRate={data.skipRate}
                  onClick={() => navigate(`/history?category=${data.category}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Category Pie Chart */}
        {categoryData.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5" />
              <h2 className="text-xl font-bold">Spending Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Monthly Trend */}
        {monthlyChartData.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h2 className="text-xl font-bold">Monthly Spending Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="total" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Activity Heatmap */}
        {impulses.length > 0 && (
          <Card>
            <HeatmapChart impulses={impulses} days={365} />
          </Card>
        )}

        {/* Emotional Triggers */}
        {emotionalTriggers.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5" />
              <h2 className="text-xl font-bold">Emotional Triggers</h2>
            </div>
            <div className="space-y-3">
              {emotionalTriggers.slice(0, 5).map((trigger) => (
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
                        {trigger.count} impulses • {(trigger.skipRate * 100).toFixed(0)}% skipped
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {trigger.avgRegret !== null ? (
                      <>
                        <div className="text-sm font-semibold">
                          Avg regret: {trigger.avgRegret.toFixed(0)}
                        </div>
                        <div className="text-xs text-base-content/70">
                          {(trigger.buyRate * 100).toFixed(0)}% bought
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-base-content/70">No regret data</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {impulses.length === 0 && (
          <Card>
            <p className="text-center text-base-content/70">No data yet. Start adding impulses to see your stats!</p>
          </Card>
        )}
      </div>
    </div>
  );
}

