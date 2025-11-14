# Play Store Submission Checklist for ImpulseVault

## Quick Reference Guide

This checklist helps you prepare all necessary assets and documentation for submitting ImpulseVault to the Google Play Store.

---

## ✅ Pre-Submission Checklist

### 1. App Icon
- [ ] Icon created (512x512px minimum)
- [ ] Icon is original and doesn't infringe on trademarks
- [ ] Icon tested at various sizes (16px to 512px)
- [ ] Android adaptive icon created (1024x1024px foreground)
- [ ] Icon design documented (see `APP_ICON_DESIGN_SPEC.md`)
- [ ] Trademark search completed (see `PATENT_TRADEMARK_GUIDE.md`)

### 2. Privacy Policy
- [ ] Privacy policy written (see `PRIVACY_POLICY.md`)
- [ ] Privacy policy hosted online (HTML version available)
- [ ] Privacy policy URL ready for Play Store submission
- [ ] Contact information added to privacy policy
- [ ] Last updated date set

### 3. App Information
- [ ] App name: "ImpulseVault" (or variation if needed)
- [ ] Short description (80 characters max)
- [ ] Full description (4000 characters max)
- [ ] App category selected
- [ ] Content rating completed
- [ ] Screenshots prepared (at least 2, up to 8)
- [ ] Feature graphic created (1024x500px)

### 4. Legal & Compliance
- [ ] Privacy policy URL provided
- [ ] Terms of service (if applicable)
- [ ] Data safety section completed
- [ ] App content rating questionnaire completed
- [ ] Export compliance (if applicable)

### 5. Technical Requirements
- [ ] App signed with release key
- [ ] Version code and version name set
- [ ] Target SDK version meets Play Store requirements
- [ ] App tested on multiple devices
- [ ] No critical bugs
- [ ] Permissions properly declared

---

## 📋 Detailed Requirements

### App Icon Specifications

**Required Sizes:**
- **High-res icon:** 512 x 512 pixels (PNG, 32-bit)
- **Adaptive icon foreground:** 1024 x 1024 pixels
- **Adaptive icon background:** 1024 x 1024 pixels (or solid color)

**Design Requirements:**
- Original design (no trademark issues)
- Recognizable at small sizes
- Works with circular and square masks
- See `APP_ICON_DESIGN_SPEC.md` for detailed specifications

### Privacy Policy Requirements

**Must Include:**
- What data is collected
- How data is used
- Data sharing practices
- User rights
- Contact information
- Compliance statements (GDPR, CCPA)

**Hosting:**
- Must be accessible via public URL
- Should be HTML format (see `PRIVACY_POLICY.html`)
- Can be hosted on:
  - Your website
  - GitHub Pages (free)
  - Firebase Hosting (free tier)
  - Any web hosting service

**Quick Setup Options:**
1. **GitHub Pages:**
   - Create a repository
   - Upload `PRIVACY_POLICY.html`
   - Enable GitHub Pages
   - URL: `https://yourusername.github.io/repo/privacy-policy.html`

2. **Firebase Hosting:**
   - Create Firebase project
   - Deploy HTML file
   - URL: `https://yourproject.web.app/privacy-policy.html`

### App Description

**See `PLAY_STORE_LISTING.md` for the complete, ready-to-use listing copy.**

**Quick Reference:**

**App Name:**
```
ImpulseVault – Stop Regret Buys
```

**Short Description (80 characters):**
```
Catch your impulses before you buy. Save money, skip regret.
```

**Full Description:**
See `PLAY_STORE_LISTING.md` for the complete long description optimized for youth audience and featuring Zomato/Swiggy, Amazon, Flipkart, gaming, etc.

### Screenshots

**Requirements:**
- Minimum 2 screenshots
- Maximum 8 screenshots
- Recommended: 4-6 screenshots
- Format: PNG or JPEG
- Sizes: 16:9 or 9:16 aspect ratio
- Minimum width: 320px
- Maximum width: 3840px

**Recommended Screenshots:**
1. Home screen with stats
2. Creating a new impulse
3. Active impulses with countdown
4. Review screen
5. History/analytics screen
6. Settings screen

