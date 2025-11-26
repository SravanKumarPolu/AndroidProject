# Component Documentation

## UI Components

### Button (`src/components/ui/Button.tsx`)

Primary button component with variants.

**Props:**
- `title: string` - Button text
- `onPress: () => void` - Press handler
- `variant?: 'primary' | 'secondary' | 'outline'` - Button variant
- `disabled?: boolean` - Disabled state
- `loading?: boolean` - Loading state
- `icon?: ReactNode` - Optional icon

**Example:**
```tsx
<Button
  title="Save"
  onPress={handleSave}
  variant="primary"
  loading={isSaving}
/>
```

### Input (`src/components/ui/Input.tsx`)

Text input component.

**Props:**
- `value: string` - Input value
- `onChangeText: (text: string) => void` - Change handler
- `placeholder?: string` - Placeholder text
- `label?: string` - Label text
- `error?: string` - Error message
- `keyboardType?: KeyboardTypeOptions` - Keyboard type
- `multiline?: boolean` - Multiline input

### Card (`src/components/ui/Card.tsx`)

Card container component.

**Props:**
- `title?: string` - Card title
- `subtitle?: string` - Card subtitle
- `children: ReactNode` - Card content
- `onPress?: () => void` - Press handler
- `variant?: 'default' | 'outlined'` - Card variant

## Feature Components

### ImpulseCard (`src/components/ImpulseCard.tsx`)

Displays an impulse with countdown timer.

**Props:**
- `impulse: Impulse` - Impulse data
- `onPress?: () => void` - Press handler
- `onCancel?: () => void` - Cancel handler
- `showCountdown?: boolean` - Show countdown timer

### StatsCard (`src/components/StatsCard.tsx`)

Displays user statistics.

**Props:**
- `stats: UserStats` - Statistics data
- `currency: Currency` - Currency for formatting
- `compact?: boolean` - Compact display mode

### AnalyticsChart (`src/components/AnalyticsChart.tsx`)

Chart component for analytics.

**Props:**
- `impulses: Impulse[]` - Impulses data
- `type: 'category' | 'time' | 'price'` - Chart type

### ErrorBoundary (`src/components/ErrorBoundary.tsx`)

Error boundary component.

**Props:**
- `fallback?: ReactNode` - Custom fallback UI
- `children: ReactNode` - Child components

## Hooks Usage

### useImpulses()

```tsx
const { impulses, loading, createImpulse, updateImpulse } = useImpulses();

// Create impulse
await createImpulse({
  title: 'New iPhone',
  category: 'SHOPPING',
  price: 999,
  urgency: 'HIGH',
});
```

### useStats()

```tsx
const { stats, activeImpulses, categoryStats } = useStats(impulses);

// Access stats
console.log(stats.totalSaved);
console.log(stats.currentStreak);
```

### useAnalytics()

```tsx
const { trackScreenView, trackEvent } = useAnalytics();

// Track screen view
trackScreenView('HomeScreen');

// Track event
trackEvent('impulse_created', {
  category: 'SHOPPING',
  price: 99.99,
});
```

### useTranslation()

```tsx
const { t, locale, setLocale } = useTranslation();

// Translate
const title = t('impulse.title');

// Change locale
setLocale('es');
```

