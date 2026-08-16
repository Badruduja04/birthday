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

  const saveJournalData = async (updatedData: Partial<JournalData>) => {
    setIsSaving(true)
    try {
      const dataToSave = {
        user_id: userId,
        ...journalData,
        ...updatedData,
        date: selectedDate,
      }

      const { data, error } = await supabase
        .from('daily_journals')
        .upsert(dataToSave, { onConflict: 'user_id,date' })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setJournalData(prev => ({ ...prev, id: data.id }))
      }
    } catch (error) {
      console.error('Error saving journal:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const addTodo = () => {
    if (newTodo.trim()) {
      const updated = [...journalData.todo_list, newTodo.trim()]
      setJournalData(prev => ({ ...prev, todo_list: updated }))
      saveJournalData({ todo_list: updated })
      setNewTodo('')
    }
  }

  const removeTodo = (index: number) => {
    const updated = journalData.todo_list.filter((_, i) => i !== index)
    setJournalData(prev => ({ ...prev, todo_list: updated }))
    saveJournalData({ todo_list: updated })
  }

  const addCompleted = () => {
    if (newCompleted.trim()) {
      const updated = [...journalData.completed_list, newCompleted.trim()]
      setJournalData(prev => ({ ...prev, completed_list: updated }))
      saveJournalData({ completed_list: updated })
      setNewCompleted('')
    }
  }

  const removeCompleted = (index: number) => {
    const updated = journalData.completed_list.filter((_, i) => i !== index)
    setJournalData(prev => ({ ...prev, completed_list: updated }))
    saveJournalData({ completed_list: updated })
  }

  const selectMood = (time: 'morning' | 'evening', mood: string) => {
    const key = time === 'morning' ? 'mood_morning' : 'mood_evening'
    setJournalData(prev => ({ ...prev, [key]: mood }))
    saveJournalData({ [key]: mood })
  }

  const updateComment = (comment: string) => {
    setJournalData(prev => ({ ...prev, comment }))
  }

  const saveComment = () => {
    saveJournalData({ comment: journalData.comment })
  }

  const uploadPhoto = async (file: File) => {
    setUploadingPhoto(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `daily-journal/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('daily-journal-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('daily-journal-photos')
        .getPublicUrl(filePath)

      setJournalData(prev => ({ ...prev, photo_url: publicUrl }))
      saveJournalData({ photo_url: publicUrl })
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Failed to upload photo')
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
      {/* Date Picker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20"
      >
        <label className="block text-white/80 text-sm font-medium mb-2">Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
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
          onBlur={saveComment}
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
        className="bg-peach-100/90 backdrop-blur-md rounded-3xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">Photo of the day</h3>
        
        {journalData.photo_url ? (
          <div className="relative">
            <img
              src={journalData.photo_url}
              alt="Photo of the day"
              className="w-full h-64 object-cover rounded-2xl"
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
                if (file) uploadPhoto(file)
              }}
              className="hidden"
              disabled={uploadingPhoto}
            />
            {uploadingPhoto ? (
              <div className="text-gray-600">Uploading...</div>
            ) : (
              <>
                <Camera size={40} className="text-gray-400 mb-2" />
                <span className="text-gray-600">Click to upload photo</span>
              </>
            )}
          </label>
        )}
      </motion.div>

      {/* Save Status */}
      {isSaving && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg">
          Saving...
        </div>
      )}
    </div>
  )
}
