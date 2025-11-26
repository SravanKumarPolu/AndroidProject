/**
 * Location Insights Utilities
 * Analyze location patterns in impulse data
 */

import { Impulse } from '@/types/impulse';
import { LocationData, calculateDistance } from '@/services/location';

export interface LocationInsight {
  location: string;
  count: number;
  totalSpent: number;
  avgPrice: number;
  regretRate: number;
  category?: string;
}

export interface LocationStats {
  totalLocations: number;
  uniqueLocations: number;
  mostFrequentLocation: LocationInsight | null;
  highestSpendingLocation: LocationInsight | null;
  locationInsights: LocationInsight[];
  cityBreakdown: Record<string, number>;
}

/**
 * Get location insights from impulses
 */
export function getLocationInsights(impulses: Impulse[]): LocationStats {
  const locationMap = new Map<string, {
    count: number;
    totalSpent: number;
    prices: number[];
    regrets: number;
    executed: number;
    category?: string;
  }>();

  const cityMap = new Map<string, number>();

  impulses.forEach(impulse => {
    if (!impulse.location) return;

    const locationKey = impulse.location.address || 
      `${impulse.location.city || 'Unknown'}, ${impulse.location.country || 'Unknown'}`;
    
    if (!locationMap.has(locationKey)) {
      locationMap.set(locationKey, {
        count: 0,
        totalSpent: 0,
        prices: [],
        regrets: 0,
        executed: 0,
      });
    }

    const locationData = locationMap.get(locationKey)!;
    locationData.count++;
    
    if (impulse.price) {
      locationData.totalSpent += impulse.price;
      locationData.prices.push(impulse.price);
    }

    if (impulse.status === 'EXECUTED') {
      locationData.executed++;
      if (impulse.finalFeeling === 'REGRET') {
        locationData.regrets++;
      }
    }

    if (impulse.location.city) {
      cityMap.set(impulse.location.city, (cityMap.get(impulse.location.city) || 0) + 1);
    }
  });

  const insights: LocationInsight[] = Array.from(locationMap.entries())
    .map(([location, data]) => ({
      location,
      count: data.count,
      totalSpent: data.totalSpent,
      avgPrice: data.prices.length > 0 
        ? data.prices.reduce((a, b) => a + b, 0) / data.prices.length 
        : 0,
      regretRate: data.executed > 0 
        ? (data.regrets / data.executed) * 100 
        : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const mostFrequent = insights.length > 0 ? insights[0] : null;
  const highestSpending = insights.length > 0 
    ? [...insights].sort((a, b) => b.totalSpent - a.totalSpent)[0]
    : null;

  return {
    totalLocations: impulses.filter(i => i.location).length,
    uniqueLocations: locationMap.size,
    mostFrequentLocation: mostFrequent,
    highestSpendingLocation: highestSpending,
    locationInsights: insights.slice(0, 10), // Top 10
    cityBreakdown: Object.fromEntries(cityMap),
  };
}

/**
 * Get location clusters (impulses near each other)
 */
export function getLocationClusters(
  impulses: Impulse[],
  maxDistanceKm: number = 1
): { location: LocationData; impulses: Impulse[] }[] {
  const clusters: { location: LocationData; impulses: Impulse[] }[] = [];
  const processed = new Set<string>();

  impulses.forEach(impulse => {
    if (!impulse.location || processed.has(impulse.id)) return;

    const cluster: Impulse[] = [impulse];
    processed.add(impulse.id);

    impulses.forEach(other => {
      if (
        !other.location ||
        processed.has(other.id) ||
        impulse.id === other.id
      ) return;

      const distance = calculateDistance(impulse.location!, other.location!);
      if (distance <= maxDistanceKm) {
        cluster.push(other);
        processed.add(other.id);
      }
    });

    if (cluster.length > 0) {
      clusters.push({
        location: impulse.location,
        impulses: cluster,
      });
    }
  });

  return clusters.sort((a, b) => b.impulses.length - a.impulses.length);
}

/**
 * Get location-based patterns
 */
export function getLocationPatterns(impulses: Impulse[]): {
  homeLocation?: LocationData;
  workLocation?: LocationData;
  frequentLocations: { location: string; count: number }[];
} {
  const locationCounts = new Map<string, { count: number; data: LocationData }>();

  impulses.forEach(impulse => {
    if (!impulse.location) return;

    const key = `${impulse.location.latitude.toFixed(4)},${impulse.location.longitude.toFixed(4)}`;
    if (!locationCounts.has(key)) {
      locationCounts.set(key, { count: 0, data: impulse.location });
    }
    locationCounts.get(key)!.count++;
  });

  const sorted = Array.from(locationCounts.entries())
    .sort((a, b) => b[1].count - a[1].count);

  // Most frequent location could be home
  const homeLocation = sorted.length > 0 && sorted[0][1].count >= 5
    ? sorted[0][1].data
    : undefined;

  // Second most frequent could be work
  const workLocation = sorted.length > 1 && sorted[1][1].count >= 3
    ? sorted[1][1].data
    : undefined;

  const frequentLocations = sorted
    .slice(0, 5)
    .map(([_, data]) => ({
      location: data.data.address || `${data.data.city || 'Unknown'}, ${data.data.country || ''}`,
      count: data.count,
    }));

  return {
    homeLocation,
    workLocation,
    frequentLocations,
  };
}



