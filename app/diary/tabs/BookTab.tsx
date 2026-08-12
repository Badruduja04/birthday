'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type DiaryEntry = Database['public']['Tables']['diary_entries']['Row']

interface BookTabProps {
  userId: string
  onEventClick?: (event: any) => void
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
        .order('date', { ascending: false })
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
          date: newEntryDate,
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
      <div className="flex justify-between items-center flex-wrap gap-4">
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
                    {new Date(entry.date).getDate()}
                  </div>
                  <div className="text-xs text-white/90">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
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
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/20 flex-shrink-0">
                    <img
                      src={entry.image_url}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Arrow */}
                <div className="text-white/40 group-hover:text-white/80 transition-colors text-xl flex-shrink-0">
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
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-pink-500 outline-none [color-scheme:dark] transition-all duration-300"
              />
            </div>

            {/* Mood & Weather */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-white/70 text-sm mb-2">How are you feeling?</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(MOOD_ICONS).map(([mood, icon]) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setNewEntryMood(mood)}
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/40 border border-white/20 focus:border-pink-500 outline-none transition-all duration-300"
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
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/40 border border-white/20 focus:border-pink-500 outline-none resize-none transition-all duration-300"
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
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/40 border border-white/20 focus:border-pink-500 outline-none transition-all duration-300"
              />
            </div>

            {/* Image Upload */}
            <div className="mb-8">
              <label className="block text-white/70 text-sm mb-2">Add a photo (optional)</label>
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
                className={`w-full border-2 border-dashed border-white/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:border-pink-400 hover:bg-white/5'}`}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg" />
                ) : (
                  <>
                    <span className="text-4xl mb-2">📷</span>
                    <p className="text-white/90 text-sm">Click to upload photo</p>
                    <p className="text-white/50 text-xs mt-1">PNG, JPG up to 5MB</p>
                  </>
                )}
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border-2 border-white/20 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(236, 72, 153, 0.5) transparent' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-full flex items-center justify-center text-white text-2xl transition-all"
            >
              ×
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                {selectedEntry.mood && <span className="text-4xl">{MOOD_ICONS[selectedEntry.mood]}</span>}
                {selectedEntry.weather && <span className="text-3xl">{WEATHER_ICONS[selectedEntry.weather]}</span>}
              </div>
              <p className="text-white/60 text-sm mb-2">{formatDate(selectedEntry.date)}</p>
              <h2 className="text-3xl font-bold text-white">{selectedEntry.title}</h2>
            </div>

            {/* Image */}
            {selectedEntry.image_url && (
              <div className="mb-6 rounded-2xl overflow-hidden border-2 border-white/20">
                <img
                  src={selectedEntry.image_url}
                  alt={selectedEntry.title}
                  className="w-full h-auto object-cover max-h-96"
                />
              </div>
            )}

            {/* Content */}
            {selectedEntry.content && (
              <div className="mb-6 bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {selectedEntry.content}
                </p>
              </div>
            )}

            {/* Tags */}
            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedEntry.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
