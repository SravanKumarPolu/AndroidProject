# 🚀 Build & Test Instructions

## Quick Start (3 Steps)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Build APK:**
   ```bash
   npm run build:android:preview
   ```

**That's it!** Wait ~15-20 minutes, then download and install the APK.

---

## Detailed Guides

- **📖 Full Guide:** `BUILD_AND_TEST.md` - Complete step-by-step instructions
- **⚡ Quick Start:** `QUICK_START_BUILD.md` - Minimal steps to get started
- **🧪 Testing Guide:** `ANDROID_TESTING_GUIDE.md` - How to test shortcuts and deep links
- **📋 Quick Commands:** `QUICK_TEST_COMMANDS.md` - Command reference

---

## Available Build Commands

```bash
# Preview build (for testing)
npm run build:android:preview

# Production build
npm run build:android:production

# Development build (with dev client)
npm run build:android:dev
```

---

## Testing Checklist

After installing APK:

- [ ] **Shortcuts:** Long-press icon → "Quick Add" appears
- [ ] **Deep Link:** `impulsevault://quick-add` opens Quick Add screen
- [ ] **App:** Opens normally, all features work

---

## Need Help?

- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Expo Forums:** https://forums.expo.dev/
- **See:** `BUILD_AND_TEST.md` for troubleshooting

---

**Ready to build!** 🎉

