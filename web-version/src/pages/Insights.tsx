import { useNavigate } from 'react-router-dom';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { HeatmapChart } from '@/components/ui/HeatmapChart';
import { formatCurrency } from '@/utils/format';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, Bell } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ImpulseCategory } from '@/types/impulse';
import { getEmotionalTriggers, calculateImpulseScore } from '@/utils/reports';
import { ScoreCard } from '@/components/ui/ScoreCard';

const COLORS = ['#6366f1', '#d946ef', '#22d3ee', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export function Insights() {
  const navigate = useNavigate();
  const { impulses } = useImpulseStore();

  // Saved vs Spent Summary
  const summaryData = useMemo(() => {
    const totalImpulses = impulses.length;
    const totalSpent = impulses
      .filter((i) => i.status === 'bought' || i.decisionAtEnd === 'bought')
      .reduce((sum, i) => sum + i.price, 0);
    const estimatedSaved = impulses
      .filter((i) => i.status === 'skipped' || i.decisionAtEnd === 'skipped')
      .reduce((sum, i) => sum + i.price, 0);
    
    return { totalImpulses, totalSpent, estimatedSaved };
  }, [impulses]);

  // Impulses per day data
  const impulsesPerDay = useMemo(() => {
    const dayMap = new Map<number, { date: string; count: number }>();
    impulses.forEach((imp) => {
      const date = new Date(imp.createdAt);
      date.setHours(0, 0, 0, 0);
      const timestamp = date.getTime();
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const existing = dayMap.get(timestamp);
      if (existing) {
        existing.count++;
      } else {
        dayMap.set(timestamp, { date: dateStr, count: 1 });
      }
    });
    return Array.from(dayMap.entries())
      .map(([timestamp, data]) => ({ ...data, timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-30) // Last 30 days
      .map(({ timestamp, ...data }) => data); // Remove timestamp from final output
  }, [impulses]);

  const impulseScore = useMemo(() => calculateImpulseScore(impulses), [impulses]);
  const emotionalTriggers = useMemo(() => getEmotionalTriggers(impulses), [impulses]);

  // Category spending data (for donut chart)
  const categoryData = useMemo(() => {
    const categoryMap = new Map<ImpulseCategory, number>();
    impulses.forEach((imp) => {
      if (imp.decisionAtEnd === 'bought' || imp.status === 'bought') {
        const current = categoryMap.get(imp.category) || 0;
        categoryMap.set(imp.category, current + imp.price);
      }
    });
    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      name: category.charAt(0).toUpperCase() + category.slice(1),
    }));
  }, [impulses]);

  // Impulse Time Patterns
  const timePatterns = useMemo(() => {
    const hourMap = new Map<number, number>();
    impulses.forEach((imp) => {
      const hour = new Date(imp.createdAt).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });
    
    const sortedHours = Array.from(hourMap.entries())
      .sort((a, b) => b[1] - a[1]);
    
    if (sortedHours.length === 0) return null;
    
    const [peakHour, peakCount] = sortedHours[0];
    const nextHour = peakHour === 23 ? 0 : peakHour + 1;
    const peakTimeRange = `${peakHour.toString().padStart(2, '0')}:00 - ${nextHour.toString().padStart(2, '0')}:00`;
    const reminderHour = peakHour === 0 ? 23 : peakHour - 1;
    const reminderTime = `${reminderHour.toString().padStart(2, '0')}:45`;
    
    return {
      peakHour,
      peakCount,
      peakTimeRange,
      reminderTime,
    };
  }, [impulses]);

  // Regret Insights
  const regretInsights = useMemo(() => {
    const boughtImpulses = impulses.filter(
      (i) => i.decisionAtEnd === 'bought' || i.status === 'bought'
    );
    const withRegret = boughtImpulses.filter(
      (i) => i.regretScore !== null && i.regretScore !== undefined && i.regretScore >= 50
    );
    
    const regretPercentage = boughtImpulses.length > 0
      ? (withRegret.length / boughtImpulses.length) * 100
      : 0;

    // Category regret comparison
    const categoryRegret = new Map<ImpulseCategory, { total: number; regretted: number }>();
    boughtImpulses.forEach((imp) => {
      const current = categoryRegret.get(imp.category) || { total: 0, regretted: 0 };
      current.total++;
      if (imp.regretScore !== null && imp.regretScore !== undefined && imp.regretScore >= 50) {
        current.regretted++;
      }
      categoryRegret.set(imp.category, current);
    });

    const categoryRegretRates = Array.from(categoryRegret.entries())
      .map(([category, data]) => ({
        category,
        rate: data.total > 0 ? (data.regretted / data.total) * 100 : 0,
        total: data.total,
        regretted: data.regretted,
      }))
      .filter((data) => data.total >= 2) // Only show categories with at least 2 purchases
      .sort((a, b) => b.rate - a.rate);

    const topRegretCategory = categoryRegretRates[0];
    const secondRegretCategory = categoryRegretRates[1];
    
    let comparisonText = '';
    if (topRegretCategory && secondRegretCategory && secondRegretCategory.rate > 0) {
      const ratio = topRegretCategory.rate / secondRegretCategory.rate;
      comparisonText = `You regret ${topRegretCategory.category} ${ratio.toFixed(1)}x more than ${secondRegretCategory.category}.`;
    }

    return {
      regretPercentage,
      totalBought: boughtImpulses.length,
      withRegret: withRegret.length,
      comparisonText,
      topRegretCategory: topRegretCategory?.category,
    };
  }, [impulses]);

  const handleCategoryClick = (category: ImpulseCategory) => {
    navigate(`/history?category=${category}`);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-base-100 rounded-lg border border-base-300/50 shadow-lg p-3 backdrop-blur-xl z-50"
        >
          <p className="text-sm font-semibold mb-1">{label || payload[0].payload?.date || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name || 'Count'}: {entry.value}
            </p>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
  };

  return (
    <div className="min-h-screen p-4 pb-24 md:pb-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="title-xl mb-2">Insights</h1>
          <p className="body-md text-base-content/70">Charts, savings, and regret metrics</p>
        </motion.div>

        {/* Saved vs Spent Summary - Big Numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h2 className="title-lg mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold tabular-nums mb-2 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  {summaryData.totalImpulses}
                </div>
                <div className="text-sm text-base-content/70">Total impulses logged</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold tabular-nums mb-2 text-error">
                  {formatCurrency(summaryData.totalSpent)}
                </div>
                <div className="text-sm text-base-content/70">Total spent on impulses</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold tabular-nums mb-2 text-success">
                  {formatCurrency(summaryData.estimatedSaved)}
                </div>
                <div className="text-sm text-base-content/70">Estimated saved by resisting</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Impulses per Day Chart */}
        {impulsesPerDay.length > 0 && (
          <motion.div
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Card>
              <h2 className="title-lg mb-4">Impulses per Day</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={impulsesPerDay}>
                  <XAxis 
                    dataKey="date" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    fill="#6366f1"
                    radius={[8, 8, 0, 0]}
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {impulsesPerDay.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        )}

        {/* Category Breakdown - Donut Chart (Clickable) */}
        {categoryData.length > 0 && (
          <motion.div
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <Card>
              <h2 className="title-lg mb-4">Category Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="amount"
                    onClick={(data: any) => {
                      if (data && data.category) {
                        handleCategoryClick(data.category);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        style={{ 
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e: any) => {
                          e.target.style.opacity = 0.8;
                        }}
                        onMouseLeave={(e: any) => {
                          e.target.style.opacity = 1;
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    content={<CustomTooltip />}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
              <p className="text-xs text-base-content/60 text-center mt-2">
                Click a slice to filter by category
              </p>
            </Card>
          </motion.div>
        )}

        {/* Impulse Time Patterns */}
        {timePatterns && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="title-lg">Impulse Time Patterns</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-base-200/30 rounded-xl">
                  <p className="text-sm text-base-content/70 mb-2">Most impulses happen at:</p>
                  <p className="text-2xl font-bold text-primary">{timePatterns.peakTimeRange}</p>
                </div>
                {timePatterns.reminderTime && (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold mb-1">Suggestion:</p>
                        <p className="text-base text-base-content/70">
                          Want nightly reminder at {timePatterns.reminderTime}?
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/settings')}
                        className="btn btn-sm btn-primary"
                      >
                        <Bell className="w-4 h-4 mr-1" />
                        Set Reminder
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Regret Insights */}
        {regretInsights.totalBought > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-error" />
                <h2 className="title-lg">Regret Insights</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl">
                  <p className="text-sm text-base-content/70 mb-1">
                    {regretInsights.regretPercentage.toFixed(0)}% of bought impulses → regretted later.
                  </p>
                  <p className="text-xs text-base-content/60">
                    {regretInsights.withRegret} out of {regretInsights.totalBought} purchases
                  </p>
                </div>
                {regretInsights.comparisonText && (
                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
                    <p className="text-sm text-base-content/70">
                      {regretInsights.comparisonText}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Impulse Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <ScoreCard score={impulseScore} />
        </motion.div>

        {/* Category Cards */}
        {categoryData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div>
              <h2 className="title-lg mb-4">Category Spending</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryData.map((item, index) => {
                  const categoryImpulses = impulses.filter(i => i.category === item.category);
                  const totalSpent = categoryImpulses
                    .filter(i => i.decisionAtEnd === 'bought' || i.status === 'bought')
                    .reduce((sum, i) => sum + i.price, 0);
                  const totalSaved = categoryImpulses
                    .filter(i => i.decisionAtEnd === 'skipped' || i.status === 'skipped')
                    .reduce((sum, i) => sum + i.price, 0);
                  const skipRate = categoryImpulses.length > 0
                    ? categoryImpulses.filter(i => i.decisionAtEnd === 'skipped' || i.status === 'skipped').length / categoryImpulses.length
                    : 0;
                  
                  return (
                    <motion.div
                      key={item.category}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <CategoryCard
                        category={item.category}
                        totalSpent={totalSpent}
                        totalSaved={totalSaved}
                        impulseCount={categoryImpulses.length}
                        skipRate={skipRate}
                        onClick={() => handleCategoryClick(item.category)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Emotional Triggers */}
        {emotionalTriggers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <h2 className="title-lg mb-4">Emotional Triggers</h2>
              <div className="space-y-3">
                {emotionalTriggers.slice(0, 5).map((trigger) => (
                  <div key={trigger.emotion} className="flex items-center justify-between p-3 bg-base-200/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{trigger.emoji}</span>
                      <div>
                        <div className="font-semibold capitalize">{trigger.emotion}</div>
                        <div className="text-xs text-base-content/70">
                          {trigger.count} impulse{trigger.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold tabular-nums">
                        {((trigger.count / impulses.length) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Activity Heatmap */}
        {impulses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card>
              <h2 className="title-lg mb-4">Activity Heatmap</h2>
              <HeatmapChart impulses={impulses} days={90} />
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
