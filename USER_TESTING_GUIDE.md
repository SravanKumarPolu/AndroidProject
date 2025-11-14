# User Testing Guide 🧪

## Overview

This guide helps you test **Analytics Charts** and **Smart Prompts** features with real users and gather feedback.

---

## 📊 Part 1: Testing Analytics Charts

### Prerequisites

**Minimum Data Required:**
- ✅ At least 5-10 impulses logged
- ✅ Mix of executed and cancelled impulses
- ✅ Different categories
- ✅ Some with regret feedback
- ✅ Data spanning multiple weeks/months (for trends)

### Test Scenarios

#### Scenario 1: Spending Trend Chart

**Steps:**
1. Navigate to **Analytics** tab
2. Select **"Spending"** chart type
3. Observe the line chart

**What to Test:**
- [ ] Chart displays correctly
- [ ] Data points are accurate
- [ ] Y-axis shows currency (₹)
- [ ] X-axis shows time periods
- [ ] Chart is readable and clear
- [ ] Empty state shows when no data

**Expected Behavior:**
- Line chart showing spending over time
- Smooth bezier curve
- Proper scaling

**Issues to Look For:**
- ❌ Chart not rendering
- ❌ Incorrect data
- ❌ Poor readability
- ❌ Missing labels

---

#### Scenario 2: Category Breakdown Chart

**Steps:**
1. Navigate to **Analytics** tab
2. Select **"Categories"** chart type
3. Observe the pie chart

**What to Test:**
- [ ] Pie chart displays correctly
- [ ] Categories are distinct
- [ ] Colors are different for each category
- [ ] Legend is readable
- [ ] Percentages/amounts are accurate
- [ ] Top 6 categories shown

**Expected Behavior:**
- Pie chart with category breakdown
- Color-coded segments
- Legend showing categories

**Issues to Look For:**
- ❌ Overlapping labels
- ❌ Colors too similar
- ❌ Missing categories
- ❌ Incorrect calculations

---

#### Scenario 3: Regret Rate Trend Chart

**Steps:**
1. Navigate to **Analytics** tab
2. Select **"Regret Rate"** chart type
3. Observe the bar chart

**What to Test:**
- [ ] Bar chart displays correctly
- [ ] Regret percentages are accurate
- [ ] Y-axis shows percentage (0-100%)
- [ ] X-axis shows time periods
- [ ] Values shown on top of bars
- [ ] Trend is visible

**Expected Behavior:**
- Bar chart showing regret rate over time
- Percentage values on bars
- Clear trend visualization

**Issues to Look For:**
- ❌ Incorrect percentages
- ❌ Missing data points
- ❌ Unreadable values
- ❌ No trend visible

---

#### Scenario 4: Chart Switching

**Steps:**
1. Navigate to **Analytics** tab
2. Switch between chart types
3. Observe transitions

**What to Test:**
- [ ] Smooth transitions between charts
- [ ] Selected chart type is highlighted
- [ ] Icons change correctly
- [ ] No lag or delay
- [ ] Data updates correctly

**Expected Behavior:**
- Instant chart switching
- Visual feedback on selection
- Smooth UI transitions

---

#### Scenario 5: Empty States

**Steps:**
1. Clear all data (or use fresh install)
2. Navigate to **Analytics** tab
3. Observe empty states

**What to Test:**
- [ ] Empty state message is clear
- [ ] Message is helpful
- [ ] No errors or crashes
- [ ] UI is still usable

**Expected Behavior:**
- "Not enough data" message
- No crashes
- Clean UI

---

### Analytics Testing Checklist

**Functionality:**
- [ ] All 3 chart types work
- [ ] Data is accurate
- [ ] Charts render correctly
- [ ] Switching works smoothly
- [ ] Empty states handled

**Visual:**
- [ ] Charts are readable
- [ ] Colors are distinct
- [ ] Labels are clear
- [ ] Layout is good
- [ ] Responsive on different screen sizes

