# Dark Mode & Savings Goals Implementation

## Overview

This document describes the implementation of two major features:
1. **Dark Mode** - System-aware theme switching with manual override
2. **Savings Goals** - Transform saved money into trackable financial goals

---

## 🌙 Dark Mode Implementation

### Features

- **System Preference Detection**: Automatically follows device theme (light/dark)
- **Manual Override**: Users can force light or dark mode
- **Persistent Settings**: Theme preference is saved and restored
- **Theme-Aware Components**: All UI components adapt to the current theme

### Architecture

#### 1. Theme Context (`src/contexts/ThemeContext.tsx`)
- Provides theme state management
- Detects system color scheme using React Native's `useColorScheme`
- Supports three modes: `'light'`, `'dark'`, `'system'`
- Persists preference to AsyncStorage

#### 2. Color System (`src/constants/colors.ts`)
- Light theme colors (`colors`)
- Dark theme colors (`darkColors`)
- Shared color palettes (primary, accent, success, error, warning, gray)
- Theme-specific semantic colors (background, surface, text, border)

#### 3. Component Updates
- All components use `useTheme()` hook to access current theme colors
- Dynamic styling based on theme
- StatusBar adapts to theme

### Usage

```typescript
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { colors, theme, themeMode, setThemeMode } = useTheme();
  
  // Use colors from theme
  <View style={{ backgroundColor: colors.background }}>
    <Text style={{ color: colors.text }}>Hello</Text>
  </View>
  
  // Change theme mode
  setThemeMode('dark'); // or 'light' or 'system'
}
```

### Settings UI

The Settings screen includes an "Appearance" section with three options:
- **Light**: Force light mode
- **Dark**: Force dark mode  
- **System**: Follow device preference (default)

---

## 🎯 Savings Goals Implementation

### Features

- **Create Goals**: Set financial targets with optional deadlines
- **Auto-Tracking**: Cancelled impulses automatically contribute to matching goals
- **Progress Visualization**: Visual progress bars and percentage completion
- **Category Filtering**: Goals can be filtered by impulse category
- **Completion Tracking**: Goals automatically mark as completed when target is reached
- **On-Track Analysis**: Calculates if goal is on track to meet deadline

### Architecture

#### 1. Types (`src/types/goal.ts`)
- `SavingsGoal`: Core goal data structure
- `GoalProgress`: Calculated progress metrics
- `GoalFormData`: Form input structure

#### 2. Goals Service (`src/services/goals.ts`)
- CRUD operations for goals
- Automatic progress calculation from cancelled impulses
- Goal-impulse assignment tracking
- Category-based auto-assignment

#### 3. Goals Hook (`src/hooks/useGoals.ts`)
- React hook for goal management
- Automatic progress recalculation when impulses change
- Progress calculation with on-track analysis

#### 4. UI Components

**GoalsCard** (`src/components/GoalsCard.tsx`)
- Displays goals with progress bars
- Shows completion status, remaining amount, days left
- Empty state with create button

**Goals Screen** (`app/goals.tsx`)
- Full goal management interface
- Create, view, and delete goals
- Separate sections for active and completed goals

### How It Works

1. **Creating a Goal**:
   - User sets title, target amount, optional deadline and category
   - Goal is stored with `currentAmount: 0`

2. **Auto-Contribution**:
   - When an impulse is cancelled, the system checks for matching goals
   - If a goal has a category filter, only matching category impulses contribute
   - If multiple goals match, amount is distributed evenly
   - Progress is recalculated automatically

3. **Progress Calculation**:
   - `currentAmount` is sum of all contributing cancelled impulses
   - Progress percentage: `(currentAmount / targetAmount) * 100`
   - On-track analysis: Calculates daily rate and projects completion date
   - Goal is marked complete when `currentAmount >= targetAmount`

4. **Display**:
   - Home screen shows top 2 goals with progress
   - Goals screen shows all goals with full details
   - Progress bars use color coding:
     - Green: Completed
     - Blue: On track
     - Orange: Behind schedule

### Usage Example

```typescript
import { useGoals } from '@/hooks/useGoals';
import { useImpulses } from '@/hooks/useImpulses';

function MyComponent() {
  const { impulses } = useImpulses();
  const { goals, createGoal, getGoalProgress } = useGoals(impulses);
  
  // Create a goal
  await createGoal({
    title: 'New Laptop',
    targetAmount: 50000,
    targetDate: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
    category: 'SHOPPING', // Optional
  });
  
  // Get progress for a goal
  const progress = getGoalProgress(goals[0]);
  console.log(`${progress.progress}% complete`);
  console.log(`${progress.remaining} remaining`);
  console.log(`On track: ${progress.onTrack}`);
}
```

### Data Flow

```
User cancels impulse
    ↓
Goals service checks for matching goals
    ↓
Updates goal.currentAmount
    ↓
Recalculates progress
    ↓
UI updates automatically via hook
```

---

## Integration Points

### Home Screen
- Displays `GoalsCard` component showing top 2 goals
- Tapping the card navigates to full goals screen

### Settings Screen
- Appearance section for theme control
- All settings use theme-aware colors

### Navigation
- Goals screen added to Stack navigator
- Accessible from home screen via GoalsCard

---

## Testing Recommendations

### Dark Mode
1. Test system preference detection
2. Test manual theme switching
3. Verify all screens adapt correctly
4. Check StatusBar color changes
5. Test theme persistence across app restarts

### Savings Goals
1. Create goals with and without categories
2. Cancel impulses and verify auto-contribution
3. Test multiple goals with same category
4. Verify progress calculation accuracy
5. Test goal completion
6. Test on-track analysis with deadlines
7. Verify goal deletion doesn't affect saved money

---

## Future Enhancements

### Dark Mode
- Custom accent colors per theme
- Theme transition animations
- Per-screen theme overrides

### Savings Goals
- Manual impulse-to-goal assignment
- Goal templates/presets
- Goal sharing/export
- Multiple currency support
- Goal categories/tags
- Recurring goals
- Goal notifications/milestones

---

## Files Modified/Created

### Dark Mode
- `src/contexts/ThemeContext.tsx` (new)
- `src/constants/colors.ts` (updated)
- `app/_layout.tsx` (updated)
- `app/(tabs)/settings.tsx` (updated)
- `src/components/ui/Card.tsx` (updated)
- `app/(tabs)/index.tsx` (updated)

### Savings Goals
- `src/types/goal.ts` (new)
- `src/services/goals.ts` (new)
- `src/hooks/useGoals.ts` (new)
- `src/components/GoalsCard.tsx` (new)
- `app/goals.tsx` (new)
- `app/(tabs)/index.tsx` (updated)
- `app/_layout.tsx` (updated)

---

## Notes

- Both features are fully integrated and ready to use
- Dark mode works system-wide automatically
- Goals automatically track from cancelled impulses
- All components are theme-aware
- No breaking changes to existing functionality

