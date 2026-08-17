# 🧪 Testing Checklist - Diary Bug Fixes

## Pre-Testing Setup

### ✅ 1. Database Setup
- [ ] Buka Supabase Dashboard → SQL Editor
- [ ] Copy-paste `database/fix_month_format.sql`
- [ ] Run script
- [ ] Verify success message muncul

### ✅ 2. Storage Buckets
- [ ] Buka Supabase Dashboard → Storage
- [ ] Verify bucket `diary-images` exists
- [ ] Verify bucket `diary-music` exists
- [ ] Set buckets sebagai **Public** (atau setup RLS)

### ✅ 3. Restart Server
```bash
# Development
npm run dev

# Production (if deployed)
# Push changes dan rebuild
```

---

## 📝 Test Cases

### TEST 1: Daily Journal - Photo Upload

**Steps:**
1. Navigate ke `/diary`
2. Click tab "Daily Journal"
3. Pilih tanggal hari ini
4. Scroll ke "Photo of the day"
5. Click area upload
6. Pilih foto dari komputer
7. Tunggu upload selesai

**Expected Results:**
- [ ] Loading spinner muncul saat upload
- [ ] Preview foto muncul setelah upload selesai
- [ ] Tidak ada error di browser console
- [ ] Success toast muncul "Saved successfully!"

**Verify:**
- [ ] Refresh page
- [ ] Foto masih ada dan ter-load
- [ ] Click X button untuk hapus foto → berhasil

**Browser Console Check:**
```javascript
// Should see:
"Photo uploaded successfully: https://..."
// Should NOT see:
"Error uploading photo"
"Image load error"
```

---

### TEST 2: Daily Journal - Data Persistence

**Steps:**
1. Buka Daily Journal untuk hari ini
2. Add beberapa todo items
3. Select mood morning
4. Add completed items
5. Select mood evening
6. Tulis comment
7. Upload foto
8. Click "Save Journal"

**Expected Results:**
- [ ] "Saving..." message muncul
- [ ] "Saved successfully!" toast muncul
- [ ] Tidak ada error

**Verify:**
- [ ] Refresh halaman
- [ ] Semua data masih ada:
  - [ ] Todo list items
  - [ ] Mood morning selection
  - [ ] Completed list items
  - [ ] Mood evening selection
  - [ ] Comment text
  - [ ] Photo

**Database Check:**
```sql
SELECT * FROM daily_journals 
WHERE user_id = 'YOUR_USER_ID' 
  AND date = CURRENT_DATE;

-- Verify:
-- ✓ todo_list has items
-- ✓ completed_list has items
-- ✓ mood_morning not null
-- ✓ mood_evening not null
-- ✓ comment not null
-- ✓ photo_url not null
```

---

### TEST 3: Monthly Planner - No 406 Errors

**Steps:**
1. Navigate ke `/diary`
2. Click tab "Monthly Planner"
3. Open browser DevTools → Network tab
4. Navigate ke bulan sebelumnya (click ←)
5. Navigate ke bulan berikutnya (click →)
6. Navigate ke bulan berbeda lagi

**Expected Results:**
- [ ] Tidak ada HTTP 406 errors di Network tab
- [ ] Tidak ada error di Console tab
- [ ] Bulan berubah smoothly tanpa error
- [ ] Data untuk setiap bulan ter-load dengan benar

**Network Tab Check:**
```
❌ BAD:
GET .../monthly_planners?...&month=eq.2026-08-31  406 (Not Acceptable)

✅ GOOD:
GET .../monthly_planners?...&month=eq.2026-08-01  200 OK
```

**Database Query Check:**
```sql
-- Check all months use first day of month
SELECT 
  month,
  CASE 
    WHEN month = date_trunc('month', month)::date 
    THEN '✓ Correct' 
    ELSE '✗ Wrong' 
  END as status
FROM monthly_planners;

-- All should show "✓ Correct"
```

---

### TEST 4: Monthly Planner - Data Save

**Steps:**
1. Navigate ke Monthly Planner
2. Add focus theme
3. Add 2-3 big goals
4. Add 2-3 priorities
5. Add habit with icon
6. Track habit for today
7. Add gratitude items
8. Write notes
9. Click "Save Planner"

**Expected Results:**
- [ ] "Saving..." message muncul
- [ ] "Saved successfully!" toast muncul
- [ ] Tidak ada error

