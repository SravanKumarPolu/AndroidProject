# Recurring Impulse Detection - Implementation Summary

## Overview
A comprehensive pattern detection system that identifies recurring spending habits and provides actionable insights to help users break bad patterns and make better financial decisions.

## Features Implemented

### 1. Pattern Detection Algorithms
- **Daily Patterns**: Detects impulses that occur daily or every other day
- **Weekly Patterns**: Identifies recurring impulses on the same day of week
- **Time-Based Patterns**: Finds patterns based on time of day
- **Category + Price Patterns**: Detects similar purchases in same category with similar prices
- **Frequent Patterns**: Identifies high-frequency spending in specific categories

### 2. Pattern Analysis
- **Pattern Strength**: Calculates strength (WEAK, MODERATE, STRONG, VERY_STRONG)
- **Confidence Score**: 0-100% confidence in pattern detection
- **Regret Rate Tracking**: Monitors regret rates for each pattern
- **Frequency Calculation**: Tracks occurrences per day/week/month
- **Price Range Analysis**: Identifies average, min, and max prices

### 3. Predictions
- **Next Occurrence Prediction**: Predicts when pattern will likely occur next
- **Price Prediction**: Estimates likely price for next occurrence
- **Upcoming Patterns**: Highlights patterns predicted in next 2 weeks

### 4. Insights & Suggestions
- **Automated Insights**: Generates contextual insights for each pattern
- **Actionable Suggestions**: Provides specific recommendations
- **Warning System**: Alerts for high regret patterns
- **Success Indicators**: Highlights positive patterns

### 5. Real-Time Pattern Matching
- **Live Detection**: Matches new impulses to existing patterns in real-time
- **Warning Cards**: Shows warnings when creating recurring impulses
- **Regret Rate Warnings**: Alerts if pattern has high regret rate

## Technical Implementation

### Files Created

1. **`src/types/pattern.ts`**
   - Type definitions for patterns, pattern types, strengths, and insights
   - Pattern matching interfaces

2. **`src/utils/patternDetection.ts`**
   - Core pattern detection algorithms
   - Multiple detection functions for different pattern types
   - Pattern matching and prediction logic
   - Helper functions for date/time formatting

3. **`src/hooks/usePatterns.ts`**
   - React hook for pattern detection
   - Memoized calculations for performance
   - Provides filtered views (strongest, upcoming, high regret)
   - Pattern matching function for new impulses

4. **`src/components/PatternCard.tsx`**
   - Individual pattern display component
   - Shows pattern details, metrics, predictions
   - Visual strength indicators
   - Regret rate warnings

5. **`src/components/PatternsCard.tsx`**
   - Summary card for home screen
   - Displays top patterns and insights
   - Empty state handling

6. **`app/patterns.tsx`**
   - Full patterns screen with filtering
   - Insights display
   - Pattern type grouping
   - Detailed pattern views

### Files Modified

1. **`app/(tabs)/index.tsx`**
   - Added `PatternsCard` to home screen
   - Integrated pattern detection

2. **`app/new-impulse.tsx`**
   - Added real-time pattern matching
   - Warning card for recurring patterns
   - Regret rate alerts

3. **`app/_layout.tsx`**
   - Added patterns screen route

## Pattern Detection Logic

### Detection Criteria
- **Minimum Occurrences**: 3+ occurrences required
- **Time Span**: Patterns must span at least 7 days (for time-based)
- **Price Tolerance**: 20% variation allowed for price matching
- **Time Tolerance**: 2-hour window for time-based patterns

### Pattern Strength Calculation
```
Strength Score = (Occurrences × 0.4) + (Consistency × 0.4) + (Frequency × 0.2)
```

### Confidence Score
- Based on frequency, consistency, and time span
- Higher confidence for more consistent patterns
- Adjusted by pattern type

## User Experience

### Home Screen
- **PatternsCard**: Shows top patterns and insights
- **Quick Access**: Tap to view all patterns
- **Visual Indicators**: Color-coded strength badges

### Patterns Screen
- **Filtering**: All, Strong, Upcoming, High Regret
- **Insights Section**: Actionable warnings and suggestions
- **Pattern Details**: Full information for each pattern
- **Type Grouping**: Patterns organized by type

### New Impulse Screen
- **Real-Time Detection**: Warns when creating recurring impulse
- **Regret Rate Alerts**: Shows if pattern has high regret
- **Occurrence Count**: Displays how many times pattern occurred

## Performance Optimizations

1. **Memoization**: All pattern calculations are memoized
2. **Efficient Algorithms**: O(n log n) complexity for pattern detection
3. **Lazy Evaluation**: Patterns only calculated when needed
4. **Caching**: Pattern results cached until impulses change

## Pattern Types

1. **DAILY**: Same impulse every day
2. **WEEKLY**: Same impulse on same day of week
3. **MONTHLY**: Same impulse on same day of month
4. **FREQUENT**: High frequency, irregular timing
5. **TIME_BASED**: Same time of day
6. **CATEGORY**: Same category, similar price
7. **PRICE**: Similar price range
8. **SOURCE**: Same source app (future)

## Insights Generated

- **Warnings**: High regret patterns, frequent patterns
- **Suggestions**: Set goals, extend cool-down, plan ahead
- **Info**: Pattern predictions, upcoming occurrences
- **Success**: Positive patterns (low regret, good habits)

## Future Enhancements

1. **Machine Learning**: Improve pattern detection accuracy
2. **Source App Detection**: Track patterns by app/site
3. **Location-Based**: Detect patterns by location
4. **Seasonal Patterns**: Identify seasonal spending habits
5. **Pattern Breaking**: Track progress breaking bad patterns
6. **Pattern Goals**: Set goals to reduce pattern frequency

## Testing Recommendations

1. **Test with Various Data**: Different pattern types, frequencies
2. **Edge Cases**: Single occurrence, irregular patterns
3. **Performance**: Large datasets (1000+ impulses)
4. **UI/UX**: Pattern card displays, warnings, predictions
5. **Real-Time Matching**: New impulse pattern detection

## Usage Example

```typescript
import { usePatterns } from '@/hooks/usePatterns';

function MyComponent() {
  const { impulses } = useImpulses();
  const { patterns, insights, strongestPatterns } = usePatterns(impulses);
  
  // patterns: All detected patterns
  // insights: Actionable insights and warnings
  // strongestPatterns: Top 5 strongest patterns
}
```

## Key Benefits

1. **Self-Awareness**: Users see their spending patterns clearly
2. **Proactive Warnings**: Alerts before making recurring purchases
3. **Data-Driven**: Based on actual spending history
4. **Actionable**: Provides specific suggestions
5. **Predictive**: Forecasts future occurrences
6. **Visual**: Easy to understand pattern cards

## Integration Points

- **Home Screen**: PatternsCard shows top patterns
- **New Impulse**: Real-time pattern matching
- **Analytics**: Can be integrated into analytics screen
- **Goals**: Can suggest goals based on patterns
- **Achievements**: Can unlock achievements for breaking patterns

