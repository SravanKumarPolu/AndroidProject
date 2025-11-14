import { useMemo } from 'react';
import { Impulse } from '@/types/impulse';
import { RecurringPattern, PatternInsight } from '@/types/pattern';
import { detectRecurringPatterns, matchImpulseToPatterns } from '@/utils/patternDetection';

/**
 * Custom hook for recurring pattern detection
 * Efficient, memoized pattern analysis
 */
export function usePatterns(impulses: Impulse[]) {
  // Detect all patterns
  const patterns = useMemo<RecurringPattern[]>(() => {
    if (impulses.length < 3) return [];
    return detectRecurringPatterns(impulses);
  }, [impulses.length, impulses.map(i => `${i.id}_${i.createdAt}_${i.category}`).join(',')]);

  // Get pattern insights
  const insights = useMemo<PatternInsight[]>(() => {
    const result: PatternInsight[] = [];
    
    patterns.forEach(pattern => {
      // High regret rate warning
      if (pattern.regretRate > 50 && pattern.totalOccurrences >= 5) {
        result.push({
          type: 'WARNING',
          title: 'High Regret Pattern',
          message: `${pattern.category} purchases have ${Math.round(pattern.regretRate)}% regret rate. Consider avoiding this pattern.`,
          action: {
            label: 'View Pattern',
            type: 'VIEW_PATTERN',
          },
        });
      }
      
      // High frequency warning
      if (pattern.frequency > 1 && pattern.type === 'FREQUENT') {
        result.push({
          type: 'WARNING',
          title: 'Frequent Pattern Detected',
          message: `You're logging ${pattern.category} impulses very frequently. This might be a habit worth breaking.`,
          action: {
            label: 'Set Goal',
            type: 'SET_GOAL',
          },
        });
      }
      
      // Strong pattern suggestion
      if (pattern.strength === 'VERY_STRONG' || pattern.strength === 'STRONG') {
        result.push({
          type: 'SUGGESTION',
          title: 'Recurring Pattern',
          message: `Strong ${pattern.type.toLowerCase()} pattern detected. ${pattern.suggestions[0] || 'Consider reviewing this habit.'}`,
          action: {
            label: 'View Details',
            type: 'VIEW_PATTERN',
          },
        });
      }
      
      // Upcoming prediction
      if (pattern.nextPredictedDate && pattern.nextPredictedDate > Date.now()) {
        const daysUntil = Math.ceil((pattern.nextPredictedDate - Date.now()) / (24 * 60 * 60 * 1000));
        if (daysUntil <= 7) {
          result.push({
            type: 'INFO',
            title: 'Pattern Prediction',
            message: `This pattern typically occurs in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}. Be prepared!`,
            action: {
              label: 'Set Reminder',
              type: 'EXTEND_COOLDOWN',
            },
          });
        }
      }
    });
    
    return result.slice(0, 5); // Top 5 insights
  }, [patterns]);

  // Get patterns by type
  const patternsByType = useMemo(() => {
    const grouped: Record<string, RecurringPattern[]> = {};
    patterns.forEach(pattern => {
      if (!grouped[pattern.type]) {
        grouped[pattern.type] = [];
      }
      grouped[pattern.type].push(pattern);
    });
    return grouped;
  }, [patterns]);

  // Get strongest patterns
  const strongestPatterns = useMemo(() => {
    return patterns
      .filter(p => p.strength === 'VERY_STRONG' || p.strength === 'STRONG')
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }, [patterns]);

  // Get patterns with high regret
  const highRegretPatterns = useMemo(() => {
    return patterns
      .filter(p => p.regretRate > 40 && p.totalOccurrences >= 3)
      .sort((a, b) => b.regretRate - a.regretRate)
      .slice(0, 5);
  }, [patterns]);

  // Get upcoming patterns (predicted soon)
  const upcomingPatterns = useMemo(() => {
    const now = Date.now();
    return patterns
      .filter(p => {
        if (!p.nextPredictedDate) return false;
        const daysUntil = (p.nextPredictedDate - now) / (24 * 60 * 60 * 1000);
        return daysUntil > 0 && daysUntil <= 14; // Next 2 weeks
      })
      .sort((a, b) => (a.nextPredictedDate || 0) - (b.nextPredictedDate || 0))
      .slice(0, 5);
  }, [patterns]);

  // Match current impulse to patterns (for new impulse screen)
  const matchCurrentImpulse = useMemo(() => {
    return (impulse: Impulse) => {
      return matchImpulseToPatterns(impulse, patterns);
    };
  }, [patterns]);

  return {
    patterns,
    insights,
    patternsByType,
    strongestPatterns,
    highRegretPatterns,
    upcomingPatterns,
    matchCurrentImpulse,
  };
}

