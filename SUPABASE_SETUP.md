# Supabase Setup Guide

## 🎯 Why Supabase? (Cost-Effective Choice)

**Free Tier:**
- ✅ 50,000 monthly active users
- ✅ 500 MB database storage
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth
- ✅ **Perfect for MVP - FREE!**

**Pro Plan (if needed):**
- $25/month flat rate (predictable)
- 100,000 monthly active users
- 8 GB database storage
- 100 GB file storage

**vs Firebase:**
- Free tier: Limited (50K reads/day)
- Paid: Pay-as-you-go (unpredictable, can get expensive)
- Example: 50K users = ~$282/month

**✅ Supabase is better for solo devs with financial constraints!**

---

## 📋 Setup Steps

### 1. Create Supabase Project (FREE)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up (free)
4. Create new project
5. Choose region closest to you
6. Wait for project to initialize (~2 minutes)

---

### 2. Get API Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **anon public key** (starts with `eyJhbGci...`)

---

### 3. Create Database Tables

In Supabase, go to **SQL Editor** and run:

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

-- Enable Row Level Security (RLS)
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

---

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Important:** Add `.env` to `.gitignore` (already done)

---

### 5. Enable Cloud Sync in App

1. Open app
2. Go to **Settings** tab
3. Toggle **Cloud Sync** ON
4. Data will sync automatically every 5 minutes

---

## 🔒 Security

**Row Level Security (RLS):**
- ✅ Enabled on all tables
- ✅ Users can only access their own data
- ✅ Anonymous auth for sync (no login required)

**Why Anonymous Auth:**
- No user registration needed
- Works immediately
- Secure (RLS ensures data isolation)
- Can upgrade to email auth later if needed

---

## 💰 Cost Breakdown

### Free Tier (Perfect for MVP)
- **Users:** Up to 50,000/month
- **Storage:** 500 MB database
- **Bandwidth:** 2 GB/month
- **Cost:** **FREE**

### Pro Plan (If you grow)
- **Users:** Up to 100,000/month
- **Storage:** 8 GB database
- **Bandwidth:** 250 GB/month
- **Cost:** **$25/month** (predictable!)

### Self-Hosted (Future)
- **Cost:** **FREE** (just server costs)
- **Control:** Full control over data
- **When:** If you outgrow Pro plan

---

## 📊 Data Usage Estimate

**Per User:**
- Average impulse: ~500 bytes
- 100 impulses/user: ~50 KB
- 1,000 users: ~50 MB

**Free Tier Capacity:**
- 500 MB = ~10,000 users with 100 impulses each
- **More than enough for MVP!**

---

## ✅ Setup Checklist

- [ ] Create Supabase account (free)
- [ ] Create new project
- [ ] Copy API credentials
- [ ] Run SQL to create tables
- [ ] Add credentials to `.env` file
- [ ] Enable cloud sync in app
- [ ] Test sync (create impulse, wait 5 min)

---

## 🚀 Next Steps

1. **Start with free tier** - Perfect for MVP
2. **Monitor usage** - Check Supabase dashboard
3. **Upgrade if needed** - Only $25/month when you grow
4. **Self-host later** - If you want full control

---

## 🆘 Troubleshooting

**"Supabase not configured" warning:**
- Check `.env` file exists
- Verify credentials are correct
- Restart Expo dev server

**Sync not working:**
- Check internet connection
- Verify RLS policies are created
- Check Supabase dashboard for errors

**Need help?**
- Supabase docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

---

**Last Updated:** After Supabase integration

