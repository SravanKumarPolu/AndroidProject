# 🎨 ImpulseVault Branding Customization Guide

This guide helps you customize all branding elements of ImpulseVault for your own brand.

## 📋 Current Branding Status

### ✅ Existing Assets
- **Icons**: `assets/icon.png`, `assets/adaptive-icon.png`, `assets/favicon.png`
- **App Name**: "ImpulseVault – Stop Regret Buys"
- **Display Name**: "ImpulseVault"
- **Package/Bundle ID**: `com.impulsevault.app`
- **Primary Color**: `#6366F1` (Indigo)

### 📍 Branding Locations

1. **Configuration Files**:
   - `app.json` - Expo app configuration
   - `src/constants/app.ts` - App constants (name, URLs, etc.)

2. **Icon Files** (in `assets/`):
   - `icon.png` - Main app icon (1024x1024px recommended)
   - `adaptive-icon.png` - Android adaptive icon (1024x1024px)
   - `favicon.png` - Web favicon (48x48px or 512x512px)

3. **UI Display**:
   - Home screen title
   - Settings screen
   - Onboarding screens
   - Share messages
   - PDF reports
   - Export filenames

---

## 🚀 Quick Customization Steps

### Step 1: Update App Configuration

Edit `src/constants/app.ts`:

```typescript
export const appConfig = {
  name: 'Your App Name – Tagline',
  displayName: 'YourAppName',
  version: '1.0.0',
  packageName: 'com.yourcompany.yourapp',
  // ... update other fields
};
```

### Step 2: Update app.json

Edit `app.json`:
- Change `name` field
- Update `slug` (URL-friendly version)
- Update `bundleIdentifier` (iOS)
- Update `package` (Android)
- Update `scheme` (deep linking)

### Step 3: Replace Icons

Replace these files in `assets/`:
- `icon.png` - 1024x1024px, PNG, transparent background
- `adaptive-icon.png` - 1024x1024px, PNG (Android)
- `favicon.png` - 512x512px or 48x48px (Web)

**Icon Requirements**:
- **iOS**: 1024x1024px, no transparency, PNG
- **Android**: 1024x1024px, PNG (adaptive icon will be masked)
- **Web**: 512x512px or 48x48px, PNG or ICO

### Step 4: Update Colors

Edit `src/constants/colors.ts` to change the primary color scheme.

### Step 5: Update Package/Bundle IDs

**Important**: Changing package/bundle IDs requires:
1. Update `app.json`
2. Update `src/constants/app.ts`
3. Clean build: `npx expo prebuild --clean`
4. Rebuild native projects

---

## 📝 Detailed Customization Checklist

### ✅ App Identity
- [ ] App name (full)
- [ ] Display name (short)
- [ ] Tagline/description
- [ ] Package name (Android)
- [ ] Bundle identifier (iOS)
- [ ] App slug (URL-friendly)

### ✅ Visual Assets
- [ ] Main app icon (1024x1024px)
- [ ] Android adaptive icon (1024x1024px)
- [ ] Web favicon (512x512px)
- [ ] Splash screen image (optional)
- [ ] App logo (for UI, optional)

### ✅ Branding Colors
- [ ] Primary color
- [ ] Accent color
- [ ] Background colors
- [ ] Text colors

### ✅ URLs & Links
- [ ] Website URL
- [ ] Privacy policy URL
- [ ] Support email
- [ ] Play Store URL (after publishing)
- [ ] App Store URL (after publishing)

### ✅ Text Content
- [ ] App description
- [ ] Short description
- [ ] Permission messages
- [ ] Share messages
- [ ] Onboarding text

---

## 🎨 Icon Generation Tools

### Recommended Tools:
1. **Figma** - Design icons, export PNGs
2. **Canva** - Quick icon creation
3. **Icon Generator** - Online tools:
   - [AppIcon.co](https://www.appicon.co/)
   - [IconKitchen](https://icon.kitchen/)
   - [MakeAppIcon](https://makeappicon.com/)

### Icon Design Tips:
- Use simple, recognizable symbols
- Ensure visibility at small sizes
- Test on different backgrounds
- Follow platform guidelines:
  - [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
  - [Android Icon Design Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design)

---

## 🔧 Environment Variables

You can use environment variables for sensitive branding:

Create `.env`:
```env
EXPO_PUBLIC_APP_NAME=Your App Name
EXPO_PUBLIC_DISPLAY_NAME=YourApp
EXPO_PUBLIC_SUPPORT_EMAIL=support@yourapp.com
EXPO_PUBLIC_WEBSITE_URL=https://yourapp.com
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://yourapp.com/privacy
```

Then reference in `src/constants/app.ts`:
```typescript
name: process.env.EXPO_PUBLIC_APP_NAME || 'ImpulseVault',
```

---

## 📱 Platform-Specific Notes

### Android
- Adaptive icon requires foreground and background
- Icon will be masked to different shapes
- Test on different Android versions

### iOS
- Icon must be exactly 1024x1024px
- No transparency allowed
- Will be automatically rounded on device

### Web
- Favicon should be 512x512px or 48x48px
- Can use PNG or ICO format
- Consider multiple sizes for different browsers

---

## ✅ Testing Your Branding

After customization:

1. **Test Icons**:
   ```bash
   # Preview icons
   npx expo start
   # Check on device/emulator
   ```

2. **Test App Name**:
   - Check app drawer/home screen
   - Check app settings
   - Check share dialogs

3. **Test Colors**:
   - Verify contrast ratios
   - Test in light/dark mode
   - Check accessibility

4. **Clean Build** (after package ID changes):
   ```bash
   npx expo prebuild --clean
   ```

---

## 🚨 Important Notes

1. **Package/Bundle IDs**: Once published, these CANNOT be changed. Choose carefully!

2. **Icon Sizes**: Always use exact sizes specified. Expo will generate all required sizes automatically.

3. **App Name Length**: 
   - iOS: Max 30 characters (truncated with "...")
   - Android: Max 30 characters (truncated)
   - Keep it short!

4. **Testing**: Always test branding on actual devices, not just emulators.

5. **Backup**: Keep original assets before replacing.

---

## 📚 Additional Resources

- [Expo App Configuration](https://docs.expo.dev/versions/latest/config/app/)
- [iOS App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Icon Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design)
- [Expo Icon Generation](https://docs.expo.dev/guides/app-icons/)

---

**Need Help?** Check the main README.md or create an issue in the repository.


