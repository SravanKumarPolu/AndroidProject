import { Impulse, ImpulseCategory, EmotionTag, UrgencyLevel, CoolDownPeriod, ImpulseStatus, FinalFeeling } from '@/types/impulse';

/**
 * Test Data Generator
 * Creates sample impulses for testing analytics and smart prompts
 */

const CATEGORIES: ImpulseCategory[] = ['FOOD', 'SHOPPING', 'ENTERTAINMENT', 'TRADING', 'CRYPTO', 'COURSE', 'SUBSCRIPTION', 'OTHER'];
const EMOTIONS: EmotionTag[] = ['BORED', 'STRESSED', 'FOMO', 'HAPPY', 'LONELY'];
const URGENCY_LEVELS: UrgencyLevel[] = ['ESSENTIAL', 'NICE_TO_HAVE', 'IMPULSE'];
const COOL_DOWN_PERIODS: CoolDownPeriod[] = ['1H', '6H', '24H', '3D'];

/**
 * Generate random impulses for testing
 */
export function generateTestImpulses(count: number = 20): Impulse[] {
  const impulses: Impulse[] = [];
  const now = Date.now();
  const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const createdAt = oneMonthAgo + Math.random() * (now - oneMonthAgo);
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const urgency: UrgencyLevel = URGENCY_LEVELS[Math.floor(Math.random() * URGENCY_LEVELS.length)];
    const coolDownPeriod: CoolDownPeriod = COOL_DOWN_PERIODS[Math.floor(Math.random() * COOL_DOWN_PERIODS.length)];
    
    // Calculate review time
    const hours = getCoolDownHours(coolDownPeriod);
    const reviewAt = createdAt + (hours * 60 * 60 * 1000);

    // Random status
    const statusRand = Math.random();
    let status: ImpulseStatus;
    let executedAt: number | undefined;
    let finalFeeling: FinalFeeling | undefined;

    if (statusRand < 0.3) {
      // 30% cancelled
      status = 'CANCELLED';
    } else if (statusRand < 0.7) {
      // 40% executed
      status = 'EXECUTED';
      executedAt = reviewAt + Math.random() * (24 * 60 * 60 * 1000);
      // 50% chance of regret
      finalFeeling = Math.random() < 0.5 ? 'REGRET' : 'WORTH_IT';
    } else {
      // 30% still locked
      status = 'LOCKED';
    }

    const impulse: Impulse = {
      id: `test-${Date.now()}-${i}`,
      title: getRandomTitle(category),
      category,
      price: Math.random() < 0.8 ? Math.floor(Math.random() * 5000) + 100 : undefined,
      emotion: Math.random() < 0.7 ? EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)] : undefined,
      urgency,
      coolDownPeriod,
      createdAt,
      reviewAt,
      status,
      executedAt,
      finalFeeling,
    };

    impulses.push(impulse);
  }

  // Sort by creation date
  return impulses.sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Generate impulses with specific patterns for testing
 */
