# 🚀 TEST NOW - Quick Guide

## Error yang Tadi: SOLVED! ✅

Error SQL sudah diperbaiki. Sekarang test dengan query yang benar.

---

## 📋 QUICK TEST (5 menit):

### Step 1: Check Database Sekarang

Copy-paste query ini di **Supabase SQL Editor**:

```sql
-- Check if any data exists
SELECT COUNT(*) as total_entries FROM daily_journals;
```

**Expected:** Harus return number (bisa 0 kalau belum ada data)

---

### Step 2: Get Your User ID

```sql
SELECT id, username FROM profiles ORDER BY created_at DESC;
```

**Action:** Copy your `id` value (long string like `f0902aaa-cdb8-...`)

---

### Step 3: Check Your Entries

**GANTI `YOUR_USER_ID` dengan ID dari Step 2!**

```sql
SELECT 
  date,
  todo_list,
  completed_list,
  mood_morning,
  created_at
FROM daily_journals 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY date DESC;
```

**Expected:** 
- **If 0 rows:** Belum ada data (normal kalau belum save)
- **If > 0 rows:** Ada data! Check apakah sesuai dengan yang Anda input

---

### Step 4: Test Save Function

1. **Open App:** `http://localhost:3000/diary`
2. **Go to:** Daily Journal tab
3. **Fill data:**
   - Add 1 todo: "Test todo 1"
   - Select mood morning: Happy 😊
   - Type comment: "Testing save function"
4. **Click:** "💾 Save Journal"
5. **Watch for:**
   - ✅ "Saving..." button
   - ✅ Green toast "Saved successfully!" + timestamp
   - ✅ Green checkmark "Entry exists for this date"

---

### Step 5: Verify in Database

**Run query from Step 3 lagi:**

```sql
SELECT date, todo_list, mood_morning, created_at
FROM daily_journals 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY date DESC
LIMIT 1;
```

**Expected:** Harus ada 1 row baru dengan:
- ✅ `date` = hari ini (2026-08-16 or whatever today is)
- ✅ `todo_list` = `["Test todo 1"]`
- ✅ `mood_morning` = `"happy"`
- ✅ `created_at` = baru saja (beberapa detik yang lalu)

---

## ✅ If All Steps Pass:

**CONGRATS!** 🎉 Save function is working!

Now you can:
- Save journal entries for any date
- Edit existing entries
- View history in "Recent entries"
- Upload photos
- Everything persists after refresh

---

## ❌ If Step 5 Shows No Data:

### Check Console (F12):

1. Open browser console (F12)
2. Look for errors (red text)
3. Look for these logs:
   ```
   "Saving journal data: {...}"
   "Journal saved successfully: {...}"
   ```

### Common Issues:

**Issue 1: "Supabase error" in console**
- Might be RLS policy issue
- Run: `database/fix_rls_policies.sql`

**Issue 2: User ID mismatch**
- Check console log for user_id
- Compare with database profiles table
- Make sure they match

**Issue 3: Network error**
- Check Network tab (F12 → Network)
- Look for request to `/rest/v1/daily_journals`
- Check status code (should be 200 or 201)

---

## 🆘 Need Help?

**Send me:**

1. **Console Screenshot:**
   - F12 → Console tab
   - After clicking "Save Journal"
   - Show any errors or logs

2. **SQL Result:**
   ```sql
   SELECT * FROM daily_journals 
   WHERE user_id = 'YOUR_USER_ID';
   ```
   - Screenshot of result

3. **Network Tab:**
   - F12 → Network tab
   - After clicking save
   - Look for `daily_journals` request
   - Click it and screenshot Response tab

---

## 🎯 Success Checklist:

- [ ] Step 1: Database accessible ✓
- [ ] Step 2: Got my user ID ✓
- [ ] Step 3: Can query my data ✓
- [ ] Step 4: Save button shows feedback ✓
- [ ] Step 5: Data appears in database ✓
- [ ] Bonus: Refresh page → data still there ✓

---

## 💡 Quick SQL Reference:

### Show all my entries:
```sql
SELECT date, todo_list, mood_morning, mood_evening
FROM daily_journals 
WHERE user_id = 'YOUR_ID'
ORDER BY date DESC;
```

### Count my entries:
```sql
SELECT COUNT(*) FROM daily_journals 
WHERE user_id = 'YOUR_ID';
```

### Delete test entry (if needed):
```sql
DELETE FROM daily_journals 
WHERE user_id = 'YOUR_ID' 
  AND date = CURRENT_DATE;
```

### Check today's entry:
```sql
SELECT * FROM daily_journals 
WHERE user_id = 'YOUR_ID' 
  AND date = CURRENT_DATE;
```

---

**NOW:** Go through Step 1-5 and report hasil! 🚀

**Time needed:** 5 minutes maximum

**File ini:** Quick reference untuk test
