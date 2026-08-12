# 🚨 URGENT: Diary Fixes - Modal Scroll & Book Tab Function

## Issue #1: Add Event Modal Tidak Bisa Di-Scroll ❌

### Problem:
- Modal Add Event terbuka tapi tidak bisa di-scroll
- Button "Add Event" dan "Cancel" tidak bisa diklik karena ter-hidden di bawah
- Background page yang malah ke-scroll

### ROOT CAUSE:
Modal container tidak memiliki `overflow-y-auto` dan `max-height`

### SOLUTION - Fix CalendarOfUs.tsx:

Cari bagian `{/* Add Event Modal */}` sekitar line 943-950, ganti seluruh modal container:

**BEFORE (Yang Error):**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
  onClick={() => !isSubmitting && setShowAddModal(false)}
>
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.9, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border-2 border-white/20"
    onClick={(e) => e.stopPropagation()}
  >
```

**AFTER (Yang Benar - PASTI BISA DI-SCROLL):**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden"
  onClick={() => !isSubmitting && setShowAddModal(false)}
>
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ scale: 0.9, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border-2 border-white/20 max-h-[90vh] overflow-y-auto"
    onClick={(e) => e.stopPropagation()}
    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(236, 72, 153, 0.5) transparent' }}
  >
```

### KEY CHANGES:
1. **Outer div**: Added `overflow-hidden` - prevent background scroll
2. **Inner div**: Added `max-h-[90vh] overflow-y-auto` - enable modal scroll
3. **Inner div**: Added `style={{ scrollbarWidth: 'thin' }}` - custom scrollbar style
4. **Inner div**: Removed `scale: 1` from animate to prevent re-render issues

---

## Issue #2: Book Tab Salah Fungsi ❌

### Problem:
- Book Tab saat ini hanya menampilkan events dari calendar
- Seharusnya Book Tab untuk mencatat keseharian (daily diary entries)
- User ingin bisa menulis catatan harian yang TIDAK terikat dengan event khusus

### CURRENT FUNCTION (Salah):
Book Tab = menampilkan filtered calendar events (memory, photo, message, birthday, special)

### CORRECT FUNCTION (Yang Diinginkan):
Book Tab = Daily diary entries untuk mencatat apa saja (thoughts, feelings, daily activities)

### SOLUTION - Buat Sistem Baru:

#### Step 1: Create New Database Table untuk Diary Entries

**File: `database/create_diary_entries_table.sql`**
```sql
-- Create diary_entries table for Book Tab
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  mood TEXT, -- happy, sad, excited, calm, anxious, etc.
  weather TEXT, -- sunny, rainy, cloudy, etc.
  image_url TEXT,
  image_path TEXT,
  tags TEXT[], -- array of tags like ['work', 'family', 'travel']
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_diary_entries_user_date ON diary_entries(user_id, entry_date DESC);
CREATE INDEX idx_diary_entries_user_created ON diary_entries(user_id, created_at DESC);
CREATE INDEX idx_diary_entries_tags ON diary_entries USING GIN(tags);

-- Enable RLS
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own diary entries"
ON diary_entries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary entries"
ON diary_entries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary entries"
ON diary_entries FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary entries"
ON diary_entries FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE diary_entries IS 'Daily diary entries for Book tab - personal thoughts and feelings';
COMMENT ON COLUMN diary_entries.mood IS 'User mood for the day';
COMMENT ON COLUMN diary_entries.weather IS 'Weather condition for the day';
COMMENT ON COLUMN diary_entries.tags IS 'Tags for categorizing entries';
```

#### Step 2: Update Database Types

**File: `types/database.types.ts`**

Add inside `Database['public']['Tables']`:
```typescript
diary_entries: {
  Row: {
    id: string
    user_id: string
    entry_date: string
    title: string
    content: string | null
    mood: string | null
    weather: string | null
    image_url: string | null
    image_path: string | null
    tags: string[] | null
    is_private: boolean
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    user_id: string
    entry_date: string
    title: string
    content?: string | null
    mood?: string | null
    weather?: string | null
    image_url?: string | null
    image_path?: string | null
    tags?: string[] | null
    is_private?: boolean
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    entry_date?: string
    title?: string
    content?: string | null
    mood?: string | null
    weather?: string | null
    image_url?: string | null
    image_path?: string | null
    tags?: string[] | null
    is_private?: boolean
    created_at?: string
    updated_at?: string
  }
}
```

#### Step 3: Create New BookTab Component

**File: `app/diary/tabs/BookTab.tsx`** (REPLACE ENTIRE FILE)

