import { Impulse, EmotionAtImpulse, ImpulseCategory } from '@/types/impulse';

export interface RegretPrediction {
  predictedScore: number; // 0-100
  confidence: number; // 0-1
  factors: {
    emotion: { score: number; weight: number };
    category: { score: number; weight: number };
    price: { score: number; weight: number };
    timeOfDay: { score: number; weight: number };
    pastBehavior: { score: number; weight: number };
  };
  recommendation: 'high-risk' | 'medium-risk' | 'low-risk';
  message: string;
}

/**
 * Predicts regret score based on:
 * - Emotion at impulse
 * - Category type
 * - Price relative to past purchases
 * - Time of day
 * - Past behavior patterns
 */
export function predictRegret(
  impulse: Omit<Impulse, 'id' | 'createdAt' | 'cooldownEndsAt' | 'status'>,
  pastImpulses: Impulse[]
): RegretPrediction {
  const factors = {
    emotion: predictFromEmotion(impulse.emotionAtImpulse),
    category: predictFromCategory(impulse.category, pastImpulses),
    price: predictFromPrice(impulse.price, pastImpulses),
    timeOfDay: predictFromTimeOfDay(impulse.createdAt || Date.now()),
    pastBehavior: predictFromPastBehavior(impulse, pastImpulses),
  };

  // Weighted average
  const weights = {
    emotion: 0.3,
    category: 0.2,
    price: 0.2,
    timeOfDay: 0.1,
    pastBehavior: 0.2,
  };

  const predictedScore = Math.round(
    factors.emotion.score * weights.emotion +
    factors.category.score * weights.category +
    factors.price.score * weights.price +
    factors.timeOfDay.score * weights.timeOfDay +
    factors.pastBehavior.score * weights.pastBehavior
  );

  // Calculate confidence based on data availability
  const confidence = calculateConfidence(pastImpulses.length);

  // Determine recommendation
  let recommendation: 'high-risk' | 'medium-risk' | 'low-risk';
  let message: string;

  if (predictedScore >= 70) {
    recommendation = 'high-risk';
    message = '⚠️ High regret risk! Based on your patterns, you might regret this purchase.';
  } else if (predictedScore >= 40) {
    recommendation = 'medium-risk';
    message = '💡 Moderate regret risk. Consider waiting a bit longer before deciding.';
  } else {
    recommendation = 'low-risk';
    message = '✅ Low regret risk. This seems like a reasonable purchase based on your history.';
  }

  return {
    predictedScore: Math.max(0, Math.min(100, predictedScore)),
    confidence,
    factors: {
      emotion: { ...factors.emotion, weight: weights.emotion },
      category: { ...factors.category, weight: weights.category },
      price: { ...factors.price, weight: weights.price },
      timeOfDay: { ...factors.timeOfDay, weight: weights.timeOfDay },
      pastBehavior: { ...factors.pastBehavior, weight: weights.pastBehavior },
    },
    recommendation,
    message,
  };
}

function predictFromEmotion(emotion?: EmotionAtImpulse): { score: number } {
  // Emotions that typically lead to regret
  const emotionScores: Record<EmotionAtImpulse, number> = {
    'stressed': 75,
    'sad': 70,
    'bored': 65,
    'fomo': 80, // Fear of missing out often leads to regret
    'tired': 60,
    'hungry': 55,
    'excited': 40, // Excitement can lead to impulse but less regret
    'neutral': 30,
  };

  return {
    score: emotion ? emotionScores[emotion] : 50, // Default to medium if no emotion
  };
}

function predictFromCategory(
  category: ImpulseCategory,
  pastImpulses: Impulse[]
): { score: number } {
  // Calculate average regret for this category
  const categoryImpulses = pastImpulses.filter(
    (imp) => imp.category === category && imp.regretScore !== null
  );

  if (categoryImpulses.length === 0) {
    // Default scores by category type
    const defaultScores: Record<ImpulseCategory, number> = {
      'gadget': 60,
      'subscription': 55,
      'clothing': 50,
      'shopping': 55,
      'entertainment': 40,
      'food': 35,
      'other': 50,
    };
    return { score: defaultScores[category] };
  }

  const avgRegret = categoryImpulses.reduce(
    (sum, imp) => sum + (imp.regretScore || 0),
    0
  ) / categoryImpulses.length;

  return { score: avgRegret };
}

function predictFromPrice(
  price: number,
  pastImpulses: Impulse[]
): { score: number } {
  if (pastImpulses.length === 0) return { score: 50 };

  // Calculate average price of regretted purchases
  const regrettedPurchases = pastImpulses.filter(
    (imp) => imp.regretScore !== null && imp.regretScore > 50
  );

  if (regrettedPurchases.length === 0) {
    // If no regretted purchases, compare to average
    const avgPrice = pastImpulses.reduce((sum, imp) => sum + imp.price, 0) / pastImpulses.length;
    // Higher than average = higher risk
    return { score: price > avgPrice * 1.5 ? 70 : price > avgPrice ? 50 : 30 };
  }

  const avgRegrettedPrice = regrettedPurchases.reduce(
    (sum, imp) => sum + imp.price,
    0
  ) / regrettedPurchases.length;

  // If price is similar to regretted purchases, higher risk
  const ratio = price / avgRegrettedPrice;
  if (ratio > 1.2) return { score: 75 };
  if (ratio > 0.8) return { score: 65 };
  return { score: 40 };
}

function predictFromTimeOfDay(timestamp: number): { score: number } {
  const date = new Date(timestamp);
  const hour = date.getHours();

  // Late night purchases (10 PM - 2 AM) tend to have higher regret
  if (hour >= 22 || hour < 2) return { score: 70 };
  // Evening purchases (6 PM - 10 PM)
  if (hour >= 18) return { score: 55 };
  // Afternoon (12 PM - 6 PM)
  if (hour >= 12) return { score: 45 };
  // Morning (6 AM - 12 PM) - usually more thoughtful
  return { score: 35 };
}

function predictFromPastBehavior(
  impulse: Omit<Impulse, 'id' | 'createdAt' | 'cooldownEndsAt' | 'status'>,
  pastImpulses: Impulse[]
): { score: number } {
  if (pastImpulses.length === 0) return { score: 50 };

  // Check if similar impulses were regretted
  const similarImpulses = pastImpulses.filter((imp) => {
    const sameCategory = imp.category === impulse.category;
    const similarPrice = Math.abs(imp.price - impulse.price) / impulse.price < 0.3;
    const sameEmotion = imp.emotionAtImpulse === impulse.emotionAtImpulse;

    return sameCategory && similarPrice && sameEmotion;
  });

  if (similarImpulses.length === 0) return { score: 50 };

  // Calculate average regret of similar impulses
  const regrettedSimilar = similarImpulses.filter(
    (imp) => imp.regretScore !== null && imp.regretScore > 50
  );

  const regretRate = regrettedSimilar.length / similarImpulses.length;
  return { score: regretRate * 100 };
}

function calculateConfidence(dataPoints: number): number {
  // More data = higher confidence
  if (dataPoints >= 20) return 0.9;
  if (dataPoints >= 10) return 0.7;
  if (dataPoints >= 5) return 0.5;
  return 0.3;
}

