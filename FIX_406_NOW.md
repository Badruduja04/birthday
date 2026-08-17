# 🚨 Fix 406 Errors - Step by Step

## Error yang Anda Alami:

```
GET .../monthly_planners?month=eq.2026-07-31 406 (Not Acceptable)
GET .../daily_journals?date=eq.2026-08-17 406 (Not Acceptable)
```

---

## 🎯 Simple Fix (5 menit):

### Step 1: Check Month Format

Buka **Supabase SQL Editor**, copy-paste & run:

```sql
SELECT 
  month,
  EXTRACT(day FROM month) as day_of_month
FROM monthly_planners
ORDER BY month DESC;
```

**Look at `day_of_month` column:**
- ✅ If all show `1` → Skip to Step 3
- ❌ If any show `31`, `30`, `28` → Continue to Step 2

---

### Step 2: Fix Month Format (If needed)

Run ini **HANYA** jika Step 1 menunjukkan ada yang salah:

```sql
UPDATE monthly_planners
SET month = DATE_TRUNC('month', month)::date;

-- Verify
SELECT month FROM monthly_planners;
-- All should end with -01 now (e.g., 2026-07-01)
```

---

### Step 3: Check RLS Policies

Run query ini:

```sql
SELECT 
  tablename,
  policyname,
  qual
FROM pg_policies 
WHERE tablename IN ('daily_journals', 'monthly_planners');
```

**Look at `qual` column:**
- ✅ If all show `true` → You're good! Go to Step 5
- ❌ If any show `auth.uid()` or other → Continue to Step 4

---

### Step 4: Fix RLS Policies (If needed)

Copy-paste **ENTIRE FILE** `database/fix_rls_policies.sql` ke SQL Editor dan run.

**What it does:**
- Drop old policies that use `auth.uid()`
- Create new policies with `USING (true)`
- Works with custom auth (localStorage)

---

### Step 5: Restart & Test

```bash
# Stop current server (Ctrl+C)
npm run dev

# Open browser
http://localhost:3000/diary
```

**Check Console (F12):**
- ✅ No 406 errors → SUCCESS!
- ❌ Still 406 errors → See Troubleshooting below

---

## 🔍 Troubleshooting:

### Issue: "Error in SQL script"

**Possible causes:**
1. Table doesn't exist
2. Syntax error in copy-paste
3. Missing semicolons

**Solution:**
- Run queries **one at a time**, not all together
- Check for copy-paste errors
- Remove comments if causing issues

---

### Issue: Still 406 after Step 4

**Check if RLS is enabled:**

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('daily_journals', 'monthly_planners');
```

**If `rowsecurity` = false:**

```sql
-- Enable RLS
ALTER TABLE daily_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_planners ENABLE ROW LEVEL SECURITY;

-- Then run Step 4 again
```

---

### Issue: Can't UPDATE monthly_planners

**Error might be permission issue. Try this:**

```sql
-- Check if you're the owner
SELECT tablename, tableowner 
FROM pg_tables 
WHERE tablename = 'monthly_planners';

-- If not owner, you might need to use Supabase Dashboard
-- Or contact your Supabase project admin
```

---

## 🎯 Quick Verification:

After all steps, test with your user_id:

```sql
-- Replace YOUR_USER_ID with your actual ID
-- Get your ID first:
SELECT id, username FROM profiles LIMIT 1;

-- Then test (replace the ID):
SELECT * FROM monthly_planners 
WHERE user_id = 'f0902aaa-cdb8-4ab1-b7e5-a3f280292e41'
  AND month = '2026-08-01';

SELECT * FROM daily_journals 
WHERE user_id = 'f0902aaa-cdb8-4ab1-b7e5-a3f280292e41'
  AND date = CURRENT_DATE;
```

**Expected:** Queries run without errors, return your data

---

## ✅ Success Checklist:

- [ ] Step 1 done: Checked month format
- [ ] Step 2 done: Fixed month format (if needed)
- [ ] Step 3 done: Checked RLS policies  
- [ ] Step 4 done: Fixed RLS policies (if needed)
- [ ] Step 5 done: Restarted server
- [ ] No 406 errors in console
- [ ] Monthly Planner loads without errors
- [ ] Daily Journal loads without errors

---

## 📝 What Each Step Does:

**Step 1-2:** Fix date format
- Problem: `2026-07-31` (last day)
- Fix: `2026-07-01` (first day)

**Step 3-4:** Fix RLS policies
- Problem: Policies use `auth.uid()` which doesn't work with custom auth
- Fix: Use `USING (true)` to allow all (app filters by user_id)

**Step 5:** Apply changes
- Restart server to clear cache
- Test in browser

---

## 🆘 If Still Not Working:

**Send me:**

1. **Screenshot of Step 1 result:**
   ```sql
   SELECT month FROM monthly_planners;
   ```

2. **Screenshot of Step 3 result:**
   ```sql
   SELECT tablename, policyname, qual 
   FROM pg_policies 
   WHERE tablename IN ('daily_journals', 'monthly_planners');
   ```

3. **Console errors:**
   - Open F12 → Console
   - Screenshot any 406 errors

4. **What happened when you ran Step 2 or Step 4:**
   - Success?
   - Error message?

---

## 💡 Alternative: Disable RLS (Quick but not recommended)

If you're testing and just want it to work:

```sql
-- ⚠️ This disables security - only for testing!
ALTER TABLE daily_journals DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_planners DISABLE ROW LEVEL SECURITY;
```

**Then later, re-enable properly:**
```sql
-- Enable RLS
ALTER TABLE daily_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_planners ENABLE ROW LEVEL SECURITY;

-- Then run: database/fix_rls_policies.sql
```

---

**TL;DR:**
1. Run Step 1 → Check format
2. If wrong → Run Step 2
3. Run Step 3 → Check policies
4. If wrong → Copy-paste entire `fix_rls_policies.sql`
5. Restart server → Test

**Time:** 5 minutes max
**Difficulty:** Easy (just copy-paste)