### Feature Graphic

**Requirements:**
- Size: 1024 x 500 pixels
- Format: PNG or JPEG
- Should showcase your app's key features
- Text should be readable at small sizes

---

## 🔍 Trademark & Legal Checklist

Before submitting, verify:

- [ ] App name "ImpulseVault" trademark search completed
- [ ] Icon design is original (no trademark issues)
- [ ] No copyright infringement
- [ ] Privacy policy is complete and accurate
- [ ] All third-party services disclosed (Supabase)
- [ ] Terms of use (if applicable)

See `PATENT_TRADEMARK_GUIDE.md` for detailed guidance.

---

## 📱 Data Safety Section (Play Store)

**Required Information:**
- What data is collected
- How data is used
- Whether data is shared
- Security practices
- Data deletion options

**For ImpulseVault:**
- **Data Collected:** Impulse entries, app settings, device info (for functionality)
- **Data Usage:** App functionality, cloud sync (optional)
- **Data Sharing:** Only with Supabase (if cloud sync enabled)
- **Security:** Encryption, secure storage, Row Level Security
- **Deletion:** Users can delete data anytime

---

## 🚀 Submission Steps

1. **Prepare Assets:**
   - [ ] Create app icon
   - [ ] Write privacy policy
   - [ ] Host privacy policy online
   - [ ] Prepare screenshots
   - [ ] Create feature graphic

2. **Build Release APK:**
   - [ ] Build signed release APK or AAB
   - [ ] Test release build
   - [ ] Verify version code/name

3. **Create Play Console Listing:**
   - [ ] Sign in to Google Play Console
   - [ ] Create new app
   - [ ] Fill in app details
   - [ ] Upload screenshots
   - [ ] Upload feature graphic
   - [ ] Add privacy policy URL
   - [ ] Complete content rating
   - [ ] Complete data safety section

4. **Upload App:**
   - [ ] Upload APK/AAB to production track
   - [ ] Set release notes
   - [ ] Review all information

5. **Submit for Review:**
   - [ ] Review all sections
   - [ ] Submit for review
   - [ ] Wait for approval (typically 1-3 days)

---

## 📝 Quick Reference: File Locations

- **Privacy Policy (Markdown):** `PRIVACY_POLICY.md`
- **Privacy Policy (HTML):** `PRIVACY_POLICY.html`
- **Icon Design Spec:** `APP_ICON_DESIGN_SPEC.md`
- **Trademark Guide:** `PATENT_TRADEMARK_GUIDE.md`
- **This Checklist:** `PLAY_STORE_CHECKLIST.md`

---

## ⚠️ Common Issues to Avoid

1. **Privacy Policy:**
   - Must be publicly accessible URL
   - Must be complete and accurate
   - Must include contact information

2. **App Icon:**
   - Must be original design
   - Must meet size requirements
   - Must not infringe trademarks

3. **Content Rating:**
   - Must complete questionnaire accurately
   - Must reflect actual app content

4. **Data Safety:**
   - Must accurately describe data collection
   - Must match privacy policy

5. **Screenshots:**
   - Must show actual app functionality
   - Must not be misleading

---

## 🎯 Next Steps

1. **Create App Icon:**
   - Follow `APP_ICON_DESIGN_SPEC.md`
   - Use DALL·E or hire a designer
   - Test at various sizes

2. **Host Privacy Policy:**
   - Use `PRIVACY_POLICY.html`
   - Deploy to web hosting
   - Get public URL

3. **Prepare Screenshots:**
   - Take screenshots on real device or emulator
   - Edit if needed (add captions, highlights)
   - Ensure they showcase key features

4. **Complete Play Console:**
   - Fill in all required fields
   - Upload all assets
   - Submit for review

---

## 📞 Support Resources

- **Google Play Console Help:** https://support.google.com/googleplay/android-developer
- **Play Store Policies:** https://play.google.com/about/developer-content-policy/
- **Privacy Policy Requirements:** https://support.google.com/googleplay/android-developer/answer/10787469

---

**Good luck with your Play Store submission! 🚀**