```typescript
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type DiaryEntry = Database['public']['Tables']['diary_entries']['Row']

interface BookTabProps {
  userId: string
}

const MOOD_ICONS: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  excited: '🤩',
  calm: '😌',
  anxious: '😰',
  angry: '😠',
  loved: '🥰',
  tired: '😴'
}

const WEATHER_ICONS: Record<string, string> = {
  sunny: '☀️',
  rainy: '🌧️',
  cloudy: '☁️',
  stormy: '⛈️',
  snowy: '❄️',
  windy: '💨'
}

export default function BookTab({ userId }: BookTabProps) {
  const prefersReducedMotion = useReducedMotion()
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  
  // Form state
  const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [newEntryTitle, setNewEntryTitle] = useState('')
  const [newEntryContent, setNewEntryContent] = useState('')
  const [newEntryMood, setNewEntryMood] = useState<string>('happy')
  const [newEntryWeather, setNewEntryWeather] = useState<string>('sunny')
  const [newEntryTags, setNewEntryTags] = useState<string>('')
  const [newEntryImage, setNewEntryImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadEntries()
  }, [userId])

  const loadEntries = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false })
        .limit(50)

      if (error) throw error
      setEntries(data || [])
    } catch (err) {
      console.error('Load entries error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEntry = async () => {
    if (!newEntryTitle.trim()) {
      alert('Please enter a title')
      return
    }

    try {
      setIsSubmitting(true)
      
      let imageUrl = null
      let imagePath = null

      // Upload image if selected
      if (newEntryImage) {
        imageUrl = await uploadImage(newEntryImage, userId)
        if (imageUrl) {
          imagePath = `diary-entries/${userId}-${Date.now()}.${newEntryImage.name.split('.').pop()}`
        }
      }

      // Parse tags (comma separated)
      const tagsArray = newEntryTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const { error } = await supabase
        .from('diary_entries')
        .insert({
          user_id: userId,
          entry_date: newEntryDate,
          title: newEntryTitle.trim(),
          content: newEntryContent.trim() || null,
          mood: newEntryMood,
          weather: newEntryWeather,
          tags: tagsArray.length > 0 ? tagsArray : null,
          image_url: imageUrl,
          image_path: imagePath
        })

      if (error) throw error

      // Reload entries
      await loadEntries()

      // Reset form
      setNewEntryTitle('')
      setNewEntryContent('')
      setNewEntryMood('happy')
      setNewEntryWeather('sunny')
      setNewEntryTags('')
      setNewEntryImage(null)
      setImagePreview(null)
      setShowAddModal(false)
      setNewEntryDate(new Date().toISOString().split('T')[0])

    } catch (err: any) {
      console.error('Add entry error:', err)
      alert('Failed to add entry: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `diary-entries/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('diary-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('diary-images')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error: any) {
      console.error('Upload error:', error)
      return null
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    setNewEntryImage(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📖</div>
        <p className="text-white/60">Loading your diary...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">My Daily Journal 📖</h2>
          <p className="text-white/70">Your personal space for thoughts and feelings</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full text-white font-medium transition-all duration-300"
        >
          ✏️ New Entry
        </button>
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white/5 rounded-2xl border border-white/10"
        >
          <div className="text-8xl mb-6">📖✨</div>
          <h3 className="text-2xl font-bold text-white mb-4">Start Your Journal</h3>
          <p className="text-white/70 mb-2">Write about your day, your thoughts, your feelings...</p>
          <p className="text-white/50 text-sm">Every day is a new page in your story</p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry, index) => (
            <motion.button
              key={entry.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedEntry(entry)}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-left hover:bg-white/15 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                {/* Date Badge */}
                <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl p-3 text-center min-w-[80px]">
                  <div className="text-2xl font-bold text-white">
                    {new Date(entry.entry_date).getDate()}
                  </div>
                  <div className="text-xs text-white/90">
                    {new Date(entry.entry_date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {entry.mood && <span className="text-2xl">{MOOD_ICONS[entry.mood]}</span>}
                    {entry.weather && <span className="text-xl">{WEATHER_ICONS[entry.weather]}</span>}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors">
                    {entry.title}
                  </h3>
                  
                  {entry.content && (
                    <p className="text-white/70 text-sm line-clamp-2 mb-3">
                      {entry.content}
                    </p>
                  )}

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image Thumbnail */}
                {entry.image_url && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/20">
                    <img
                      src={entry.image_url}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Arrow */}
                <div className="text-white/40 group-hover:text-white/80 transition-colors text-xl">
                  →
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Add Entry Modal - WITH PROPER SCROLL! */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden"
          onClick={() => !isSubmitting && setShowAddModal(false)}
        >
          <div
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border-2 border-white/20 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(236, 72, 153, 0.5) transparent' }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">✏️ New Diary Entry</h2>

            {/* Date */}
            <div className="mb-6">
              <label className="block text-white/70 text-sm mb-2">Date</label>
              <input
                type="date"
                value={newEntryDate}
                onChange={(e) => setNewEntryDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-pink-500 outline-none [color-scheme:dark]"
              />
            </div>

            {/* Mood & Weather */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-white/70 text-sm mb-2">How are you feeling?</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(MOOD_ICONS).map(([mood, icon]) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setNewEntryMood(mood)}
                      className={`
                        p-3 rounded-xl border-2 transition-all duration-300
                        ${newEntryMood === mood 
                          ? 'border-pink-500 bg-pink-500/20' 
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                        }
                      `}
                    >
                      <span className="text-2xl">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Weather</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(WEATHER_ICONS).map(([weather, icon]) => (
                    <button
                      key={weather}
                      type="button"
                      onClick={() => setNewEntryWeather(weather)}
                      className={`
                        p-3 rounded-xl border-2 transition-all duration-300
                        ${newEntryWeather === weather 
                          ? 'border-blue-500 bg-blue-500/20' 
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                        }
                      `}
                    >
                      <span className="text-2xl">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-white/70 text-sm mb-2">Title *</label>
              <input
                type="text"
                value={newEntryTitle}
                onChange={(e) => setNewEntryTitle(e.target.value)}
                placeholder="Give your day a title..."
                className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/40 border border-white/20 focus:border-pink-500 outline-none"
              />
            </div>

            {/* Content */}
            <div className="mb-6">
              <label className="block text-white/70 text-sm mb-2">What happened today?</label>
              <textarea
                value={newEntryContent}
                onChange={(e) => setNewEntryContent(e.target.value)}
                placeholder="Write about your day, thoughts, feelings..."
                rows={6}
                className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/40 border border-white/20 focus:border-pink-500 outline-none resize-none"
              />
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-white/70 text-sm mb-2">Tags (comma separated)</label>
              <input
                type="text"
                value={newEntryTags}
                onChange={(e) => setNewEntryTags(e.target.value)}
                placeholder="work, family, travel, thoughts..."
                className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/40 border border-white/20 focus:border-pink-500 outline-none"
              />
            </div>

            {/* Image Upload */}
            <div className="mb-8">
              <label className="block text-white/70 text-sm mb-2">Add a photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={isSubmitting}
                className="hidden"
                id="diary-image"
              />
              <label
                htmlFor="diary-image"
                className="w-full border-2 border-dashed border-white/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-pink-400 hover:bg-white/5 transition-all duration-300"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg" />
                ) : (
                  <>
                    <span className="text-4xl mb-2">📷</span>
                    <p className="text-white/90 text-sm">Click to upload photo</p>
                  </>
                )}
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                disabled={isSubmitting || !newEntryTitle.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## Implementation Checklist:

### Fix #1: Modal Scroll (URGENT) ⚠️
- [ ] Update CalendarOfUs.tsx line ~947: Add `overflow-hidden` to outer div
- [ ] Update CalendarOfUs.tsx line ~954: Add `max-h-[90vh] overflow-y-auto` to inner div
- [ ] Update EventDetailModal.tsx: Apply same fix
- [ ] Test: Open modal, scroll content, verify buttons clickable

### Fix #2: Book Tab Function (NEW FEATURE) ✨
- [ ] Run SQL: `database/create_diary_entries_table.sql`
- [ ] Update: `types/database.types.ts` 
- [ ] Replace: `app/diary/tabs/BookTab.tsx` with new version
- [ ] Test: Create new diary entry
- [ ] Test: View entries list
- [ ] Test: Upload image to entry

---

## Testing Instructions:

1. **Modal Scroll Test:**
   - Open Calendar tab
   - Click any date without events
   - Add Event Modal should open
   - TRY TO SCROLL inside modal
   - ✅ Modal content should scroll
   - ✅ Background should NOT scroll
   - ✅ Add Event button should be visible and clickable

2. **Book Tab Test:**
   - Go to Book tab
   - Click "New Entry" button
   - Fill in: mood, weather, title, content, tags
   - Upload image
   - Click "Save Entry"
   - ✅ Entry should appear in list
   - ✅ Click entry to view details

---

## Summary:

**Modal Issue:** Fixed dengan menambahkan `overflow-hidden` + `max-h-[90vh] overflow-y-auto`

**Book Tab:** Sekarang fungsinya untuk daily diary entries (mencatat keseharian), BUKAN hanya menampilkan calendar events. User bisa menulis apapun setiap hari dengan mood, weather, tags, dan foto.

**Calendar Events:** Tetap digunakan untuk special occasions (birthday, memories, messages, photos, special events)

**Diary Entries:** Untuk catatan harian biasa (thoughts, feelings, daily activities)
