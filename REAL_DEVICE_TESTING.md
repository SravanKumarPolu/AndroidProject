# Real Device Testing Guide 📱

## Overview

This guide helps you test ImpulseVault on a real Android device to ensure everything works correctly.

---

## Prerequisites

### 1. Build APK
- Follow `BUILD_AND_TEST.md` to build APK
- Or use `npm run build:android:preview`

### 2. Android Device
- Android 7.1+ (API 25+)
- USB debugging enabled
- Or use wireless ADB

---

## Installation

### Method 1: Direct Install (Easiest)

1. **Download APK** from EAS build
2. **Transfer to device:**
   - Email to yourself
   - Google Drive/Dropbox
   - USB cable
   - Nearby Share (Android)

3. **Install:**
   - Open file manager
   - Tap APK
   - Allow "Install from unknown sources"
   - Install

### Method 2: ADB Install

```bash
# Connect device via USB
adb devices

# Install APK
adb install app-release.apk
```

---

## Testing Checklist

### ✅ Core Functionality

#### 1. App Launch
- [ ] App opens without crashes
- [ ] Onboarding shows (first time)
- [ ] Can skip/complete onboarding
- [ ] Home screen loads

#### 2. Create Impulse
- [ ] Can open "New Impulse" form
- [ ] All fields work (title, category, price, emotion, urgency)
- [ ] Cool-down period selection works
- [ ] Can save impulse
- [ ] Impulse appears on home screen

#### 3. Quick Add
- [ ] Quick Add shortcut works (long-press icon)
- [ ] Quick Add form opens
- [ ] Can create impulse quickly
- [ ] Deep link works (`impulsevault://quick-add`)

#### 4. Review Flow
- [ ] Countdown timer displays
- [ ] Notification appears when cool-down ends
- [ ] Can review impulse (Skip/Execute)
- [ ] Skip flow works (feeling check)
- [ ] Execute flow works
- [ ] Regret check appears after 24h

#### 5. Statistics
- [ ] Stats card displays correctly
- [ ] Money saved shows
- [ ] Regret rate shows
- [ ] Streak counter works
- [ ] Weekly review card shows

#### 6. History
- [ ] History screen loads
- [ ] All impulses visible
- [ ] Filters work (All, Saved, Executed, Regretted)
- [ ] Can view impulse details

#### 7. Analytics
- [ ] Analytics screen loads
- [ ] All 3 chart types work
- [ ] Charts display data correctly
- [ ] Switching between charts works

#### 8. Settings
- [ ] Settings screen loads
- [ ] Strict mode toggle works
- [ ] Export data works (CSV/JSON)
- [ ] Cloud sync toggle works (if configured)
- [ ] App info displays

---

### ✅ Notifications

#### 1. Permissions
- [ ] Notification permission requested
- [ ] Permission granted/denied handled gracefully

#### 2. Cool-Down Notifications
- [ ] Notification appears when cool-down ends
- [ ] Notification text is correct
- [ ] Tapping notification opens review screen
- [ ] Notification timing is accurate

#### 3. Regret Check Notifications
- [ ] Notification appears 24h after execution
- [ ] Notification text is correct
- [ ] Tapping notification opens regret check
- [ ] Can mark regret/worth it

#### 4. Smart Prompts
- [ ] Time-based prompts appear (weak hour)
- [ ] Pattern-based prompts appear (regret pattern)
- [ ] Prompts are helpful
- [ ] Not too frequent

---

### ✅ UI/UX

#### 1. Navigation
- [ ] Tab navigation works
- [ ] Modal screens work
- [ ] Back button works
- [ ] Deep linking works

#### 2. Animations
- [ ] Screen transitions are smooth
- [ ] Card animations work
- [ ] Button press feedback
- [ ] Loading states show

#### 3. Error Handling
- [ ] Error toasts appear
- [ ] Error messages are clear
- [ ] App doesn't crash on errors
- [ ] Retry mechanisms work

#### 4. Performance
- [ ] App loads quickly
- [ ] No lag when scrolling
- [ ] Charts render smoothly
- [ ] No memory leaks

---

### ✅ Edge Cases

#### 1. Empty States
- [ ] No impulses → Empty state shows
- [ ] No history → Empty state shows
- [ ] No analytics data → Empty state shows

#### 2. Offline
- [ ] App works offline
- [ ] Data persists
- [ ] No crashes

#### 3. Permissions
- [ ] Notification permission denied → App still works
- [ ] Storage permission → Not needed (handled by system)

#### 4. Data
- [ ] Large number of impulses → Performance OK
- [ ] Old data → Still displays correctly
- [ ] Export with lots of data → Works

---

## Common Issues & Fixes

### App Crashes on Launch
- **Fix:** Check logs: `adb logcat | grep ReactNativeJS`
- **Fix:** Clear app data: `adb shell pm clear com.impulsevault.app`
- **Fix:** Reinstall app

### Notifications Not Working
- **Fix:** Check notification permissions in Settings
- **Fix:** Verify notification service is working
- **Fix:** Check logs for errors

### Deep Links Not Working
- **Fix:** Verify `app.json` has scheme configured
- **Fix:** Test with ADB: `adb shell am start -W -a android.intent.action.VIEW -d "impulsevault://quick-add" com.impulsevault.app`
- **Fix:** Reinstall app

### Performance Issues
- **Fix:** Check for memory leaks
- **Fix:** Optimize chart rendering
- **Fix:** Reduce data size

---

## Testing Tools

### ADB Commands

```bash
# View logs
adb logcat | grep ReactNativeJS

# Clear app data
adb shell pm clear com.impulsevault.app

# Uninstall
adb uninstall com.impulsevault.app

# Install
adb install app-release.apk

# Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "impulsevault://quick-add" com.impulsevault.app
```

### Device Settings

- **Developer Options:** Enable USB debugging
- **App Settings:** Check notification permissions
- **Battery:** Disable battery optimization (for notifications)

---

## Test Scenarios

### Scenario 1: First-Time User
1. Install app
2. Complete onboarding
3. Create first impulse
4. Wait for cool-down
5. Review impulse

### Scenario 2: Regular User
1. Open app
2. Create impulse
3. View stats
4. Check history
5. View analytics

### Scenario 3: Power User
1. Create multiple impulses
2. Test all features
3. Export data
4. Test cloud sync (if configured)
5. Test smart prompts

---

## Success Criteria

**App is ready when:**
- ✅ All core features work
- ✅ Notifications work correctly
- ✅ No crashes
- ✅ Good performance
- ✅ Error handling works
- ✅ Edge cases handled

---

## Next Steps

After testing:
1. **Document issues** found
2. **Fix critical bugs**
3. **Re-test** fixed issues
4. **Prepare for release**

---

**Ready to test!** 🚀

