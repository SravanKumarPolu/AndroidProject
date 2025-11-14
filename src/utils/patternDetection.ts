import { Impulse, ImpulseCategory } from '@/types/impulse';
import { RecurringPattern, PatternType, PatternStrength, PatternMatch } from '@/types/pattern';

/**
 * Recurring Pattern Detection
 * Efficient algorithms to identify patterns in impulse behavior
 */

const MIN_PATTERN_OCCURRENCES = 3; // Minimum occurrences to be considered a pattern
const PRICE_TOLERANCE = 0.2; // 20% price variation allowed
const TIME_TOLERANCE_HOURS = 2; // 2 hour window for time-based patterns

/**
 * Calculate similarity between two strings (simple keyword matching)
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  const words1 = title1.toLowerCase().split(/\s+/);
  const words2 = title2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(w => words2.includes(w));
  const totalWords = new Set([...words1, ...words2]).size;
  
  return totalWords > 0 ? (commonWords.length / totalWords) * 100 : 0;
}

/**
 * Check if two prices are similar (within tolerance)
 */
function isPriceSimilar(price1: number | undefined, price2: number | undefined): boolean {
  if (!price1 || !price2) return false;
  const diff = Math.abs(price1 - price2);
  const avg = (price1 + price2) / 2;
  return diff / avg <= PRICE_TOLERANCE;
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 */
function getDayOfWeek(timestamp: number): number {
  return new Date(timestamp).getDay();
}

/**
 * Get day of month (1-31)
 */
function getDayOfMonth(timestamp: number): number {
  return new Date(timestamp).getDate();
}

/**
 * Calculate pattern strength based on frequency and consistency
 */
function calculatePatternStrength(
  occurrences: number,
  consistency: number,
  timeSpan: number
): PatternStrength {
  const frequency = occurrences / (timeSpan / (24 * 60 * 60 * 1000)); // per day
  const score = (occurrences * 0.4) + (consistency * 0.4) + (frequency * 0.2);
  
  if (score >= 8) return 'VERY_STRONG';
  if (score >= 6) return 'STRONG';
  if (score >= 4) return 'MODERATE';
  return 'WEAK';
}

/**
 * Detect daily patterns (same impulse every day)
 */
function detectDailyPatterns(impulses: Impulse[]): RecurringPattern[] {
  const patterns: RecurringPattern[] = [];
  const grouped = new Map<string, Impulse[]>();
  
  // Group by category and similar title
  impulses.forEach(impulse => {
    const key = `${impulse.category}_${impulse.title.toLowerCase().substring(0, 20)}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(impulse);
  });
  
  grouped.forEach((group, key) => {
    if (group.length < MIN_PATTERN_OCCURRENCES) return;
    
    // Check if they occur daily
    const sorted = group.sort((a, b) => a.createdAt - b.createdAt);
    const days = new Set<number>();
    sorted.forEach(i => {
      const day = Math.floor(i.createdAt / (24 * 60 * 60 * 1000));
      days.add(day);
    });
    
    if (days.size >= MIN_PATTERN_OCCURRENCES) {
      const timeSpan = sorted[sorted.length - 1].createdAt - sorted[0].createdAt;
      const avgInterval = timeSpan / (days.size - 1);
      
      // Check if intervals are consistent (within 1.5 days)
      const intervals: number[] = [];
      for (let i = 1; i < sorted.length; i++) {
        const interval = (sorted[i].createdAt - sorted[i - 1].createdAt) / (24 * 60 * 60 * 1000);
        intervals.push(interval);
      }
      const avgInt = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const consistent = intervals.every(i => Math.abs(i - avgInt) < 1.5);
      
      if (consistent && avgInterval <= 2) { // Daily or every other day
        const executed = group.filter(i => i.status === 'EXECUTED');
        const regretted = executed.filter(i => i.finalFeeling === 'REGRET');
        const prices = group.filter(i => i.price).map(i => i.price!);
        
        patterns.push({
          id: `daily_${key}_${Date.now()}`,
          type: 'DAILY',
          strength: calculatePatternStrength(group.length, 0.8, timeSpan),
          confidence: Math.min(100, (group.length / Math.max(1, timeSpan / (24 * 60 * 60 * 1000))) * 20),
          title: sorted[0].title,
          category: sorted[0].category,
          priceRange: prices.length > 0 ? {
            min: Math.min(...prices),
            max: Math.max(...prices),
            avg: prices.reduce((a, b) => a + b, 0) / prices.length,
          } : undefined,
          frequency: days.size / (timeSpan / (24 * 60 * 60 * 1000)),
          period: 'day',
          totalOccurrences: group.length,
          firstSeen: sorted[0].createdAt,
          lastSeen: sorted[sorted.length - 1].createdAt,
          avgInterval,
          totalSpent: executed.reduce((sum, i) => sum + (i.price || 0), 0),
          totalRegretted: regretted.reduce((sum, i) => sum + (i.price || 0), 0),
          regretRate: executed.length > 0 ? (regretted.length / executed.length) * 100 : 0,
          avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
          impulseIds: group.map(i => i.id),
          insights: [
            `This appears ${group.length} times`,
            avgInterval < 1.5 ? 'Occurs almost daily' : 'Occurs every 1-2 days',
          ],
          suggestions: [
            'Consider setting a savings goal for this category',
            'Try extending the cool-down period',
          ],
        });
      }
    }
  });
  
  return patterns;
}

/**
 * Detect weekly patterns (same day of week)
 */
function detectWeeklyPatterns(impulses: Impulse[]): RecurringPattern[] {
  const patterns: RecurringPattern[] = [];
  const grouped = new Map<string, Impulse[]>();
  
  impulses.forEach(impulse => {
    const dayOfWeek = getDayOfWeek(impulse.createdAt);
    const key = `${impulse.category}_${dayOfWeek}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(impulse);
  });
  
  grouped.forEach((group, key) => {
    if (group.length < MIN_PATTERN_OCCURRENCES) return;
    
    const sorted = group.sort((a, b) => a.createdAt - b.createdAt);
    const timeSpan = sorted[sorted.length - 1].createdAt - sorted[0].createdAt;
    const weeks = timeSpan / (7 * 24 * 60 * 60 * 1000);
    
    if (weeks >= 2 && group.length >= MIN_PATTERN_OCCURRENCES) {
      const dayOfWeek = getDayOfWeek(sorted[0].createdAt);
      const executed = group.filter(i => i.status === 'EXECUTED');
      const regretted = executed.filter(i => i.finalFeeling === 'REGRET');
      const prices = group.filter(i => i.price).map(i => i.price!);
      
      patterns.push({
        id: `weekly_${key}_${Date.now()}`,
        type: 'WEEKLY',
        strength: calculatePatternStrength(group.length, 0.7, timeSpan),
        confidence: Math.min(100, (group.length / weeks) * 30),
        category: sorted[0].category,
        dayOfWeek,
        priceRange: prices.length > 0 ? {
          min: Math.min(...prices),
          max: Math.max(...prices),
          avg: prices.reduce((a, b) => a + b, 0) / prices.length,
        } : undefined,
        frequency: group.length / weeks,
        period: 'week',
        totalOccurrences: group.length,
        firstSeen: sorted[0].createdAt,
        lastSeen: sorted[sorted.length - 1].createdAt,
        avgInterval: 7,
        totalSpent: executed.reduce((sum, i) => sum + (i.price || 0), 0),
        totalRegretted: regretted.reduce((sum, i) => sum + (i.price || 0), 0),
        regretRate: executed.length > 0 ? (regretted.length / executed.length) * 100 : 0,
        avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
        impulseIds: group.map(i => i.id),
        insights: [
          `Recurring on ${getDayName(dayOfWeek)}s`,
          `${group.length} occurrences over ${Math.round(weeks)} weeks`,
        ],
        suggestions: [
          'Plan ahead for this weekly expense',
          'Consider a weekly budget for this category',
        ],
      });
    }
  });
  
  return patterns;
}

/**
 * Detect time-based patterns (same time of day)
 */
function detectTimeBasedPatterns(impulses: Impulse[]): RecurringPattern[] {
  const patterns: RecurringPattern[] = [];
  const hourGroups = new Map<number, Impulse[]>();
  
  impulses.forEach(impulse => {
    const hour = new Date(impulse.createdAt).getHours();
    if (!hourGroups.has(hour)) {
      hourGroups.set(hour, []);
    }
    hourGroups.get(hour)!.push(impulse);
  });
  
  hourGroups.forEach((group, hour) => {
    if (group.length < MIN_PATTERN_OCCURRENCES) return;
    
    const sorted = group.sort((a, b) => a.createdAt - b.createdAt);
    const timeSpan = sorted[sorted.length - 1].createdAt - sorted[0].createdAt;
    const days = timeSpan / (24 * 60 * 60 * 1000);
    
    if (days >= 7 && group.length >= MIN_PATTERN_OCCURRENCES) {
      const categoryCounts = new Map<ImpulseCategory, number>();
      group.forEach(i => {
        categoryCounts.set(i.category, (categoryCounts.get(i.category) || 0) + 1);
      });
      const topCategory = Array.from(categoryCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0];
      
      const executed = group.filter(i => i.status === 'EXECUTED');
      const regretted = executed.filter(i => i.finalFeeling === 'REGRET');
      const prices = group.filter(i => i.price).map(i => i.price!);
      
      patterns.push({
        id: `time_${hour}_${Date.now()}`,
        type: 'TIME_BASED',
        strength: calculatePatternStrength(group.length, 0.6, timeSpan),
        confidence: Math.min(100, (group.length / days) * 15),
        category: topCategory,
        timeOfDay: hour,
        priceRange: prices.length > 0 ? {
          min: Math.min(...prices),
          max: Math.max(...prices),
          avg: prices.reduce((a, b) => a + b, 0) / prices.length,
        } : undefined,
        frequency: group.length / days,
        period: 'day',
        totalOccurrences: group.length,
        firstSeen: sorted[0].createdAt,
        lastSeen: sorted[sorted.length - 1].createdAt,
        avgInterval: days / group.length,
        totalSpent: executed.reduce((sum, i) => sum + (i.price || 0), 0),
        totalRegretted: regretted.reduce((sum, i) => sum + (i.price || 0), 0),
        regretRate: executed.length > 0 ? (regretted.length / executed.length) * 100 : 0,
        avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
        impulseIds: group.map(i => i.id),
        insights: [
          `Most impulses occur around ${formatHour(hour)}`,
          `Common category: ${topCategory}`,
        ],
        suggestions: [
          'Set a reminder before this time',
          'Plan an alternative activity during this time',
        ],
      });
    }
  });
  
  return patterns;
}

/**
 * Detect category + price patterns
 */
function detectCategoryPricePatterns(impulses: Impulse[]): RecurringPattern[] {
  const patterns: RecurringPattern[] = [];
  const categoryGroups = new Map<ImpulseCategory, Impulse[]>();
  
  impulses.forEach(impulse => {
    if (!categoryGroups.has(impulse.category)) {
      categoryGroups.set(impulse.category, []);
    }
    categoryGroups.get(impulse.category)!.push(impulse);
  });
  
  categoryGroups.forEach((group, category) => {
    if (group.length < MIN_PATTERN_OCCURRENCES) return;
    
    const prices = group.filter(i => i.price).map(i => i.price!);
    if (prices.length < MIN_PATTERN_OCCURRENCES) return;
    
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const similarPrice = group.filter(i => 
      i.price && isPriceSimilar(i.price, avgPrice)
    );
    
    if (similarPrice.length >= MIN_PATTERN_OCCURRENCES) {
      const sorted = similarPrice.sort((a, b) => a.createdAt - b.createdAt);
      const timeSpan = sorted[sorted.length - 1].createdAt - sorted[0].createdAt;
      const executed = similarPrice.filter(i => i.status === 'EXECUTED');
      const regretted = executed.filter(i => i.finalFeeling === 'REGRET');
      
      patterns.push({
        id: `category_price_${category}_${Date.now()}`,
        type: 'CATEGORY',
        strength: calculatePatternStrength(similarPrice.length, 0.5, timeSpan),
        confidence: Math.min(100, (similarPrice.length / Math.max(1, timeSpan / (24 * 60 * 60 * 1000))) * 10),
        category,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices),
          avg: avgPrice,
        },
        frequency: similarPrice.length / (timeSpan / (24 * 60 * 60 * 1000)),
        period: 'day',
        totalOccurrences: similarPrice.length,
        firstSeen: sorted[0].createdAt,
        lastSeen: sorted[sorted.length - 1].createdAt,
        avgInterval: timeSpan / (similarPrice.length - 1),
        totalSpent: executed.reduce((sum, i) => sum + (i.price || 0), 0),
        totalRegretted: regretted.reduce((sum, i) => sum + (i.price || 0), 0),
        regretRate: executed.length > 0 ? (regretted.length / executed.length) * 100 : 0,
        avgPrice,
        impulseIds: similarPrice.map(i => i.id),
        insights: [
          `${similarPrice.length} similar ${category} purchases`,
          `Average price: ₹${Math.round(avgPrice)}`,
        ],
        suggestions: [
          'Create a savings goal for this category',
          'Review if these purchases are necessary',
        ],
      });
    }
  });
  
  return patterns;
}

