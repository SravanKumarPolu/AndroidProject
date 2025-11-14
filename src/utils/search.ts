import { Impulse, ImpulseCategory, EmotionTag, UrgencyLevel } from '@/types/impulse';

export interface SearchFilters {
  query?: string;
  categories?: ImpulseCategory[];
  status?: 'ALL' | 'LOCKED' | 'CANCELLED' | 'EXECUTED' | 'REGRETTED';
  emotions?: EmotionTag[];
  urgency?: UrgencyLevel[];
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: number;
  dateTo?: number;
  showRegretted?: boolean;
}

/**
 * Search and filter impulses based on criteria
 */
export function searchImpulses(impulses: Impulse[], filters: SearchFilters): Impulse[] {
  let results = [...impulses];

  // Text search
  if (filters.query && filters.query.trim()) {
    const query = filters.query.toLowerCase().trim();
    results = results.filter(impulse => {
      const titleMatch = impulse.title.toLowerCase().includes(query);
      const notesMatch = impulse.notes?.toLowerCase().includes(query);
      const categoryMatch = impulse.category.toLowerCase().includes(query);
      return titleMatch || notesMatch || categoryMatch;
    });
  }

  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    results = results.filter(impulse => filters.categories!.includes(impulse.category));
  }

  // Status filter
  if (filters.status && filters.status !== 'ALL') {
    if (filters.status === 'REGRETTED') {
      results = results.filter(impulse => impulse.finalFeeling === 'REGRET');
    } else {
      results = results.filter(impulse => impulse.status === filters.status);
    }
  }

  // Emotion filter
  if (filters.emotions && filters.emotions.length > 0) {
    results = results.filter(impulse => 
      impulse.emotion && filters.emotions!.includes(impulse.emotion)
    );
  }

  // Urgency filter
  if (filters.urgency && filters.urgency.length > 0) {
    results = results.filter(impulse => filters.urgency!.includes(impulse.urgency));
  }

  // Price range filter
  if (filters.minPrice !== undefined) {
    results = results.filter(impulse => 
      impulse.price !== undefined && impulse.price >= filters.minPrice!
    );
  }
  if (filters.maxPrice !== undefined) {
    results = results.filter(impulse => 
      impulse.price !== undefined && impulse.price <= filters.maxPrice!
    );
  }

  // Date range filter
  if (filters.dateFrom !== undefined) {
    results = results.filter(impulse => impulse.createdAt >= filters.dateFrom!);
  }
  if (filters.dateTo !== undefined) {
    results = results.filter(impulse => impulse.createdAt <= filters.dateTo!);
  }

  // Regretted filter
  if (filters.showRegretted !== undefined) {
    if (filters.showRegretted) {
      results = results.filter(impulse => impulse.finalFeeling === 'REGRET');
    }
  }

  // Sort by date (newest first)
  return results.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Get quick filter presets
 */
export function getQuickFilters(): { label: string; filters: SearchFilters }[] {
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const weekStart = now - 7 * 24 * 60 * 60 * 1000;
  const monthStart = now - 30 * 24 * 60 * 60 * 1000;

  return [
    {
      label: 'Today',
      filters: { dateFrom: todayStart },
    },
    {
      label: 'This Week',
      filters: { dateFrom: weekStart },
    },
    {
      label: 'This Month',
      filters: { dateFrom: monthStart },
    },
    {
      label: 'High Value (₹5000+)',
      filters: { minPrice: 5000 },
    },
    {
      label: 'Regretted',
      filters: { showRegretted: true },
    },
  ];
}

