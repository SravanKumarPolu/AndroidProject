# 🎯 Action Plan - Build & Test Android APK

## ✅ Current Status

- ✅ **Deep linking configured** (`impulsevault://`)
- ✅ **Android shortcuts configured** (Quick Add)
- ✅ **Deep link handler implemented** (with error handling)
- ✅ **EAS build config ready** (`eas.json`)
- ✅ **Build scripts added** (`package.json`)

---

## 🚀 Next Steps (In Order)

### Step 1: Install EAS CLI ⏱️ 2 minutes

```bash
npm install -g eas-cli
```

**Verify:**
```bash
eas --version
```

---

### Step 2: Login to Expo ⏱️ 1 minute

```bash
eas login
```

**If no account:**
1. Go to https://expo.dev/signup
2. Create free account
3. Run `eas login` again

---

### Step 3: Configure EAS Build ⏱️ 2 minutes

```bash
eas build:configure
```

**Answer prompts:**
- Set up EAS Build? → **Yes**
- Use existing eas.json? → **Yes**

---

### Step 4: Build APK ⏱️ 15-20 minutes

```bash
npm run build:android:preview
```

**OR:**
```bash
eas build --platform android --profile preview
```

**What to expect:**
1. Code uploads to EAS
2. Build starts in cloud
3. Wait ~15-20 minutes
4. Get download link when done

**Monitor progress:**
- Link appears in terminal
- Or check: https://expo.dev/accounts/[your-account]/projects/impulsevault/builds

---

### Step 5: Download APK ⏱️ 1 minute

1. **Copy download link** from terminal
2. **Open in browser**
3. **Download APK file**
4. **Save to easy location** (Desktop, Downloads)

---

### Step 6: Install on Android Device ⏱️ 2 minutes

**Method 1: Direct Transfer (Easiest)**
1. **Email APK** to yourself
2. **Open email on Android device**
3. **Download APK**
4. **Tap to install**
5. **Allow "Install from unknown sources"** if prompted

**Method 2: USB Transfer**
1. **Connect device via USB**
2. **Copy APK to device**
3. **Open file manager on device**
4. **Tap APK to install**

**Method 3: Cloud Storage**
1. **Upload to Google Drive/Dropbox**
2. **Download on device**
3. **Install**

---

### Step 7: Test Shortcuts ⏱️ 1 minute

1. **Find ImpulseVault icon** on device
2. **Long-press icon** (hold 1-2 seconds)
3. **"Quick Add" shortcut appears**
4. **Tap "Quick Add"**
5. **✅ Should open Quick Add screen**

**Success:** Shortcut works! ✅

---

### Step 8: Test Deep Linking ⏱️ 2 minutes

**Option A: Browser Test (Easiest)**
1. **Open browser on device**
2. **Type:** `impulsevault://quick-add`
3. **Tap "Go"**
4. **Should prompt:** "Open in ImpulseVault?"
5. **Tap "Open"**
6. **✅ Should open Quick Add screen**

**Option B: ADB (If installed)**
```bash
adb shell am start -W -a android.intent.action.VIEW -d "impulsevault://quick-add" com.impulsevault.app
```

**Success:** Deep link works! ✅

---

### Step 9: Verify Everything ⏱️ 5 minutes

**Complete Testing Checklist:**

#### Shortcuts ✅
- [ ] Long-press icon → "Quick Add" appears
- [ ] Tap shortcut → Opens Quick Add screen
- [ ] No intermediate screens
- [ ] Form is functional

#### Deep Linking ✅
- [ ] `impulsevault://quick-add` works
- [ ] Works when app is closed
- [ ] Works when app is in background
- [ ] Works when app is in foreground
- [ ] No crashes

#### App Functionality ✅
- [ ] App opens normally
- [ ] Home screen loads
- [ ] Can create impulse
- [ ] Can view history
- [ ] Settings work
- [ ] Analytics work

---

## 📋 Quick Reference

### Build Commands
```bash
# Preview (for testing)
npm run build:android:preview

# Production
npm run build:android:production

# Development
npm run build:android:dev
```

### Test Commands
```bash
# Deep link test (if ADB installed)
adb shell am start -W -a android.intent.action.VIEW -d "impulsevault://quick-add" com.impulsevault.app

# View logs
adb logcat | grep -E "ReactNativeJS|ExpoLinking"
```

---

## 🐛 Troubleshooting

### Build Issues

**"EAS not found"**
```bash
npm install -g eas-cli
```

**"Not logged in"**
```bash
eas login
```

**"Build failed"**
- Check internet connection
- Verify `eas.json` exists
- Run `eas build:configure` again
- Check Expo account is active

### Installation Issues

**"App not installing"**
- Enable "Install from unknown sources"
- Check Android version (7.1+ required)
- Try downloading APK again

**"Shortcut not appearing"**
- Ensure native build (not Expo Go)
- Reinstall app
- Clear app data

### Deep Link Issues

**"Deep link not working"**
- Check `app.json` has `"scheme": "impulsevault"`
- Verify app is installed
- Test with browser first
- Check console logs

---

## 📚 Documentation

- **📖 Full Guide:** `BUILD_AND_TEST.md`
- **⚡ Quick Start:** `QUICK_START_BUILD.md`
- **🧪 Testing:** `ANDROID_TESTING_GUIDE.md`
- **📋 Commands:** `QUICK_TEST_COMMANDS.md`

---

## ✅ Success Criteria

**You're done when:**
- ✅ APK builds successfully
- ✅ APK installs on device
- ✅ Shortcuts work (long-press → Quick Add)
- ✅ Deep linking works (`impulsevault://quick-add`)
- ✅ App functions normally

---

## 🎉 Next Steps After Testing

1. **Fix any issues** found during testing
2. **Update version** in `app.json` if needed
3. **Build production APK** when ready
4. **Submit to Play Store** (when ready)

---

**Ready to start!** Begin with Step 1 above. 🚀

