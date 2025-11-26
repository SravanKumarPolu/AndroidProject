# ImpulseVault

**Lock your impulses. Free your future.**

A modern, cross-platform app (Android, iOS, Web) that helps you avoid impulsive purchases by enforcing a configurable cool-down period and tracking regrets.

## 🎯 Concept

ImpulseVault is not another expense tracker. It's a **pre-spend intervention app** that:
- Catches you **before** you buy (not after)
- Enforces a 24-hour cool-down period
- Tracks which purchases you regret
- Shows how much money you've saved

## 🎨 Branding Customization

**Want to customize the app name, icons, and branding?**

1. **Quick Check**: Run `npm run check:branding` to see current status
2. **Full Guide**: See [BRANDING_GUIDE.md](./BRANDING_GUIDE.md) for complete instructions
3. **Quick Update**: Edit `src/constants/app.ts` and `app.json` for basic changes
4. **Icons**: Replace files in `assets/` folder (icon.png, adaptive-icon.png, favicon.png)

**Current Branding:**
- App Name: "ImpulseVault – Stop Regret Buys"
- Display Name: "ImpulseVault"
- Icons: ✅ Present (icon.png, adaptive-icon.png, favicon.png)
- Package: com.impulsevault.app

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
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

# Run on Web
npm run web
```

When the server starts, you'll see a QR code. Use:
- **Expo Go app** on your phone (scan QR code)
- **Android Emulator** (press `a` in terminal)
- **iOS Simulator** (press `i` in terminal)
- **Web Browser** (press `w` in terminal or run `npm run web`)

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

- **React Native + Expo** - Cross-platform framework (Android, iOS, Web)
- **TypeScript** - Type safety
- **Expo Router** - File-based routing
- **AsyncStorage** - Local data persistence
- **Expo Notifications** - Push notifications (Android/iOS)
- **React Hooks** - State management
- **Supabase** - Optional cloud sync
- **react-native-web** - Web platform support

### Design System

- **Colors**: Modern indigo primary, warm accents
- **Typography**: System fonts, clean hierarchy
- **Spacing**: 4px grid system
- **Components**: Reusable, accessible UI components

## 📱 Features

### Core Features
- ✅ **5-Step User Flow**: Entry → Cool-Down → Reflection → Decision → Results
- ✅ **Impulse Entry**: Quick logging with source app tracking (40+ apps)
- ✅ **Cool-Down Timer**: Configurable 10 minutes to 3 days
- ✅ **Reflection Questions**: Post-cool-down decision prompts
- ✅ **Decision Options**: Skip, Buy Anyway, Save for Later
- ✅ **Results & Insights**: Skip celebration, regret analysis (3 days)
- ✅ **Savings Visualization**: Real-time savings tracking with fun equivalents
- ✅ **Impulse Control Score**: Control score with trends and insights

### User Personas (Auto-Detected)
- ✅ **Students (18-25)**: Food, shopping, gaming impulses
- ✅ **IT Professionals (25-35)**: Amazon, gadgets, courses, delivery apps
- ✅ **Crypto/Options Traders**: High-risk financial decisions
- ✅ **General Public**: Subscriptions, entertainment, travel

### Analytics & Impact
- ✅ **30-60 Day Impact Metrics**: Spending reduction, savings rate, discipline score
- ✅ **Regret Avoidance**: Regret rate tracking and improvement
- ✅ **Goal Progress**: Savings goals with progress tracking
- ✅ **Trigger Awareness**: Emotional trigger identification

### Additional Features
- ✅ Statistics (money saved, regret rate, streaks)
- ✅ History with filters
- ✅ Push notifications (Android/iOS only, 3-day regret check)
- ✅ Cloud sync (optional, via Supabase)
- ✅ Android widgets (Android only)
- ✅ Deep linking support

## 🌐 Platform Support

### Android & iOS
Full feature support including:
- Push notifications
- Image picker (camera & gallery)
- Location tracking
- Native widgets (Android)
- All core features

### Web
Core features work on web, with some limitations:
- ✅ All core impulse tracking features
- ✅ Statistics and analytics
- ✅ History and filters
- ✅ Cloud sync
- ⚠️ **Push notifications** - Not available (web notifications may work in future)
- ⚠️ **Image picker** - Limited (file input instead of native picker)
- ⚠️ **Location tracking** - Requires browser permissions (may have limited accuracy)
- ⚠️ **Native widgets** - Not available

**Note**: Web support is best for viewing and managing your data. For the full experience with notifications and native features, use the mobile apps.

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

## 🔨 Building & Testing

### Development Build

```bash
# Start Metro bundler
npm start

