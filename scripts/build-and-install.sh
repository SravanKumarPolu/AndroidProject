#!/bin/bash

# Build and Install Android App Script

export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo "🔍 Checking for Android device/emulator..."

# Wait for device to be ready
MAX_WAIT=60
WAIT_TIME=0
while [ $WAIT_TIME -lt $MAX_WAIT ]; do
    if adb devices | grep -q "device$"; then
        echo "✅ Device found!"
        break
    fi
    echo "⏳ Waiting for device... ($WAIT_TIME/$MAX_WAIT seconds)"
    sleep 2
    WAIT_TIME=$((WAIT_TIME + 2))
done

if ! adb devices | grep -q "device$"; then
    echo "❌ No device found!"
    echo "💡 Starting emulator..."
    export PATH=$PATH:$ANDROID_HOME/emulator
    $ANDROID_HOME/emulator/emulator -avd Medium_Phone_API_36.1 > /dev/null 2>&1 &
    echo "⏳ Wait 30 seconds for emulator to boot, then run this script again"
    exit 1
fi

echo "🔨 Building and installing app..."
cd "$(dirname "$0")/../android"

# Build debug APK
echo "📦 Building APK..."
./gradlew assembleDebug

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Install APK
echo "📲 Installing APK..."
adb install -r app/build/outputs/apk/debug/app-debug.apk

if [ $? -eq 0 ]; then
    echo "✅ App installed successfully!"
    echo "🚀 Launching app..."
    adb shell am start -n com.impulsevault.app/com.impulsevault.app.MainActivity
    echo ""
    echo "✅ Done! App should be running on your device."
    echo "💡 Make sure Metro bundler is running: pnpm start"
else
    echo "❌ Installation failed!"
    exit 1
fi

