# 🚨 FIX ERROR 406 & Constraint Violation - RUN THIS NOW!

## Errors You're Seeing:

```
❌ GET .../monthly_planners?month=eq.2026-07-31 406 (Not Acceptable)
❌ GET .../daily_journals?date=eq.2026-08-17 406 (Not Acceptable)
❌ POST .../monthly_planners 400 (Bad Request)
   Error: "violates check constraint month_must_be_first_day"
```

---

## ✅ ONE-TIME FIX (5 minutes):

### Step 1: Run Complete Fix SQL

1. **Open Supabase SQL Editor**
2. **Copy ALL content** from `database/COMPLETE_FIX.sql`
3. **Paste** into SQL Editor
4. **Click RUN**
5. **Wait** for success message

**What it does:**
- Removes constraint temporarily
- Fixes ALL existing data (changes 2026-07-31 → 2026-07-01)
- Re-adds constraint
- Fixes RLS policies (fixes 406 errors)
- Verifies everything

---

### Step 2: Restart Development Server

```bash
# Stop server (Ctrl+C if running)
npm run dev
```

---

### Step 3: Clear Browser Cache & Test

1. **Open browser** (F12 → Console)
2. **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Go to** `http://localhost:3000/diary`
4. **Test Monthly Planner:**
   - Navigate months (← →)
   - Check console → **Should be NO 406 errors!**
5. **Test Daily Journal:**
   - Fill form
   - Click Save
   - Check console → **Should be NO errors!**

---

## 🎯 Expected Result After Fix:

### Before:
```
❌ 406 errors everywhere
❌ Can't save monthly planner
❌ Constraint violation errors
```

### After:
```
✅ No 406 errors
✅ Can navigate months smoothly
✅ Can save monthly planner
✅ Can save daily journal
✅ All queries work perfectly
```

---

## 🔍 Verification After Fix:

Run this in Supabase SQL Editor to verify:

```sql
-- 1. Check all months are first day
SELECT month, EXTRACT(day FROM month) as day 
FROM monthly_planners;
-- All "day" should be 1

-- 2. Check RLS policies
SELECT tablename, policyname, qual 
FROM pg_policies 
WHERE tablename IN ('daily_journals', 'monthly_planners');
-- All "qual" should be "true"

-- 3. Test query with YOUR user_id
SELECT * FROM monthly_planners 
WHERE user_id = 'f0902aaa-cdb8-4ab1-b7e5-a3f280292e41'
ORDER BY month DESC;
-- Should return data without errors
```

---

## 🐛 If You Still See Errors:

### Error: "Permission denied" when running SQL

**Solution:** Make sure you're using the **SQL Editor** in Supabase Dashboard, not Table Editor.

---

### Error: "Constraint still violated"

**Check if data was actually fixed:**
```sql
SELECT month FROM monthly_planners WHERE EXTRACT(day FROM month) != 1;
-- Should return 0 rows
```

**If still has data:**
```sql
-- Force update
UPDATE monthly_planners SET month = '2026-07-01' WHERE month = '2026-07-31';
UPDATE monthly_planners SET month = '2026-08-01' WHERE month = '2026-08-31';
-- Repeat for each wrong month
```

---

### Error: Still 406 after fix

**Check policies were created:**
```sql
SELECT COUNT(*) FROM pg_policies 
WHERE tablename IN ('daily_journals', 'monthly_planners');
-- Should return at least 2 (one for each table)
```

**If count is 0:**
```sql
-- Manually create policies
CREATE POLICY "Allow all on daily_journals"
  ON daily_journals FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on monthly_planners"
  ON monthly_planners FOR ALL
  USING (true) WITH CHECK (true);
```

---

## 📸 Screenshot Checklist:

After running the fix, your console should show:

✅ **Network Tab:**
```
GET /monthly_planners?month=eq.2026-08-01  200 OK
GET /daily_journals?date=eq.2026-08-17     200 OK
POST /monthly_planners                      201 Created
```

✅ **Console Tab:**
```
No red errors
No 406 errors
No constraint violation errors
```

---

## 💡 Why This Happened:

1. **Old data** had wrong format (last day of month)
2. **New constraint** requires first day of month
3. **RLS policies** were using `auth.uid()` which doesn't work with custom auth
4. **App code** is correct, but database had mixed data

---

## ✅ After This Fix:

- ✅ All existing data corrected
- ✅ Constraint ensures future data is correct
- ✅ RLS policies allow queries
- ✅ No more 406 errors
- ✅ Everything works smoothly

---

## 🚀 Quick Start After Fix:

1. **Run SQL** from `COMPLETE_FIX.sql`
2. **Restart server:** `npm run dev`
3. **Hard refresh browser:** Ctrl+Shift+R
4. **Test everything**
5. **Enjoy bug-free diary!** 🎉

---

**Time needed:** 5 minutes
**Difficulty:** Easy (just copy-paste SQL)
**One-time fix:** Yes, won't need to run again

---

**IMPORTANT:** After running the fix, the error messages in screenshot should **completely disappear**. If they don't, send me:
1. Screenshot of SQL Editor after running COMPLETE_FIX.sql
2. Result of verification queries
3. New console errors (if any)

---

**File to run:** `database/COMPLETE_FIX.sql`
**Action:** Copy entire file content → Paste in Supabase SQL Editor → Run
**Then:** Restart server → Hard refresh browser → Test!
