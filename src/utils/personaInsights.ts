/**
 * Persona Insights Utilities
 * Provides persona-specific insights and recommendations based on user behavior
 */

import { Impulse, ImpulseCategory } from '@/types/impulse';
import { formatCurrency } from './currency';
import { CATEGORY_LABELS } from '@/constants/categories';

export type UserPersona = 
  | 'STUDENT'
  | 'IT_PROFESSIONAL'
  | 'CRYPTO_TRADER'
  | 'GENERAL_PUBLIC'
  | 'UNKNOWN';

export interface PersonaInsight {
  persona: UserPersona;
  confidence: number; // 0-100
  insights: string[];
  recommendations: string[];
  topCategories: ImpulseCategory[];
  topSourceApps: string[];
}

/**
 * Detect user persona based on impulse patterns
 */
export function detectPersona(impulses: Impulse[]): UserPersona {
  if (impulses.length < 5) return 'UNKNOWN';
  
  const categoryCounts = new Map<ImpulseCategory, number>();
  const sourceAppCounts = new Map<string, number>();
  
  impulses.forEach(impulse => {
    categoryCounts.set(
      impulse.category,
      (categoryCounts.get(impulse.category) || 0) + 1
    );
    if (impulse.sourceApp) {
      sourceAppCounts.set(
        impulse.sourceApp,
        (sourceAppCounts.get(impulse.sourceApp) || 0) + 1
      );
    }
  });
  
  // Student indicators
  const studentIndicators = [
    categoryCounts.get('FOOD') || 0,
    categoryCounts.get('SHOPPING') || 0,
    categoryCounts.get('GAMING') || 0,
  ];
  const studentScore = studentIndicators.reduce((a, b) => a + b, 0);
  
  // IT Professional indicators
  const itIndicators = [
    categoryCounts.get('SHOPPING') || 0,
    categoryCounts.get('DIGITAL') || 0,
    categoryCounts.get('COURSE') || 0,
    categoryCounts.get('FOOD') || 0,
  ];
  const itScore = itIndicators.reduce((a, b) => a + b, 0);
  const itSourceApps = ['amazon', 'flipkart', 'swiggy', 'zomato', 'blinkit', 'udemy', 'coursera'];
  const itSourceScore = itSourceApps.reduce((sum, app) => 
    sum + (sourceAppCounts.get(app) || 0), 0
  );
  
  // Crypto/Trader indicators
  const traderIndicators = [
    categoryCounts.get('CRYPTO') || 0,
    categoryCounts.get('TRADING') || 0,
  ];
  const traderScore = traderIndicators.reduce((a, b) => a + b, 0);
  const traderSourceApps = ['tradingapp', 'cryptoexchange', 'binance', 'coinbase'];
  const traderSourceScore = traderSourceApps.reduce((sum, app) => 
    sum + (sourceAppCounts.get(app) || 0), 0
  );
  
  // General Public indicators
  const generalIndicators = [
    categoryCounts.get('SUBSCRIPTION') || 0,
    categoryCounts.get('ENTERTAINMENT') || 0,
    categoryCounts.get('TRAVEL') || 0,
  ];
  const generalScore = generalIndicators.reduce((a, b) => a + b, 0);
  
  // Calculate scores with source app bonuses
  const scores = {
    STUDENT: studentScore,
    IT_PROFESSIONAL: itScore + (itSourceScore * 2),
    CRYPTO_TRADER: traderScore + (traderSourceScore * 3),
    GENERAL_PUBLIC: generalScore,
  };
  
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'UNKNOWN';
  
  const detectedPersona = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as UserPersona;
  return detectedPersona || 'UNKNOWN';
}

/**
 * Get persona-specific insights
 */
