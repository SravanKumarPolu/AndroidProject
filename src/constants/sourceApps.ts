/**
 * Source App Presets
 * Common apps/platforms where users make impulse purchases
 * Helps users quickly identify where the impulse came from
 */

export interface SourceAppPreset {
  name: string;
  category: string;
  icon: string;
  description: string;
  commonUrgency: 'ESSENTIAL' | 'NICE_TO_HAVE' | 'IMPULSE';
  suggestedCoolDown: string;
}

export const SOURCE_APP_PRESETS: SourceAppPreset[] = [
  // Food Delivery
  {
    name: 'Swiggy',
    category: 'FOOD',
    icon: '🍔',
    description: 'Food delivery cravings',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '1H',
  },
  {
    name: 'Zomato',
    category: 'FOOD',
    icon: '🍕',
    description: 'Food delivery cravings',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '1H',
  },
  {
    name: 'Blinkit',
    category: 'FOOD',
    icon: '⚡',
    description: '10-minute delivery temptations',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '30M', // Shorter for time-sensitive
  },
  {
    name: 'Zepto',
    category: 'FOOD',
    icon: '⚡',
    description: 'Quick delivery temptations',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '30M',
  },
  
  // E-commerce
  {
    name: 'Amazon',
    category: 'SHOPPING',
    icon: '📦',
    description: 'Online shopping',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '24H',
  },
  {
    name: 'Flipkart',
    category: 'SHOPPING',
    icon: '🛍️',
    description: 'Online shopping',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '24H',
  },
  {
    name: 'Myntra',
    category: 'SHOPPING',
    icon: '👕',
    description: 'Fashion & clothing',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '24H',
  },
  
  // Gaming
  {
    name: 'In-Game Purchase',
    category: 'ENTERTAINMENT',
    icon: '🎮',
    description: 'Gaming microtransactions',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '6H',
  },
  {
    name: 'Steam',
    category: 'ENTERTAINMENT',
    icon: '🎮',
    description: 'Game purchases',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '24H',
  },
  
  // Trading/Finance
  {
    name: 'Trading App',
    category: 'TRADING',
    icon: '📈',
    description: 'Options/F&O trading',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '24H',
  },
  {
    name: 'Crypto Exchange',
    category: 'CRYPTO',
    icon: '₿',
    description: 'Meme coins, crypto',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '24H',
  },
  
  // Education
  {
    name: 'Udemy',
    category: 'COURSE',
    icon: '📚',
    description: 'Online courses',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '3D', // Longer for courses
  },
  {
    name: 'Coursera',
    category: 'COURSE',
    icon: '📚',
    description: 'Online courses',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '3D',
  },
  {
    name: 'Skillshare',
    category: 'COURSE',
    icon: '📚',
    description: 'Online courses',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '3D',
  },
  
  // Fashion/Lifestyle
  {
    name: 'Nike',
    category: 'SHOPPING',
    icon: '👟',
    description: 'Sneakers & sportswear',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '24H',
  },
  {
    name: 'Adidas',
    category: 'SHOPPING',
    icon: '👟',
    description: 'Sneakers & sportswear',
    commonUrgency: 'IMPULSE',
    suggestedCoolDown: '24H',
  },
];

/**
 * Get presets for a specific category
 */
export function getPresetsForCategory(category: string): SourceAppPreset[] {
  return SOURCE_APP_PRESETS.filter(preset => preset.category === category);
}

/**
 * Get preset by name
 */
export function getPresetByName(name: string): SourceAppPreset | undefined {
  return SOURCE_APP_PRESETS.find(preset => 
    preset.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get popular presets (most common impulse sources)
 */
export function getPopularPresets(): SourceAppPreset[] {
  return [
    ...SOURCE_APP_PRESETS.filter(p => ['Swiggy', 'Zomato', 'Blinkit'].includes(p.name)),
    ...SOURCE_APP_PRESETS.filter(p => ['Amazon', 'Flipkart'].includes(p.name)),
    ...SOURCE_APP_PRESETS.filter(p => p.name === 'In-Game Purchase'),
    ...SOURCE_APP_PRESETS.filter(p => ['Trading App', 'Crypto Exchange'].includes(p.name)),
  ];
}