/**
 * Detect frequent patterns (high frequency, irregular)
 */
function detectFrequentPatterns(impulses: Impulse[]): RecurringPattern[] {
  const patterns: RecurringPattern[] = [];
  const categoryCounts = new Map<ImpulseCategory, Impulse[]>();
  
  impulses.forEach(impulse => {
    if (!categoryCounts.has(impulse.category)) {
      categoryCounts.set(impulse.category, []);
    }
    categoryCounts.get(impulse.category)!.push(impulse);
  });
  
  categoryCounts.forEach((group, category) => {
    if (group.length < MIN_PATTERN_OCCURRENCES * 2) return; // Need more for frequent
    
    const sorted = group.sort((a, b) => a.createdAt - b.createdAt);
    const timeSpan = sorted[sorted.length - 1].createdAt - sorted[0].createdAt;
    const days = timeSpan / (24 * 60 * 60 * 1000);
    const frequency = group.length / days;
    
    // High frequency: more than 0.5 per day
    if (frequency > 0.5 && days >= 7) {
      const executed = group.filter(i => i.status === 'EXECUTED');
      const regretted = executed.filter(i => i.finalFeeling === 'REGRET');
      const prices = group.filter(i => i.price).map(i => i.price!);
      
      patterns.push({
        id: `frequent_${category}_${Date.now()}`,
        type: 'FREQUENT',
        strength: calculatePatternStrength(group.length, 0.4, timeSpan),
        confidence: Math.min(100, frequency * 20),
        category,
        priceRange: prices.length > 0 ? {
          min: Math.min(...prices),
          max: Math.max(...prices),
          avg: prices.reduce((a, b) => a + b, 0) / prices.length,
        } : undefined,
        frequency,
        period: 'day',
        totalOccurrences: group.length,
        firstSeen: sorted[0].createdAt,
        lastSeen: sorted[sorted.length - 1].createdAt,
        avgInterval: days / group.length,
        totalSpent: executed.reduce((sum, i) => sum + (i.price || 0), 0),
        totalRegretted: regretted.reduce((sum, i) => sum + (i.price || 0), 0),
        regretRate: executed.length > 0 ? (regretted.length / executed.length) * 100 : 0,
        avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
        impulseIds: group.map(i => i.id),
        insights: [
          `Very frequent ${category} impulses`,
          `${Math.round(frequency * 7)} times per week on average`,
        ],
        suggestions: [
          'This is a high-frequency category - consider a budget',
          'Set up a recurring savings goal',
        ],
      });
    }
  });
  
  return patterns;
}

