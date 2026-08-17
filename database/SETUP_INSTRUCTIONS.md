# ⚠️ WAJIB: Database Setup Instructions

## Error 406 - Table Not Found

Jika kamu melihat error:
```
Failed to load resource: the server responded with a status of 406
```

Ini berarti **tabel belum dibuat di Supabase**. Ikuti langkah di bawah!

---

## 📋 Step-by-Step Setup

### **Step 1: Buka Supabase Dashboard**

1. Login ke [Supabase](https://supabase.com)
2. Pilih project kamu (qaxnyafpunqmfphzrgqe)
3. Pergi ke menu **SQL Editor** (icon ⚡)

---

### **Step 2: Run SQL Schema**

1. **PERTAMA:** Buat tabel
   - Buka file: `database/planner_tables.sql`
   - Copy **SEMUA ISI** file tersebut
   - Paste di SQL Editor
   - Klik **RUN** (atau Ctrl/Cmd + Enter)
   - Tunggu sampai selesai (✓ Success)

2. **KEDUA:** Fix RLS Policies
   - Buka file: `database/fix_rls_policies.sql`
   - Copy **SEMUA ISI** file tersebut
   - Paste di SQL Editor
   - Klik **RUN**
   - Tunggu sampai selesai (✓ Success)

---

### **Step 3: Verify Tables Created**

Run query ini di SQL Editor untuk verify:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('daily_journals', 'monthly_planners', 'habit_tracker', 'schedule_tasks');
```

**Expected result:** 4 rows (daily_journals, monthly_planners, habit_tracker, schedule_tasks)

---

### **Step 4: Create Storage Bucket**

1. Pergi ke menu **Storage** (icon 📦)
2. Klik **New bucket**
3. Settings:
   - Name: `daily-journal-photos`
   - Public: **OFF** (unchecked)
   - File size limit: Leave default
   - Allowed MIME types: Leave default
4. Klik **Create bucket**

---

### **Step 5: Add Storage Policies**

1. Masih di **Storage**
2. Click pada bucket `daily-journal-photos`
3. Pergi ke tab **Policies**
4. Klik **New Policy**

**Atau run SQL ini di SQL Editor:**

```sql
-- Storage Policies for daily-journal-photos bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'daily-journal-photos');

CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'daily-journal-photos');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'daily-journal-photos');
```

---

## ✅ Verification Checklist

Setelah semua step selesai, verify:

### 1. Tables exist
```sql
\dt daily_journals monthly_planners habit_tracker schedule_tasks
```

### 2. RLS Policies active
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('daily_journals', 'monthly_planners', 'habit_tracker', 'schedule_tasks');
```

**Expected:** 4 policies per table (SELECT, INSERT, UPDATE, DELETE) = 16 total

### 3. Storage bucket exists
- Check in Storage menu
- Bucket name: `daily-journal-photos`
- Public: OFF

---

## 🧪 Test in App

1. Run development server:
   ```bash
   npm run dev
   ```

2. Login to app

3. Go to `/diary` → Tab **Daily**

4. Try:
   - Add todo item
   - Select mood
   - Upload photo
   - Click **💾 Save Journal**
   - See **"Saved successfully!"** toast

5. Refresh page
   - Data should persist

6. Go to Tab **Monthly**
   - Add goal
   - Add habit
   - Click **💾 Save Planner**
   - See **"Saved successfully!"** toast

---

## 🚨 Troubleshooting

### Error: `new row violates row-level security policy`
**Solution:** Run `fix_rls_policies.sql` again

### Error: `404` or `406` when loading data
**Solution:** 
1. Check tables exist
2. Check RLS policies are correct
3. Verify `user_id` in profiles table matches logged in user

### Photo upload fails
**Solution:** 
1. Check storage bucket exists
2. Check storage policies exist
3. Verify bucket name is `daily-journal-photos` (no typo)

### No save confirmation / data not persisting
**Solution:**
1. Open browser console (F12)
2. Look for errors
3. Most likely: tables don't exist → run SQL schema again

---

## 📝 Quick Check Command

Run this single command to check everything:

```sql
-- Check all setup
DO $$ 
BEGIN
  -- Check tables
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_journals') THEN
    RAISE NOTICE '❌ daily_journals table NOT FOUND';
  ELSE
    RAISE NOTICE '✅ daily_journals table exists';
  END IF;

  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'monthly_planners') THEN
    RAISE NOTICE '❌ monthly_planners table NOT FOUND';
  ELSE
    RAISE NOTICE '✅ monthly_planners table exists';
  END IF;

  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'habit_tracker') THEN
    RAISE NOTICE '❌ habit_tracker table NOT FOUND';
  ELSE
    RAISE NOTICE '✅ habit_tracker table exists';
  END IF;

  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'schedule_tasks') THEN
    RAISE NOTICE '❌ schedule_tasks table NOT FOUND';
  ELSE
    RAISE NOTICE '✅ schedule_tasks table exists';
  END IF;
END $$;
```

Expected output:
```
✅ daily_journals table exists
✅ monthly_planners table exists
✅ habit_tracker table exists
✅ schedule_tasks table exists
```

If you see ❌, re-run `planner_tables.sql`!
