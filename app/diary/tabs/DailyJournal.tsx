'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Plus, X, Check, Camera, Upload } from 'lucide-react'

interface DailyJournalProps {
  userId: string
}

interface JournalData {
  id?: string
  date: string
  todo_list: string[]
  completed_list: string[]
  mood_morning: string
  mood_evening: string
  comment: string
  photo_url: string | null
}

const MOODS = [
  { emoji: '😊', value: 'happy', label: 'Happy' },
  { emoji: '😃', value: 'excited', label: 'Excited' },
  { emoji: '😐', value: 'neutral', label: 'Neutral' },
  { emoji: '😔', value: 'sad', label: 'Sad' },
  { emoji: '😠', value: 'angry', label: 'Angry' },
]

export default function DailyJournal({ userId }: DailyJournalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [journalData, setJournalData] = useState<JournalData>({
    date: selectedDate,
    todo_list: [],
    completed_list: [],
    mood_morning: '',
    mood_evening: '',
    comment: '',
    photo_url: null,
  })
  
  const [newTodo, setNewTodo] = useState('')
  const [newCompleted, setNewCompleted] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [recentDates, setRecentDates] = useState<string[]>([])
  const [recentEntries, setRecentEntries] = useState<JournalData[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Load recent journal dates and full entries
  useEffect(() => {
    const loadRecentDates = async () => {
      try {
        const { data, error } = await supabase
          .from('daily_journals')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(10)

        if (error) throw error

        if (data) {
          setRecentDates(data.map(d => d.date))
          setRecentEntries(data.map(d => ({
            id: d.id,
            date: d.date,
            todo_list: d.todo_list || [],
            completed_list: d.completed_list || [],
            mood_morning: d.mood_morning || '',
            mood_evening: d.mood_evening || '',
            comment: d.comment || '',
            photo_url: d.photo_url,
          })))
        }
      } catch (error) {
        console.error('Error loading recent dates:', error)
      }
    }

    loadRecentDates()
  }, [userId, saveSuccess])

  // Load journal data for selected date
  useEffect(() => {
    loadJournalData()
  }, [selectedDate, userId])

  const loadJournalData = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('daily_journals')
        .select('*')
        .eq('user_id', userId)
        .eq('date', selectedDate)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading journal:', error)
        return
      }

      if (data) {
        setJournalData({
          id: data.id,
          date: data.date,
          todo_list: data.todo_list || [],
          completed_list: data.completed_list || [],
          mood_morning: data.mood_morning || '',
          mood_evening: data.mood_evening || '',
          comment: data.comment || '',
          photo_url: data.photo_url,
        })
      } else {
        // Reset for new date
        setJournalData({
          date: selectedDate,
          todo_list: [],
          completed_list: [],
          mood_morning: '',
          mood_evening: '',
          comment: '',
          photo_url: null,
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveJournalData = async (updatedData: Partial<JournalData> = {}) => {
    setIsSaving(true)
    setSaveSuccess(false)
    
    try {
      // Merge current data with updates
      const mergedData = { ...journalData, ...updatedData }
      
      const dataToSave = {
        user_id: userId,
        date: selectedDate,
        todo_list: mergedData.todo_list,
        completed_list: mergedData.completed_list,
        mood_morning: mergedData.mood_morning || null,
        mood_evening: mergedData.mood_evening || null,
        comment: mergedData.comment || null,
        photo_url: mergedData.photo_url || null,
      }

      console.log('Saving journal data:', dataToSave)

      const { data, error } = await supabase
        .from('daily_journals')
        .upsert(dataToSave, { 
          onConflict: 'user_id,date',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (data) {
        console.log('Journal saved successfully:', data)
        
        // Reload recent dates to show this entry
        const { data: recentData } = await supabase
          .from('daily_journals')
          .select('date')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(10)
        
        if (recentData) {
          setRecentDates(recentData.map(d => d.date))
        }
        
        setSaveSuccess(true)
        
        // Reset form after save (clear inputs for new entry)
        setTimeout(() => {
          setJournalData({
            date: selectedDate,
            todo_list: [],
            completed_list: [],
            mood_morning: '',
            mood_evening: '',
            comment: '',
            photo_url: null,
          })
          setSaveSuccess(false)
        }, 2000) // Wait 2 seconds so user sees success message
      }
    } catch (error: any) {
      console.error('Error saving journal:', error)
      alert(`Failed to save journal: ${error.message || 'Please check database setup'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const addTodo = () => {
    if (newTodo.trim()) {
      const updated = [...journalData.todo_list, newTodo.trim()]
      setJournalData(prev => ({ ...prev, todo_list: updated }))
      setNewTodo('')
    }
  }

  const removeTodo = (index: number) => {
    const updated = journalData.todo_list.filter((_, i) => i !== index)
    setJournalData(prev => ({ ...prev, todo_list: updated }))
  }

  const addCompleted = () => {
    if (newCompleted.trim()) {
      const updated = [...journalData.completed_list, newCompleted.trim()]
      setJournalData(prev => ({ ...prev, completed_list: updated }))
      setNewCompleted('')
    }
  }

  const removeCompleted = (index: number) => {
    const updated = journalData.completed_list.filter((_, i) => i !== index)
    setJournalData(prev => ({ ...prev, completed_list: updated }))
  }

  const selectMood = (time: 'morning' | 'evening', mood: string) => {
    const key = time === 'morning' ? 'mood_morning' : 'mood_evening'
    setJournalData(prev => ({ ...prev, [key]: mood }))
  }

  const updateComment = (comment: string) => {
    setJournalData(prev => ({ ...prev, comment }))
  }

  const loadEntryFromHistory = (entry: JournalData) => {
    setSelectedDate(entry.date)
    setJournalData(entry)
    setShowHistory(false)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const uploadPhoto = async (file: File): Promise<void> => {
    setUploadingPhoto(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `daily-journal/${fileName}` // Add prefix for organization

      const { error: uploadError } = await supabase.storage
        .from('diary-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from('diary-images')
        .getPublicUrl(filePath)

      console.log('Photo uploaded successfully:', data.publicUrl)
      setJournalData(prev => ({ ...prev, photo_url: data.publicUrl }))
    } catch (error: any) {
      console.error('Error uploading photo:', error)
      alert(`Failed to upload photo: ${error.message || 'Check storage bucket exists.'}`)
      throw error
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-white text-lg">Loading journal...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Picker with Recent History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20"
      >
        <div className="flex items-center justify-between mb-4">
          <label className="block text-white/80 text-sm font-medium">Date:</label>
          {journalData.id && (
            <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
              <Check size={14} />
              <span>Entry exists for this date</span>
            </div>
          )}
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 mb-4"
        />
        
        {/* Recent Journal Entries */}
        {recentDates.length > 0 && (
          <div className="space-y-2">
            <p className="text-white/60 text-xs font-medium">Recent entries ({recentDates.length}):</p>
            <div className="flex gap-2 flex-wrap">
              {recentDates.map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedDate === date
                      ? 'bg-pink-500 text-white shadow-lg'
                      : 'bg-white/20 text-white/80 hover:bg-white/30'
                  }`}
                >
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {recentDates.length === 0 && (
          <div className="text-white/50 text-sm italic mt-2">
            No journal entries yet. Start writing your first entry!
          </div>
        )}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* What I Want To Do Today */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-pink-100/90 backdrop-blur-md rounded-3xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">What I want to do today</h3>
          
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {journalData.todo_list.map((item, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                <span className="text-gray-800">•</span>
                <span className="flex-1 text-gray-800 text-sm">{item}</span>
                <button
                  onClick={() => removeTodo(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add new task..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/60 border border-gray-300 text-gray-800 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              onClick={addTodo}
              className="p-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </motion.div>

        {/* Mood in the Morning */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-pink-100/90 backdrop-blur-md rounded-3xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Mood in the morning</h3>
          
          <div className="flex flex-wrap gap-3">
            {MOODS.map((mood) => (
              <motion.button
                key={mood.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectMood('morning', mood.value)}
                className={`p-3 rounded-full text-3xl transition-all ${
                  journalData.mood_morning === mood.value
                    ? 'bg-pink-300 ring-4 ring-pink-400 shadow-lg'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              >
                {mood.emoji}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* What Did I Do Today */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-pink-100/90 backdrop-blur-md rounded-3xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">What did I do today</h3>
          
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {journalData.completed_list.map((item, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                <Check size={16} className="text-green-600" />
                <span className="flex-1 text-gray-800 text-sm">{item}</span>
                <button
                  onClick={() => removeCompleted(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCompleted}
              onChange={(e) => setNewCompleted(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCompleted()}
              placeholder="Add completed task..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/60 border border-gray-300 text-gray-800 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              onClick={addCompleted}
              className="p-2 bg-green-400 text-white rounded-lg hover:bg-green-500 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </motion.div>

        {/* Mood in the Evening */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-green-100/90 backdrop-blur-md rounded-3xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Mood in the evening</h3>
          
          <div className="flex flex-wrap gap-3">
            {MOODS.map((mood) => (
              <motion.button
                key={mood.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectMood('evening', mood.value)}
                className={`p-3 rounded-full text-3xl transition-all ${
                  journalData.mood_evening === mood.value
                    ? 'bg-green-300 ring-4 ring-green-400 shadow-lg'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              >
                {mood.emoji}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Comment for Today */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-pink-100/90 backdrop-blur-md rounded-3xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">Comment for today</h3>
        <textarea
          value={journalData.comment}
          onChange={(e) => updateComment(e.target.value)}
          placeholder="Write your thoughts about today..."
          rows={5}
          className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
        />
      </motion.div>

      {/* Photo of the Day */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-pink-100/90 backdrop-blur-md rounded-3xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">Photo of the day</h3>
        
        {journalData.photo_url ? (
          <div className="relative">
            <img
              src={journalData.photo_url}
              alt="Photo of the day"
              className="w-full h-64 object-cover rounded-2xl"
              onError={(e) => {
                console.error('Image load error:', journalData.photo_url)
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage not found%3C/text%3E%3C/svg%3E'
              }}
            />
            <button
              onClick={() => {
                setJournalData(prev => ({ ...prev, photo_url: null }))
                saveJournalData({ photo_url: null })
              }}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-400 rounded-2xl cursor-pointer hover:border-pink-400 hover:bg-white/40 transition-all">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  uploadPhoto(file).then(() => {
                    // Auto-save after upload completes
                    setTimeout(() => {
                      saveJournalData({})
                    }, 500)
                  })
                }
              }}
              className="hidden"
              disabled={uploadingPhoto}
            />
            {uploadingPhoto ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
                <div className="text-gray-600">Uploading...</div>
              </div>
            ) : (
              <>
                <Camera size={40} className="text-gray-400 mb-2" />
                <span className="text-gray-600">Click to upload photo</span>
              </>
            )}
          </label>
        )}
      </motion.div>

      {/* Manual Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex gap-3"
      >
        <button
          onClick={() => saveJournalData({})}
          disabled={isSaving}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : '💾 Save Journal'}
        </button>
        
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          📚 History ({recentEntries.length})
        </button>
        
        {journalData.id && (
          <button
            onClick={async () => {
              if (confirm('Delete this journal entry?')) {
                try {
                  const { error } = await supabase
                    .from('daily_journals')
                    .delete()
                    .eq('id', journalData.id)
                  
                  if (error) throw error
                  
                  // Reset form
                  setJournalData({
                    date: selectedDate,
                    todo_list: [],
                    completed_list: [],
                    mood_morning: '',
                    mood_evening: '',
                    comment: '',
                    photo_url: null,
                  })
                  
                  // Reload recent dates
                  const { data: recentData } = await supabase
                    .from('daily_journals')
                    .select('*')
                    .eq('user_id', userId)
                    .order('date', { ascending: false })
                    .limit(10)
                  
                  if (recentData) {
                    setRecentDates(recentData.map(d => d.date))
                    setRecentEntries(recentData.map(d => ({
                      id: d.id,
                      date: d.date,
                      todo_list: d.todo_list || [],
                      completed_list: d.completed_list || [],
                      mood_morning: d.mood_morning || '',
                      mood_evening: d.mood_evening || '',
                      comment: d.comment || '',
                      photo_url: d.photo_url,
                    })))
                  }
                  
                  alert('Journal deleted successfully!')
                } catch (error) {
                  console.error('Error deleting:', error)
                  alert('Failed to delete')
                }
              }
            }}
            className="px-6 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg hover:bg-red-600 transition-all"
          >
            🗑️ Delete
          </button>
        )}
      </motion.div>

      {/* Journal History */}
      {showHistory && recentEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">📚 Journal History</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentEntries.map((entry) => (
              <motion.div
                key={entry.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all"
                onClick={() => loadEntryFromHistory(entry)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-white font-bold">
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h4>
                    <div className="flex gap-2 mt-1">
                      {entry.mood_morning && (
                        <span className="text-xs text-white/70">
                          Morning: {MOODS.find(m => m.value === entry.mood_morning)?.emoji}
                        </span>
                      )}
                      {entry.mood_evening && (
                        <span className="text-xs text-white/70">
                          Evening: {MOODS.find(m => m.value === entry.mood_evening)?.emoji}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {entry.photo_url && <span className="text-white/70">📸</span>}
                    {entry.todo_list.length > 0 && (
                      <span className="text-xs text-white/70 bg-white/20 px-2 py-1 rounded">
                        {entry.todo_list.length} todos
                      </span>
                    )}
                    {entry.completed_list.length > 0 && (
                      <span className="text-xs text-white/70 bg-green-500/30 px-2 py-1 rounded">
                        ✓ {entry.completed_list.length}
                      </span>
                    )}
                  </div>
                </div>
                
                {entry.comment && (
                  <p className="text-white/70 text-sm line-clamp-2 mt-2">
                    {entry.comment}
                  </p>
                )}
                
                <div className="mt-2 text-xs text-white/50">
                  Click to edit
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Save Status Toast */}
      {isSaving && (
        <div className="fixed bottom-6 right-6 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Saving...
        </div>
      )}
      
      {saveSuccess && !isSaving && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2">
          <Check size={20} />
          <div className="flex flex-col">
            <span className="font-bold">Saved successfully!</span>
            <span className="text-xs text-white/80">
              {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
