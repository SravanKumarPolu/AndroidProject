import { useMemo } from 'react';
import { Impulse, EmotionAtImpulse } from '@/types/impulse';
import { Card } from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface MoodImpulseGraphProps {
  impulses: Impulse[];
}

const emotionEmojis: Record<EmotionAtImpulse, string> = {
  bored: '😴',
  stressed: '😫',
  hungry: '🤤',
  excited: '🤩',
  sad: '😢',
  tired: '😵',
  fomo: '😰',
  neutral: '😐',
};

const emotionLabels: Record<EmotionAtImpulse, string> = {
  bored: 'Bored',
  stressed: 'Stressed',
  hungry: 'Hungry',
  excited: 'Excited',
  sad: 'Sad',
  tired: 'Tired',
  fomo: 'FOMO',
  neutral: 'Neutral',
};

const COLORS = ['#6366f1', '#d946ef', '#22d3ee', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#64748b'];

export function MoodImpulseGraph({ impulses }: MoodImpulseGraphProps) {
  const chartData = useMemo(() => {
    // Group by emotion
    const emotionMap = new Map<EmotionAtImpulse, {
      total: number;
      skipped: number;
      bought: number;
      regretted: number;
      avgRegret: number;
    }>();

    impulses.forEach((imp) => {
      const emotion = imp.emotionAtImpulse || 'neutral';
      const entry = emotionMap.get(emotion) || {
        total: 0,
        skipped: 0,
        bought: 0,
        regretted: 0,
        avgRegret: 0,
      };

      entry.total++;
      
      if (imp.decisionAtEnd === 'skipped' || imp.status === 'skipped') {
        entry.skipped++;
      } else if (imp.decisionAtEnd === 'bought' || imp.status === 'bought') {
        entry.bought++;
        if (imp.regretScore !== null && imp.regretScore > 50) {
          entry.regretted++;
        }
      }

      emotionMap.set(emotion, entry);
    });

    // Calculate average regret for each emotion
    emotionMap.forEach((entry, emotion) => {
      const regrettedImpulses = impulses.filter(
        (imp) => (imp.emotionAtImpulse || 'neutral') === emotion &&
        imp.regretScore !== null &&
        imp.regretScore > 50
      );
      
      if (regrettedImpulses.length > 0) {
        entry.avgRegret = regrettedImpulses.reduce(
          (sum, imp) => sum + (imp.regretScore || 0),
          0
        ) / regrettedImpulses.length;
      }
    });

    // Convert to chart data
    return Array.from(emotionMap.entries())
      .map(([emotion, data]) => ({
        emotion,
        label: `${emotionEmojis[emotion]} ${emotionLabels[emotion]}`,
        total: data.total,
        skipped: data.skipped,
        bought: data.bought,
        skipRate: data.total > 0 ? (data.skipped / data.total) * 100 : 0,
        buyRate: data.total > 0 ? (data.bought / data.total) * 100 : 0,
        regretRate: data.bought > 0 ? (data.regretted / data.bought) * 100 : 0,
        avgRegret: data.avgRegret,
      }))
      .sort((a, b) => b.total - a.total);
  }, [impulses]);

  if (chartData.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-bold mb-4">Mood-Impulse Correlation</h2>
        <p className="text-center text-base-content/70 py-8">
          Not enough data yet. Start logging impulses with emotions to see correlations!
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Mood-Impulse Correlation</h2>
      <p className="text-sm text-base-content/70 mb-6">
        See how your emotions correlate with impulse decisions and regret rates
      </p>

      {/* Skip Rate by Emotion */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Skip Rate by Emotion</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="label"
              angle={-45}
              textAnchor="end"
              height={100}
              stroke="hsl(var(--bc) / 0.7)"
            />
            <YAxis stroke="hsl(var(--bc) / 0.7)" />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'skipRate') return [`${value.toFixed(1)}%`, 'Skip Rate'];
                if (name === 'buyRate') return [`${value.toFixed(1)}%`, 'Buy Rate'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="skipRate" fill="#10b981" name="Skip Rate (%)" />
            <Bar dataKey="buyRate" fill="#ef4444" name="Buy Rate (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Regret Rate by Emotion */}
      {chartData.some((d) => d.regretRate > 0) && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Regret Rate by Emotion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="label"
                angle={-45}
                textAnchor="end"
                height={100}
                stroke="hsl(var(--bc) / 0.7)"
              />
              <YAxis stroke="hsl(var(--bc) / 0.7)" />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Regret Rate']}
              />
              <Bar dataKey="regretRate" fill="#f59e0b" name="Regret Rate (%)">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.regretRate > 50 ? '#ef4444' : entry.regretRate > 30 ? '#f59e0b' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Insights */}
      <div className="mt-6 space-y-2">
        <h3 className="text-lg font-semibold">Key Insights</h3>
        {chartData.length > 0 && (
          <div className="space-y-2 text-sm">
            {(() => {
              const highestSkipRate = chartData.reduce((max, d) => 
                d.skipRate > max.skipRate ? d : max
              );
              const highestRegretRate = chartData
                .filter((d) => d.regretRate > 0)
                .reduce((max, d) => 
                  d.regretRate > max.regretRate ? d : max,
                  chartData[0]
                );

              return (
                <>
                  {highestSkipRate && (
                    <p className="text-base-content/70">
                      💚 <strong>{highestSkipRate.label}</strong> has the highest skip rate (
                      {highestSkipRate.skipRate.toFixed(1)}%) - you're making good decisions when feeling this way!
                    </p>
                  )}
                  {highestRegretRate && highestRegretRate.regretRate > 0 && (
                    <p className="text-base-content/70">
                      ⚠️ <strong>{highestRegretRate.label}</strong> has the highest regret rate (
                      {highestRegretRate.regretRate.toFixed(1)}%) - be extra careful when feeling this way!
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </Card>
  );
}

