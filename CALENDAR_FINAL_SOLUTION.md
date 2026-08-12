# ✅ CALENDAR FINAL SOLUTION - Foreign Key Fix

## 🔴 Error Yang Muncul:
```
Failed to add event: insert or update on table "calendar_events" 
violates foreign key constraint "calendar_events_user_id_fkey"

Key (user_id)=(f0902aaa-cdb8-4ab1-b7e5-a3f280292e41) is not present in table "users"
```

## 🔍 Root Cause:
Table `calendar_events` punya foreign key ke `auth.users`, tapi:
- ❌ User ID kamu (`f0902aaa-cdb8-4ab1-b7e5-a3f280292e41`) ada di table **`profiles`**
- ❌ BUKAN di table `auth.users`
- ❌ Karena kamu pakai custom authentication, bukan Supabase Auth

## ✅ Solution:
Change foreign key dari `auth.users` ke `profiles` table.

---

## 🚀 CARA FIX (PILIH SALAH SATU):

### 🎯 Option A: Quick Fix (Recommended)
Jalankan SQL ini di Supabase SQL Editor:

**File:** `database/fix_calendar_foreign_key.sql`

```sql
-- Drop foreign key lama
ALTER TABLE public.calendar_events
DROP CONSTRAINT IF EXISTS calendar_events_user_id_fkey;

-- Add foreign key baru ke profiles
ALTER TABLE public.calendar_events
ADD CONSTRAINT calendar_events_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
```

### 🎯 Option B: Complete Fresh Setup
Kalau mau start dari awal (delete semua data):

**File:** `database/COMPLETE_CALENDAR_SETUP.sql`

```sql
-- Drop table completely
DROP TABLE IF EXISTS public.calendar_events CASCADE;

-- Create new table with correct foreign key
CREATE TABLE public.calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('memory', 'photo', 'message', 'birthday', 'special')),
  image_url TEXT,
  image_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Foreign key to PROFILES table (not auth.users)
  CONSTRAINT calendar_events_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE
);

-- Disable RLS
ALTER TABLE public.calendar_events DISABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_date ON public.calendar_events(event_date);
CREATE INDEX idx_calendar_events_type ON public.calendar_events(event_type);
```

---

## 📋 Step-by-Step Instructions:

### Step 1: Buka Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/qaxnyafpunqmfphzrgqe
2. Click **SQL Editor** di sidebar kiri
3. Click **New Query**

### Step 2: Run SQL
**Choose one:**

#### Option A (Quick Fix - Keep existing data):
```sql
ALTER TABLE public.calendar_events
DROP CONSTRAINT IF EXISTS calendar_events_user_id_fkey;

ALTER TABLE public.calendar_events
ADD CONSTRAINT calendar_events_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
```

#### Option B (Fresh Start - Delete all data):
Copy entire content from `database/COMPLETE_CALENDAR_SETUP.sql`

### Step 3: Klik Run (atau Ctrl + Enter)

### Step 4: Verify Success
You should see: ✅ "Success. No rows returned"

### Step 5: Refresh Browser
```
Tekan: Ctrl + Shift + R
```

### Step 6: Test Calendar! 🎉
1. Go to `/diary`
2. Klik tanggal mana saja
3. Pilih event type (🎂 Birthday)
4. Enter title: "Your Birthday"
5. Enter description: "Special day!"
6. Click **"Add Event"**

### ✨ SEHARUSNYA BERHASIL SEKARANG! 💕

---

## 🔍 Verification

After running SQL, verify in Supabase:

### Check Foreign Key:
```sql
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'calendar_events';
```

**Expected Result:**
- `foreign_table_name`: **profiles** (NOT users!)

### Check Your User ID Exists in Profiles:
```sql
SELECT id, username, display_name 
FROM public.profiles 
WHERE id = 'f0902aaa-cdb8-4ab1-b7e5-a3f280292e41';
```

Should return your profile data.

---

## 🎯 Summary of Changes

### Before (❌ WRONG):
```sql
FOREIGN KEY (user_id) REFERENCES auth.users(id)
```
- Points to Supabase Auth users table
- Your user doesn't exist there (custom auth)

### After (✅ CORRECT):
```sql
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
```
- Points to your profiles table
- Your user exists there!

---

## 📂 Files Created:

1. ✅ `database/fix_calendar_foreign_key.sql` - Quick fix
2. ✅ `database/COMPLETE_CALENDAR_SETUP.sql` - Complete setup
3. ✅ `CALENDAR_FINAL_SOLUTION.md` - This guide

---

## 🐛 If Still Not Working:

### Debug Checklist:

1. **Check user_id is correct:**
```javascript
// In browser console (F12)
const user = JSON.parse(localStorage.getItem('user_session'))
console.log('User ID:', user.id)
```

2. **Check profiles table has this user:**
```sql
SELECT * FROM public.profiles WHERE id = 'YOUR_USER_ID';
```

3. **Check calendar_events table exists:**
```sql
SELECT * FROM public.calendar_events LIMIT 1;
```

4. **Check RLS is disabled:**
```sql
SELECT rowsecurity FROM pg_tables 
WHERE tablename = 'calendar_events';
-- Should return: f (false)
```

---

## ✨ Final Result

After this fix, you'll have:

✅ Calendar events table pointing to correct `profiles` table  
✅ No more foreign key errors  
✅ Can add events successfully  
✅ Can view events on calendar  
✅ Can delete events  
✅ All 5 event types working (🌸📸💌🎂❤️)  

---

## 🎊 Next Steps After Fix:

Try adding different event types:
- 🌸 **Memory**: "Our first trip together"
- 📸 **Photo**: "Sunset at the beach"
- 💌 **Message**: "I love you"
- 🎂 **Birthday**: "Your special day"
- ❤️ **Special**: "Our anniversary"

Your Calendar of Us is finally ready! 💕🎉

---

**Status**: 🔧 Ready to fix!  
**Action**: Run Option A or B SQL in Supabase  
**Time**: < 1 minute  
**Result**: Working calendar! ✨
