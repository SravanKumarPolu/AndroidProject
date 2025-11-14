import { Impulse, EmotionTag } from '@/types/impulse';
import { EMOTION_LABELS } from '@/constants/categories';
import { getTimeOfDayLabel } from './timePatterns';

export interface MoodTrigger {
  emotion: EmotionTag;
  timeOfDay: string;
  count: number;
  regretCount: number;
  regretRate: number;
}

/**
 * Find worst mood trigger (emotion + time of day combination with highest regret rate)
 */
export function getWorstMoodTrigger(impulses: Impulse[]): MoodTrigger | null {
  if (impulses.length === 0) return null;

  const emotionTimeMap = new Map<string, { count: number; regrets: number }>();

  // Group by emotion and time of day
  impulses.forEach(impulse => {
    if (!impulse.emotion || impulse.emotion === 'NONE') return;

    const date = new Date(impulse.createdAt);
    const hour = date.getHours();
    const timeOfDay = getTimeOfDayLabel(hour);
    const key = `${impulse.emotion}_${timeOfDay}`;

    if (!emotionTimeMap.has(key)) {
      emotionTimeMap.set(key, { count: 0, regrets: 0 });
    }

    const data = emotionTimeMap.get(key)!;
    data.count++;

    if (impulse.finalFeeling === 'REGRET') {
      data.regrets++;
    }
  });

  if (emotionTimeMap.size === 0) return null;

  // Convert to array and calculate regret rates
  const triggers: MoodTrigger[] = Array.from(emotionTimeMap.entries()).map(([key, data]) => {
    const [emotion, timeOfDay] = key.split('_');
    return {
      emotion: emotion as EmotionTag,
      timeOfDay,
      count: data.count,
      regretCount: data.regrets,
      regretRate: data.count > 0 ? (data.regrets / data.count) * 100 : 0,
    };
  });

  // Find worst trigger (highest regret rate with at least 2 occurrences)
  const worstTrigger = triggers
    .filter(t => t.count >= 2)
    .sort((a, b) => b.regretRate - a.regretRate)[0];

  return worstTrigger || null;
}

/**
 * Format mood trigger for display
 */
export function formatMoodTrigger(trigger: MoodTrigger): string {
  const emotionLabel = EMOTION_LABELS[trigger.emotion];
  return `${emotionLabel} (${trigger.timeOfDay})`;
}

