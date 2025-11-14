# Photo Attachments - Quick Setup

## Installation

Install the required packages:

```bash
npx expo install expo-image-picker expo-image-manipulator
```

## Configuration

The `app.json` has been updated with the image picker plugin configuration. After installing packages, rebuild the app:

```bash
# For development build
npx expo prebuild

# Or rebuild with EAS
npm run build:android:dev
```

## Permissions

The app will automatically request camera and photo library permissions when users try to add a photo. The permission messages are configured in `app.json`.

## Usage

1. **Create Impulse with Photo**:
   - Open "New Impulse" screen
   - Fill in impulse details
   - Tap "Add Photo"
   - Choose camera or photo library
   - Photo preview appears
   - Submit impulse (photo is automatically saved)

2. **View Photos**:
   - Photos appear as thumbnails in impulse cards
   - Tap thumbnail to view full-size
   - Photos also shown in review screen

3. **Remove Photos**:
   - Tap "Change Photo" to replace
   - Tap remove button (X) to delete
   - Photos are automatically deleted when impulse is deleted

## Features

✅ Camera and photo library support
✅ Automatic image compression (80% quality, max 1920px)
✅ Efficient storage management
✅ Automatic cleanup on impulse deletion
✅ Full-screen photo viewer
✅ Theme-aware UI
✅ Beautiful previews in cards

## Storage

Photos are stored in: `FileSystem.documentDirectory/impulse_photos/`

Each photo is named: `{impulseId}_{timestamp}.jpg`

Average compressed size: 200-500 KB (vs 2-5 MB original)

