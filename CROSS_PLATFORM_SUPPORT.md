# Cross-Platform Support Documentation

This document outlines the cross-platform support for ImpulseVault across Android, iOS, and Web platforms.

## ✅ Platform Support Status

### Android ✅
- **Status**: Fully Supported
- **Build Scripts**: ✅ Complete
- **Native Features**: ✅ All features available
- **EAS Build**: ✅ Configured (preview, production, development)

### iOS ✅
- **Status**: Fully Supported
- **Build Scripts**: ✅ Complete (added)
- **Native Features**: ✅ All features available
- **EAS Build**: ✅ Configured (preview, production, development)

### Web ✅
- **Status**: Fully Supported (with limitations)
- **Build Scripts**: ✅ Complete (added)
- **Core Features**: ✅ All core features work
- **Limitations**: See Web Limitations section below

## 📦 Build Scripts

### Android
```bash
# Development
npm run android              # Run on Android device/emulator
npm run android:emulator     # Start Android emulator
npm run android:build       # Build and install APK
npm run android:sync        # Sync native code

# EAS Build
npm run build:android:dev        # Development build
npm run build:android:preview    # Preview build (APK)
npm run build:android:production # Production build (APK)
```

### iOS
```bash
# Development
npm run ios                  # Run on iOS device/simulator
npm run ios:sync            # Sync native code (added)

# EAS Build
npm run build:ios:dev           # Development build (added)
npm run build:ios:preview        # Preview build (added)
npm run build:ios:production     # Production build (added)
```

### Web
```bash
# Development
npm run web                  # Start web development server
npm run web:clean            # Clean web cache and restart

# Production Build
npm run build:web             # Build for production (added)
npm run build:web:production   # Build without minification (added)
```

## 🔧 Platform Detection

A new platform utility has been created at `src/utils/platform.ts` for consistent platform detection:

```typescript
import { isWeb, isIOS, isAndroid, isNative, isFeatureAvailable } from '@/utils/platform';

// Platform checks
if (isWeb) { /* web-specific code */ }
if (isIOS) { /* iOS-specific code */ }
if (isAndroid) { /* Android-specific code */ }
if (isNative) { /* native-only code */ }

// Feature availability
if (isFeatureAvailable('notifications')) { /* ... */ }
if (isFeatureAvailable('camera')) { /* ... */ }
if (isFeatureAvailable('location')) { /* ... */ }
```

## 🌐 Web Limitations

The following features have limitations on web:

### ⚠️ Push Notifications
- **Status**: Limited support
- **Implementation**: Uses browser Notification API
- **Limitations**: 
  - Requires user permission
  - Not persistent across browser sessions
  - May not work in all browsers
- **Fallback**: Uses `setTimeout` for scheduled notifications (not persistent)

### ⚠️ Image Picker
- **Status**: Limited support
- **Implementation**: Uses HTML file input
- **Limitations**: 
  - No native camera access (uses file input)
  - No native gallery picker
- **Fallback**: File input with camera capture attribute

### ⚠️ Location Tracking
- **Status**: Supported with limitations
- **Implementation**: Uses browser Geolocation API
- **Limitations**: 
  - Requires browser permission
  - May have reduced accuracy
  - May not work in all browsers
- **Fallback**: Uses OpenStreetMap Nominatim for reverse geocoding

### ⚠️ Native Widgets
- **Status**: Not available
- **Reason**: Web doesn't support native widgets
- **Alternative**: PWA installation for home screen access

### ✅ Fully Supported on Web
- All core impulse tracking features
- Statistics and analytics
- History and filters
- Cloud sync (Supabase)
- Data export (CSV, JSON, HTML reports)
- Theme switching
- All UI components

## 📱 Platform-Specific Features

### Android Only
- **App Shortcuts**: Quick Add shortcut configured
- **Native Widgets**: Android widgets support
- **Exact Alarm Permissions**: For precise notifications

### iOS Only
- **Info.plist Permissions**: Camera, photo library, location permissions configured
- **Tablet Support**: iPad support enabled

### Web Only
- **PWA Support**: Progressive Web App configuration
- **Web Manifest**: Icons and metadata configured
- **Favicon**: Custom favicon support

## 🔍 Platform Checks in Code

All platform-specific code uses `Platform.OS` checks:

```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Web-specific code
} else {
  // Native code (Android/iOS)
}
```

### Services with Platform Checks
- ✅ `src/services/notifications.ts` - Web notifications fallback
- ✅ `src/services/location.ts` - Browser geolocation fallback
- ✅ `src/services/photos.ts` - File input fallback
- ✅ `src/utils/export.ts` - Web download fallback
- ✅ `src/utils/pdfReport.ts` - Web HTML download
- ✅ `app/_layout.tsx` - Web favicon injection

## 🚀 Deployment

### Android
1. Build APK: `npm run build:android:preview`
2. Download from EAS
3. Install on device

### iOS
1. Build IPA: `npm run build:ios:preview`
2. Download from EAS
3. Install via TestFlight or direct install

### Web
1. Build: `npm run build:web`
2. Deploy `web-build/` folder to:
   - Vercel
   - Netlify
   - GitHub Pages
   - Any static hosting service

## 📝 Configuration Files

### EAS Build (`eas.json`)
- ✅ Android profiles: development, preview, production
- ✅ iOS profiles: development, preview, production (added)

### App Config (`app.json`)
- ✅ Android configuration: permissions, shortcuts, adaptive icon
- ✅ iOS configuration: permissions, bundle ID, Info.plist
- ✅ Web configuration: PWA manifest, icons, theme (enhanced)

## 🧪 Testing

### Android
```bash
npm run android              # Run on emulator/device
npm run android:emulator     # Start emulator first
```

### iOS
```bash
npm run ios                  # Run on simulator/device
# Requires Xcode and iOS Simulator
```

### Web
```bash
npm run web                  # Start dev server
# Open http://localhost:8081 in browser
```

## 📚 Additional Resources

- [Expo Platform-Specific Code](https://docs.expo.dev/workflow/platform-specific-code/)
- [React Native Platform Module](https://reactnative.dev/docs/platform-specific-code)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [PWA Configuration](https://docs.expo.dev/guides/progressive-web-apps/)

## ✅ Summary

All platforms (Android, iOS, Web) are now fully configured with:
- ✅ Build scripts for all platforms
- ✅ EAS build profiles for Android and iOS
- ✅ Platform detection utilities
- ✅ Web PWA configuration
- ✅ Platform-specific feature handling
- ✅ Graceful fallbacks for web limitations

The app is production-ready for all three platforms! 🎉

