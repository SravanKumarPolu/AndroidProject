#!/bin/bash

# Fix Favicon Script
# This script clears caches and restarts the web server with fresh favicon

echo "🔧 Fixing Favicon Issue..."
echo ""

# Clear Expo cache
echo "1. Clearing Expo web cache..."
rm -rf .expo/web 2>/dev/null
rm -rf .expo/cache 2>/dev/null

# Clear node_modules/.cache if exists
echo "2. Clearing Metro bundler cache..."
rm -rf node_modules/.cache 2>/dev/null

echo ""
echo "✅ Cache cleared!"
echo ""
echo "📋 Next steps:"
echo "   1. Stop your current dev server (Ctrl+C or Cmd+C)"
echo "   2. Run: npm start -- --web --clear"
echo "   3. In your browser:"
echo "      - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "      - Or clear cache: Ctrl+Shift+Delete → Clear 'Cached images'"
echo "      - Or test in incognito/private window"
echo ""
echo "💡 The favicon should now show your app icon instead of purple square!"

