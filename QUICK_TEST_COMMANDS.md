# Quick Test Commands 🚀

## Build APK

### EAS Build (Cloud - Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build APK
eas build --platform android --profile preview
```

### Local Build (Requires Android Studio)
```bash
# Generate native code
npx expo prebuild --platform android

# Build APK
cd android && ./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

---

## Install & Test

### Install APK
```bash
adb install app-release.apk
# Or drag APK to device
```

### Uninstall
```bash
adb uninstall com.impulsevault.app
```

---

## Test Deep Linking

### Quick Add
```bash
adb shell am start -W -a android.intent.action.VIEW -d "impulsevault://quick-add" com.impulsevault.app
```

### Home
```bash
adb shell am start -W -a android.intent.action.VIEW -d "impulsevault://" com.impulsevault.app
```

---

## View Logs

### React Native Logs
```bash
adb logcat | grep -E "ReactNativeJS|ExpoLinking|ImpulseVault"
```

### All Logs
```bash
adb logcat
```

### Clear Logs
```bash
adb logcat -c
```

---

## Clear App Data
```bash
adb shell pm clear com.impulsevault.app
```

---

## Test Shortcuts

1. **Long-press** app icon on device
2. **Tap** "Quick Add" shortcut
3. Should open Quick Add screen

---

## Verify Configuration

### Check Deep Link Scheme
```bash
adb shell dumpsys package com.impulsevault.app | grep -A 5 "scheme"
```

### Check App Info
```bash
adb shell dumpsys package com.impulsevault.app | grep -E "versionName|versionCode"
```

---

## Quick Test Flow

```bash
# 1. Install
adb install app-release.apk

# 2. Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "impulsevault://quick-add" com.impulsevault.app

# 3. Check logs
adb logcat | grep -E "ReactNativeJS|Deep link"

# 4. Test shortcut (manually on device)
# Long-press icon → Tap "Quick Add"
```

---

## Troubleshooting

### App Not Installing
```bash
# Uninstall first
adb uninstall com.impulsevault.app
# Then install
adb install app-release.apk
```

### Deep Link Not Working
```bash
# Check if app is installed
adb shell pm list packages | grep impulsevault

# Test deep link again
adb shell am start -W -a android.intent.action.VIEW -d "impulsevault://quick-add" com.impulsevault.app
```

### View App Permissions
```bash
adb shell dumpsys package com.impulsevault.app | grep permission
```

---

**Ready to test!** 🎉

