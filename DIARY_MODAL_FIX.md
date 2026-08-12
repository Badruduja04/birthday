# Diary Modal Scroll Fix & Music Upload Feature

## Issues Found:
1. ✅ Tab content (Book, Timeline, Highlights) sudah berfungsi dengan baik
2. ❌ Modal scroll - Background page scrolling instead of modal content  
3. ❌ Music upload belum ada (hanya text input)

## Fix #1: Modal Scroll Issue

### Problem:
Ketika Add Event Modal dibuka, user tidak bisa scroll konten modal. Yang ter-scroll malah halaman background.

### Solution:
Tambahkan `overflow-y-auto` ke modal content container dan `overflow-hidden` ke body ketika modal terbuka.

### Code Changes in `CalendarOfUs.tsx`:

**Line ~945-950** - Add Event Modal Container:
```tsx
// BEFORE (Yang Salah):
<motion.div
  className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
  onClick={() => !isSubmitting && setShowAddModal(false)}
>
  <motion.div
    className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border-2 border-white/20"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Content here */}
  </motion.div>
</motion.div>

// AFTER (Yang Benar):
<motion.div
  className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden"
  onClick={() => !isSubmitting && setShowAddModal(false)}
>
  <motion.div
    className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border-2 border-white/20 max-h-[90vh] overflow-y-auto"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Content here - Sekarang bisa di-scroll */}
  </motion.div>
</motion.div>
```

**Changes:**
- Outer container: Added `overflow-hidden` 
- Inner modal: Added `max-h-[90vh] overflow-y-auto`

### Apply Same Fix to EventDetailModal

File: `app/diary/components/EventDetailModal.tsx`

**Line ~70-80**:
```tsx
// BEFORE:
<motion.div
  className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
  onClick={onClose}
>
  <motion.div
    className={`bg-gradient-to-br ${EVENT_COLORS[event.event_type]} rounded-3xl p-8 max-w-lg w-full shadow-2xl border-2 border-white/20 relative`}
    onClick={(e) => e.stopPropagation()}
  >

// AFTER:
<motion.div
  className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden"
  onClick={onClose}
>
  <motion.div
    className={`bg-gradient-to-br ${EVENT_COLORS[event.event_type]} rounded-3xl p-8 max-w-lg w-full shadow-2xl border-2 border-white/20 relative max-h-[90vh] overflow-y-auto`}
    onClick={(e) => e.stopPropagation()}
  >
```

---

## Fix #2: Music File Upload Feature

### Problem:
Currently music hanya text input (title + artist). User want upload musik dari storage.

### Solution:
Implementasi music file upload similar to image upload.

### Database Changes Needed:

1. **Add music columns to calendar_events table**:
```sql
-- File: database/add_music_file_support.sql
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS music_url TEXT,
ADD COLUMN IF NOT EXISTS music_path TEXT;

COMMENT ON COLUMN calendar_events.music_url IS 'Public URL of uploaded music file';
COMMENT ON COLUMN calendar_events.music_path IS 'Storage path of uploaded music file';
```

2. **Create music storage bucket**:
```sql
-- Insert into storage.buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('diary-music', 'diary-music', true)
ON CONFLICT DO NOTHING;

-- Set up RLS policies
CREATE POLICY "Users can upload own music"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'diary-music' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own music"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'diary-music');

CREATE POLICY "Users can delete own music"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'diary-music' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Code Changes in `CalendarOfUs.tsx`:

**Add state for music file**:
```tsx
// Around line 60 - Add to existing states:
const [newEventMusicFile, setNewEventMusicFile] = useState<File | null>(null)
const [musicPreview, setMusicPreview] = useState<string | null>(null)
const [isUploadingMusic, setIsUploadingMusic] = useState(false)
```

**Add music file handler**:
```tsx
const handleMusicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // Validate file type (audio only)
  if (!file.type.startsWith('audio/')) {
    alert('Please select an audio file')
    return
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('Music file size must be less than 10MB')
    return
  }

  setNewEventMusicFile(file)
  setMusicPreview(file.name) // Show filename as preview
}

const handleRemoveMusic = () => {
  setNewEventMusicFile(null)
  setMusicPreview(null)
}

