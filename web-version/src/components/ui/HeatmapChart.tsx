import { useMemo } from 'react';
import { Impulse } from '@/types/impulse';

interface HeatmapChartProps {
  impulses: Impulse[];
  days?: number;
  className?: string;
}

export function HeatmapChart({ impulses, days = 365, className = '' }: HeatmapChartProps) {
  const data = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weeks = Math.ceil(days / 7);
    const heatmap: number[][] = [];

    // Initialize heatmap (7 days x weeks)
    for (let week = 0; week < weeks; week++) {
      heatmap[week] = new Array(7).fill(0);
    }

    // Count impulses per day
    impulses.forEach((impulse) => {
      const daysAgo = Math.floor((now - impulse.createdAt) / dayMs);
      if (daysAgo >= 0 && daysAgo < days) {
        const week = Math.floor(daysAgo / 7);
        const day = daysAgo % 7;
        if (week < weeks && day < 7) {
          heatmap[week][day]++;
        }
      }
    });

    return heatmap;
  }, [impulses, days]);

  const maxCount = Math.max(...data.flat(), 1);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-base-300/20';
    const intensity = count / maxCount;
    if (intensity < 0.25) return 'bg-primary-400/30';
    if (intensity < 0.5) return 'bg-primary-500/50';
    if (intensity < 0.75) return 'bg-primary-600/70';
    return 'bg-primary-700/90';
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Activity Heatmap</h3>
        <div className="flex items-center gap-2 text-xs text-base-content/70">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded ${
                  i === 0 ? 'bg-base-300/20' :
                  i === 1 ? 'bg-primary-400/30' :
                  i === 2 ? 'bg-primary-600/70' :
                  'bg-primary-700/90'
                }`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-2">
          {dayLabels.map((day, i) => (
            <div key={i} className="h-3 text-xs text-base-content/50 text-right pr-2">
              {i % 2 === 0 ? day : ''}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {data.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((count, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`
                    w-3 h-3 rounded transition-all duration-200
                    ${getIntensity(count)}
                    hover:scale-125 hover:z-10 relative
                    ${count > 0 ? 'cursor-pointer' : ''}
                  `}
                  title={`${count} impulse${count !== 1 ? 's' : ''}`}
                  style={{
                    boxShadow: count > 0 ? '0 0 4px rgba(99, 102, 241, 0.3)' : undefined,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

