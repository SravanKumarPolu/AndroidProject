import * as StoreReview from 'expo-store-review';

/**
 * Rating Service
 * Handles app store rating prompts using expo-store-review
 */

let positiveActionCount = 0;
const POSITIVE_ACTIONS_BEFORE_PROMPT = 3; // Track 3 positive actions before considering prompt

/**
 * Track a positive action (e.g., cancelling an impulse)
 * This should be called when users perform positive actions
 */
export async function trackPositiveAction(): Promise<void> {
  positiveActionCount++;
  
  // After enough positive actions, we can prompt for rating
  // But we'll let promptRatingIfAppropriate() handle the actual prompt timing
}

/**
 * Prompt for rating if appropriate
 * This should be called after milestones (achievements, goal completions, etc.)
 * The native system will handle the timing and frequency of prompts
 */
export async function promptRatingIfAppropriate(): Promise<void> {
  try {
    // Check if store review is available
    const isAvailable = await StoreReview.isAvailableAsync();
    
    if (!isAvailable) {
      console.log('Store review is not available on this device');
      return;
    }

    // Request review - the system will handle:
    // - Not showing too frequently
    // - Not showing if user already rated
    // - Showing at appropriate times
    await StoreReview.requestReview();
  } catch (error) {
    console.error('Error requesting store review:', error);
  }
}

/**
 * Get the current positive action count (for debugging/testing)
 */
export function getPositiveActionCount(): number {
  return positiveActionCount;
}

/**
 * Reset positive action count (for testing)
 */
export function resetPositiveActionCount(): void {
  positiveActionCount = 0;
}
