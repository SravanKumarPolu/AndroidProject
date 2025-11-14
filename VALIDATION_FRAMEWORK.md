# ImpulseVault: Validation Framework & Action Plan

## 🎯 Quick Validation Checklist

Before building, validate these assumptions:

### Assumption 1: People Will Log Impulses Before Buying
**Validation Method:**
- Create a simple landing page with a form: "Log an impulse you're about to make"
- Post on Reddit (r/India, r/personalfinance) and ask people to try it
- **Success Metric:** 50+ submissions in 48 hours = validated

### Assumption 2: 24h Cool-Down Feels Meaningful
**Validation Method:**
- Survey 20 people: "If an app made you wait 24h before buying something, would you?"
- Ask: "Would you skip the wait or actually wait?"
- **Success Metric:** 60%+ say they'd wait = validated

### Assumption 3: People Want to Track Regrets
**Validation Method:**
- Ask 20 people: "Do you regret purchases? Would you track this?"
- **Success Metric:** 70%+ say yes = validated

### Assumption 4: Money Saved Visualization Motivates
**Validation Method:**
- Show mockup of "You saved ₹5,000" screen
- Ask: "Would this motivate you to use the app?"
- **Success Metric:** 70%+ say yes = validated

---

## 📊 Pre-Build Validation (1-2 Weeks)

### Step 1: Landing Page Test (3 days)

**Create a simple landing page:**
- Value prop: "Lock your impulses. Free your future."
- CTA: "Get early access" (collect emails)
- Optional: "Try it now" (simple form to log an impulse)

**Promote:**
- Reddit: r/India, r/personalfinance, r/Frugal
- HackerNews: "Show HN"
- Twitter/X: Post with relevant hashtags

**Success Metrics:**
- 100+ email signups = Strong interest ✅
- 50+ email signups = Moderate interest ⚠️
- <50 email signups = Weak interest ❌

**If <50 signups:** Pivot messaging or reconsider concept.

---

### Step 2: User Interviews (1 week)

**Find 10-15 potential users:**
- Post on Reddit: "Looking for people who overspend on Swiggy/Amazon"
- Offer: Free Pro access for feedback
- Ask friends/family who fit the profile

**Interview Questions:**

1. **Problem Validation:**
   - "Do you make impulse purchases? How often?"
   - "Do you regret purchases later? How often?"
   - "What's your biggest regret purchase this month?"

2. **Solution Validation:**
   - "If an app made you wait 24h before buying, would you use it?"
   - "Would you log impulses before buying? What would make it easier?"
   - "Would tracking regrets help you? Why?"

3. **Feature Prioritization:**
   - "What's most important: saving money, avoiding regret, or building awareness?"
   - "Would you pay for this? How much?"
   - "What would make you stop using it?"

**Success Metrics:**
- 8+ people say they'd use it = Validated ✅
- 5-7 people say they'd use it = Needs refinement ⚠️
- <5 people say they'd use it = Pivot needed ❌

---

### Step 3: Paper Prototype Test (2-3 days)

**Create paper mockups:**
- Home screen (active impulses)
- New Impulse form
- Review screen (after 24h)

**Test with 5 users:**
- Show mockups, walk through flow
- Ask: "Does this make sense? Would you use it?"
- Note confusion points

**Success Metrics:**
- 4+ users understand flow = Good UX ✅
- 2-3 users understand = Needs refinement ⚠️
- <2 users understand = Major UX issues ❌

---

## 🚀 MVP Build Plan (10 Weeks)

### Phase 1: Foundation (Week 1-2)

**Goals:**
- Set up project
- Define data model
- Build basic storage

**Tasks:**
- [ ] Initialize React Native + Expo project
- [ ] Set up TypeScript
- [ ] Create folder structure
- [ ] Define TypeScript types (Impulse, Stats)
- [ ] Set up AsyncStorage service
- [ ] Create basic data CRUD functions

**Deliverable:** Working data layer (can save/read impulses locally)

---

### Phase 2: Core Screens (Week 3-4)

**Goals:**
- Build main screens
- Basic navigation
- Simple UI

**Tasks:**
- [ ] Home screen (list active impulses)
- [ ] New Impulse screen (form)
- [ ] History screen (past impulses)
- [ ] Set up React Navigation (bottom tabs)
- [ ] Basic styling (colors, typography)
- [ ] Create reusable UI components (Button, Input, Card)

