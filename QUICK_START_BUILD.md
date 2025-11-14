# Quick Start - Build APK in 3 Steps 🚀

## Step 1: Install & Login (One Time)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo (create account at https://expo.dev/signup if needed)
eas login
```

---

## Step 2: Configure Project (One Time)

```bash
eas build:configure
```

**Answer prompts:**
- Set up EAS Build? → **Yes**
- Use existing eas.json? → **Yes** (we already created it)

---

## Step 3: Build APK

```bash
# Build preview APK (for testing)
npm run build:android:preview

# OR directly:
eas build --platform android --profile preview
```

**Wait ~15-20 minutes** → Get download link → Install on device

---

## Install & Test

### Install APK
1. Download APK from EAS build link
2. Transfer to Android device
3. Tap to install
4. Allow "Install from unknown sources" if prompted

### Test Shortcuts
1. Long-press app icon
2. Tap "Quick Add" shortcut
3. Should open Quick Add screen ✅

### Test Deep Link
```bash
# If you have ADB installed:
adb shell am start -W -a android.intent.action.VIEW -d "impulsevault://quick-add" com.impulsevault.app

# OR use browser on device:
# Type: impulsevault://quick-add
```

---

## That's It! 🎉

**Full guide:** See `BUILD_AND_TEST.md` for detailed instructions.

---

## Troubleshooting

**EAS not found?**
```bash
npm install -g eas-cli
```

**Not logged in?**
```bash
eas login
```

**Build failed?**
- Check `eas.json` exists
- Run `eas build:configure` again
- Check Expo account is active

---

**Ready to build!** 🚀

