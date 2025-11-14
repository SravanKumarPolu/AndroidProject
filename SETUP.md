# ImpulseVault Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

Then press:
- `a` for Android
- `i` for iOS
- `w` for web

### 3. Run on Device/Emulator

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (installed globally or via npx)
- Android Studio (for Android) or Xcode (for iOS)

## 🛠️ Development

### Project Structure

```
impulsevault/
├── app/                    # Expo Router (file-based routing)
│   ├── (tabs)/            # Tab navigation screens
│   ├── new-impulse.tsx    # Modal: Create new impulse
│   └── review-impulse/    # Review flow screens
├── src/
│   ├── components/        # React components
│   ├── constants/         # Design system constants
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Business logic
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
└── assets/              # Images, fonts, etc.
```

### Key Files

- `app/(tabs)/index.tsx` - Home screen
- `app/(tabs)/history.tsx` - History screen
- `app/new-impulse.tsx` - New impulse form
- `src/hooks/useImpulses.ts` - Impulse management hook
- `src/services/storage.ts` - Local storage service
- `src/services/notifications.ts` - Push notifications

## 🎨 Design System

### Colors
- Primary: Indigo (#6366F1)
- Success: Green (#10B981)
- Error: Red (#EF4444)
- Accent: Orange (#F59E0B)

### Typography
- System fonts (native)
- Sizes: xs (12), sm (14), base (16), lg (18), xl (20), 2xl (24), 3xl (30), 4xl (36)

### Spacing
- 4px grid system
- Common: xs (4), sm (8), md (12), base (16), lg (20), xl (24), 2xl (32)

## 📱 Features Implemented

✅ Core data model (TypeScript types)
✅ Local storage (AsyncStorage)
✅ Push notifications setup
✅ Home screen with stats
✅ History screen with filters
✅ New impulse form
✅ Review flow (skip/execute)
✅ Statistics computation
✅ Countdown timers

## 🔧 Next Steps

1. **Add proper icons** - Replace emoji icons with react-native-vector-icons
2. **Add animations** - Use react-native-reanimated for smooth transitions
3. **Polish UI** - Add micro-interactions, loading states
4. **Testing** - Add unit tests for utilities
5. **Error handling** - Improve error states and recovery

## 🐛 Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### Android build issues
```bash
cd android && ./gradlew clean && cd ..
```

### iOS build issues
```bash
cd ios && pod install && cd ..
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

---

**Ready to build!** 🎯

