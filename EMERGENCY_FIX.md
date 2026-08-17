# 🚨 EMERGENCY FIX - Masih Error 406

## Masalahnya:

SQL sudah berhasil, tapi **browser cache** masih menyimpan data lama dengan format `2026-07-31`.

---

## ✅ SOLUTION (3 Langkah):

### Step 1: Clear Browser Completely

1. **Open Browser Console** (F12)
2. **Go to Application tab** (or Storage tab)
3. **Find "Local Storage"** → `http://localhost:3000`
4. **Right-click** → **Clear**
5. **Find "Session Storage"** → **Clear** juga
6. **Go to Console tab**
7. **Type this command:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload(true);
   ```
8. **Press Enter**

---

### Step 2: Hard Refresh

1. **Press:** Ctrl + Shift + Delete (Windows) atau Cmd + Shift + Delete (Mac)
2. **Select:** Cached images and files
3. **Time range:** All time
4. **Click:** Clear data
5. **Close browser completely** (all tabs)
6. **Reopen browser**

---

### Step 3: Restart Everything

```bash
# Stop server
# Press Ctrl+C

# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Restart
npm run dev
```

---

## Alternative: Direct Database Check

Jika masih error, mari kita verify database benar-benar sudah fix:

```sql
-- 1. Check data di database
SELECT month, EXTRACT(day FROM month) as day_number
FROM monthly_planners 
WHERE user_id = 'f0902aaa-cdb8-4ab1-b7e5-a3f280292e41'
ORDER BY month DESC;

-- 2. Jika masih ada yang bukan 1, force update:
UPDATE monthly_planners 
SET month = DATE_TRUNC('month', month)::date
WHERE user_id = 'f0902aaa-cdb8-4ab1-b7e5-a3f280292e41';

-- 3. Check RLS policies
SELECT tablename, policyname, qual
FROM pg_policies 
WHERE tablename = 'monthly_planners';

-- 4. If no policies or wrong policies:
DROP POLICY IF EXISTS "Allow all on monthly_planners" ON monthly_planners;

CREATE POLICY "Allow all on monthly_planners"
  ON monthly_planners
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

---

## Quick Test Commands:

**In Browser Console (F12):**
```javascript
// Clear everything
localStorage.clear();
sessionStorage.clear();

// Check what's stored
console.log('LocalStorage:', {...localStorage});
console.log('SessionStorage:', {...sessionStorage});

// Hard reload
location.reload(true);
```

**In PowerShell:**
```powershell
# Stop server
# Ctrl+C

# Remove cache
Remove-Item -Recurse -Force .next

# Restart
npm run dev
```

---

## If STILL 406 After All:

The issue is **RLS policies**. Run this in Supabase:

```sql
-- Disable RLS temporarily to test
ALTER TABLE monthly_planners DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_journals DISABLE ROW LEVEL SECURITY;

-- Test if works now
-- If YES, then RLS is the problem

-- Re-enable with correct policies
ALTER TABLE monthly_planners ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on monthly_planners"
  ON monthly_planners FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on daily_journals"
  ON daily_journals FOR ALL
  USING (true) WITH CHECK (true);
```

---

## Why This Happens:

1. ✅ Database fixed (SQL ran successfully)
2. ❌ Browser cached old data with `2026-07-31`
3. ❌ Next.js cached old responses
4. ❌ LocalStorage might have old state

---

## Expected Result After Fix:

**Console should show:**
```
✅ GET .../monthly_planners?month=eq.2026-08-01 200 OK
✅ No 406 errors
✅ Can navigate months
✅ Can save data
```

**NOT:**
```
❌ GET .../monthly_planners?month=eq.2026-07-31 406
```

---

**DO THIS NOW:**
1. Clear browser cache (Application tab → Clear)
2. Run: `localStorage.clear(); sessionStorage.clear(); location.reload(true);`
3. Close browser completely
4. Delete `.next` folder
5. Restart: `npm run dev`
6. Open fresh browser window
7. Test!
