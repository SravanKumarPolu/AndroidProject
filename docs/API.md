# API Documentation

## Services

### Storage Service (`src/services/storage.ts`)

Local storage wrapper for impulses and settings.

**Methods:**
- `getImpulses(): Promise<Impulse[]>` - Get all impulses
- `saveImpulses(impulses: Impulse[]): Promise<void>` - Save impulses
- `addImpulse(impulse: Impulse): Promise<void>` - Add a new impulse
- `updateImpulse(id: string, updates: Partial<Impulse>): Promise<void>` - Update an impulse
- `deleteImpulse(id: string): Promise<void>` - Delete an impulse
- `clearAll(): Promise<void>` - Clear all impulses

### Cloud Sync Service (`src/services/cloudSync.ts`)

Handles syncing data to Supabase cloud storage.

**Methods:**
- `syncToCloud(impulses: Impulse[]): Promise<boolean>` - Sync impulses to cloud
- `syncFromCloud(): Promise<Impulse[] | null>` - Sync impulses from cloud
- `isCloudSyncEnabled(): Promise<boolean>` - Check if cloud sync is enabled
- `enableCloudSync(): Promise<void>` - Enable cloud sync
- `disableCloudSync(): Promise<void>` - Disable cloud sync

### Analytics Service (`src/services/analytics.ts`)

Tracks user actions and app events.

**Methods:**
- `track(event: AnalyticsEvent, properties?: AnalyticsProperties): void` - Track an event
- `trackScreenView(screenName: string, properties?: AnalyticsProperties): void` - Track screen view
- `trackError(error: Error, context?: AnalyticsProperties): void` - Track error
- `setUserProperty(name: string, value: string | number | boolean): void` - Set user property

**Events:**
- `impulse_created` - When an impulse is created
- `impulse_cancelled` - When an impulse is cancelled
- `impulse_executed` - When an impulse is executed
- `impulse_regretted` - When an impulse is regretted
- `screen_view` - When a screen is viewed
- `error_occurred` - When an error occurs

### Performance Monitor (`src/utils/performance.ts`)

Tracks app performance metrics.

**Methods:**
- `start(name: string, metadata?: Record<string, any>): void` - Start tracking
- `end(name: string): number | null` - End tracking
- `measure<T>(name: string, fn: () => Promise<T>): Promise<T>` - Measure function execution
- `trackScreenLoad(screenName: string): () => void` - Track screen load time

### I18n Service (`src/i18n/index.ts`)

Internationalization and translation utilities.

**Methods:**
- `t(key: TranslationKey, params?: Record<string, string | number>): string` - Translate a key
- `setLocale(locale: SupportedLocale): void` - Set locale
- `getLocale(): SupportedLocale` - Get current locale

**Supported Locales:**
- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `hi` - Hindi
- `ja` - Japanese

## Hooks

### useImpulses()

Manages impulse state and operations.

**Returns:**
- `impulses: Impulse[]` - Array of impulses
- `loading: boolean` - Loading state
- `error: Error | null` - Error state
- `createImpulse(formData): Promise<void>` - Create new impulse
- `updateImpulse(id, updates): Promise<void>` - Update impulse
- `deleteImpulse(id): Promise<void>` - Delete impulse
- `loadImpulses(): Promise<void>` - Reload impulses

### useStats(impulses)

Computes statistics from impulses.

**Returns:**
- `stats: UserStats` - User statistics
- `activeImpulses: Impulse[]` - Active impulses
- `readyToReview: Impulse[]` - Impulses ready for review
- `categoryStats: CategoryStats` - Statistics by category

### useAnalytics()

Analytics tracking hook.

**Returns:**
- `trackScreenView(screenName, properties?)` - Track screen view
- `trackEvent(event, properties?)` - Track event
- `analytics: AnalyticsService` - Analytics service instance

### useTranslation()

Translation hook.

**Returns:**
- `t(key, params?)` - Translate function
- `locale: SupportedLocale` - Current locale
- `setLocale(locale)` - Set locale function

## Components

### ErrorBoundary

Catches React errors and displays fallback UI.

**Props:**
- `fallback?: ReactNode` - Custom fallback component
- `children: ReactNode` - Child components

### ImpulseCard

Displays an impulse card.

**Props:**
- `impulse: Impulse` - Impulse data
- `onPress?: () => void` - Press handler
- `onCancel?: () => void` - Cancel handler

## Types

### Impulse

```typescript
interface Impulse {
  id: string;
  title: string;
  category: ImpulseCategory;
  price?: number;
  emotion?: EmotionTag;
  urgency: UrgencyLevel;
  createdAt: number;
  reviewAt: number;
  status: 'LOCKED' | 'CANCELLED' | 'EXECUTED';
  executedAt?: number;
  finalFeeling?: 'WORTH_IT' | 'REGRET' | 'NEUTRAL';
  coolDownPeriod: CoolDownPeriod;
}
```

### UserStats

```typescript
interface UserStats {
  totalSaved: number;
  totalRegretted: number;
  totalExecuted: number;
  totalCancelled: number;
  regretRate: number;
  currentStreak: number;
  longestStreak: number;
}
```

