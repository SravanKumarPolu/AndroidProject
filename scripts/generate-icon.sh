#!/bin/bash

# Generate PNG icons from SVG logo
# Requires: ImageMagick or Inkscape

echo "🎨 Generating app icons from SVG logo..."

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
    echo "✅ Using ImageMagick..."
    
    # Generate main icon (1024x1024)
    if [ -f "assets/logo-simple.svg" ]; then
        convert -background none -resize 1024x1024 assets/logo-simple.svg assets/icon.png
        echo "✅ Generated icon.png (1024x1024)"
    fi
    
    # Generate adaptive icon (1024x1024)
    convert -background none -resize 1024x1024 assets/logo-simple.svg assets/adaptive-icon.png
    echo "✅ Generated adaptive-icon.png (1024x1024)"
    
    # Generate favicon (512x512)
    convert -background none -resize 512x512 assets/logo-simple.svg assets/favicon.png
    echo "✅ Generated favicon.png (512x512)"
    
    echo ""
    echo "🎉 Icons generated successfully!"
    echo "📁 Check assets/ folder for: icon.png, adaptive-icon.png, favicon.png"
    
elif command -v inkscape &> /dev/null; then
    echo "✅ Using Inkscape..."
    
    # Generate main icon
    inkscape --export-type=png --export-width=1024 --export-height=1024 --export-filename=assets/icon.png assets/logo-simple.svg
    inkscape --export-type=png --export-width=1024 --export-height=1024 --export-filename=assets/adaptive-icon.png assets/logo-simple.svg
    inkscape --export-type=png --export-width=512 --export-height=512 --export-filename=assets/favicon.png assets/logo-simple.svg
    
    echo "✅ Icons generated successfully!"
    
else
    echo "❌ Error: ImageMagick or Inkscape not found"
    echo ""
    echo "Install one of these:"
    echo "  macOS: brew install imagemagick"
    echo "  Linux: sudo apt-get install imagemagick"
    echo "  Or: Install Inkscape"
    echo ""
    echo "Alternatively, use an online converter:"
    echo "  1. Open assets/logo-simple.svg in a browser"
    echo "  2. Use https://cloudconvert.com/svg-to-png"
    echo "  3. Download and save as icon.png (1024x1024)"
    exit 1
fi

