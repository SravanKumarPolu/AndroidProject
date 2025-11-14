# Test Data Setup Guide 🧪

## Quick Start

Generate test data to test analytics charts and smart prompts without waiting for real usage.

---

## Option 1: Using Test Data Generator (Recommended)

### Step 1: Create Test Data Script

Create a file `scripts/generateTestData.ts`:

```typescript
import { generateTestImpulses, generatePatternTestData } from '@/utils/testDataGenerator';
import { storage } from '@/services/storage';

async function setupTestData() {
  console.log('Generating test data...');
  
  // Option A: Random test data (20 impulses)
  const randomData = generateTestImpulses(20);
  await storage.saveImpulses(randomData);
  console.log(`✅ Generated ${randomData.length} random impulses`);
  
  // Option B: Pattern-based test data (for smart prompts)
  const patternData = generatePatternTestData();
  await storage.saveImpulses(patternData);
  console.log(`✅ Generated ${patternData.length} pattern-based impulses`);
  
  console.log('Test data ready!');
}

setupTestData();
```

### Step 2: Run Script

```bash
# Add to package.json scripts
npm run generate-test-data

# Or run directly
npx ts-node scripts/generateTestData.ts
```

---

## Option 2: Manual Test Data

### For Analytics Charts Testing

**Minimum Data Needed:**
- 10+ impulses
- Mix of executed and cancelled
- Different categories
- Data spanning 2+ weeks
- Some with regret feedback

**Example Data:**
```typescript
const testImpulses = [
  // Week 1
  { category: 'FOOD', price: 500, status: 'EXECUTED', finalFeeling: 'REGRET', createdAt: now - 7 days },
  { category: 'SHOPPING', price: 2000, status: 'EXECUTED', finalFeeling: 'WORTH_IT', createdAt: now - 6 days },
  { category: 'FOOD', price: 300, status: 'CANCELLED', createdAt: now - 5 days },
  
  // Week 2
  { category: 'ENTERTAINMENT', price: 1500, status: 'EXECUTED', finalFeeling: 'REGRET', createdAt: now - 3 days },
  { category: 'FOOD', price: 400, status: 'EXECUTED', finalFeeling: 'REGRET', createdAt: now - 2 days },
  { category: 'SHOPPING', price: 800, status: 'CANCELLED', createdAt: now - 1 day },
];
```

---

## Option 3: For Smart Prompts Testing

### Pattern 1: Weak Hour (Evening 8-10 PM)

**Create 5+ impulses at same hour:**
```typescript
const weakHour = 21; // 9 PM
const impulses = [];
for (let i = 0; i < 5; i++) {
  const date = new Date();
  date.setHours(weakHour, 0, 0, 0);
  date.setDate(date.getDate() - i); // Different days
  impulses.push({
    category: 'FOOD',
    createdAt: date.getTime(),
    status: 'EXECUTED',
  });
}
```

### Pattern 2: Recent Regrets

**Create 3+ executed impulses with regret:**
```typescript
const regrets = [];
for (let i = 0; i < 3; i++) {
  regrets.push({
    category: 'FOOD', // Same category
    status: 'EXECUTED',
    finalFeeling: 'REGRET',
    executedAt: now - (i * 2 * 24 * 60 * 60 * 1000), // 2 days apart
  });
}
```

### Pattern 3: Active Impulses

**Create 2+ impulses in cool-down:**
```typescript
const active = [];
for (let i = 0; i < 2; i++) {
  active.push({
    category: 'SHOPPING',
    status: 'LOCKED',
    createdAt: now - (i * 2 * 60 * 60 * 1000), // 2 hours apart
    reviewAt: now + (24 * 60 * 60 * 1000), // 24h from now
  });
}
```

---

## Quick Test Data Commands

### Generate Random Data
```bash
npm run generate-test-data
```

### Clear All Data
```bash
# In app: Settings → Clear All Data
# Or manually clear AsyncStorage
```

### Import Test Data
```bash
# Use test data generator
# Or manually add via app
```

---

## Test Data Scenarios

### Scenario 1: Empty State Testing
- Clear all data
- Test analytics with no data
- Test smart prompts with < 5 impulses

### Scenario 2: Full Analytics Testing
- 20+ impulses
- Multiple categories
- 2+ months of data
- Mix of statuses

### Scenario 3: Smart Prompts Testing
- 5+ impulses (minimum for prompts)
- Weak hour pattern
- Regret pattern
- Active impulses

### Scenario 4: Realistic Usage
- 30+ impulses
- Realistic patterns
- Various categories
- Time-based distribution

---

## Verification

**After generating test data, verify:**
- [ ] Data appears in app
- [ ] Analytics charts show data
- [ ] Smart prompts trigger (if conditions met)
- [ ] No errors or crashes

---

**Ready to test!** 🚀