# In another terminal, run on device
npm run android

# Or run on web
npm run web
```

### Android Studio Build (Recommended)

1. **Open Project:**
   - Launch Android Studio
   - File → Open → Select `android` folder
   - Wait for Gradle sync to complete

2. **Start Metro:**
   ```bash
   npm start
   ```
   Keep this terminal open!

3. **Build & Run:**
   - In Android Studio, select "app" from run configuration
   - Select your emulator/device
   - Click Run (▶️) or press `Shift + F10`

### EAS Build (Cloud Build)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure (first time only)
eas build:configure
# This will generate a project ID and update app.json automatically

# Build APK
eas build --platform android --profile preview
```

**Note**: After running `eas build:configure`, the `projectId` in `app.json` will be automatically updated. If you see `"your-project-id"` in `app.json`, run `eas build:configure` to set it up.

After build completes, download the APK and install on your device.

### Local Build (Advanced)

```bash
# Generate native code
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

### Web Build

```bash
# Start web development server
npm run web

# The app will open in your default browser at http://localhost:8081
# Or press 'w' in the Expo CLI to open web
```

**Web Production Build:**
```bash
# Build for production
npx expo export:web

# The built files will be in the 'web-build' directory
# You can deploy this to any static hosting service (Vercel, Netlify, etc.)
```

## ☁️ Supabase Setup (Optional Cloud Sync)

### Why Supabase?

**Free Tier:**
- ✅ 50,000 monthly active users
- ✅ 500 MB database storage
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth
- ✅ **Perfect for MVP - FREE!**

### Setup Steps

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Sign up (free)
   - Create new project
   - Wait for initialization (~2 minutes)

2. **Get API Credentials:**
   - In Supabase project: Settings → API
   - Copy **Project URL** and **anon public key**

3. **Create Database Tables:**
   - Go to SQL Editor in Supabase
   - Run the following SQL:

```sql
-- Create impulses table
CREATE TABLE IF NOT EXISTS impulses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC,
  emotion TEXT,
  urgency TEXT NOT NULL,
  cool_down_period TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  review_at BIGINT NOT NULL,
  status TEXT NOT NULL,
  executed_at BIGINT,
  final_feeling TEXT,
  skipped_feeling TEXT,
  notes TEXT,
  source_app TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  user_id UUID PRIMARY KEY,
  settings JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE impulses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only see their own data)
CREATE POLICY "Users can view own impulses"
  ON impulses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own impulses"
  ON impulses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own impulses"
  ON impulses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own impulses"
  ON impulses FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings"
  ON settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON settings FOR UPDATE
  USING (auth.uid() = user_id);
```

4. **Configure Environment Variables:**
   - Copy `.env.example` to `.env` in project root (or create `.env` file):
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
   - Add `.env` to `.gitignore` (already done)
   - **Note**: If `.env.example` doesn't exist, create a `.env` file with the variables above

5. **Enable Cloud Sync:**
   - Open app → Settings tab
   - Toggle **Cloud Sync** ON
   - Data syncs automatically every 5 minutes

## 🧪 Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm test

# Clear Metro cache
npm start -- --reset-cache
```

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

### Gradle sync fails
- Check internet connection
- File → Invalidate Caches → Restart
- Build → Clean Project

### App crashes on launch
- Check Metro is running: `npm start`
- View → Tool Windows → Logcat (check for errors)

## 📝 Privacy Policy

See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) for complete privacy policy.

**Key Points:**
- Data stored locally by default
- Cloud sync is optional
- No data sold to third parties
- GDPR and CCPA compliant
- Row Level Security (RLS) for cloud data

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Supabase Documentation](https://supabase.com/docs)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## 📖 Additional Documentation

- [API Documentation](./docs/API.md) - Complete API reference
- [Component Documentation](./docs/COMPONENTS.md) - Component usage guide
- [Setup Guide](./docs/SETUP.md) - Setup and configuration
- [Improvements Summary](./IMPROVEMENTS_SUMMARY.md) - Recent improvements
- [Final Improvements](./FINAL_IMPROVEMENTS.md) - Latest enhancements

## 📝 License

Private - All rights reserved

## 🙏 Acknowledgments

Built with modern best practices and a focus on user psychology and behavior change.

---

**Status**: Production Ready ✅
