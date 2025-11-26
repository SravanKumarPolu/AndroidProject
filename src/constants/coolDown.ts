import { CoolDownPeriod } from '@/types/impulse';

export const COOL_DOWN_PERIODS: CoolDownPeriod[] = ['10M', '15M', '30M', '1H', '2H', '6H', '24H', '3D'];

export const COOL_DOWN_LABELS: Record<CoolDownPeriod, string> = {
  '10M': '10 Minutes',
  '15M': '15 Minutes',
  '30M': '30 Minutes',
  '1H': '1 Hour',
  '2H': '2 Hours',
  '6H': '6 Hours',
  '24H': '24 Hours',
  '3D': '3 Days',
};

export const COOL_DOWN_DESCRIPTIONS: Record<CoolDownPeriod, string> = {
  '10M': 'Quick pause to reconsider',
  '15M': 'Brief moment to reconsider',
  '30M': 'Short break (recommended for small purchases)',
  '1H': 'Quick pause for small decisions',
  '2H': 'Two hours to think it over',
  '6H': 'Half day to think',
  '24H': 'Full day (recommended)',
  '3D': 'Extended wait for big purchases',
};

/**
 * Convert cool-down period to hours
 */
export function coolDownPeriodToHours(period: CoolDownPeriod): number {
  switch (period) {
    case '10M':
      return 10 / 60; // 10 minutes = 0.167 hours
    case '15M':
      return 15 / 60; // 15 minutes = 0.25 hours
    case '30M':
      return 30 / 60; // 30 minutes = 0.5 hours
    case '1H':
      return 1;
    case '2H':
      return 2;
    case '6H':
      return 6;
    case '24H':
      return 24;
    case '3D':
      return 72; // 3 days = 72 hours
    default:
      return 0.5; // Default to 30 minutes
  }
}

/**
 * Convert cool-down period to milliseconds
 */
export function coolDownPeriodToMs(period: CoolDownPeriod): number {
  switch (period) {
    case '10M':
      return 10 * 60 * 1000; // 10 minutes
    case '15M':
      return 15 * 60 * 1000; // 15 minutes
    case '30M':
      return 30 * 60 * 1000; // 30 minutes
    case '1H':
      return 60 * 60 * 1000; // 1 hour
    case '2H':
      return 2 * 60 * 60 * 1000; // 2 hours
    case '6H':
      return 6 * 60 * 60 * 1000; // 6 hours
    case '24H':
      return 24 * 60 * 60 * 1000; // 24 hours
    case '3D':
      return 3 * 24 * 60 * 60 * 1000; // 3 days
    default:
      return 30 * 60 * 1000; // Default to 30 minutes
  }
}

/**
 * Synchronous version for backwards compatibility
 * Uses 30M as default
 */
export function getDefaultCoolDownSync(urgency: 'ESSENTIAL' | 'NICE_TO_HAVE' | 'IMPULSE'): CoolDownPeriod {
  return '30M'; // Default fallback
}