/**
 * Predict next occurrence date
 */
function predictNextOccurrence(pattern: RecurringPattern): number | undefined {
  const now = Date.now();
  const daysSinceLast = (now - pattern.lastSeen) / (24 * 60 * 60 * 1000);
  
  if (pattern.type === 'DAILY' && pattern.avgInterval) {
    return pattern.lastSeen + (pattern.avgInterval * 24 * 60 * 60 * 1000);
  }
  
  if (pattern.type === 'WEEKLY' && pattern.dayOfWeek !== undefined) {
    const lastDate = new Date(pattern.lastSeen);
    const lastDayOfWeek = lastDate.getDay();
    const daysUntilNext = (pattern.dayOfWeek - lastDayOfWeek + 7) % 7 || 7;
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + daysUntilNext);
    return nextDate.getTime();
  }
  
  if (pattern.avgInterval) {
    return pattern.lastSeen + (pattern.avgInterval * 24 * 60 * 60 * 1000);
  }
  
  return undefined;
}

/**
 * Main pattern detection function
 */
export function detectRecurringPatterns(impulses: Impulse[]): RecurringPattern[] {
  if (impulses.length < MIN_PATTERN_OCCURRENCES) {
    return [];
  }
  
  const allPatterns: RecurringPattern[] = [
    ...detectDailyPatterns(impulses),
    ...detectWeeklyPatterns(impulses),
    ...detectTimeBasedPatterns(impulses),
    ...detectCategoryPricePatterns(impulses),
    ...detectFrequentPatterns(impulses),
  ];
  
  // Deduplicate and merge similar patterns
  const uniquePatterns = new Map<string, RecurringPattern>();
  
  allPatterns.forEach(pattern => {
    const key = `${pattern.type}_${pattern.category}_${pattern.dayOfWeek || pattern.timeOfDay || ''}`;
    const existing = uniquePatterns.get(key);
    
    if (!existing || pattern.confidence > existing.confidence) {
      // Add predictions
      pattern.nextPredictedDate = predictNextOccurrence(pattern);
      pattern.predictedPrice = pattern.priceRange?.avg;
      
      uniquePatterns.set(key, pattern);
    }
  });
  
  return Array.from(uniquePatterns.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10); // Top 10 patterns
}

