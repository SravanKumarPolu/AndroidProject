/**
 * Fun Equivalents Utility
 * Converts money amounts into relatable, emotionally engaging comparisons
 * Makes savings more tangible and motivating
 */

export interface FunEquivalent {
  text: string;
  emoji: string;
  category: 'food' | 'entertainment' | 'lifestyle' | 'time' | 'general';
}

/**
 * Calculate fun equivalents for a given amount (in INR)
 */
export function getFunEquivalents(amount: number): FunEquivalent[] {
  const equivalents: FunEquivalent[] = [];

  // Food equivalents (based on typical Indian prices)
  if (amount >= 50) {
    const canteenLunches = Math.round(amount / 50);
    if (canteenLunches >= 1) {
      equivalents.push({
        text: `${canteenLunches} ${canteenLunches === 1 ? 'day' : 'days'} of canteen lunch`,
        emoji: '🍱',
        category: 'food',
      });
    }
  }

  if (amount >= 200) {
    const biryanis = Math.round(amount / 200);
    if (biryanis >= 1 && biryanis <= 10) {
      equivalents.push({
        text: `${biryanis} ${biryanis === 1 ? 'biryani' : 'biryani plates'}`,
        emoji: '🍛',
        category: 'food',
      });
    }
  }

  if (amount >= 100) {
    const coffees = Math.round(amount / 100);
    if (coffees >= 1 && coffees <= 20) {
      equivalents.push({
        text: `${coffees} ${coffees === 1 ? 'coffee' : 'cups of coffee'}`,
        emoji: '☕',
        category: 'food',
      });
    }
  }

  // Entertainment equivalents
  if (amount >= 149) {
    const ottMonths = Math.round(amount / 149);
    if (ottMonths >= 1 && ottMonths <= 12) {
      equivalents.push({
        text: `${ottMonths} ${ottMonths === 1 ? 'OTT month' : 'OTT months'} (Netflix/Prime)`,
        emoji: '📺',
        category: 'entertainment',
      });
    }
  }

  if (amount >= 500) {
    const movieTickets = Math.round(amount / 500);
    if (movieTickets >= 1 && movieTickets <= 10) {
      equivalents.push({
        text: `${movieTickets} ${movieTickets === 1 ? 'movie ticket' : 'movie tickets'}`,
        emoji: '🎬',
        category: 'entertainment',
      });
    }
  }

  // Lifestyle equivalents
  if (amount >= 1000) {
    const uberRides = Math.round(amount / 200);
    if (uberRides >= 1 && uberRides <= 20) {
      equivalents.push({
        text: `${uberRides} ${uberRides === 1 ? 'Uber ride' : 'Uber rides'}`,
        emoji: '🚗',
        category: 'lifestyle',
      });
    }
  }

  if (amount >= 5000) {
    const phoneRecharges = Math.round(amount / 500);
    if (phoneRecharges >= 1 && phoneRecharges <= 10) {
      equivalents.push({
        text: `${phoneRecharges} ${phoneRecharges === 1 ? 'month' : 'months'} of phone recharge`,
        emoji: '📱',
        category: 'lifestyle',
      });
    }
  }

  // Time-based equivalents (savings rate)
  if (amount >= 2000) {
    const daysOfWork = Math.round(amount / 1000); // Assuming ₹1000/day savings rate
    if (daysOfWork >= 1 && daysOfWork <= 30) {
      equivalents.push({
        text: `${daysOfWork} ${daysOfWork === 1 ? 'day' : 'days'} of savings`,
        emoji: '💰',
        category: 'time',
      });
    }
  }

  // General equivalents
  if (amount >= 10000) {
    const months = Math.round(amount / 10000);
    if (months >= 1 && months <= 12) {
      equivalents.push({
        text: `${months} ${months === 1 ? 'month' : 'months'} of emergency fund`,
        emoji: '🏦',
        category: 'general',
      });
    }
  }

  // Return top 2-3 most relatable equivalents
  return equivalents.slice(0, 3);
}

/**
 * Get a single, most relatable equivalent for display
 */
export function getBestEquivalent(amount: number): FunEquivalent | null {
  const equivalents = getFunEquivalents(amount);
  if (equivalents.length === 0) return null;

  // Prefer food and entertainment as they're most relatable
  const foodOrEntertainment = equivalents.find(
    e => e.category === 'food' || e.category === 'entertainment'
  );
  return foodOrEntertainment || equivalents[0];
}

/**
 * Format fun equivalent for display
 */
export function formatFunEquivalent(equivalent: FunEquivalent): string {
  return `${equivalent.emoji} ${equivalent.text}`;
}

