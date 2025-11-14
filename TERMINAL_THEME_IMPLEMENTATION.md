# Terminal/Radar Theme Implementation

## Overview

Added a **Terminal/Radar visual style** theme option to match 2025 dev aesthetics. This theme provides a dark, terminal-inspired interface with:

- Deep black backgrounds (#0A0A0A)
- Terminal green/cyan text colors (#00FF41)
- Monospace fonts for numbers/data
- Subtle scan line effects
- Glowing borders and accents
- Radar/terminal aesthetic throughout

---

## ✅ Implementation Complete

### 1. **Terminal Color Palette** ✅
- **File:** `src/constants/terminalColors.ts`
- **Features:**
  - Terminal green (#00FF41) for primary text
  - Terminal cyan for accents
  - Deep black backgrounds
  - Glow effects for cards
  - Scan line overlay colors

### 2. **Theme Context Enhancement** ✅
- **File:** `src/contexts/ThemeContext.tsx`
- **Changes:**
  - Added `'terminal'` as a theme mode option
  - Updated theme type to include `'terminal'`
  - Terminal theme automatically applied when selected

### 3. **Terminal Visual Effects** ✅
- **Files:**
  - `src/components/TerminalScanLine.tsx` - Animated scan line effect
  - `src/components/TerminalGlow.tsx` - Pulsing glow effects for cards
  - `src/components/TerminalBackground.tsx` - Background wrapper with scan lines

### 4. **Typography Enhancement** ✅
- **File:** `src/utils/terminalTypography.ts`
- **Features:**
  - Monospace font (Courier) for numbers/data in terminal mode
  - Terminal-specific text styling
  - Helper functions for terminal text styles

### 5. **Component Updates** ✅
- **Card Component:** Glowing borders in terminal mode
- **MonthlyDashboardCard:** Monospace font for numbers
- **ImpulsesBreakdownCard:** Terminal styling for stats
- **InsightsCard:** Terminal styling
- **CountdownTimer:** Terminal-style display
- **Dashboard:** Terminal background and glow effects

### 6. **Settings Integration** ✅
- **File:** `app/(tabs)/settings.tsx`
- **Changes:**
  - Added "Terminal" theme option
  - Terminal icon in theme selector
  - Special styling for terminal option

### 7. **StatusBar Update** ✅
- **File:** `app/_layout.tsx`
- **Changes:**
  - StatusBar uses light style for terminal theme

---

## 🎨 Visual Features

### Terminal Aesthetics:
1. **Deep Black Background** - #0A0A0A (radar screen feel)
2. **Terminal Green Text** - #00FF41 (classic terminal color)
3. **Monospace Fonts** - Courier for numbers/data
4. **Scan Line Effect** - Subtle animated line moving down screen
5. **Glowing Borders** - Cards have subtle green glow
6. **Pulsing Effects** - Gentle glow animations on key elements

### Color Scheme:
- **Primary:** Terminal Cyan (#26ABFF)
- **Success:** Terminal Green (#00FF41)
- **Warning:** Terminal Amber (#F59E0B)
- **Error:** Terminal Red (#EF4444)
- **Background:** Deep Black (#0A0A0A)
- **Surface:** Dark Gray (#121212)

---

## 📱 Usage

### Enable Terminal Theme:
1. Go to **Settings**
2. Find **Appearance** section
3. Select **Terminal** option

### Visual Effects:
- Scan lines automatically animate when terminal theme is active
- Cards have glowing borders
- Numbers use monospace font
- All text uses terminal green color scheme

---

## 🔧 Technical Details

### Theme Selection:
```typescript
const { themeMode, setThemeMode } = useTheme();
setThemeMode('terminal'); // Enable terminal theme
```

### Terminal-Specific Styling:
```typescript
const { theme } = useTheme();
const isTerminal = theme === 'terminal';
const terminalStyle = getTerminalTextStyle(isTerminal);
```

### Components:
- `<TerminalBackground>` - Wraps screens with scan line effect
- `<TerminalGlow>` - Adds pulsing glow to cards
- `<TerminalScanLine>` - Animated scan line overlay

---

## ✅ Status

**All terminal/radar theme features implemented!**

The app now supports:
- ✅ Light theme (default)
- ✅ Dark theme
- ✅ System theme (follows device)
- ✅ **Terminal theme** (NEW - 2025 dev aesthetics)

Users can switch between themes in Settings → Appearance.

