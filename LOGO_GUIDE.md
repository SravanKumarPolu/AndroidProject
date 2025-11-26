# 🎨 ImpulseVault Logo Guide

## ✅ Logo Created!

I've created **2 logo designs** for ImpulseVault:

### 1. **logo-simple.svg** (Recommended)
- **Design**: Modern lock icon with vault door lines and money symbol
- **Colors**: Purple (#6366F1) background, white lock, green money symbol
- **Style**: Clean, professional, works great at all sizes
- **Best for**: App icon, favicon, all uses

### 2. **logo.svg** (Alternative)
- **Design**: Lock with integrated dollar sign
- **Colors**: Purple theme with green accents
- **Style**: More detailed, decorative
- **Best for**: Marketing materials, larger displays

---

## 🚀 Quick Setup (3 Options)

### Option 1: Auto-Generate (Recommended)

If you have ImageMagick or Inkscape installed:

```bash
# Generate all icon sizes from SVG
bash scripts/generate-icon.sh
```

**Install ImageMagick:**
- macOS: `brew install imagemagick`
- Linux: `sudo apt-get install imagemagick`
- Windows: Download from [ImageMagick website](https://imagemagick.org/)

### Option 2: Online Converter (Easiest)

1. **Open the SVG:**
   - Open `assets/logo-simple.svg` in your browser
   - Or use any SVG viewer

2. **Convert to PNG:**
   - Go to [CloudConvert](https://cloudconvert.com/svg-to-png)
   - Upload `assets/logo-simple.svg`
   - Set size: **1024x1024** for icon.png
   - Set size: **512x512** for favicon.png
   - Download and save to `assets/` folder

3. **Replace files:**
   ```bash
   # Save downloaded files as:
   # - assets/icon.png (1024x1024)
   # - assets/adaptive-icon.png (1024x1024) 
   # - assets/favicon.png (512x512)
   ```

### Option 3: Design Tool

1. Open `assets/logo-simple.svg` in:
   - Figma (import SVG)
   - Adobe Illustrator
   - Inkscape (free)
   - Canva (upload SVG)

2. Export as PNG:
   - **icon.png**: 1024x1024px
   - **adaptive-icon.png**: 1024x1024px
   - **favicon.png**: 512x512px

3. Save to `assets/` folder

---

## 📐 Logo Specifications

### Design Elements:
- **Lock Icon**: Represents "locking" impulses
- **Vault Door Lines**: Represents security/vault concept
- **Money Symbol ($)**: Represents savings
- **Purple Color (#6366F1)**: Matches your app theme
- **Green Accent (#10B981)**: Represents money/savings

### File Sizes Needed:
- `icon.png`: 1024x1024px (main app icon)
- `adaptive-icon.png`: 1024x1024px (Android adaptive icon)
- `favicon.png`: 512x512px (web favicon)

---

## ✅ After Generating Icons

1. **Verify files exist:**
   ```bash
   ls -lh assets/*.png
   ```

2. **Restart server:**
   ```bash
   npm start -- --web --clear
   ```

3. **Test:**
   - Go to `http://localhost:8081/assets/icon.png`
   - Should see your logo (not purple square!)
   - Browser tab should show your logo

---

## 🎨 Logo Design Details

### Color Palette:
- **Primary**: #6366F1 (Indigo/Purple) - Trust, security
- **Accent**: #10B981 (Green) - Money, savings, success
- **Background**: White or transparent
- **Text**: #1F2937 (Dark gray) if needed

### Design Philosophy:
- **Simple**: Recognizable at 16x16px
- **Meaningful**: Lock + Vault + Money = ImpulseVault
- **Modern**: Clean lines, rounded corners
- **Professional**: Suitable for app stores

---

## 🔄 Customization

Want to customize the logo?

1. **Edit SVG files:**
   - Open `assets/logo-simple.svg` in a text editor or design tool
   - Modify colors, shapes, elements
   - Save and regenerate PNGs

2. **Change colors:**
   - Find `#6366F1` (purple) → Replace with your color
   - Find `#10B981` (green) → Replace with your accent color

3. **Add text:**
   - Uncomment the text element in logo.svg
   - Adjust font, size, position

---

## 📱 Testing Your Logo

After generating icons:

1. **Check file sizes:**
   ```bash
   file assets/icon.png
   # Should show: PNG image data, 1024 x 1024
   ```

2. **Preview in browser:**
   - `http://localhost:8081/assets/icon.png`
   - Should see your logo clearly

3. **Test at different sizes:**
   - Open icon.png in image viewer
   - Zoom out to see how it looks small
   - Should still be recognizable

---

## 🎉 Result

Once you've generated the PNG files:
- ✅ Professional logo for your app
- ✅ Works on all platforms (Android, iOS, Web)
- ✅ Matches your app's theme and purpose
- ✅ No more purple square!

---

**Next Step**: Generate the PNG files using one of the methods above!