**Deliverable:** Navigable app with 3 main screens

---

### Phase 3: Core Features (Week 5-6)

**Goals:**
- Implement cool-down logic
- Add countdown timer
- Build review flow

**Tasks:**
- [ ] Cool-down timer (24h from creation)
- [ ] Countdown display component
- [ ] Review screen (after cool-down ends)
- [ ] Skip/Execute decision flow
- [ ] Update impulse status logic
- [ ] Basic stats computation (money saved, count)

**Deliverable:** Full core flow works (Log → Lock → Review → Decision)

---

### Phase 4: Notifications & Polish (Week 7-8)

**Goals:**
- Add push notifications
- Polish UI
- Add animations

**Tasks:**
- [ ] Set up Expo Notifications
- [ ] Notification: Cool-down ended
- [ ] Notification: Regret check (24h after execution)
- [ ] Stats computation (total saved, regret rate)
- [ ] UI polish (animations, micro-interactions)
- [ ] Copy refinement (supportive, not shaming)
- [ ] Error handling

**Deliverable:** Polished app with notifications

---

### Phase 5: Testing & Launch (Week 9-10)

**Goals:**
- Test on real device
- Fix bugs
- Prepare for launch

**Tasks:**
- [ ] Test on Android device
- [ ] Fix bugs and edge cases
- [ ] Create Play Store assets:
  - [ ] App icon (1024x1024)
  - [ ] Screenshots (at least 2)
  - [ ] Short description (80 chars)
  - [ ] Long description (4000 chars)
  - [ ] Feature graphic (1024x500)
- [ ] Write privacy policy
- [ ] Submit to Play Store
- [ ] Plan launch (Product Hunt, Reddit, etc.)

**Deliverable:** App live on Play Store

---

## 📋 MVP Feature Checklist

### Must-Have (v1)
- [ ] Log impulse (category, title, price, emotion, urgency)
- [ ] 24h cool-down timer
- [ ] Countdown display
- [ ] Review after cool-down (Skip/Execute)
- [ ] Regret check (24h after execution)
- [ ] Basic stats (money saved, regret rate)
- [ ] History view (saved vs executed)
- [ ] Push notifications (cool-down end, regret check)
- [ ] Local storage (AsyncStorage)

### Nice-to-Have (v1.5 - add if time allows)
- [ ] Streak counter
- [ ] Today's savings score
- [ ] Weekly review card
- [ ] Android widget (quick-add)

### Postpone to v2
- [ ] Multiple cool-down periods
- [ ] Cloud sync
- [ ] Advanced analytics (heatmaps, category breakdowns)
- [ ] Custom rules
- [ ] Strict mode toggle
- [ ] Export data
- [ ] Screenshot attachments
- [ ] Social features
- [ ] Pro features / monetization

---

## 🎨 Design System (Quick Reference)

### Colors
```typescript
const colors = {
  primary: '#6366F1',      // Indigo (calm, trustworthy)
  accent: '#F59E0B',       // Orange (warnings, impulses)
  success: '#10B981',      // Green (saved money)
  error: '#EF4444',        // Red (regrets)
  background: '#FAFAFA',   // Off-white
  text: '#1F2937',         // Dark gray
  textLight: '#6B7280',    // Light gray
};
```

### Typography
- **Headings:** Inter or Poppins (Bold, 24-32px)
- **Body:** System font (Regular, 16px)
- **Small:** System font (Regular, 14px)

### Spacing
- **Card padding:** 16px
- **Screen padding:** 20px
- **Gap between cards:** 12px
- **Border radius:** 12-16px

### Components
- **Button:** Rounded, 48px height, primary color
- **Card:** White background, subtle shadow, 12px radius
- **Input:** Rounded, 48px height, border
- **Badge:** Small, rounded, colored background

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] Can log new impulse
- [ ] Cool-down timer counts down correctly
- [ ] Review screen appears after 24h
- [ ] Can skip impulse (updates status)
- [ ] Can execute impulse (updates status)
- [ ] Regret check appears 24h after execution
- [ ] Stats compute correctly (money saved, regret rate)
- [ ] History shows all past impulses
- [ ] Notifications fire at correct times

