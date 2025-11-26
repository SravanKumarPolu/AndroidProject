# Decision Options - Complete ✅

## Step 4: Decision - All Features Implemented

### ✅ Required Decision Options

After reflection questions, user can pick from three options:

1. **Skip** ✅
   - Button: "Skip"
   - Action: Cancels the impulse purchase
   - Flow:
     - In strict mode: Requires reason first
     - Otherwise: Shows feeling selection (Relieved, Neutral, Still Craving)
   - Result: Impulse marked as CANCELLED
   - Celebration: Shows saved amount if price exists

2. **Buy anyway** ✅
   - Button: "Buy anyway"
   - Action: Executes the impulse purchase
   - Flow:
     - In strict mode (if still locked): Requires reason to bypass cool-down
     - Otherwise: Executes immediately
   - Result: Impulse marked as EXECUTED
   - Follow-up: 24-hour check-in for regret rating

3. **Save for later** ✅ **NEW**
   - Button: "Save for later"
   - Action: Extends review date by 24 hours
   - Flow:
     - Updates `reviewAt` timestamp to 24 hours from now
     - Keeps impulse in LOCKED status
     - Schedules new notification
   - Result: User gets another 24 hours to decide
   - Message: "Saved for later. We'll remind you in 24 hours."

---

## Implementation Details

### Files Modified

- `app/review-impulse/[id].tsx` - Added "Save for later" option
  - Added `handleSaveForLater` function
  - Added "Save for later" button to decision options
  - Updated button labels:
     - "Skip this purchase" → "Skip"
     - "Still buying" → "Buy anyway"

### Button Layout

The three decision buttons are displayed in order:
1. **Skip** (Primary button, large)
2. **Buy anyway** (Outline button, large)
3. **Save for later** (Ghost button, medium)

### Save for Later Functionality

```typescript
const handleSaveForLater = async () => {
  // Check if cool-down has ended
  if (impulse && !isTimePast(impulse.reviewAt)) {
    Alert.alert('Still Locked', '...');
    return;
  }

  // Extend review date by 24 hours
  const newReviewAt = Date.now() + (24 * 60 * 60 * 1000);
  await updateImpulse(impulse.id, {
    reviewAt: newReviewAt,
  });
  
  showSuccess('Saved for later. We\'ll remind you in 24 hours.');
  router.back();
};
```

**Features**:
- ✅ Extends review date by 24 hours
- ✅ Keeps impulse in LOCKED status
- ✅ Shows success message
- ✅ Navigates back to home
- ✅ Respects cool-down (can't save if still locked)
- ✅ Uses `updateImpulse` to modify reviewAt timestamp

---

## Decision Flow

### Skip Flow
1. User clicks "Skip"
2. If strict mode: Show reason input
3. If not strict mode: Show feeling selection
4. User selects feeling (Relieved, Neutral, Still Craving)
5. Impulse cancelled
6. Show celebration if price exists

### Buy Anyway Flow
1. User clicks "Buy anyway"
2. If strict mode and still locked: Show reason input
3. Otherwise: Execute immediately
4. Impulse marked as EXECUTED
5. Show success message
6. Schedule 24-hour regret check-in

### Save for Later Flow
1. User clicks "Save for later"
2. Check if cool-down has ended
3. Extend reviewAt by 24 hours
4. Update impulse
5. Show success message
6. Navigate back

---

## Button States

All buttons respect the cool-down period:
- **Disabled** if `!isTimePast(impulse.reviewAt)` (still in cool-down)
- **Enabled** after cool-down ends

Exception: "Buy anyway" in strict mode can bypass cool-down with reason.

---

## Verification

✅ All three decision options implemented
✅ "Skip" button works correctly
✅ "Buy anyway" button works correctly
✅ "Save for later" button works correctly
✅ Save for later extends review date by 24 hours
✅ All buttons respect cool-down period
✅ Proper error handling
✅ Success messages displayed
✅ Type safety maintained
✅ No type errors
✅ No linter errors

---

**Status**: Step 4 (Decision) is complete with all required features! 🎉

