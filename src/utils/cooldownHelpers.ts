/**
 * Cool-Down Helper Functions
 * Utilities for displaying motivational content during cool-down
 */

import { Impulse } from '@/types/impulse';

/**
 * Get calming/motivational messages
 */
export function getCalmingMessages(): string[] {
  return [
    "Take a deep breath. This moment will pass.",
    "You're stronger than this impulse.",
    "Future you will thank present you.",
    "Every skip is a step toward your goals.",
    "You've made good decisions before. You can do it again.",
    "This feeling is temporary. Your savings are permanent.",
    "Think about what you could do with this money instead.",
    "You're building better habits, one decision at a time.",
    "Your future self is counting on you.",
    "You don't need this right now. You want it.",
  ];
}

/**
 * Get a random calming message
 */
export function getRandomCalmingMessage(): string {
  const messages = getCalmingMessages();
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Find similar impulses (same category, similar price range)
 */
export function findSimilarImpulses(
  currentImpulse: Impulse,
  allImpulses: Impulse[],
  limit: number = 3
): Impulse[] {
  const similar = allImpulses
    .filter(i => 
      i.id !== currentImpulse.id &&
      i.category === currentImpulse.category &&
      i.status === 'EXECUTED' &&
      i.price !== undefined &&
      currentImpulse.price !== undefined
    )
    .filter(i => {
      // Price within 50% range
      if (!i.price || !currentImpulse.price) return false;
      const priceDiff = Math.abs(i.price - currentImpulse.price);
      const avgPrice = (i.price + currentImpulse.price) / 2;
      return priceDiff <= avgPrice * 0.5;
    })
    .sort((a, b) => {
      // Sort by most recent first
      return (b.executedAt || 0) - (a.executedAt || 0);
    })
    .slice(0, limit);

  return similar;
}

/**
 * Calculate total money wasted on similar impulses
 */
export function calculateSimilarImpulsesWaste(
  currentImpulse: Impulse,
  allImpulses: Impulse[]
): { totalWasted: number; count: number; regrettedCount: number; regrettedWaste: number } {
  const similar = findSimilarImpulses(currentImpulse, allImpulses, 10);
  
  const totalWasted = similar.reduce((sum, i) => sum + (i.price || 0), 0);
  const regretted = similar.filter(i => 
    i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
  );
  const regrettedWaste = regretted.reduce((sum, i) => sum + (i.price || 0), 0);

  return {
    totalWasted,
    count: similar.length,
    regrettedCount: regretted.length,
    regrettedWaste,
  };
}

/**
 * Get past regrets for same category
 */
export function getPastRegrets(
  currentImpulse: Impulse,
  allImpulses: Impulse[],
  limit: number = 3
): Impulse[] {
  return allImpulses
    .filter(i => 
      i.id !== currentImpulse.id &&
      i.category === currentImpulse.category &&
      (i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)) &&
      i.status === 'EXECUTED'
    )
    .sort((a, b) => (b.executedAt || 0) - (a.executedAt || 0))
    .slice(0, limit);
}

/**
 * Get alternative suggestions based on category
 */
export function getAlternatives(category: Impulse['category'], price?: number): string[] {
  const alternatives: Record<string, string[]> = {
    FOOD: [
      "Make something at home",
      "Use what you already have in the fridge",
      "Wait until your next meal",
      "Drink water - you might just be thirsty",
      "Have a healthy snack you already own",
    ],
    SHOPPING: [
      "Check if you already own something similar",
      "Wait for a better deal",
      "Add to wishlist and revisit later",
      "Borrow from a friend if possible",
      "See if you can rent instead of buy",
    ],
    TRAVEL: [
      "Plan a local day trip instead",
      "Use points/miles if available",
      "Wait for off-season pricing",
      "Consider a staycation",
      "Look for free local activities",
    ],
    DIGITAL: [
      "Check for free alternatives",
      "Use trial period first",
      "Wait for a better discount",
      "See if you can share with family",
      "Check if you already have similar software",
    ],
    GAMING: [
      "Play a game you already own",
      "Wait for a sale",
      "Complete games in your backlog first",
      "Try free-to-play alternatives",
      "Share with friends who own it",
    ],
    ENTERTAINMENT: [
      "Watch something on streaming you already pay for",
      "Read a book you already own",
      "Listen to free podcasts",
      "Go for a walk instead",
      "Call a friend",
    ],
    TRADING: [
      "Review your trading plan first",
      "Wait 24 hours before any trade",
      "Consult with a financial advisor",
      "Start with paper trading",
      "Research more before deciding",
    ],
    CRYPTO: [
      "Research the project thoroughly first",
      "Wait for a better entry point",
      "Start with a smaller amount",
      "Diversify instead of going all-in",
      "Consult with experienced traders",
    ],
    COURSE: [
      "Check if content is available for free",
      "Wait for a deeper discount",
      "Complete courses you already bought",
      "Try free courses first",
      "See if your employer will pay",
    ],
    SUBSCRIPTION: [
      "Check if you're already paying for similar service",
      "Use free trial first",
      "Share with family/friends",
      "Cancel an unused subscription instead",
      "Wait until you actually need it",
    ],
    OTHER: [
      "Sleep on it",
      "Ask yourself: do I really need this?",
      "Wait 24 hours",
      "Check if you can borrow it",
      "See if there's a free alternative",
    ],
  };

  return alternatives[category] || alternatives.OTHER;
}