### Edge Cases
- [ ] What if user closes app during cool-down? (timer should resume)
- [ ] What if user has multiple impulses? (all should show)
- [ ] What if price is 0 or missing? (should still work)
- [ ] What if notification is dismissed? (should still show in app)
- [ ] What if device time changes? (should handle gracefully)

### UX Testing
- [ ] Is logging frictionless? (should be <10 seconds)
- [ ] Is copy supportive? (not shaming)
- [ ] Are animations smooth? (no jank)
- [ ] Is navigation intuitive? (no confusion)

---

## 📈 Success Metrics (Post-Launch)

### Week 1-2: Early Adoption
- **Target:** 100+ downloads
- **Measure:** Play Store installs
- **Action if <100:** Improve marketing, post more

### Week 3-4: Engagement
- **Target:** 30%+ of users log at least 1 impulse
- **Measure:** Analytics (impulses logged / total users)
- **Action if <30%:** Improve onboarding, add widget

### Week 5-6: Retention
- **Target:** 20%+ of users still active (log at least 1 impulse/week)
- **Measure:** Weekly active users
- **Action if <20%:** Add re-engagement features (notifications, streaks)

### Week 7-8: Value Realization
- **Target:** 10%+ of users have saved at least ₹500
- **Measure:** Users with totalSaved > 500
- **Action if <10%:** Improve stats visualization, add weekly reviews

---

## 🚨 Red Flags (When to Pivot)

### Red Flag 1: Low Adoption (<5% log impulses)
**After:** 2 weeks
**Action:** 
- Add widget immediately
- Improve onboarding
- If still low after 1 month → Consider pivot

### Red Flag 2: High Skip Rate (>50% skip cool-downs)
**After:** 1 month
**Action:**
- Enforce strict mode by default
- Require reason to skip
- If still high → Consider different approach (longer cool-down?)

### Red Flag 3: Low Retention (<10% active after 1 month)
**After:** 1 month
**Action:**
- Add weekly reviews
- Add streaks
- Improve notifications
- If still low → Consider pivot to social features

---

## 🎯 Launch Strategy

### Pre-Launch (1 week before)
- [ ] Create Product Hunt account
- [ ] Write Product Hunt description
- [ ] Create launch video (30-60 seconds)
- [ ] Prepare Reddit posts (r/India, r/personalfinance)
- [ ] Prepare Twitter/X posts
- [ ] Email early access list

### Launch Day
- [ ] Submit to Product Hunt (12:01 AM PST)
- [ ] Post on Reddit (multiple subreddits, spaced out)
- [ ] Post on Twitter/X
- [ ] Email early access list
- [ ] Share with friends/family

### Post-Launch (Week 1)
- [ ] Monitor Product Hunt ranking
- [ ] Respond to all comments
- [ ] Monitor Play Store reviews
- [ ] Fix critical bugs immediately
- [ ] Collect user feedback

---

## 📝 Quick Reference: Key Decisions

### Decision 1: Cool-Down Period
**MVP:** Fixed 24h (no choice)
**Rationale:** Simpler, faster to build, easier to understand
**v2:** Add 1h, 6h, 3 days options

### Decision 2: Strict Mode
**MVP:** Optional, but recommended in onboarding
**Rationale:** Don't want to be too restrictive initially
**v2:** Make default for first week

### Decision 3: Cloud Sync
**MVP:** Local only (no accounts)
**Rationale:** Simpler, faster, privacy-friendly
**v2:** Add optional cloud sync (Pro feature)

### Decision 4: Monetization
**MVP:** Free, no ads
**Rationale:** Focus on adoption first
**v2:** Add Pro features, optional ads

### Decision 5: Widget
**MVP:** Postpone (nice but not critical)
**Rationale:** Reduces complexity, can add later
**v2:** Add as Pro feature

---

## ✅ Final Pre-Build Checklist

Before starting to code, ensure:

- [ ] Landing page tested (50+ signups)
- [ ] User interviews done (8+ positive responses)
- [ ] Paper prototype tested (4+ users understand)
- [ ] Tech stack decided (React Native + Expo)
- [ ] Folder structure planned
- [ ] Design system defined (colors, typography)
- [ ] MVP scope locked (no feature creep)
- [ ] Success metrics defined
- [ ] Launch strategy planned

**If all checked:** ✅ **Ready to build!**

**If not all checked:** ⚠️ **Do validation first, then build.**

---

Good luck! 🚀

