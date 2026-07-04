# Supabase Setup Guide

This guide walks you through setting up Supabase for cloud storage and authentication.

---

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Enter a project name (e.g., "everythingreimbursable")
4. Set a secure database password (save this!)
5. Choose a region close to your users
6. Click "Create new project" (takes ~2 minutes)

---

## 2. Get Your Credentials

1. In your project dashboard, go to **Settings** → **API**
2. Copy the following values to your `.env.local` file:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Your `.env.local` should look like:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. For password reset emails: go to **Authentication** → **URL Configuration** and add
   `http://localhost:3000/reset-password` (and your production origin) to the redirect allowlist.

---

## 3. Create Storage Bucket for Receipt Images

1. In your project dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Name it: `receipt-images`
4. Check "Public bucket" (so images can be viewed without authentication)
5. Click "Create bucket"

### Configure Storage Policies

1. Click on the `receipt-images` bucket
2. Go to **Policies** tab
3. Click "New Policy"
4. Choose "For full customization"
5. Add these policies:

**Policy 1: Allow authenticated users to upload**

```sql
CREATE POLICY "Users can upload their own receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipt-images' AND auth.role() = 'authenticated');
```

**Policy 2: Allow public read access**

```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipt-images');
```

**Policy 3: Allow users to delete their own receipts**

```sql
CREATE POLICY "Users can delete their own receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'receipt-images' AND auth.role() = 'authenticated');
```

---

## 4. Create Database Tables (Optional - for Phase 4.2)

If you want to sync receipt data to the cloud, create a `receipts` table:

1. Go to **SQL Editor**
2. Run this SQL:

```sql
CREATE TABLE receipts (
  -- The app generates receipt IDs client-side (UUID strings), so TEXT not UUID-default
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  e_invoice_id TEXT,
  company_name TEXT NOT NULL,
  address TEXT,
  date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  payment_last4 TEXT,
  category TEXT NOT NULL,
  image_uri TEXT NOT NULL,
  cloud_path TEXT,
  confidence DECIMAL(3, 2) DEFAULT 0.95,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  synced_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX receipts_user_id_idx ON receipts (user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own receipts
CREATE POLICY "Users can view their own receipts"
ON receipts FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own receipts
CREATE POLICY "Users can insert their own receipts"
ON receipts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own receipts
CREATE POLICY "Users can update their own receipts"
ON receipts FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own receipts
CREATE POLICY "Users can delete their own receipts"
ON receipts FOR DELETE
USING (auth.uid() = user_id);
```

---

## 5. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (enabled by default) — the app uses email/password auth only

---

## 6. Test Your Setup

After configuring, restart your dev server:

```bash
npm run dev
```

The app will automatically:

- Upload receipt images to Supabase Storage
- Store image URLs in local database
- Fall back to local storage if Supabase is not configured

---

## Troubleshooting

### "Supabase credentials not configured"

- Check that `.env.local` exists and has correct values
- Restart the dev server (env vars are read at startup)

### "Storage policy violation"

- Make sure you created the storage policies in step 3
- Check that the user is authenticated (Phase 4.2)

### "Invalid API key"

- Verify you copied the **anon** key, not the service_role key
- The anon key is safe to expose in client-side code

---

## Security Notes

- The `anon` key is designed to be public - it's safe to include in your app
- Row Level Security (RLS) ensures users can only access their own data
- Never expose the `service_role` key in client-side code
- Storage policies prevent unauthorized uploads/deletions