**Verify:**
- [ ] Refresh halaman
- [ ] Navigate ke bulan lain dan kembali
- [ ] Semua data tersimpan:
  - [ ] Focus theme
  - [ ] Goals list
  - [ ] Priorities list
  - [ ] Habits dan tracked dates
  - [ ] Gratitude list
  - [ ] Notes

---

### TEST 5: Calendar of Us - Still Works

**Steps:**
1. Navigate ke Calendar of Us tab
2. Click tanggal hari ini
3. Add new event dengan:
   - Title
   - Description
   - Photo
   - Audio (optional)
4. Save event
5. Click tanggal yang sama lagi

**Expected Results:**
- [ ] Event tersimpan
- [ ] Photo muncul di modal
- [ ] Audio bisa diputar (jika ada)
- [ ] Tidak ada error

**Verify:**
- [ ] Search event yang baru dibuat
- [ ] Jump to event dari search results
- [ ] Edit event → changes saved
- [ ] Delete event → berhasil terhapus

---

### TEST 6: Cross-Feature Integration

**Steps:**
1. Upload foto di Daily Journal
2. Upload foto di Calendar of Us
3. Check Supabase Storage

**Expected Results:**
- [ ] Kedua foto tersimpan di bucket `diary-images`
- [ ] Daily Journal photos di: `daily-journal/`
- [ ] Calendar photos di: `diary-events/`
- [ ] Semua foto accessible

**Storage Structure Check:**
```
diary-images/
├── diary-events/
│   └── user-123-timestamp.jpg  (from Calendar)
└── daily-journal/
    └── user-123-timestamp.jpg  (from Daily Journal)
```

---

### TEST 7: Error Handling

**Steps:**
1. Try upload foto > 5MB
2. Try upload non-image file
3. Try save tanpa internet (simulate offline)

**Expected Results:**
- [ ] Large file → Alert "Image size must be less than 5MB"
- [ ] Non-image → Alert "Please select an image file"
- [ ] Offline → Proper error message di console
- [ ] App tidak crash

---

### TEST 8: Mobile Responsive

**Steps:**
1. Open DevTools → Toggle device toolbar
2. Test pada berbagai screen sizes
3. Test semua tabs

**Expected Results:**
- [ ] Layout responsive
- [ ] Upload buttons accessible
- [ ] Modal tidak terpotong
- [ ] Save buttons visible
- [ ] Navigation works

---

## 🔍 Debugging Guide

### Issue: Image Not Loading

**Check:**
1. Browser Console untuk errors
2. Network tab untuk failed requests
3. Image URL format:
   ```
   ✅ https://PROJECT.supabase.co/storage/v1/object/public/diary-images/daily-journal/...
   ❌ https://PROJECT.supabase.co/storage/v1/object/public/daily-journal-photos/...
   ```

**Fix:**
- Verify bucket exists
- Check bucket is public
- Check RLS policies
- Test URL langsung di browser

---

### Issue: 406 Error on Monthly Planner

**Check:**
1. Network tab untuk query string
2. Database month format

**Query should look like:**
```
✅ month=eq.2026-08-01
❌ month=eq.2026-08-31
```

**Fix:**
```sql
-- Run fix_month_format.sql
UPDATE monthly_planners
SET month = date_trunc('month', month)::date;
```

---

### Issue: Data Not Persisting

**Check:**
1. Console untuk save errors
2. Network tab untuk API response
3. Database directly:
   ```sql
   SELECT * FROM daily_journals WHERE user_id = 'YOUR_ID';
   SELECT * FROM monthly_planners WHERE user_id = 'YOUR_ID';
   ```

**Fix:**
- Check RLS policies enabled
- Verify user_id correct
- Check API response status

---

## ✅ Final Verification

After all tests pass:

- [ ] No errors in browser console
- [ ] No 406 errors in Network tab
- [ ] All photos load correctly
- [ ] All data persists after refresh
- [ ] Mobile responsive works
- [ ] Search functionality works
- [ ] Delete functionality works
- [ ] Edit functionality works

---

## 📊 Test Results Template

```markdown
## Test Results - [Date]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Mobile/Tablet]
- OS: [Windows/Mac/Linux/iOS/Android]

**Tests Passed:** X/8
**Tests Failed:** 0/8

### Failed Tests:
- None ✅

### Notes:
- All features working as expected
- No errors encountered
- Performance: Excellent

**Status:** ✅ Ready for Production
```

---

**Last Updated:** August 16, 2026
**Tested By:** [Your Name]
**Status:** Ready for Testing