const uploadMusic = async (file: File, userId: string): Promise<{ url: string; path: string } | null> => {
  try {
    setIsUploadingMusic(true)
    
    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('diary-music')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('diary-music')
      .getPublicUrl(filePath)

    return {
      url: urlData.publicUrl,
      path: filePath
    }
  } catch (error: any) {
    console.error('Music upload error:', error)
    alert('Failed to upload music: ' + error.message)
    return null
  } finally {
    setIsUploadingMusic(false)
  }
}
```

**Update handleAddEvent to upload music**:
```tsx
const handleAddEvent = async () => {
  // ... existing validation ...

  try {
    setIsSubmitting(true)
    
    let imageUrl = null
    let imagePath = null
    let musicUrl = null
    let musicPath = null

    // Upload image if selected
    if (newEventImage) {
      imageUrl = await uploadImage(newEventImage, userId)
      if (imageUrl) {
        imagePath = `diary-events/${userId}-${Date.now()}.${newEventImage.name.split('.').pop()}`
      }
    }

    // Upload music if selected
    if (newEventMusicFile) {
      const musicData = await uploadMusic(newEventMusicFile, userId)
      if (musicData) {
        musicUrl = musicData.url
        musicPath = musicData.path
      }
    }

    const { error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: userId,
        title: newEventTitle.trim(),
        description: newEventDescription.trim() || null,
        event_date: selectedDate.toISOString().split('T')[0],
        event_type: newEventType,
        music_title: newEventMusicTitle.trim() || null,
        music_artist: newEventMusicArtist.trim() || null,
        music_url: musicUrl,
        music_path: musicPath,
        image_url: imageUrl,
        image_path: imagePath
      })

    if (error) throw error

    // ... rest of the function ...
    
    // Reset music fields
    setNewEventMusicFile(null)
    setMusicPreview(null)
    
  } catch (err: any) {
    console.error('Add event error:', err)
    alert('Failed to add event: ' + err.message)
  } finally {
    setIsSubmitting(false)
  }
}
```

**Add Music Upload UI in Modal** (Around line 1000):
```tsx
{/* Song Section */}
<div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
  <div className="flex items-center gap-2 mb-4">
    <span className="text-2xl">🎵</span>
    <h3 className="text-white font-semibold">Song (Optional)</h3>
  </div>

  {/* Option 1: Upload Music File */}
  <div className="mb-4">
    <label className="block text-white/70 text-sm mb-2">Upload Music File</label>
    <input
      type="file"
      accept="audio/*"
      onChange={handleMusicSelect}
      disabled={isUploadingMusic || isSubmitting}
      className="hidden"
      id="music-upload"
    />
    <label
      htmlFor="music-upload"
      className={`
        w-full border-2 border-dashed border-white/30 rounded-xl p-6
        flex flex-col items-center justify-center cursor-pointer
        transition-all duration-300
        ${isUploadingMusic || isSubmitting 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:border-pink-400 hover:bg-white/5'
        }
      `}
    >
      <span className="text-4xl mb-2">🎵</span>
      <p className="text-white/90 text-sm font-medium mb-1">
        {musicPreview || 'Click to upload music'}
      </p>
      <p className="text-white/60 text-xs">MP3, WAV, M4A up to 10MB</p>
    </label>

    {musicPreview && (
      <button
        onClick={handleRemoveMusic}
        disabled={isUploadingMusic || isSubmitting}
        className="mt-2 text-red-400 text-sm hover:text-red-300 transition-colors"
      >
        ✕ Remove music
      </button>
    )}
  </div>

  {/* Option 2: Or Enter Details Manually */}
  <div className="pt-4 border-t border-white/10">
    <p className="text-white/60 text-xs mb-3 text-center">Or enter song details manually</p>
    
    <input
      type="text"
      value={newEventMusicTitle}
      onChange={(e) => setNewEventMusicTitle(e.target.value)}
      placeholder="Song title"
      disabled={isSubmitting}
      className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/40 border border-white/20 focus:border-pink-500 outline-none transition-all duration-300 mb-3"
    />
    
    <input
      type="text"
      value={newEventMusicArtist}
      onChange={(e) => setNewEventMusicArtist(e.target.value)}
      placeholder="Artist"
      disabled={isSubmitting}
      className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/40 border border-white/20 focus:border-pink-500 outline-none transition-all duration-300"
    />
  </div>
  
  <p className="text-white/50 text-xs mt-3">
    Add a song that reminds you of this moment
  </p>
</div>
```

### Update database.types.ts:
```tsx
// Add to calendar_events Row/Insert/Update:
music_url: string | null
music_path: string | null
```

---

## Testing Checklist:

### Modal Scroll:
- [ ] Open Add Event Modal
- [ ] Try scrolling inside modal content
- [ ] Verify background page tidak ikut scroll
- [ ] Verify semua form fields masih bisa diakses dengan scroll

### Music Upload:
- [ ] Upload MP3 file - should work
- [ ] Upload WAV file - should work
- [ ] Try upload non-audio file - should show error
- [ ] Try upload file > 10MB - should show error
- [ ] Remove uploaded music - should clear preview
- [ ] Submit event dengan music file - should save to database
- [ ] View event detail dengan music - should show player (future enhancement)

### Existing Features (Regression Test):
- [ ] Image upload still works
- [ ] Manual music text input still works  
- [ ] Event types selection works
- [ ] Calendar navigation works
- [ ] Book/Timeline/Highlights tabs work

---

## Summary:

**Modal Scroll Fix:**
- Add `overflow-hidden` to outer container
- Add `max-h-[90vh] overflow-y-auto` to inner modal

**Music Upload Feature:**
- Add `music_url` and `music_path` columns to database
- Create `diary-music` storage bucket
- Implement file upload similar to image upload
- Support MP3, WAV, M4A files up to 10MB
- Keep manual text input as alternative option

---

**Note:** Tab content (Book, Timeline, Highlights) sudah berfungsi dengan baik. Tidak ada perubahan yang diperlukan untuk tabs.
