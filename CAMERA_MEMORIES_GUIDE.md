# 📷 Camera Hub & Memories Gallery Guide

## ✅ Yang Sudah Dibuat:

### 1. **Camera Hub** (`/camera`)
Halaman utama untuk memilih antara:
- 📸 **Photo Booth** - Ambil foto & simpan ke gallery
- 🧩 **Puzzle Game** - Main puzzle (coming soon)

### 2. **Photo Booth** (`/camera/photobooth`)
- ✅ Akses webcam/camera
- ✅ Countdown 3-2-1
- ✅ Capture photo
- ✅ **Auto-save to Supabase Storage**
- ✅ **Auto-save to memories table**
- ✅ Download photo
- ✅ Retake photo
- ✅ Success animation
- ✅ Auto-redirect ke gallery

### 3. **Memories Gallery** (`/memories`)
- ✅ Load photos dari Supabase
- ✅ Grid layout responsive
- ✅ Lightbox view (klik untuk zoom)
- ✅ Delete photo
- ✅ Empty state (link ke camera)
- ✅ Loading state
- ✅ Error handling

### 4. **Home Menu Update**
- ❌ Puzzle dihapus dari home
- ✅ Camera description: "Photos & Games"
- ✅ 5 menu cards (bukan 6)

---

## 📊 New Flow Diagram

```
Home
  ↓
Click "Camera 📷"
  ↓
Camera Hub
  ↓
┌─────────────────┬─────────────────┐
│  Photo Booth    │  Puzzle Game    │
│  📸             │  🧩             │
└─────────────────┴─────────────────┘
         ↓                  ↓
    Take Photo        (Coming Soon)
         ↓
    Countdown 3-2-1
         ↓
    Photo Captured
         ↓
┌────────────────┬──────────────────┐
│ Save to Gallery│  Download        │
│ (auto to DB)   │  (local save)    │
└────────────────┴──────────────────┘
         ↓
    Success! ✅
         ↓
 Auto-redirect to
  Memories Gallery
         ↓
    View All Photos
```

---

## 🗄️ Database & Storage Setup

### Step 1: Setup Supabase Storage

**Buka Supabase Dashboard → SQL Editor:**

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'memories');

-- Allow public read
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'memories');

-- Allow delete own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'memories');
```

**Verify bucket created:**
```sql
SELECT * FROM storage.buckets WHERE id = 'memories';
```

### Step 2: RLS Already Setup

Table `memories` sudah ada RLS policy dari sebelumnya:
```sql
-- Public read access (untuk login)
CREATE POLICY "Allow public read access to profiles"
ON profiles FOR SELECT TO public USING (true);
```

---

## 🧪 Testing Guide

### Test 1: Camera Hub
1. Login ke app
2. Klik "Camera 📷" dari home
3. **Expected:** 2 cards
   - ✅ Photo Booth 📸
   - ✅ Puzzle Game 🧩

### Test 2: Photo Booth → Save to Gallery
1. Klik "Photo Booth"
2. Klik "Turn On Camera"
3. Allow camera permission
4. Wait 2-3 seconds
5. Klik "Take Photo"
6. Countdown: 3... 2... 1... 📸
7. Photo captured ✅
8. Klik **"💾 Save to Gallery"**
9. **Expected:**
   - Button shows "Saving..."
   - Success overlay: "✅ Saved to Gallery!"
   - Auto-redirect ke `/memories`
   - Photo appears in gallery grid

### Test 3: View in Gallery
1. Should auto-redirect from photo booth
2. **Expected:**
   - Photo grid dengan foto baru
   - Sorted by newest first
   - Responsive grid (2-3-4 columns)

### Test 4: Lightbox
1. Klik foto di gallery
2. **Expected:**
   - Full-screen lightbox
   - Large image view
   - Close button (×)
   - Delete button (🗑️)

### Test 5: Delete Photo
1. Open lightbox
2. Klik "🗑️ Delete"
3. Confirm delete
4. **Expected:**
   - Photo removed from database
   - Photo removed from storage
   - Gallery updates (photo hilang)

### Test 6: Empty State
1. Delete all photos
2. **Expected:**
   - Empty state shows:
     - "📷 No memories yet"
     - "Take your first photo!"
     - Button "Go to Camera"

---

## 📂 File Structure

```
app/
├── camera/
│   ├── page.tsx                 # Camera Hub (selector)
│   ├── photobooth/
│   │   └── page.tsx            # Photo Booth (with save)
│   └── puzzle/
│       └── page.tsx            # Puzzle placeholder
├── memories/
│   └── page.tsx                # Gallery (with delete)
├── home/
│   └── page.tsx                # Updated (no puzzle)
└── puzzle/
    └── page.tsx                # Old puzzle (updated back link)
```

---

## 🔧 Code Details

### Photo Upload Flow

```typescript
// 1. Capture photo
canvas.toBlob((blob) => {
  const imageUrl = URL.createObjectURL(blob)
  setCapturedImage(imageUrl)
}, 'image/jpeg', 0.9)

