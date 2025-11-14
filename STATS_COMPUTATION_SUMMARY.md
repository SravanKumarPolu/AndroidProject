# Stats Computation - Implementation Summary

## ✅ All Required Stats Are Implemented

All statistics can be computed from impulses as requested:

### 1. ✅ moneySaved
```typescript
moneySaved = sum(price for all impulses where status === 'CANCELLED')
```
**Implementation:** `totalSaved` in `computeStats()` and `getCurrentMonthStats()`
- Uses `status === 'CANCELLED'` (which equals "skipped")
- Calculated via: `cancelled.reduce((sum, i) => sum + (i.price || 0), 0)`

### 2. ✅ totalImpulses
```typescript
totalImpulses = impulses.length
```
**Implementation:** Available as:
- `totalLogged` in stats (for filtered time periods)
- `impulses.length` directly
- `totalLogged` in `MonthlyStats`

### 3. ✅ bought
```typescript
bought = count(status === 'EXECUTED')
```
**Implementation:** `totalExecuted` in stats
- Uses `status === 'EXECUTED'` (which equals "bought")
- Calculated via: `executed.length` where `executed = impulses.filter(i => i.status === 'EXECUTED')`

### 4. ✅ regretsCount
```typescript
regretsCount = count(bought with regret >= 3)
```
**Implementation:** Updated to include both:
- `finalFeeling === 'REGRET'` (backward compatibility)
- `regretRating >= 3` (new 1-5 rating scale)

**Updated in:**
- `src/utils/stats.ts` - `computeStats()` and `computeCategoryStats()`
- `src/utils/monthlyStats.ts` - `getCurrentMonthStats()`
- `src/utils/weeklyReview.ts` - `getWeeklyReview()`

**Logic:**
```typescript
const regretted = executed.filter(i => 
  i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
);
```

### 5. ✅ Category Stats via Grouping
**Implementation:** `computeCategoryStats()` in `src/utils/stats.ts`
- Groups impulses by category
- Calculates per-category:
  - `totalLogged`
  - `totalCancelled`
  - `totalExecuted`
  - `totalRegretted` (with updated regret logic)
  - `avgPrice`
  - `regretRate`

---

## 📊 Stats Available

### Main Stats (`UserStats`)
- `totalSaved` - Money saved from cancelled impulses
- `totalRegretted` - Money spent on regretted purchases
- `totalExecuted` - Count of bought impulses
- `totalCancelled` - Count of skipped impulses
- `regretRate` - Percentage of executed that were regretted
- `currentStreak` - Days since last executed impulse
- `longestStreak` - Longest streak of cancelled impulses
- `todaySaved` - Money saved today
- `todayLogged` - Impulses logged today

### Monthly Stats (`MonthlyStats`)
- `totalSaved` - Money saved this month
- `totalLogged` - Impulses logged this month
- `totalCancelled` - Impulses skipped this month
- `totalExecuted` - Impulses bought this month
- `totalRegretted` - Impulses regretted this month
- `regretRate` - Regret rate for the month

### Category Stats (`CategoryStats[]`)
- Per-category breakdown with all above metrics

---

## 🔧 Usage

```typescript
import { useStats } from '@/hooks/useStats';
import { getCurrentMonthStats } from '@/utils/monthlyStats';
import { computeStats, computeCategoryStats } from '@/utils/stats';

// In component
const { stats, categoryStats } = useStats(impulses);

// Or directly
const stats = computeStats(impulses);
const categoryStats = computeCategoryStats(impulses);
const monthlyStats = getCurrentMonthStats(impulses);
```

---

## ✅ Status: Complete

All requested statistics are implemented and working:
- ✅ moneySaved (from CANCELLED status)
- ✅ totalImpulses (impulses.length)
- ✅ bought (count of EXECUTED status)
- ✅ regretsCount (bought with regretRating >= 3 OR finalFeeling === 'REGRET')
- ✅ Category stats via grouping

**Last Updated:** 2025-01-XX

