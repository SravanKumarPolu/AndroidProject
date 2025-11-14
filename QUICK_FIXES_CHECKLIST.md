# Quick Fixes Checklist

**Priority:** Do these before launch (2-3 hours total)

---

## ✅ Immediate Actions (30 minutes)

### 1. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in Supabase credentials (if using cloud sync)
- [ ] Set privacy policy URL
- [ ] Update support email and website URLs
- [ ] Verify `.env` is in `.gitignore`

### 2. Fix Placeholders
- [ ] Update `app.json` line 77: Replace `"your-project-id"` with actual EAS project ID
  ```bash
  # Get your EAS project ID:
  npx eas whoami
  npx eas project:info
  ```

---

## ✅ Critical Fixes (2 hours)

### 3. Create Logger Utility
- [ ] Create `src/utils/logger.ts` (see example in PROJECT_REVIEW_IMPROVEMENTS.md)
- [ ] Replace `console.log` in critical files:
  - [ ] `src/services/storage.ts`
  - [ ] `src/services/notifications.ts`
  - [ ] `src/hooks/useImpulses.ts`
  - [ ] `src/services/cloudSync.ts`
- [ ] Keep `console.error` in ErrorBoundary (for crash reporting)

### 4. Implement Missing Features
- [ ] Implement "Clear All" in `app/(tabs)/settings.tsx`
  ```typescript
  // Add confirmation dialog
  // Clear all impulses from storage
  // Show success toast
  ```
- [ ] Fix currency in `src/services/goals.ts` (get from settings)

---

## ✅ Testing (Optional but Recommended)

### 5. Add Basic Tests
- [ ] Test `useImpulses` hook
- [ ] Test `storage` service
- [ ] Test critical utility functions

**Run tests:**
```bash
npm test
```

---

## ✅ Pre-Launch Checklist

- [ ] All environment variables configured
- [ ] No placeholder values in code
- [ ] No console.log in production code (use logger)
- [ ] All TODOs addressed or documented
- [ ] Privacy policy URL is valid
- [ ] EAS project ID is set
- [ ] Test on real device
- [ ] Verify notifications work
- [ ] Check error handling works

---

## 🚀 After Launch

See `PROJECT_REVIEW_IMPROVEMENTS.md` for:
- Accessibility improvements
- Error reporting (Sentry)
- Performance optimizations
- CI/CD setup
- Analytics integration