/**
 * Match an impulse to existing patterns
 */
export function matchImpulseToPatterns(
  impulse: Impulse,
  patterns: RecurringPattern[]
): PatternMatch[] {
  const matches: PatternMatch[] = [];
  
  patterns.forEach(pattern => {
    let score = 0;
    
    // Category match
    if (pattern.category === impulse.category) {
      score += 30;
    }
    
    // Price match
    if (pattern.priceRange && impulse.price) {
      const avg = pattern.priceRange.avg;
      if (isPriceSimilar(impulse.price, avg)) {
        score += 25;
      }
    }
    
    // Time match
    if (pattern.timeOfDay !== undefined) {
      const hour = new Date(impulse.createdAt).getHours();
      if (Math.abs(hour - pattern.timeOfDay) <= TIME_TOLERANCE_HOURS) {
        score += 20;
      }
    }
    
    // Day of week match
    if (pattern.dayOfWeek !== undefined) {
      const day = getDayOfWeek(impulse.createdAt);
      if (day === pattern.dayOfWeek) {
        score += 25;
      }
    }
    
    // Title similarity
    if (pattern.title && impulse.title) {
      const similarity = calculateTitleSimilarity(pattern.title, impulse.title);
      score += similarity * 0.2;
    }
    
    if (score >= 40) { // Minimum threshold
      matches.push({
        pattern,
        matchScore: Math.min(100, score),
        matchedImpulses: [impulse],
      });
    }
  });
  
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Helper functions
 */
function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

