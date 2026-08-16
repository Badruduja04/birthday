'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import EventDetailModal from './components/EventDetailModal'
import EventPicker from './components/EventPicker'
import {
  MemoryPetalsAnimation,
  PhotoFlashAnimation,
  MessageEnvelopeAnimation,
  BirthdayConfettiAnimation,
  SpecialHeartsAnimation
} from './animations/EventAnimations'

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
type EventType = 'memory' | 'photo' | 'message' | 'birthday' | 'special'

interface CalendarOfUsProps {
  userId: string
}

const EVENT_ICONS: Record<EventType, string> = {
  memory: '🌸',
  photo: '📸',
  message: '💌',
  birthday: '🎂',
  special: '❤️'
}

const EVENT_COLORS: Record<EventType, string> = {
  memory: 'from-pink-500 to-rose-500',
  photo: 'from-blue-500 to-cyan-500',
  message: 'from-purple-500 to-pink-500',
  birthday: 'from-yellow-500 to-orange-500',
  special: 'from-red-500 to-pink-600'
}

export default function CalendarOfUs({ userId }: CalendarOfUsProps) {
  const prefersReducedMotion = useReducedMotion()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEventDetail, setShowEventDetail] = useState(false)
  const [showEventPicker, setShowEventPicker] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([])
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [monthDirection, setMonthDirection] = useState<'left' | 'right'>('right')
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationType, setAnimationType] = useState<EventType | null>(null)
  const [clickedDate, setClickedDate] = useState<Date | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)

  // Form state
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDescription, setNewEventDescription] = useState('')
  const [newEventType, setNewEventType] = useState<EventType>('special')
  const [newEventMusicTitle, setNewEventMusicTitle] = useState('')
  const [newEventMusicArtist, setNewEventMusicArtist] = useState('')
  const [newEventAudio, setNewEventAudio] = useState<File | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [newEventImage, setNewEventImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingAudio, setIsUploadingAudio] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadEvents()
    loadAllEvents() // Load all events for search
  }, [currentDate, userId])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .gte('event_date', firstDay.toISOString().split('T')[0])
        .lte('event_date', lastDay.toISOString().split('T')[0])
        .order('event_date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('Load events error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAllEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: false })

      if (error) throw error
      setAllEvents(data || [])
    } catch (err) {
      console.error('Load all events error:', err)
    }
  }

  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => event.event_date === dateStr)
  }

  const handleDateClick = (date: Date | null) => {
    if (!date) return
    setSelectedDate(date)
    setClickedDate(date)
    const dateEvents = getEventsForDate(date)
    
    if (dateEvents.length === 1) {
      // Single event
      const event = dateEvents[0]
      setSelectedEvent(event)
      setSelectedDateEvents(dateEvents)
      setCurrentEventIndex(0)
      
      if (prefersReducedMotion) {
        // Skip animation for reduced motion preference
        setClickedDate(null)
        setTimeout(() => {
          setShowEventDetail(true)
        }, 100)
      } else {
        // Play animation sequence
        setAnimationType(event.event_type)
        setShowAnimation(true)
      }
    } else if (dateEvents.length === 0) {
      // No events - show add modal directly (no animation)
      setShowAddModal(true)
      setClickedDate(null)
    } else {
      // Multiple events - show picker (no animation for picker)
      setSelectedDateEvents(dateEvents)
      setShowEventPicker(true)
      setClickedDate(null)
    }
  }

  const handleAnimationComplete = () => {
    // Step 3: Hide animation and show detail modal
    setShowAnimation(false)
    setAnimationType(null)
    setClickedDate(null)
    
    // Short delay before showing modal for smooth transition
    setTimeout(() => {
      setShowEventDetail(true)
    }, 150)
  }

  const handleSelectEventFromPicker = (event: CalendarEvent, index: number) => {
    setSelectedEvent(event)
    setCurrentEventIndex(index)
    setShowEventPicker(false)
    
    if (prefersReducedMotion) {
      // Skip animation for reduced motion preference
      setTimeout(() => {
        setShowEventDetail(true)
      }, 100)
    } else {
      // Play animation for selected event from picker
      setAnimationType(event.event_type)
      setShowAnimation(true)
    }
  }

  const handleCloseEventPicker = () => {
    setShowEventPicker(false)
    setSelectedDate(null)
    setSelectedDateEvents([])
  }

  const handleNextEvent = () => {
    if (currentEventIndex < selectedDateEvents.length - 1) {
      const newIndex = currentEventIndex + 1
      setCurrentEventIndex(newIndex)
      setSelectedEvent(selectedDateEvents[newIndex])
    }
  }

  const handlePreviousEvent = () => {
    if (currentEventIndex > 0) {
      const newIndex = currentEventIndex - 1
      setCurrentEventIndex(newIndex)
      setSelectedEvent(selectedDateEvents[newIndex])
    }
  }

  const handleCloseEventDetail = () => {
    setShowEventDetail(false)
    setSelectedEvent(null)
    setSelectedDateEvents([])
    setCurrentEventIndex(0)
    setClickedDate(null)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setNewEventImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setNewEventImage(null)
    setImagePreview(null)
  }

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Audio size must be less than 10MB')
      return
    }

    setNewEventAudio(file)
    setAudioPreview(URL.createObjectURL(file))
  }

  const handleRemoveAudio = () => {
    setNewEventAudio(null)
    if (audioPreview) URL.revokeObjectURL(audioPreview)
    setAudioPreview(null)
  }

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    try {
      setIsUploadingImage(true)
      
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `diary-events/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('diary-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('diary-images')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error: any) {
      console.error('Upload error:', error)
      alert('Failed to upload image: ' + error.message)
      return null
    } finally {
      setIsUploadingImage(false)
    }
  }

  const uploadAudio = async (file: File, userId: string): Promise<{url: string, path: string} | null> => {
    try {
      setIsUploadingAudio(true)
      
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `diary-events/${fileName}`

      // Fix MIME type for m4a files
      let contentType = file.type
      if (file.type === 'audio/x-m4a' || fileExt === 'm4a') {
        contentType = 'audio/mp4' // Supabase accepts audio/mp4 for m4a files
      }

      // Upload to Supabase Storage with correct content type
      const { error: uploadError } = await supabase.storage
        .from('diary-music')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType
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
      console.error('Audio upload error:', error)
      alert('Failed to upload audio: ' + error.message)
      return null
    } finally {
      setIsUploadingAudio(false)
    }
  }

  const handleAddEvent = async () => {
    if (!selectedDate || !newEventTitle.trim()) {
      alert('Please enter a title')
      return
    }

    try {
      setIsSubmitting(true)
      
      let imageUrl = null
      let imagePath = null
      let audioUrl = null
      let audioPath = null

      // Upload image if selected
      if (newEventImage) {
        imageUrl = await uploadImage(newEventImage, userId)
        if (imageUrl) {
          imagePath = `diary-events/${userId}-${Date.now()}.${newEventImage.name.split('.').pop()}`
        }
      }

      // Upload audio if selected
      if (newEventAudio) {
        const audioData = await uploadAudio(newEventAudio, userId)
        if (audioData) {
          audioUrl = audioData.url
          audioPath = audioData.path
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
          audio_url: audioUrl,
          audio_path: audioPath,
          image_url: imageUrl,
          image_path: imagePath
        })

      if (error) throw error

      // Reload events
      await loadEvents()
      await loadAllEvents()

      // Reset form
      setNewEventTitle('')
      setNewEventDescription('')
      setNewEventType('special')
      setNewEventMusicTitle('')
      setNewEventMusicArtist('')
      setNewEventAudio(null)
      setAudioPreview(null)
      setNewEventImage(null)
      setImagePreview(null)
      setShowAddModal(false)
      setSelectedDate(null)

    } catch (err: any) {
      console.error('Add event error:', err)
      alert('Failed to add event: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      await loadEvents()
      await loadAllEvents()
      handleCloseEventDetail()
      setClickedDate(null)
    } catch (err: any) {
      console.error('Delete event error:', err)
      alert('Failed to delete: ' + err.message)
    }
  }

  const handleEditEvent = (event: CalendarEvent) => {
    // Populate form with existing event data
    setSelectedDate(new Date(event.event_date))
    setNewEventTitle(event.title)
    setNewEventDescription(event.description || '')
    setNewEventType(event.event_type)
    setNewEventMusicTitle(event.music_title || '')
    setNewEventMusicArtist(event.music_artist || '')
    
    // Set image preview if exists
    if (event.image_url) {
      setImagePreview(event.image_url)
    }
    
    // Set audio preview if exists
    if (event.audio_url) {
      setAudioPreview(event.audio_url)
    }
    
    // Enable edit mode
    setIsEditMode(true)
    setEditingEventId(event.id)
    
    // Close detail modal and open add/edit modal
    setShowEventDetail(false)
    setShowAddModal(true)
  }

  const handleUpdateEvent = async () => {
    if (!editingEventId || !selectedDate || !newEventTitle.trim()) {
      alert('Please enter a title')
      return
    }

    try {
      setIsSubmitting(true)
      
      let imageUrl = imagePreview // Keep existing image URL
      let imagePath = null
      let audioUrl = audioPreview // Keep existing audio URL
      let audioPath = null

      // Upload new image if selected
      if (newEventImage) {
        imageUrl = await uploadImage(newEventImage, userId)
        if (imageUrl) {
          imagePath = `diary-events/${userId}-${Date.now()}.${newEventImage.name.split('.').pop()}`
        }
      }

      // Upload new audio if selected
      if (newEventAudio) {
        const audioData = await uploadAudio(newEventAudio, userId)
        if (audioData) {
          audioUrl = audioData.url
          audioPath = audioData.path
        }
      }

      const { error } = await supabase
        .from('calendar_events')
        .update({
          title: newEventTitle.trim(),
          description: newEventDescription.trim() || null,
          event_date: selectedDate.toISOString().split('T')[0],
          event_type: newEventType,
          music_title: newEventMusicTitle.trim() || null,
          music_artist: newEventMusicArtist.trim() || null,
          audio_url: audioUrl,
          audio_path: audioPath,
          image_url: imageUrl,
          image_path: imagePath
        })
        .eq('id', editingEventId)

      if (error) throw error

      // Reload events
      await loadEvents()
      await loadAllEvents()

      // Reset form and edit mode
      setNewEventTitle('')
      setNewEventDescription('')
      setNewEventType('special')
      setNewEventMusicTitle('')
      setNewEventMusicArtist('')
      setNewEventAudio(null)
      setAudioPreview(null)
      setNewEventImage(null)
      setImagePreview(null)
      setShowAddModal(false)
      setSelectedDate(null)
      setIsEditMode(false)
      setEditingEventId(null)

    } catch (err: any) {
      console.error('Update event error:', err)
      alert('Failed to update event: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickDateJump = (dateString: string) => {
    if (!dateString) return
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const newMonth = date.getMonth()
      const currentMonth = currentDate.getMonth()
      setMonthDirection(newMonth > currentMonth ? 'right' : 'left')
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1))
      setShowDatePicker(false)
    }
  }

  const handleSearchEvent = () => {
    if (!searchQuery.trim()) {
      setShowSearchResults(false)
      return
    }
    setShowSearchResults(true)
  }

  const filteredEvents = allEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const jumpToEvent = (event: CalendarEvent) => {
    const eventDate = new Date(event.event_date)
    const newMonth = eventDate.getMonth()
    const currentMonth = currentDate.getMonth()
    setMonthDirection(newMonth > currentMonth ? 'right' : 'left')
    setCurrentDate(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1))
    setShowSearchResults(false)
    setSearchQuery('')
    
    // Show event detail after a short delay
    setTimeout(() => {
      setSelectedEvent(event)
      setSelectedDateEvents([event])
      setCurrentEventIndex(0)
      setShowEventDetail(true)
    }, 300)
  }

  const previousMonth = () => {
    setMonthDirection('left')
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setMonthDirection('right')
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const days = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const daysArray: (Date | null)[] = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(null)
    }

    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(new Date(year, month, day))
    }

    return daysArray
  }, [currentDate])

  // Animation variants for month transition
  const monthVariants = useMemo(() => ({
    enter: (direction: 'left' | 'right') => ({
      x: prefersReducedMotion ? 0 : (direction === 'right' ? 300 : -300),
      opacity: prefersReducedMotion ? 1 : 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: 'left' | 'right') => ({
      x: prefersReducedMotion ? 0 : (direction === 'right' ? -300 : 300),
      opacity: prefersReducedMotion ? 1 : 0
    })
  }), [prefersReducedMotion])

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h2 className="text-4xl font-bold mb-2" style={{ textShadow: '0 0 20px rgba(236, 72, 153, 0.5)' }}>
          Calendar of Us 💕
        </h2>
        <p className="text-white/70">Our special moments together</p>
      </motion.div>

      {/* Quick Actions Bar - Single Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Left: Quick Date Jump */}
            <div className="flex gap-2 items-center md:w-auto">
              <span className="text-white/70 font-medium text-sm whitespace-nowrap">📅</span>
              <input
                type="date"
                onChange={(e) => handleQuickDateJump(e.target.value)}
                className="w-full md:w-48 px-3 py-2 bg-white/10 rounded-xl text-white text-sm border border-white/20 focus:border-pink-500 outline-none transition-all duration-300 [color-scheme:dark]"
              />
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium transition-all duration-300 whitespace-nowrap"
              >
                Today
              </button>
            </div>

            {/* Right: Search */}
            <div className="flex gap-2 flex-1">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchEvent()}
                  placeholder="🔍 Search events..."
                  className="w-full px-4 py-2 bg-white/10 rounded-xl text-white text-sm border border-white/20 focus:border-pink-500 outline-none transition-all duration-300 placeholder-white/40"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setShowSearchResults(false)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={handleSearchEvent}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl text-white text-sm font-medium transition-all duration-300 whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search Results */}
      <AnimatePresence>
        {showSearchResults && filteredEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                Found {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
              </h3>
              <button
                onClick={() => setShowSearchResults(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredEvents.map((event) => (
                <motion.button
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => jumpToEvent(event)}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-left transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{EVENT_ICONS[event.event_type]}</span>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{event.title}</h4>
                      <p className="text-white/60 text-sm mb-2">
                        {new Date(event.event_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {event.description && (
                        <p className="text-white/50 text-sm line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="text-white/60 text-sm">
                      Click to view →
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        {showSearchResults && filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center"
          >
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-white/70">No events found for &quot;{searchQuery}&quot;</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Month Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
      >
        <motion.button
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={previousMonth}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xl transition-all duration-300"
        >
          ←
        </motion.button>
        
        <motion.div 
          key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextMonth}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xl transition-all duration-300"
        >
          →
        </motion.button>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl overflow-hidden"
      >
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-white/60 font-semibold text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days with Animation */}
        <div className="relative" style={{ minHeight: '320px' }}>
          <AnimatePresence mode="wait" custom={monthDirection}>
            <motion.div
              key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
              custom={monthDirection}
              variants={monthVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 }
              }}
              className="grid grid-cols-7 gap-2"
            >
              {days.map((date, index) => {
                const dateEvents = getEventsForDate(date)
                const isToday = date && 
                  date.toDateString() === new Date().toDateString()
                const hasSpecialEvent = dateEvents.some(e => e.event_type === 'birthday' || e.event_type === 'special')
                const isClicked = clickedDate && date && date.toDateString() === clickedDate.toDateString()

                return (
                  <motion.button
                    key={index}
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: isClicked ? 1.1 : 1,
                      ...(hasSpecialEvent && !isToday && !prefersReducedMotion ? {
                        boxShadow: [
                          '0 0 0px rgba(236, 72, 153, 0)',
                          '0 0 12px rgba(236, 72, 153, 0.4)',
                          '0 0 0px rgba(236, 72, 153, 0)',
                        ]
                      } : {}),
                      ...(isClicked ? {
                        boxShadow: '0 0 20px rgba(236, 72, 153, 0.8)'
                      } : {})
                    }}
                    transition={prefersReducedMotion ? { duration: 0.1 } : (hasSpecialEvent && !isToday ? {
                      opacity: { duration: 0.3 },
                      scale: { duration: 0.2 },
                      boxShadow: {
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }
                    } : {
                      delay: index * 0.01,
                      scale: { duration: 0.2 }
                    })}
                    whileHover={date && !prefersReducedMotion ? { scale: 1.05 } : {}}
                    whileTap={date && !prefersReducedMotion ? { scale: 0.95 } : {}}
                    onClick={() => handleDateClick(date)}
                    disabled={!date}
                    className={`
                      aspect-square rounded-xl p-2 relative transition-all duration-300
                      ${!date ? 'invisible' : ''}
                      ${isToday ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold' : 'bg-white/5 hover:bg-white/10'}
                      ${dateEvents.length > 0 ? 'ring-2 ring-pink-400/40' : 'border border-white/10'}
                      ${isClicked ? 'ring-4 ring-pink-500' : ''}
                    `}
                  >
                    {date && (
                      <>
                        <div className="text-sm font-medium">
                          {date.getDate()}
                        </div>
                        
                        {/* Event Indicators - Subtle dots system */}
                        {dateEvents.length > 0 && (
                          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                            {/* Show max 3 dots for events */}
                            {dateEvents.slice(0, 3).map((event, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`
                                  w-1.5 h-1.5 rounded-full
                                  ${event.event_type === 'memory' ? 'bg-pink-400' : ''}
                                  ${event.event_type === 'photo' ? 'bg-blue-400' : ''}
                                  ${event.event_type === 'message' ? 'bg-purple-400' : ''}
                                  ${event.event_type === 'birthday' ? 'bg-yellow-400' : ''}
                                  ${event.event_type === 'special' ? 'bg-red-400' : ''}
                                `}
                                style={{
                                  boxShadow: '0 0 4px currentColor'
                                }}
                              />
                            ))}
                            {/* Show +N indicator if more than 3 events */}
                            {dateEvents.length > 3 && (
                              <span className="text-[10px] text-white/70 ml-0.5">
                                +{dateEvents.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Photo indicator - small camera icon if any event has image */}
                        {dateEvents.some(e => e.image_url) && (
                          <div className="absolute top-1 right-1">
                            <span className="text-[10px] opacity-60">📷</span>
                          </div>
                        )}
                      </>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-white/60 text-xs mb-2 text-center">Event Types:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(EVENT_ICONS).map(([type, icon]) => (
              <div key={type} className="flex items-center gap-1 text-sm">
                <span>{icon}</span>
                <span className="text-white/70 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Events Preview Section */}
      <AnimatePresence>
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <h3 className="text-xl font-bold text-white">
                  This Month&apos;s Stories
                </h3>
              </div>
              <div className="bg-pink-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-pink-400/30">
                <p className="text-pink-300 text-sm font-medium">
                  {events.length} {events.length === 1 ? 'event' : 'events'}
                </p>
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {events
                .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
                .map((event, index) => {
                  const eventDate = new Date(event.event_date)
                  const isPast = eventDate < new Date()
                  
                  return (
                    <motion.button
                      key={event.id}
                      initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={prefersReducedMotion ? { duration: 0.1 } : { delay: index * 0.05 }}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.02, x: 5 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                      onClick={() => {
                        setSelectedEvent(event)
                        setSelectedDateEvents([event])
                        setCurrentEventIndex(0)
                        setAnimationType(event.event_type)
                        setShowAnimation(true)
                      }}
                      className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-left transition-all duration-300 group relative overflow-hidden"
                    >
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                      
                      <div className="relative flex items-start gap-3">
                        {/* Icon or Image Thumbnail */}
                        {event.image_url ? (
                          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 border-white/20">
                            <img
                              src={event.image_url}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="text-3xl flex-shrink-0">
                            {EVENT_ICONS[event.event_type]}
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-semibold truncate">
                              {event.title}
                            </h4>
                            {/* Event type badge */}
                            <span className={`
                              text-xs capitalize px-2 py-0.5 rounded-full whitespace-nowrap
                              ${event.event_type === 'memory' ? 'bg-pink-500/20 text-pink-300 border border-pink-400/30' : ''}
                              ${event.event_type === 'photo' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : ''}
                              ${event.event_type === 'message' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' : ''}
                              ${event.event_type === 'birthday' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' : ''}
                              ${event.event_type === 'special' ? 'bg-red-500/20 text-red-300 border border-red-400/30' : ''}
                            `}>
                              {event.event_type}
                            </span>
                          </div>
                          
                          {/* Date */}
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-white/60 text-sm">
                              {eventDate.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            {isPast && (
                              <span className="text-white/40 text-xs">
                                • Past
                              </span>
                            )}
                          </div>
                          
                          {/* Description preview */}
                          {event.description && (
                            <p className="text-white/50 text-sm line-clamp-1 mb-2">
                              {event.description}
                            </p>
                          )}
                          
                          {/* Music indicator */}
                          {(event.music_title || event.music_artist) && (
                            <div className="flex items-center gap-1 text-white/60 text-xs">
                              <span>🎵</span>
                              <span className="truncate">
                                {event.music_title || 'Music attached'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Arrow */}
                        <div className="text-white/40 group-hover:text-white/80 transition-colors text-xl flex-shrink-0">
                          →
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
            </div>

            {/* No events message */}
            {events.length === 0 && (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">📅</div>
                <p className="text-white/60">No events this month</p>
                <p className="text-white/40 text-sm mt-1">
                  Click any date to add a special moment
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden"
            onClick={() => !isSubmitting && setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(236, 72, 153, 0.5) transparent' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-white mb-2 text-center">
                {isEditMode ? 'Edit Event ✏️' : 'Add Special Moment'}
              </h2>
              <p className="text-white/60 text-center mb-6">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>

              <div className="space-y-4">
                {/* Event Type */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">Event Type</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(EVENT_ICONS) as EventType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => setNewEventType(type)}
                        className={`
                          p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-1
                          ${newEventType === type 
                            ? 'border-pink-400 bg-pink-500/20' 
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }
                        `}
                      >
                        <span className="text-2xl">{EVENT_ICONS[type]}</span>
                        <span className="text-xs text-white/70 capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">Title *</label>
                  <input
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="What happened?"
                    className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-pink-500 outline-none transition-all duration-300"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">Description</label>
                  <textarea
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Tell the story..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-pink-500 outline-none transition-all duration-300 resize-none"
                  />
                </div>

                {/* Music/Song (Optional) */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🎵</span>
                    <label className="text-white/80 text-sm font-medium">Song (Optional)</label>
                  </div>
                  
                  {!audioPreview ? (
                    <label className="block">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioSelect}
                        disabled={isSubmitting || isUploadingAudio}
                        className="hidden"
                      />
                      <div className="w-full px-4 py-6 bg-white/10 hover:bg-white/15 rounded-lg border-2 border-dashed border-white/20 hover:border-purple-500 cursor-pointer transition-all duration-300 text-center">
                        <div className="text-3xl mb-2">🎵</div>
                        <p className="text-white/70 text-sm mb-1">Click to upload audio</p>
                        <p className="text-white/50 text-xs">MP3, WAV, OGG up to 10MB</p>
                      </div>
                    </label>
                  ) : (
                    <div className="relative bg-white/10 rounded-lg p-4">
                      <audio
                        src={audioPreview}
                        controls
                        className="w-full"
                        style={{
                          height: '40px',
                          borderRadius: '8px'
                        }}
                      />
                      <button
                        onClick={handleRemoveAudio}
                        disabled={isSubmitting || isUploadingAudio}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-sm transition-all duration-300 disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <p className="text-white/50 text-xs mt-2">Upload an audio file for this moment</p>
                </div>

                {/* Image Upload (Optional) */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📸</span>
                    <label className="text-white/80 text-sm font-medium">Photo (Optional)</label>
                  </div>
                  
                  {!imagePreview ? (
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={isSubmitting || isUploadingImage}
                        className="hidden"
                      />
                      <div className="w-full px-4 py-8 bg-white/10 hover:bg-white/15 rounded-lg border-2 border-dashed border-white/20 hover:border-pink-500 cursor-pointer transition-all duration-300 text-center">
                        <div className="text-4xl mb-2">📷</div>
                        <p className="text-white/70 text-sm mb-1">Click to upload photo</p>
                        <p className="text-white/50 text-xs">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                    </label>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={handleRemoveImage}
                        disabled={isSubmitting || isUploadingImage}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all duration-300 disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <p className="text-white/50 text-xs mt-2">Add a photo to capture this moment</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    disabled={isSubmitting || isUploadingImage || isUploadingAudio}
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-all duration-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={isEditMode ? handleUpdateEvent : handleAddEvent}
                    disabled={isSubmitting || isUploadingImage || isUploadingAudio || !newEventTitle.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingImage ? 'Uploading Image...' : isUploadingAudio ? 'Uploading Audio...' : isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Event' : 'Add Event')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Animation Overlay */}
      <AnimatePresence>
        {showAnimation && animationType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {animationType === 'memory' && (
                <MemoryPetalsAnimation onComplete={handleAnimationComplete} />
              )}
              {animationType === 'photo' && (
                <PhotoFlashAnimation onComplete={handleAnimationComplete} />
              )}
              {animationType === 'message' && (
                <MessageEnvelopeAnimation onComplete={handleAnimationComplete} />
              )}
              {animationType === 'birthday' && (
                <BirthdayConfettiAnimation onComplete={handleAnimationComplete} />
              )}
              {animationType === 'special' && (
                <SpecialHeartsAnimation onComplete={handleAnimationComplete} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Picker Modal */}
      <AnimatePresence>
        {showEventPicker && selectedDate && selectedDateEvents.length > 0 && (
          <EventPicker
            events={selectedDateEvents}
            date={selectedDate}
            onSelectEvent={handleSelectEventFromPicker}
            onClose={handleCloseEventPicker}
          />
        )}
      </AnimatePresence>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {showEventDetail && selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={handleCloseEventDetail}
            onDelete={handleDeleteEvent}
            onEdit={handleEditEvent}
            onPrevious={currentEventIndex > 0 ? handlePreviousEvent : undefined}
            onNext={currentEventIndex < selectedDateEvents.length - 1 ? handleNextEvent : undefined}
            hasMultiple={selectedDateEvents.length > 1}
            currentIndex={currentEventIndex}
            totalEvents={selectedDateEvents.length}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