export function generatePatternTestData(): Impulse[] {
  const impulses: Impulse[] = [];
  const now = Date.now();
  
  // Pattern 1: Many regrets in FOOD category
  for (let i = 0; i < 5; i++) {
    const createdAt = now - (i * 2 * 24 * 60 * 60 * 1000); // 2 days apart
    impulses.push({
      id: `regret-food-${i}`,
      title: `Swiggy Order ${i + 1}`,
      category: 'FOOD',
      price: 500 + Math.random() * 300,
      emotion: 'BORED',
      urgency: 'IMPULSE',
      coolDownPeriod: '24H',
      createdAt,
      reviewAt: createdAt + (24 * 60 * 60 * 1000),
      status: 'EXECUTED',
      executedAt: createdAt + (24 * 60 * 60 * 1000) + 1000,
      finalFeeling: 'REGRET',
    });
  }

  // Pattern 2: Weak hour (evening 8-10 PM)
  const weakHour = 21; // 9 PM
  for (let i = 0; i < 8; i++) {
    const date = new Date(now - (i * 7 * 24 * 60 * 60 * 1000)); // Weekly
    date.setHours(weakHour, 0, 0, 0);
    const createdAt = date.getTime();
    
    impulses.push({
      id: `weak-hour-${i}`,
      title: `Evening Purchase ${i + 1}`,
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      price: 300 + Math.random() * 700,
      emotion: 'STRESSED',
      urgency: 'IMPULSE',
      coolDownPeriod: '24H',
      createdAt,
      reviewAt: createdAt + (24 * 60 * 60 * 1000),
      status: Math.random() < 0.5 ? 'EXECUTED' : 'CANCELLED',
      executedAt: Math.random() < 0.5 ? createdAt + (24 * 60 * 60 * 1000) : undefined,
      finalFeeling: Math.random() < 0.6 ? 'REGRET' : undefined,
    });
  }

  // Pattern 3: Active impulses in cool-down
  for (let i = 0; i < 3; i++) {
    const createdAt = now - (i * 2 * 60 * 60 * 1000); // 2 hours apart
    impulses.push({
      id: `active-${i}`,
      title: `Pending Purchase ${i + 1}`,
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      price: 200 + Math.random() * 800,
      emotion: 'FOMO',
      urgency: 'IMPULSE',
      coolDownPeriod: '24H',
      createdAt,
      reviewAt: createdAt + (24 * 60 * 60 * 1000),
      status: 'LOCKED',
    });
  }

  // Pattern 4: Mixed data for analytics
  for (let i = 0; i < 10; i++) {
    const createdAt = now - (i * 3 * 24 * 60 * 60 * 1000); // 3 days apart
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    
    impulses.push({
      id: `mixed-${i}`,
      title: getRandomTitle(category),
      category,
      price: Math.random() < 0.9 ? Math.floor(Math.random() * 3000) + 50 : undefined,
      emotion: Math.random() < 0.7 ? EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)] : undefined,
      urgency: URGENCY_LEVELS[Math.floor(Math.random() * URGENCY_LEVELS.length)],
      coolDownPeriod: COOL_DOWN_PERIODS[Math.floor(Math.random() * COOL_DOWN_PERIODS.length)],
      createdAt,
      reviewAt: createdAt + (24 * 60 * 60 * 1000),
      status: Math.random() < 0.4 ? 'CANCELLED' : Math.random() < 0.8 ? 'EXECUTED' : 'LOCKED',
      executedAt: Math.random() < 0.6 ? createdAt + (24 * 60 * 60 * 1000) : undefined,
      finalFeeling: Math.random() < 0.4 ? 'REGRET' : Math.random() < 0.7 ? 'WORTH_IT' : undefined,
    });
  }

  return impulses.sort((a, b) => a.createdAt - b.createdAt);
}

function getRandomTitle(category: ImpulseCategory): string {
  const titles: Record<ImpulseCategory, string[]> = {
    FOOD: ['Swiggy Order', 'Zomato Delivery', 'Restaurant Meal', 'Snacks', 'Coffee'],
    SHOPPING: ['Amazon Purchase', 'Flipkart Order', 'Clothing', 'Electronics', 'Accessories'],
    ENTERTAINMENT: ['Movie Ticket', 'Streaming Subscription', 'Game Purchase', 'Concert Ticket'],
    TRADING: ['Stock Options', 'Futures Trade', 'Day Trading', 'Options Trade'],
    CRYPTO: ['Bitcoin', 'Ethereum', 'Altcoin', 'Meme Coin', 'NFT'],
    COURSE: ['Online Course', 'Udemy Course', 'Skill Development', 'Certification'],
    SUBSCRIPTION: ['Netflix', 'Spotify', 'Gym Membership', 'Software License'],
    OTHER: ['Random Purchase', 'Impulse Buy', 'Misc Item'],
  };

  const categoryTitles = titles[category] || titles.OTHER;
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
}

function getCoolDownHours(period: CoolDownPeriod): number {
  switch (period) {
    case '1H': return 1;
    case '6H': return 6;
    case '24H': return 24;
    case '3D': return 72;
    default: return 24;
  }
}

/**
 * Clear all test data
 */
export function clearTestData(): void {
  // This would be called from storage service
  console.log('Test data cleared');
}

