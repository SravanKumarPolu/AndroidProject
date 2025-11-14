# ImpulseVault

**Lock your impulses. Free your future.**

A modern, Android-first app that helps you avoid impulsive purchases by enforcing a cool-down period and tracking regrets.

## 🎯 Concept

ImpulseVault is not another expense tracker. It's a **pre-spend intervention app** that:
- Catches you **before** you buy (not after)
- Enforces a 24-hour cool-down period
- Tracks which purchases you regret
- Shows how much money you've saved

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development) or Xcode (for iOS)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 📁 Project Structure

```
impulsevault/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home screen
│   │   └── history.tsx    # History screen
│   ├── new-impulse.tsx    # New impulse form
│   └── review-impulse/    # Review flow
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # Base UI components
│   │   ├── ImpulseCard.tsx
│   │   └── StatsCard.tsx
│   ├── constants/        # Constants (colors, typography, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Business logic (storage, notifications)
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── assets/              # Images, fonts, etc.
└── package.json
```

## 🏗️ Architecture

### Tech Stack

- **React Native + Expo** - Cross-platform framework
- **TypeScript** - Type safety
- **Expo Router** - File-based routing
- **AsyncStorage** - Local data persistence
- **Expo Notifications** - Push notifications
- **React Hooks** - State management

### Design System

- **Colors**: Modern indigo primary, warm accents
- **Typography**: System fonts, clean hierarchy
- **Spacing**: 4px grid system
- **Components**: Reusable, accessible UI components

## 📱 Features (MVP)

- ✅ Log impulses before buying
- ✅ 24-hour cool-down timer
- ✅ Review after cool-down (Skip/Execute)
- ✅ Regret tracking (24h after execution)
- ✅ Statistics (money saved, regret rate, streaks)
- ✅ History with filters
- ✅ Push notifications

## 🎨 Design Principles

1. **Frictionless** - Log impulses in <10 seconds
2. **Supportive** - Positive, non-shaming copy
3. **Story-driven** - Stats tell narratives, not just numbers
4. **Modern** - Clean, elegant, delightful UI

## 📊 Data Model

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
  skippedFeeling?: 'RELIEVED' | 'NEUTRAL' | 'STILL_CRAVING';
}
```

## 🧪 Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## 📝 License

Private - All rights reserved

## 🙏 Acknowledgments

Built with modern best practices and a focus on user psychology and behavior change.

---

**Status**: MVP in development 🚧

