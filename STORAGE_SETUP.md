# Storage Setup Instructions

## Storage Buckets Required

Aplikasi ini menggunakan Supabase Storage untuk menyimpan file. Pastikan bucket berikut sudah dibuat di Supabase Dashboard:

### 1. `diary-images` (Untuk Calendar Events & Daily Journal)
- **Purpose**: Menyimpan foto untuk calendar events dan daily journal photos
- **Public**: Yes (atau buat RLS policy untuk private access)
- **Path Structure**:
  - `diary-events/` - untuk foto calendar events
  - `daily-journal/` - untuk foto daily journal

### 2. `diary-music` (Untuk Calendar Events Audio)
- **Purpose**: Menyimpan file audio untuk calendar events
- **Public**: Yes (atau buat RLS policy untuk private access)
- **Path Structure**:
  - `diary-events/` - untuk file audio calendar events

## Cara Membuat Storage Bucket

1. Buka Supabase Dashboard → Storage
2. Klik "New bucket"
3. Masukkan nama bucket: `diary-images`
4. Pilih "Public bucket" atau atur RLS policy
5. Klik "Create bucket"
6. Ulangi untuk bucket `diary-music`

## Storage Policies (Jika Private Bucket)

Jika Anda ingin bucket private, tambahkan policies berikut:

### Untuk `diary-images`:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'diary-images');

-- Allow authenticated users to read images
CREATE POLICY "Authenticated users can read images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'diary-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'diary-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Untuk `diary-music`:

```sql
-- Allow authenticated users to upload audio
CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'diary-music');

-- Allow authenticated users to read audio
CREATE POLICY "Authenticated users can read audio"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'diary-music');

-- Allow users to delete their own audio
CREATE POLICY "Users can delete their own audio"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'diary-music' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Troubleshooting

### Gambar Tidak Muncul di Daily Journal
1. Pastikan bucket `diary-images` sudah dibuat
2. Pastikan bucket public atau RLS policy sudah diatur
3. Check browser console untuk error messages
4. Verifikasi URL gambar di database (kolom `photo_url`)

### Error 406 pada Monthly Planner
- Error ini terjadi jika query format salah
- Pastikan kolom `month` menggunakan format DATE dengan hari pertama bulan (e.g., `2026-08-01`)
- Jangan gunakan hari terakhir bulan (e.g., `2026-08-31`)

### Audio Tidak Dapat Diputar
1. Pastikan bucket `diary-music` sudah dibuat
2. Pastikan file audio format didukung (mp3, m4a, wav, ogg)
3. Check MIME type yang di-upload sudah benar