export function getPersonaInsights(impulses: Impulse[], persona: UserPersona): PersonaInsight {
  const categoryCounts = new Map<ImpulseCategory, number>();
  const sourceAppCounts = new Map<string, number>();
  const regrettedByCategory = new Map<ImpulseCategory, number>();
  
  impulses.forEach(impulse => {
    categoryCounts.set(
      impulse.category,
      (categoryCounts.get(impulse.category) || 0) + 1
    );
    if (impulse.sourceApp) {
      sourceAppCounts.set(
        impulse.sourceApp,
        (sourceAppCounts.get(impulse.sourceApp) || 0) + 1
      );
    }
    if (impulse.finalFeeling === 'REGRET' || (impulse.regretRating !== undefined && impulse.regretRating >= 3)) {
      regrettedByCategory.set(
        impulse.category,
        (regrettedByCategory.get(impulse.category) || 0) + 1
      );
    }
  });
  
  const topCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);
  
  const topSourceApps = Array.from(sourceAppCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([app]) => app);
  
  const insights: string[] = [];
  const recommendations: string[] = [];
  
  switch (persona) {
    case 'STUDENT':
      insights.push('You frequently log food and gaming impulses');
      insights.push('Budget-conscious decisions are important for students');
      if (categoryCounts.get('FOOD') && (categoryCounts.get('FOOD') || 0) > 5) {
        recommendations.push('Consider meal prepping to reduce food delivery impulses');
      }
      if (categoryCounts.get('GAMING') && (categoryCounts.get('GAMING') || 0) > 3) {
        recommendations.push('Set a monthly gaming budget to avoid overspending');
      }
      recommendations.push('Use longer cool-down periods (24h) for non-essential purchases');
      break;
      
    case 'IT_PROFESSIONAL':
      insights.push('You tend to buy gadgets, courses, and use quick delivery apps');
      insights.push('Professional development purchases are common');
      if (categoryCounts.get('DIGITAL') && (categoryCounts.get('DIGITAL') || 0) > 3) {
        recommendations.push('Review if you\'re actually using the digital tools you buy');
      }
      if (categoryCounts.get('COURSE') && (categoryCounts.get('COURSE') || 0) > 2) {
        recommendations.push('Finish existing courses before buying new ones');
      }
      recommendations.push('Set a monthly budget for professional development');
      break;
      
    case 'CRYPTO_TRADER':
      insights.push('You engage in high-risk financial decisions');
      insights.push('Emotional trading can lead to significant losses');
      const cryptoRegrets = regrettedByCategory.get('CRYPTO') || 0;
      const tradingRegrets = regrettedByCategory.get('TRADING') || 0;
      if (cryptoRegrets + tradingRegrets > 2) {
        recommendations.push('Consider mandatory 24-48 hour cool-down for all trades');
        recommendations.push('Track your regret rate - if >50%, reduce trading frequency');
      }
      recommendations.push('Never trade on impulse - always use the full cool-down period');
      recommendations.push('Set a maximum loss limit per month');
      break;
      
    case 'GENERAL_PUBLIC':
      insights.push('You make diverse impulse purchases across categories');
      if (categoryCounts.get('SUBSCRIPTION') && (categoryCounts.get('SUBSCRIPTION') || 0) > 2) {
        recommendations.push('Review your subscriptions - cancel unused ones');
      }
      if (categoryCounts.get('TRAVEL') && (categoryCounts.get('TRAVEL') || 0) > 1) {
        recommendations.push('Plan travel purchases in advance, not on impulse');
      }
      recommendations.push('Use reflection questions to evaluate each purchase');
      break;
      
    default:
      insights.push('Keep logging impulses to get personalized insights');
      recommendations.push('Use the app consistently to build better spending habits');
  }
  
  // Calculate confidence based on data volume
  const confidence = Math.min(100, Math.round((impulses.length / 20) * 100));
  
  return {
    persona,
    confidence,
    insights,
    recommendations,
    topCategories,
    topSourceApps,
  };
}

/**
 * Get persona-specific cool-down recommendations
 */
export function getPersonaCoolDownRecommendation(persona: UserPersona, category: ImpulseCategory): string {
  switch (persona) {
    case 'STUDENT':
      if (category === 'FOOD') return 'Consider waiting 1-2 hours before ordering food';
      if (category === 'GAMING') return 'Wait 24 hours before buying games or in-game items';
      if (category === 'SHOPPING') return 'Add to wishlist and revisit in 24 hours';
      break;
      
    case 'IT_PROFESSIONAL':
      if (category === 'DIGITAL') return 'Check if free alternatives exist first';
      if (category === 'COURSE') return 'Review your existing courses before buying new ones';
      if (category === 'SHOPPING') return 'Wait 24 hours for gadgets - prices often drop';
      break;
      
    case 'CRYPTO_TRADER':
      if (category === 'CRYPTO' || category === 'TRADING') {
        return 'MANDATORY: Wait 24-48 hours before any trade. Emotional trading is dangerous.';
      }
      break;
      
    case 'GENERAL_PUBLIC':
      if (category === 'SUBSCRIPTION') return 'Check if you\'re using existing subscriptions first';
      if (category === 'TRAVEL') return 'Plan travel purchases - don\'t book on impulse';
      if (category === 'ENTERTAINMENT') return 'Wait 24 hours for entertainment purchases';
      break;
  }
  
  return 'Use a cool-down period to reconsider this purchase';
}

/**
 * Format persona name for display
 */
export function formatPersonaName(persona: UserPersona): string {
  switch (persona) {
    case 'STUDENT':
      return 'Student (18-25)';
    case 'IT_PROFESSIONAL':
      return 'IT Professional (25-35)';
    case 'CRYPTO_TRADER':
      return 'Crypto/Options Trader';
    case 'GENERAL_PUBLIC':
      return 'General Public';
    default:
      return 'Unknown';
  }
}

/**
 * Get persona emoji
 */
export function getPersonaEmoji(persona: UserPersona): string {
  switch (persona) {
    case 'STUDENT':
      return '🎓';
    case 'IT_PROFESSIONAL':
      return '💻';
    case 'CRYPTO_TRADER':
      return '📈';
    case 'GENERAL_PUBLIC':
      return '👤';
    default:
      return '❓';
  }
}