**Performance:**
- [ ] Charts load quickly
- [ ] No lag when switching
- [ ] Smooth animations
- [ ] No memory issues

---

## 🔔 Part 2: Testing Smart Prompts

### Prerequisites

**Minimum Data Required:**
- ✅ At least 5 impulses logged
- ✅ Some with regret feedback (for pattern-based)
- ✅ Data across different hours (for time-based)
- ✅ Some active impulses in cool-down (for reminders)

### Test Scenarios

#### Scenario 1: Time-Based Smart Prompt (Weak Hour)

**Setup:**
1. Log 5+ impulses at different times
2. Identify your "weak hour" (most impulses occur)
3. Open app during that hour

**Steps:**
1. Open app during weak hour
2. Wait 2 seconds
3. Check for notification

**What to Test:**
- [ ] Notification appears
- [ ] Title is "⏰ Weak Hour Alert"
- [ ] Message mentions the hour
- [ ] Notification is helpful
- [ ] Tapping notification opens app
- [ ] App navigates to home

**Expected Behavior:**
- Notification: "You usually make impulsive decisions around [hour]. Think twice before buying!"
- App opens when tapped
- Navigates to home screen

**Issues to Look For:**
- ❌ Notification doesn't appear
- ❌ Wrong hour mentioned
- ❌ Notification too intrusive
- ❌ Tapping doesn't work

---

#### Scenario 2: Pattern-Based Smart Prompt

**Setup:**
1. Log 5+ impulses
2. Execute at least 3 with regret feedback
3. Use same category for regrets
4. Open app

**Steps:**
1. Open app
2. Wait 2 seconds
3. Check for notification

**What to Test:**
- [ ] Notification appears
- [ ] Title is "💡 Pattern Alert"
- [ ] Message mentions regret count
- [ ] Mentions category
- [ ] Notification is helpful
- [ ] Tapping works

**Expected Behavior:**
- Notification: "You've regretted [N] purchases recently. Consider logging before buying [category] items."
- App opens when tapped

**Issues to Look For:**
- ❌ Notification doesn't appear
- ❌ Wrong count
- ❌ Wrong category
- ❌ Too frequent

---

#### Scenario 3: Reminder Smart Prompt

**Setup:**
1. Log 2+ impulses
2. Leave them in cool-down (LOCKED status)
3. Open app

**Steps:**
1. Open app
2. Check for notification (if implemented)

**What to Test:**
- [ ] Notification appears (if implemented)
- [ ] Mentions active impulses
- [ ] Helpful reminder
- [ ] Tapping works

**Expected Behavior:**
- Notification: "You have [N] impulse(s) in cool-down. Check them out!"
- App opens when tapped

---

#### Scenario 4: Smart Prompt Frequency

**Steps:**
1. Open app multiple times
2. Observe prompt frequency

**What to Test:**
- [ ] Not too frequent (not every time)
- [ ] Not too rare (shows when relevant)
- [ ] Doesn't spam
- [ ] Contextual timing

**Expected Behavior:**
- Shows when relevant
- Not every app open
- Respects user experience

---

#### Scenario 5: Notification Permissions

**Steps:**
1. Deny notification permissions
2. Open app
3. Check if prompts still work

**What to Test:**
- [ ] App doesn't crash
- [ ] Graceful handling
- [ ] No errors
- [ ] Other features still work

**Expected Behavior:**
- App works without permissions
- No crashes
- Prompts simply don't show

---

### Smart Prompts Testing Checklist

**Functionality:**
- [ ] Time-based prompts work
- [ ] Pattern-based prompts work
- [ ] Reminder prompts work (if implemented)
- [ ] Notifications appear correctly
- [ ] Tapping notifications works
- [ ] App navigation works

**Timing:**
- [ ] Prompts show at right time
- [ ] Not too frequent
- [ ] Not too rare
- [ ] Contextual

**Content:**
- [ ] Messages are clear
- [ ] Messages are helpful
- [ ] No typos
- [ ] Relevant information

