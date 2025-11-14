import { CoolDownPeriod } from '@/types/impulse';

export const COOL_DOWN_PERIODS: CoolDownPeriod[] = ['1H', '6H', '24H', '3D'];

export const COOL_DOWN_LABELS: Record<CoolDownPeriod, string> = {
  '1H': '1 Hour',
  '6H': '6 Hours',
  '24H': '24 Hours',
  '3D': '3 Days',
};

export const COOL_DOWN_DESCRIPTIONS: Record<CoolDownPeriod, string> = {
  '1H': 'Quick pause for small decisions',
  '6H': 'Half day to think',
  '24H': 'Full day (recommended)',
  '3D': 'Extended wait for big purchases',
};

/**
 * Convert cool-down period to hours
 */
export function coolDownPeriodToHours(period: CoolDownPeriod): number {
  switch (period) {
    case '1H':
      return 1;
    case '6H':
      return 6;
    case '24H':
      return 24;
    case '3D':
      return 72; // 3 days = 72 hours
    default:
      return 24;
  }
}

/**
 * Get default cool-down period based on urgency
 */
export function getDefaultCoolDown(urgency: 'ESSENTIAL' | 'NICE_TO_HAVE' | 'IMPULSE'): CoolDownPeriod {
  switch (urgency) {
    case 'ESSENTIAL':
      return '1H'; // Shorter for essentials
    case 'NICE_TO_HAVE':
      return '24H'; // Standard
    case 'IMPULSE':
      return '24H'; // Standard, can be extended
    default:
      return '24H';
  }
}

