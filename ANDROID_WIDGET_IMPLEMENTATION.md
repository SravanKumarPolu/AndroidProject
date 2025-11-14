# Android Widget Implementation Guide

## Overview

This document describes the Android widget implementation for ImpulseVault's quick-add feature. The widget allows users to quickly log impulses directly from their home screen.

## Architecture

The widget uses:
- **App Widget Provider** - Handles widget lifecycle and updates
- **RemoteViews** - Defines widget UI
- **PendingIntent** - Handles widget button clicks
- **Deep Linking** - Opens app to quick-add screen

## Files Created

1. `android/app/src/main/java/com/impulsevault/app/QuickAddWidgetProvider.kt` - Widget provider
2. `android/app/src/main/res/xml/quick_add_widget_info.xml` - Widget configuration
3. `android/app/src/main/res/layout/widget_quick_add.xml` - Widget layout
4. `android/app/src/main/res/values/widget_colors.xml` - Widget colors

## Implementation Steps

### Step 1: Create Widget Provider

```kotlin
// android/app/src/main/java/com/impulsevault/app/QuickAddWidgetProvider.kt
package com.impulsevault.app

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import android.net.Uri

class QuickAddWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_quick_add)
        
        // Set up click intent to open quick-add screen
        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("impulsevault://quick-add")
            setPackage(context.packageName)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        
        val pendingIntent = android.app.PendingIntent.getActivity(
            context,
            0,
            intent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or 
            android.app.PendingIntent.FLAG_IMMUTABLE
        )
        
        views.setOnClickPendingIntent(R.id.widget_button, pendingIntent)
        
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}
```

### Step 2: Create Widget Layout

```xml
<!-- android/app/src/main/res/layout/widget_quick_add.xml -->
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@drawable/widget_background"
    android:orientation="vertical"
    android:padding="16dp"
    android:gravity="center">

    <ImageView
        android:id="@+id/widget_icon"
        android:layout_width="48dp"
        android:layout_height="48dp"
        android:src="@drawable/ic_lock"
        android:contentDescription="ImpulseVault"
        android:layout_marginBottom="8dp" />

    <TextView
        android:id="@+id/widget_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Quick Add"
        android:textColor="@android:color/white"
        android:textSize="14sp"
        android:textStyle="bold"
        android:layout_marginBottom="4dp" />

    <TextView
        android:id="@+id/widget_subtitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Log an impulse"
        android:textColor="@android:color/white"
        android:textSize="12sp"
        android:alpha="0.9"
        android:layout_marginBottom="12dp" />

    <Button
        android:id="@+id/widget_button"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="+ Add"
        android:textColor="@android:color/white"
        android:background="@drawable/widget_button_background"
        android:padding="12dp"
        android:textSize="14sp"
        android:textStyle="bold" />

</LinearLayout>
```

### Step 3: Create Widget Info

```xml
<!-- android/app/src/main/res/xml/quick_add_widget_info.xml -->
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="110dp"
    android:minHeight="110dp"
    android:updatePeriodMillis="0"
    android:initialLayout="@layout/widget_quick_add"
    android:description="@string/widget_description"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:targetCellWidth="2"
    android:targetCellHeight="2" />
```

### Step 4: Update AndroidManifest.xml

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<receiver
    android:name=".QuickAddWidgetProvider"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/quick_add_widget_info" />
</receiver>
```

### Step 5: Update app.json

The widget configuration is already in `app.json` under `android.shortcuts`. The deep link `impulsevault://quick-add` is already configured.

## Testing

1. Build the app: `npx expo run:android`
2. Long-press on home screen
3. Select "Widgets"
4. Find "ImpulseVault Quick Add"
5. Add to home screen
6. Tap widget button - should open quick-add screen

## Alternative: Expo Widgets (Future)

For Expo-managed projects, consider using:
- `expo-widgets` (when available)
- Or use native module approach above

## Notes

- Widget updates are manual (no auto-refresh needed for this use case)
- Deep link `impulsevault://quick-add` must match app.json configuration
- Widget size: 2x2 cells (minimum)
- Requires Android 5.0+ (API 21+)

