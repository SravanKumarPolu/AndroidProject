#!/bin/bash

# Start Android Emulator Script

export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

# Check if emulator is already running
if adb devices | grep -q "emulator"; then
    echo "✅ Emulator is already running!"
    adb devices
    exit 0
fi

# List available emulators
echo "📱 Available emulators:"
$ANDROID_HOME/emulator/emulator -list-avds

# Start the first available emulator (or specify one)
EMULATOR_NAME=$(($ANDROID_HOME/emulator/emulator -list-avds) | head -n 1)

if [ -z "$EMULATOR_NAME" ]; then
    echo "❌ No emulators found!"
    echo "Please create an emulator in Android Studio:"
    echo "  Tools → Device Manager → Create Device"
    exit 1
fi

echo "🚀 Starting emulator: $EMULATOR_NAME"
echo "⏳ This may take 2-5 minutes on first boot..."

$ANDROID_HOME/emulator/emulator -avd "$EMULATOR_NAME" > /dev/null 2>&1 &

echo "✅ Emulator is starting in the background..."
echo "💡 Wait for it to fully boot, then run: pnpm android"

