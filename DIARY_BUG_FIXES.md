# Diary Bug Fixes - August 16, 2026

## Masalah yang Diperbaiki

### 1. ❌ Error 406 pada Monthly Planner Queries

**Masalah:**
```
GET .../monthly_planners?...&month=eq.2026-08-31 406 (Not Acceptable)
GET .../monthly_planners?...&month=eq.2026-06-30 406 (Not Acceptable)
```

**Penyebab:**
- Query menggunakan hari terakhir bulan (`2026-08-31`, `2026-06-30`)
- Database constraint atau data mungkin menggunakan hari pertama bulan

**Solusi:**
✅ Kode sudah benar menggunakan `getFirstDayOfMonth()` function
✅ Tambahkan constraint di database untuk memastikan format konsisten
✅ Jalankan `database/fix_month_format.sql` untuk memperbaiki data existing

**Testing:**
```sql
-- Check data format
SELECT month FROM monthly_planners WHERE user_id = 'YOUR_USER_ID';
-- Should return: 2026-08-01, 2026-06-01 (not 2026-08-31)
```

---

### 2. 🖼️ Gambar Tidak Muncul di Daily Journal

**Masalah:**
- Foto muncul di Calendar of Us
- Foto TIDAK muncul di Daily Journal
- Data tersimpan tapi gambar tidak ter-load

**Penyebab:**
- Storage bucket berbeda: 
  - Calendar menggunakan `diary-images` ✅
  - Daily Journal menggunakan `daily-journal-photos` ❌ (bucket tidak ada)
- Path structure berbeda

**Solusi:**
✅ Ubah Daily Journal untuk menggunakan bucket `diary-images` yang sama
✅ Gunakan path prefix `daily-journal/` untuk organisasi
✅ Tambahkan error handling dan loading state
✅ Auto-save setelah upload selesai

**Perubahan Kode:**
```typescript
// SEBELUM (❌):
.from('daily-journal-photos')  // Bucket tidak ada!
.upload(`${fileName}`, file)   // No path prefix

// SESUDAH (✅):
.from('diary-images')          // Bucket yang sama dengan Calendar
.upload(`daily-journal/${fileName}`, file)  // Organized path
```

---

### 3. 💾 Data Daily Journal Tidak Tersimpan dengan Benar

**Masalah:**
- Form menampilkan "Saved successfully!" tapi data tidak benar-benar tersimpan
- Photo URL tidak tersimpan ke database

**Penyebab:**
- Upload foto tidak menunggu completion sebelum save
- Photo URL di-set ke state tapi tidak auto-save

**Solusi:**
✅ Tambahkan auto-save setelah upload foto selesai
✅ Perbaiki promise handling untuk upload function
✅ Tambahkan error logging untuk debugging
✅ Tambahkan image error handler untuk mendeteksi URL yang salah

**Perubahan Kode:**
```typescript
// Auto-save after photo upload
uploadPhoto(file).then(() => {
  setTimeout(() => {
    saveJournalData({})
  }, 500)
})

// Error handler untuk image load
<img 
  src={journalData.photo_url}
  onError={(e) => {
    console.error('Image load error:', journalData.photo_url)
    // Show placeholder
  }}
/>
```

---

## Files yang Diubah

1. **`app/diary/tabs/DailyJournal.tsx`**
   - Fix storage bucket dari `daily-journal-photos` → `diary-images`
   - Fix upload path dengan prefix `daily-journal/`
   - Tambah auto-save setelah upload
   - Tambah error handling untuk image loading
   - Tambah loading spinner untuk upload progress
   - Perbaiki Promise return type

2. **`database/fix_month_format.sql`** (NEW)
   - Script untuk fix data existing di monthly_planners
   - Tambah constraint untuk prevent future issues

3. **`STORAGE_SETUP.md`** (NEW)
   - Dokumentasi lengkap setup storage buckets
   - Instructions untuk RLS policies
   - Troubleshooting guide

---

## Langkah-langkah Implementasi

### 1. Update Database (WAJIB!)

Jalankan SQL berikut di Supabase SQL Editor:

```bash
# 1. Fix existing month data
psql < database/fix_month_format.sql

# Atau copy-paste isi file ke Supabase SQL Editor
```

### 2. Setup Storage Buckets

Di Supabase Dashboard → Storage:

1. ✅ Pastikan bucket `diary-images` exists
2. ✅ Pastikan bucket `diary-music` exists
3. ✅ Set bucket sebagai Public atau atur RLS policies
4. ✅ Lihat `STORAGE_SETUP.md` untuk details

