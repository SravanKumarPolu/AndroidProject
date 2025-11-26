# ImpulseVault - Use Cases Supported

## Why ImpulseVault Exists

**Everyone regrets their spontaneous purchases**, especially:

1. **Swiggy/Zomato cravings** - Late-night food delivery orders
2. **Blinkit 10-min temptations** - Quick delivery impulse buys
3. **Amazon/Flipkart "I didn't need this"** - Online shopping regrets
4. **Sneakers/Gadgets (FOMO buys)** - Limited edition, flash sales
5. **In-game purchases** - Gaming microtransactions
6. **Meme coin / Options trading impulses** - Financial FOMO
7. **Digital courses impulsively bought during sales** - Educational FOMO

**No app in India solves the "decision BEFORE spending".**

- ❌ Expense trackers work **after** damage is done
- ❌ Budgets don't stop cravings
- ❌ Habit apps don't target money impulses

**ImpulseVault fills a real psychological + financial gap.**

---

## How ImpulseVault Addresses Each Use Case

### ✅ 1. Swiggy/Zomato Cravings

**Problem**: Late-night food delivery orders you regret the next day.

**Solution**:
- **Source App Tracking**: Select "Swiggy" or "Zomato" when logging
- **Quick Add**: Fast logging before checkout
- **1-Hour Cool-Down**: Suggested for food delivery (enough time to reconsider)
- **Category**: FOOD category with delivery context
- **Regret Tracking**: 24h check-in to see if you still wanted it

**Features**:
- `SourceAppSelector` component with Swiggy/Zomato presets
- Quick-add screen for fast logging
- Smart prompts during weak hours (common for food orders)

### ✅ 2. Blinkit 10-Min Temptations

**Problem**: Ultra-fast delivery creates instant gratification pressure.

**Solution**:
- **30-Minute Cool-Down**: Shorter period for time-sensitive items
- **Source App**: "Blinkit" preset with 30M suggested cooldown
- **Quick Decision**: Fast logging before checkout
- **Urgency-Based**: Auto-suggests shorter cooldown for essentials

**Features**:
- Blinkit/Zepto presets in `SourceAppSelector`
- Configurable cool-down periods (30M minimum)
- Quick-add for instant logging

### ✅ 3. Amazon/Flipkart "I didn't need this"

**Problem**: Online shopping cart abandonment isn't enough - you still buy later.

**Solution**:
- **24-Hour Cool-Down**: Standard for shopping (prevents same-day regret)
- **Source App Tracking**: Track which e-commerce site triggers you
- **Pattern Detection**: Identifies recurring shopping patterns
- **Regret Meter**: 24h check-in to see if purchase was worth it

**Features**:
- Amazon, Flipkart, Myntra presets
- Shopping category with regret tracking
- Pattern detection for recurring purchases

### ✅ 4. Sneakers/Gadgets (FOMO Buys)

**Problem**: Limited edition, flash sales create FOMO pressure.

**Solution**:
- **24-Hour Cool-Down**: Prevents FOMO-driven decisions
- **FOMO Emotion Tag**: Track when FOMO is the driver
- **Source App**: Nike, Adidas presets for sneakers
- **Pattern Detection**: Identifies FOMO purchase patterns

**Features**:
- FOMO emotion tag
- Shopping category with gadget/sneaker context
- Pattern detection for FOMO purchases

### ✅ 5. In-Game Purchases

**Problem**: Gaming microtransactions add up quickly.

**Solution**:
- **6-Hour Cool-Down**: Shorter for entertainment, but enough to reconsider
- **Source App**: "In-Game Purchase" preset
- **Entertainment Category**: Tracks gaming-related impulses
- **Regret Tracking**: See if in-game purchases were worth it

**Features**:
- In-Game Purchase preset
- Entertainment category
- Steam preset for game purchases

### ✅ 6. Meme Coin / Options Trading Impulses

**Problem**: Financial FOMO leads to risky trades.

**Solution**:
- **24-Hour Cool-Down**: Critical for financial decisions
- **Trading/Crypto Categories**: Separate tracking for financial impulses
- **Source App**: Trading App, Crypto Exchange presets
- **Regret Tracking**: See financial decision outcomes

**Features**:
- TRADING and CRYPTO categories
- Trading App and Crypto Exchange presets
- 24h cooldown for financial decisions

### ✅ 7. Digital Courses Impulsively Bought During Sales

**Problem**: Course sales create urgency, but courses go uncompleted.

**Solution**:
- **3-Day Cool-Down**: Longer period for expensive, non-urgent purchases
- **Source App**: Udemy, Coursera, Skillshare presets
- **COURSE Category**: Tracks educational purchases
- **Regret Tracking**: See if courses were actually used

**Features**:
- COURSE category
- 3-day cooldown suggestion for courses
- Educational platform presets

---

## Key Features That Support All Use Cases

### 1. **Source App Tracking** ✅
- Track which apps/platforms trigger your impulses
- Presets for common apps (Swiggy, Amazon, Blinkit, etc.)
- Category-based suggestions
- Pattern detection by source app

### 2. **Quick Add** ✅
- Fast logging before checkout
- Minimal friction
- Deep link support
- Pre-filled fields from shortcuts

### 3. **Configurable Cool-Down** ✅
- 30M for time-sensitive (Blinkit)
- 1H for food delivery (Swiggy/Zomato)
- 24H for shopping (Amazon/Flipkart)
- 3D for courses (Udemy/Coursera)

### 4. **Regret Tracking** ✅
- 24h check-in after execution
- Regret rating (1-5 scale)
- Regret rate calculation
- Category-based regret patterns

### 5. **Pattern Detection** ✅
- Identifies recurring impulse sources
- Time-based patterns (weak hours)
- Category-based patterns
- Source app patterns

### 6. **Smart Prompts** ✅
- Weak hour reminders
- Pattern-based alerts
- Active impulse reminders

---

## Implementation Status

| Use Case | Source App | Category | Cool-Down | Status |
|----------|------------|----------|-----------|--------|
| Swiggy/Zomato | ✅ | FOOD | 1H | ✅ Complete |
| Blinkit | ✅ | FOOD | 30M | ✅ Complete |
| Amazon/Flipkart | ✅ | SHOPPING | 24H | ✅ Complete |
| Sneakers/Gadgets | ✅ | SHOPPING | 24H | ✅ Complete |
| In-Game Purchases | ✅ | ENTERTAINMENT | 6H | ✅ Complete |
| Trading/Crypto | ✅ | TRADING/CRYPTO | 24H | ✅ Complete |
| Digital Courses | ✅ | COURSE | 3D | ✅ Complete |

---

## New Features Added

1. **Source App Selector Component** (`src/components/SourceAppSelector.tsx`)
   - Quick selection of common apps
   - Category-based suggestions
   - Popular presets

2. **Source App Presets** (`src/constants/sourceApps.ts`)
   - 15+ common app presets
   - Category mapping
   - Suggested cool-down periods
   - Icons and descriptions

3. **Integration in New Impulse Form**
   - Source app selection UI
   - Auto-suggestions based on category
   - Saves sourceApp to impulse data

---

**Status**: All use cases are fully supported! 🎉