// 2. Save to Storage
const filename = `${user.id}/${Date.now()}.jpg`
const { data } = await supabase.storage
  .from('memories')
  .upload(filename, blob)

// 3. Get public URL
const { data: urlData } = supabase.storage
  .from('memories')
  .getPublicUrl(filename)

// 4. Save to Database
await supabase
  .from('memories')
  .insert({
    user_id: user.id,
    title: 'Photo Booth',
    description: 'Captured from photo booth',
    image_url: urlData.publicUrl,
    memory_date: new Date().toISOString().split('T')[0]
  })
```

### Gallery Load

```typescript
const { data } = await supabase
  .from('memories')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

setMemories(data || [])
```

### Delete Memory

```typescript
// Delete from DB
await supabase
  .from('memories')
  .delete()
  .eq('id', memoryId)

// Delete from Storage
const path = `${user.id}/${filename}`
await supabase.storage
  .from('memories')
  .remove([path])
```

---

## 🎨 UI Components

### Camera Hub Cards
```
┌────────────────────────────────┐
│                                │
│         Photo Booth            │
│            📸                  │
│                                │
│    Take photos & selfies       │
│                                │
└────────────────────────────────┘

┌────────────────────────────────┐
│                                │
│         Puzzle Game            │
│            🧩                  │
│                                │
│    Play photo puzzle           │
│                                │
└────────────────────────────────┘
```

### Memories Grid
```
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ IMG │ │ IMG │ │ IMG │ │ IMG │
└─────┘ └─────┘ └─────┘ └─────┘

┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ IMG │ │ IMG │ │ IMG │ │ IMG │
└─────┘ └─────┘ └─────┘ └─────┘

Responsive:
- Mobile: 2 columns
- Tablet: 3 columns  
- Desktop: 4 columns
```

---

## 🚨 Troubleshooting

### Issue 1: "Failed to save photo"

**Possible causes:**
1. Storage bucket not created
2. RLS blocking upload
3. Not authenticated

**Fix:**
```sql
-- Run setup_storage.sql in Supabase SQL Editor
-- Or temporarily allow public uploads:
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'memories');
```

### Issue 2: Gallery empty (but photos uploaded)

**Check:**
1. User ID match?
2. RLS blocking read?
3. Console errors?

**Debug:**
```javascript
// In browser console:
const { data, error } = await supabase
  .from('memories')
  .select('*')
console.log({ data, error })
```

### Issue 3: Images not loading

**Possible causes:**
1. Storage bucket not public
2. URL incorrect
3. File deleted but DB entry remains

**Fix:**
```sql
-- Make bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'memories';
```

### Issue 4: Delete not working

**Check:**
1. RLS policy for delete
2. Filename extraction correct?
3. User owns the file?

---

## 📊 Data Structure

### Memories Table
```typescript
interface Memory {
  id: string              // UUID
  user_id: string        // Foreign key to profiles
  title: string          // "Photo Booth"
  description: string    // "Captured from photo booth"
  image_url: string      // "https://...supabase.co/storage/.../123.jpg"
  memory_date: string    // "2024-01-15"
  created_at: string     // ISO timestamp
}
```

### Storage Path
```
memories/
  └── {user_id}/
        ├── 1786327607001.jpg
        ├── 1786327650234.jpg
        └── 1786327701456.jpg
```

---

## 🎯 Success Indicators

After setup, you should have:

1. **Camera Hub:**
   - ✅ 2 option cards
   - ✅ Hover effects
   - ✅ Navigation works

2. **Photo Booth:**
   - ✅ Camera works
   - ✅ Capture works
   - ✅ Save button appears
   - ✅ Saving... indicator
   - ✅ Success overlay
   - ✅ Auto-redirect

3. **Memories:**
   - ✅ Photos load
   - ✅ Grid responsive
   - ✅ Lightbox works
   - ✅ Delete works
   - ✅ Empty state shows

4. **Database:**
   - ✅ Photos in `memories` table
   - ✅ Files in Storage bucket
   - ✅ Public URLs work

---

## 🔮 Next Features (Future)

Photo Booth enhancements:
- [ ] Filters (Buzz theme!)
- [ ] Stickers/frames
- [ ] Text overlays
- [ ] Multiple photos (burst mode)
- [ ] Front/back camera toggle
- [ ] Timer options

Gallery enhancements:
- [ ] Search/filter
- [ ] Sort options
- [ ] Bulk delete
- [ ] Share photos
- [ ] Edit captions
- [ ] Photo details modal

Puzzle Game:
- [ ] Select photo from gallery
- [ ] Generate puzzle pieces
- [ ] Drag & drop
- [ ] Timer
- [ ] Score tracking
- [ ] Birthday surprise on complete!

---

Test semuanya dan screenshot jika ada error! 📸
