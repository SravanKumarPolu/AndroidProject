# ImpulseVault Web - React + Vite + Capacitor

Modern web-based implementation of ImpulseVault with glassmorphism UI, built for PWA and mobile apps.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Fast build tool
- **Tailwind CSS** + **DaisyUI** - Styling with glassmorphism
- **Zustand** - State management
- **IndexedDB** (via idb) - Local-first storage
- **React Router** - SPA routing
- **Capacitor** - Native mobile wrapper
- **Recharts** - Charts for stats
- **Framer Motion** - Animations

## Features

✅ Full SPA with routing (Home, New Impulse, Cooldown, Decision, History, Stats, Settings)
✅ Local-first architecture with IndexedDB
✅ Glassmorphism UI with neon gradients
✅ Bottom tab navigation (Android style)
✅ Responsive design for mobile
✅ PWA support
✅ Capacitor ready for Android/iOS

## Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Capacitor Setup

```bash
# Sync web build to native projects
npm run cap:sync

# Open Android Studio
npm run cap:open:android

# Open Xcode
npm run cap:open:ios
```

## Project Structure

```
src/
  components/
    ui/          # Reusable UI components
    Layout.tsx   # Main layout with tabs
  pages/         # Route pages
  store/         # Zustand store + IndexedDB
  types/          # TypeScript types
  utils/          # Utility functions
```

## Data Model

```typescript
interface Impulse {
  id: string;
  title: string;
  price: number;
  category: ImpulseCategory;
  reason?: string;
  urgency: UrgencyLevel;
  createdAt: number;
  cooldownEndsAt: number;
  status: 'pending' | 'cooldown' | 'decision' | 'skipped' | 'bought';
  decisionAt?: number;
  finalDecision?: 'skip' | 'buy' | 'save-later';
}
```

## State Flow

1. **Add Impulse** → Status: `cooldown`
2. **Cooldown Period** → Timer counts down
3. **Cooldown Complete** → Status: `decision`
4. **Make Decision** → Status: `skipped` | `bought` | `pending` (save-later)

## Development

- Hot reload enabled
- TypeScript strict mode
- ESLint configured
- Responsive breakpoints: mobile-first

## Build & Deploy

1. Build: `npm run build`
2. Deploy `dist/` to any static host (Vercel, Netlify, etc.)
3. For mobile: Run `npm run cap:sync` then build native apps

