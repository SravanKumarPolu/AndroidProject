# Build & Test Guide - Step by Step 🚀

## Prerequisites Check

### ✅ What You Need

1. **Expo Account** (free) - https://expo.dev/signup
2. **Android Device** (for testing) OR **Android Emulator**
3. **Internet Connection** (for EAS Build)

---

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

**Verify installation:**
```bash
eas --version
```

---

## Step 2: Login to Expo

```bash
eas login
```

**If you don't have an account:**
1. Go to https://expo.dev/signup
2. Create a free account
3. Run `eas login` again

---

## Step 3: Configure EAS Project (First Time Only)

```bash
eas build:configure
```

This will:
- Ask if you want to set up EAS Build (yes)
- Create/update `eas.json` (already exists, will be updated)
- Link your project to Expo

---

## Step 4: Build APK

### Option A: Preview Build (Recommended for Testing)

```bash
eas build --platform android --profile preview
```

**What happens:**
1. EAS uploads your code
2. Builds APK in the cloud (~15-20 minutes)
3. Provides download link when done

**After build completes:**
- You'll get a download link
- Download the APK to your computer
- Transfer to Android device

### Option B: Development Build (For Testing with Dev Client)

```bash
eas build --platform android --profile development
```

---

## Step 5: Install APK on Android Device

### Method 1: Direct Transfer (Easiest)

1. **Download APK** from EAS build link
2. **Transfer to device:**
   - Email to yourself
   - Use Google Drive/Dropbox
   - USB cable transfer
   - AirDrop (if Mac + Android with Nearby Share)

3. **On Android device:**
   - Open file manager
   - Find the APK file
   - Tap to install
   - Allow "Install from unknown sources" if prompted
   - Install

### Method 2: ADB (If you have Android SDK)

```bash
# Install ADB (if not installed)
# macOS: brew install android-platform-tools
# Or download Android Studio and use its SDK

# Connect device via USB
# Enable USB debugging on device

# Install APK
adb install path/to/app.apk
```

---

## Step 6: Test Shortcuts

### On Android Device:

1. **Find ImpulseVault icon** on home screen or app drawer
2. **Long-press** the icon (hold for 1-2 seconds)
3. **Shortcut menu appears** with "Quick Add"
4. **Tap "Quick Add"**
5. **Expected:** App opens directly to Quick Add screen

### ✅ Success Indicators:
- ✅ Shortcut appears when long-pressing icon
- ✅ Tapping shortcut opens Quick Add screen
- ✅ No intermediate screens
- ✅ Form is ready to use

---

## Step 7: Test Deep Linking

### Option A: ADB Command (If ADB is installed)

```bash
# Test Quick Add deep link
adb shell am start -W -a android.intent.action.VIEW -d "impulsevault://quick-add" com.impulsevault.app
```

**Expected:**
- App opens (or comes to foreground)
- Navigates to Quick Add screen
- No crashes

### Option B: Browser Test

1. **On Android device**, open browser
2. **Type in address bar:** `impulsevault://quick-add`
3. **Tap "Go"** or "Enter"
4. **Should prompt:** "Open in ImpulseVault?"
5. **Tap "Open"**
6. **Expected:** App opens to Quick Add screen

### Option C: Use Deep Link Tester App

1. Install "Deep Link Tester" from Play Store
2. Enter: `impulsevault://quick-add`
3. Tap "Test"
4. App should open

---

## Step 8: Verify Everything Works

### ✅ Complete Testing Checklist

#### Shortcuts
- [ ] Long-press icon → "Quick Add" appears
- [ ] Tap shortcut → Opens Quick Add screen
- [ ] No intermediate screens
- [ ] Form is functional

#### Deep Linking
- [ ] `impulsevault://quick-add` works
- [ ] Works when app is closed
- [ ] Works when app is in background
- [ ] Works when app is in foreground
- [ ] No crashes

#### App Functionality
- [ ] App opens normally
- [ ] Home screen loads
- [ ] Can create impulse
- [ ] Can view history
- [ ] Settings work
- [ ] Analytics work

---

## Troubleshooting

### Build Issues

**"EAS not found"**
```bash
npm install -g eas-cli
```

**"Not logged in"**
```bash
eas login
```

**"Project not configured"**
```bash
eas build:configure
```

### Installation Issues

**"App not installing"**
- Check Android version (7.1+ required)
- Enable "Install from unknown sources"
- Check APK file is not corrupted

**"Shortcut not appearing"**
- Ensure native build (not Expo Go)
- Reinstall app
- Clear app data: Settings → Apps → ImpulseVault → Clear Data

### Deep Link Issues

**"Deep link not working"**
- Check `app.json` has `"scheme": "impulsevault"`
- Verify app is installed
- Test with ADB command first
- Check logs: `adb logcat | grep -E "ReactNativeJS|ExpoLinking"`

---

## Quick Commands Reference

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure (first time)
eas build:configure

# Build APK
eas build --platform android --profile preview

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]
```

---

## Alternative: Local Build (Advanced)

If you prefer local build:

### Prerequisites:
- Android Studio installed
- Android SDK (API 33+)
- Java JDK

### Steps:

```bash
# Generate native code
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease

# APK location
# android/app/build/outputs/apk/release/app-release.apk
```

---

## Next Steps After Testing

1. ✅ **Fix any issues** found during testing
2. ✅ **Update version** in `app.json` if needed
3. ✅ **Build production APK** when ready
4. ✅ **Submit to Play Store** (when ready)

---

## Support

- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Expo Forums:** https://forums.expo.dev/
- **Android Testing Guide:** See `ANDROID_TESTING_GUIDE.md`

---

**Ready to build!** 🎉