### 3. Test Functionality

#### Test Daily Journal:
```typescript
1. Buka /diary → Daily Journal tab
2. Pilih tanggal hari ini
3. Upload foto → Harus langsung muncul preview
4. Click "Save Journal" → Check success message
5. Refresh page → Foto harus masih terlihat
6. Check browser console → Tidak ada error
```

#### Test Monthly Planner:
```typescript
1. Buka /diary → Monthly Planner tab
2. Navigasi ke bulan berbeda
3. Check browser console → Tidak ada 406 errors
4. Save data → Check success message
5. Refresh page → Data harus tersimpan
```

#### Test Calendar of Us:
```typescript
1. Buka /diary → Calendar tab
2. Click tanggal → Add event dengan foto
3. Save event → Foto harus tersimpan
4. Click tanggal yang sama → Foto harus muncul di modal
```

---

## Expected Behavior Setelah Fix

### ✅ Daily Journal
- ✅ Upload foto langsung muncul preview
- ✅ Foto tersimpan ke `diary-images/daily-journal/`
- ✅ Setelah save, foto tetap ada saat refresh
- ✅ Loading spinner saat upload
- ✅ Error message jika upload gagal

### ✅ Monthly Planner
- ✅ Tidak ada error 406
- ✅ Query menggunakan format `2026-08-01` (first day)
- ✅ Data tersimpan dan ter-load dengan benar
- ✅ Navigasi antar bulan smooth tanpa error

### ✅ Calendar of Us
- ✅ Foto masih berfungsi seperti sebelumnya
- ✅ Upload dan display tetap normal
- ✅ Shared bucket dengan Daily Journal

---

## Troubleshooting

### Gambar masih tidak muncul?

1. Check browser console untuk error
2. Verify bucket `diary-images` exists dan public
3. Check database:
   ```sql
   SELECT photo_url FROM daily_journals 
   WHERE user_id = 'YOUR_ID' 
   ORDER BY date DESC LIMIT 5;
   ```
4. Test URL langsung di browser
5. Check Storage policies di Supabase

### Masih ada error 406?

1. Run `database/fix_month_format.sql`
2. Check data format:
   ```sql
   SELECT month FROM monthly_planners;
   -- Must be: 2026-08-01, NOT 2026-08-31
   ```
3. Clear browser cache
4. Check API version di Supabase

### Data tidak tersimpan?

1. Check RLS policies di Supabase
2. Verify user_id correct
3. Check browser Network tab untuk API errors
4. Enable logging:
   ```typescript
   console.log('Saving data:', dataToSave)
   ```

---

## Developer Notes

### Storage Structure
```
diary-images/
├── diary-events/         # Calendar event photos
│   └── {userId}-{timestamp}.{ext}
└── daily-journal/        # Daily journal photos
    └── {userId}-{timestamp}.{ext}

diary-music/
└── diary-events/         # Calendar event audio
    └── {userId}-{timestamp}.{ext}
```

### Date Format Standards
- **Daily Journal**: `YYYY-MM-DD` (e.g., `2026-08-16`)
- **Monthly Planner**: `YYYY-MM-01` (first day of month, e.g., `2026-08-01`)
- **Habit Tracker**: `YYYY-MM-01` (same as monthly planner)

### Key Functions
```typescript
// Get first day of month (MonthlyPlanner)
function getFirstDayOfMonth(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString().split('T')[0]
}

// Upload photo (DailyJournal)
const uploadPhoto = async (file: File): Promise<void> => {
  // Returns promise for proper async handling
}
```

---

## Testing Checklist

- [ ] Run `fix_month_format.sql` di Supabase
- [ ] Verify buckets `diary-images` dan `diary-music` exists
- [ ] Test upload foto di Daily Journal
- [ ] Test save dan reload Daily Journal
- [ ] Test navigasi Monthly Planner (no 406 errors)
- [ ] Test save Monthly Planner data
- [ ] Verify Calendar of Us masih berfungsi
- [ ] Check browser console (no errors)
- [ ] Test di different browsers
- [ ] Test di mobile/responsive view

---

## Commit Message Template

```
fix(diary): resolve storage and date format issues

- Fix Daily Journal photo upload to use correct storage bucket
- Fix Monthly Planner 406 errors with proper date format
- Add auto-save after photo upload completion
- Add error handling and loading states
- Update storage documentation
- Add SQL script to fix existing data

Fixes: #[issue-number]
```
