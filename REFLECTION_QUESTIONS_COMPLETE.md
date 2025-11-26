# Reflection Questions - Complete ✅

## Step 3: Reflection Questions - All Features Implemented

### ✅ Required Questions

After cool-down ends, the app displays three key reflection questions:

1. **"Do you really need it?"** ✅
   - Icon: 🤔
   - Description: "Think about whether this is a want or a need."
   - Prompts user to distinguish between wants and needs

2. **"How will you feel tomorrow?"** ✅
   - Icon: ⏰
   - Description: "Will you still want this, or will you regret it?"
   - Encourages forward-thinking about future feelings

3. **"Is it worth your savings goal?"** ✅
   - Icon: 🎯
   - Description: 
     - If price and goals exist: "This {amount} could go toward your goals instead."
     - Otherwise: "Consider your long-term financial goals."
   - Connects purchase to savings goals

---

## Implementation Details

### Files Created

**New Files**:
- `src/components/ReflectionQuestions.tsx` - Reflection questions component
  - Displays all three questions
  - Shows contextual goal information
  - Styled with TerminalGlow for visual emphasis
  - Only shows when cool-down has ended

### Files Modified

- `app/review-impulse/[id].tsx` - Added reflection questions display
  - Imported `ReflectionQuestions` component
  - Imported `useGoals` hook
  - Added questions display after header, before impulse card
  - Only shows when `isTimePast(impulse.reviewAt)` is true

---

## Component Features

### Visual Design
- **Card with border** - Outlined card for emphasis
- **TerminalGlow effect** - Subtle glow for visual appeal
- **Icons** - Each question has an emoji icon
- **Divider lines** - Separates questions visually
- **Responsive text** - Adapts to theme colors

### Contextual Information
- **Goal-aware** - Shows specific goal impact if goals exist
- **Price-aware** - Mentions specific amount if price is set
- **Conditional display** - Only shows after cool-down ends

### Question Layout
1. **Title**: "💭 Reflect Before You Decide"
2. **Subtitle**: "Take a moment to think about these questions:"
3. **Question 1**: "Do you really need it?"
4. **Question 2**: "How will you feel tomorrow?"
5. **Question 3**: "Is it worth your savings goal?"

---

## Display Logic

The reflection questions are shown:
- ✅ **After cool-down ends** - Only when `isTimePast(impulse.reviewAt)` is true
- ✅ **Before decision buttons** - Appears before "Skip" or "Still buying" buttons
- ✅ **After header** - Positioned right after "Time to Review" header
- ✅ **Before impulse card** - Shows before the impulse details card

---

## Integration with Goals

The third question ("Is it worth your savings goal?") is enhanced with:
- **Active goals** - Fetched using `useGoals` hook
- **Price calculation** - Shows how much could go toward goals
- **Dynamic description** - Changes based on whether goals exist

Example:
- If goals exist: "This ₹500 could go toward your goals instead."
- If no goals: "Consider your long-term financial goals."

---

## Verification

✅ All three questions displayed
✅ Questions only show after cool-down ends
✅ Goal-aware third question
✅ Price-aware third question
✅ Proper styling and layout
✅ Type safety maintained
✅ No linter errors

---

**Status**: Step 3 (Reflection Questions) is complete with all required features! 🎉

