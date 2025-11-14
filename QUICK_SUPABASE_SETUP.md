# Quick Supabase Setup (5 Minutes)

## ✅ Why Supabase? (Best Financial Choice)

**Free Tier:**
- 50,000 monthly active users
- 500 MB database storage
- 1 GB file storage
- **Perfect for MVP - 100% FREE!**

**vs Firebase:**
- Free tier: Limited (50K reads/day)
- Paid: Unpredictable costs (~$282/month for 50K users)
- **Supabase is MUCH cheaper!**

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Create Account (1 min)
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up (free, no credit card needed)

### Step 2: Create Project (2 min)
1. Click "New Project"
2. Enter project name: "ImpulseVault"
3. Choose region (closest to you)
4. Enter database password (save it!)
5. Click "Create new project"
6. Wait ~2 minutes for setup

### Step 3: Get API Keys (1 min)
1. In your project, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public key** (long string starting with `eyJhbG...`)

### Step 4: Create Database Tables (1 min)
1. Go to **SQL Editor** in Supabase
2. Click "New query"
3. Copy and paste this SQL:

```sql
-- Create impulses table
CREATE TABLE IF NOT EXISTS impulses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC,
  emotion TEXT,
  urgency TEXT NOT NULL,
  cool_down_period TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  review_at BIGINT NOT NULL,
  status TEXT NOT NULL,
  executed_at BIGINT,
  final_feeling TEXT,
  skipped_feeling TEXT,
  notes TEXT,
  source_app TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  user_id UUID PRIMARY KEY,
  settings JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE impulses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only see their own data)
CREATE POLICY "Users can view own impulses"
  ON impulses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own impulses"
  ON impulses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own impulses"
  ON impulses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own impulses"
  ON impulses FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings"
  ON settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON settings FOR UPDATE
  USING (auth.uid() = user_id);
```

4. Click "Run" (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

### Step 5: Add Credentials to App (1 min)
1. In your project root, create `.env` file:
   ```bash
   touch .env
   ```

2. Add your credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Replace with your actual values from Step 3

4. **Restart Expo dev server:**
   ```bash
   npm start
   ```

---

## ✅ Done!

Now:
1. Open app
2. Go to **Settings** tab
3. Toggle **Cloud Sync** ON
4. Your data will sync automatically!

---

## 💰 Cost Breakdown

**Free Tier (What you get):**
- 50,000 users/month
- 500 MB database
- 1 GB file storage
- **Cost: $0/month**

**Pro Plan (If you grow):**
- 100,000 users/month
- 8 GB database
- 100 GB file storage
- **Cost: $25/month** (predictable!)

**vs Firebase:**
- 50K users = ~$282/month (unpredictable)
- **Supabase is 11x cheaper!**

---

## 🆘 Troubleshooting

**"Supabase not configured" warning:**
- Check `.env` file exists
- Verify credentials are correct
- Restart Expo dev server

**Sync not working:**
- Check internet connection
- Verify SQL was run successfully
- Check Supabase dashboard for errors

**Need help?**
- Full guide: See `SUPABASE_SETUP.md`
- Supabase docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

---

**That's it! You're ready to sync! 🎉**

