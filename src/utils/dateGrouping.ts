import { Impulse } from '@/types/impulse';

export interface GroupedImpulse {
  date: string; // Formatted date string (e.g., "Today", "Yesterday", "Jan 15, 2024")
  dateTimestamp: number; // Start of day timestamp for sorting
  impulses: Impulse[];
}

/**
 * Group impulses by date
 */
export function groupImpulsesByDate(impulses: Impulse[]): GroupedImpulse[] {
  const grouped = new Map<string, Impulse[]>();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  impulses.forEach(impulse => {
    const date = new Date(impulse.createdAt);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayTimestamp = dayStart.getTime();
    
    let dateKey: string;
    if (dayTimestamp === today.getTime()) {
      dateKey = 'Today';
    } else if (dayTimestamp === yesterday.getTime()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = dayStart.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    }

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(impulse);
  });

  // Convert to array and sort by date (most recent first)
  return Array.from(grouped.entries())
    .map(([dateKey, impulseList]) => {
      // Get the first impulse's date for sorting
      const firstImpulse = impulseList[0];
      const date = new Date(firstImpulse.createdAt);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      return {
        date: dateKey,
        dateTimestamp: dayStart.getTime(),
        impulses: impulseList.sort((a, b) => b.createdAt - a.createdAt), // Most recent first within group
      };
    })
    .sort((a, b) => b.dateTimestamp - a.dateTimestamp); // Most recent groups first
}