**UX:**
- [ ] Not intrusive
- [ ] Helpful
- [ ] Actionable
- [ ] Respectful

---

## 📝 Part 3: Gathering Feedback

### Feedback Collection Template

Use this template when testing with users:

#### Analytics Charts Feedback

**Questions:**
1. Are the charts easy to understand?
2. Do they provide useful insights?
3. Which chart is most helpful?
4. What's missing?
5. Any visual issues?
6. Would you use this feature regularly?

**Rating (1-5):**
- [ ] Overall usefulness: ___/5
- [ ] Visual clarity: ___/5
- [ ] Ease of use: ___/5

**Comments:**
```
[User feedback here]
```

---

#### Smart Prompts Feedback

**Questions:**
1. Are the prompts helpful?
2. Do they appear at the right time?
3. Are they too frequent or too rare?
4. Do they help you make better decisions?
5. What would make them better?
6. Would you keep this feature enabled?

**Rating (1-5):**
- [ ] Overall usefulness: ___/5
- [ ] Timing: ___/5
- [ ] Helpfulness: ___/5

**Comments:**
```
[User feedback here]
```

---

### Feedback Categories

**Positive Feedback:**
- ✅ What works well
- ✅ What users love
- ✅ What's helpful

**Issues Found:**
- ❌ Bugs or errors
- ❌ Confusing UI
- ❌ Missing features

**Suggestions:**
- 💡 New features
- 💡 Improvements
- 💡 Better UX

---

## 🎯 Testing Plan

### Phase 1: Internal Testing (You)

**Duration:** 1-2 days

1. **Create test data** (use test data generator)
2. **Test all scenarios** above
3. **Document issues**
4. **Fix critical bugs**

---

### Phase 2: Beta Testing (5-10 users)

**Duration:** 1 week

1. **Recruit testers** (friends, family, colleagues)
2. **Provide testing guide**
3. **Collect feedback** (use template)
4. **Monitor usage**
5. **Gather insights**

---

### Phase 3: Iteration

**Duration:** 1 week

1. **Analyze feedback**
2. **Prioritize fixes**
3. **Implement improvements**
4. **Re-test**

---

## 📊 Success Metrics

### Analytics Charts

- ✅ **Usage:** % of users who view analytics
- ✅ **Engagement:** Time spent on analytics screen
- ✅ **Value:** User feedback on usefulness
- ✅ **Clarity:** User understanding of charts

### Smart Prompts

- ✅ **Delivery:** % of prompts successfully sent
- ✅ **Engagement:** % of prompts tapped
- ✅ **Effectiveness:** Do users log before buying?
- ✅ **Satisfaction:** User feedback on helpfulness

---

## 🐛 Common Issues & Fixes

### Analytics Issues

**Chart not rendering:**
- Check data format
- Verify impulses array
- Check console for errors

**Incorrect data:**
- Verify impulse data
- Check date calculations
- Verify filtering logic

**Poor performance:**
- Check data size
- Optimize calculations
- Add loading states

### Smart Prompts Issues

**Prompts not appearing:**
- Check notification permissions
- Verify impulse count (needs 5+)
- Check timing (weak hour)
- Check console logs

**Wrong timing:**
- Verify weak hour calculation
- Check time zone
- Verify pattern detection

**Too frequent:**
- Add cooldown period
- Reduce trigger frequency
- Add user preference

---

## ✅ Testing Checklist Summary

### Analytics
- [ ] All 3 chart types work
- [ ] Data is accurate
- [ ] Visual clarity is good
- [ ] Performance is acceptable
- [ ] Empty states handled

### Smart Prompts
- [ ] All prompt types work
- [ ] Timing is correct
- [ ] Content is helpful
- [ ] Notifications work
- [ ] Navigation works

### Overall
- [ ] No crashes
- [ ] Good UX
- [ ] Helpful features
- [ ] Ready for users

---

**Ready to test!** 🚀

