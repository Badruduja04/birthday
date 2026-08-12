'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { Database } from '@/types/database.types'

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
type EventType = 'memory' | 'photo' | 'message' | 'birthday' | 'special'

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

const EVENT_LABELS: Record<EventType, string> = {
  memory: 'A Memory',
  photo: 'Photo Moment',
  message: 'A Message',
  birthday: 'Happy Birthday!',
  special: 'A Special Day'
}

interface EventDetailModalProps {
  event: CalendarEvent
  onClose: () => void
  onDelete: (eventId: string) => void
  onEdit?: (event: CalendarEvent) => void
  onPrevious?: () => void
  onNext?: () => void
  hasMultiple?: boolean
  currentIndex?: number
  totalEvents?: number
}

export default function EventDetailModal({
  event,
  onClose,
  onDelete,
  onEdit,
  onPrevious,
  onNext,
  hasMultiple = false,
  currentIndex,
  totalEvents,
}: EventDetailModalProps) {
  const prefersReducedMotion = useReducedMotion()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // For demo purposes - in real app, music would be from database
  const hasMusic = event.music_title || event.music_artist

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={prefersReducedMotion ? { duration: 0.1 } : {}}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden"
      onClick={onClose}
    >
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
        transition={prefersReducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 300, damping: 25 }}
        className={`
          bg-gradient-to-br ${EVENT_COLORS[event.event_type]} 
          rounded-3xl p-8 max-w-lg w-full shadow-2xl 
          border-2 border-white/20
          relative max-h-[90vh] overflow-y-auto
        `}
        onClick={(e) => e.stopPropagation()}
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(236, 72, 153, 0.5) transparent' }}
      >
        {/* Close Button */}
        <motion.button
          whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 90 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-full flex items-center justify-center text-white text-2xl border border-white/30 transition-all"
        >
          ×
        </motion.button>

        {/* Navigation for multiple events */}
        {hasMultiple && totalEvents && totalEvents > 1 && (
          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-lg rounded-full px-3 py-1 border border-white/30">
            <span className="text-white text-sm font-medium">
              {currentIndex !== undefined ? currentIndex + 1 : 1} / {totalEvents}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          {/* Event Icon */}
          <motion.div
            initial={prefersReducedMotion ? false : { scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { delay: 0.1, type: 'spring', stiffness: 200 }}
            className="text-7xl mb-4"
          >
            {EVENT_ICONS[event.event_type]}
          </motion.div>

          {/* Event Type Label */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { delay: 0.2 }}
            className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 mb-3 border border-white/30"
          >
            <p className="text-white/90 text-sm font-medium">
              {EVENT_LABELS[event.event_type]}
            </p>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { delay: 0.3 }}
            className="text-3xl font-bold text-white mb-2"
          >
            {event.title}
          </motion.h2>

          {/* Date */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { delay: 0.4 }}
            className="text-white/90 text-sm"
          >
            {formatDate(event.event_date)}
          </motion.p>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          {/* Description */}
          {event.description && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
            >
              <p className="text-white/90 leading-relaxed text-center">
                {event.description}
              </p>
            </motion.div>
          )}

          {/* Image (if exists) */}
          {event.image_url && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0.1 } : { delay: 0.7 }}
              className="rounded-2xl overflow-hidden border-2 border-white/20 mb-4"
            >
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-auto object-cover max-h-96 cursor-pointer hover:scale-105 transition-transform duration-500"
                onClick={() => {
                  // Open image in new tab for full view
                  window.open(event.image_url!, '_blank')
                }}
              />
            </motion.div>
          )}

          {/* Music Section */}
          {(hasMusic || event.audio_url) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎵</span>
                <h3 className="text-white font-semibold">Song for this memory</h3>
              </div>

              {/* Song Info */}
              {(event.music_title || event.music_artist) && (
                <div className="text-center mb-3">
                  {event.music_title && (
                    <p className="text-white/95 font-medium text-lg mb-1">
                      {event.music_title}
                    </p>
                  )}
                  {event.music_artist && (
                    <p className="text-white/75 text-sm">
                      {event.music_artist}
                    </p>
                  )}
                </div>
              )}

              {/* Audio Player */}
              {event.audio_url ? (
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <audio
                    controls
                    src={event.audio_url}
                    className="w-full"
                    style={{
                      height: '40px',
                      borderRadius: '8px',
                      filter: 'brightness(1.1) contrast(1.05)'
                    }}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : (
                /* Placeholder for events with music text but no audio file */
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/40 flex items-center justify-center transition-all"
                      disabled
                    >
                      <span className="text-white text-lg">▶️</span>
                    </button>
                    <div className="flex-1">
                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white/50 w-0" />
                      </div>
                    </div>
                    <span className="text-white/70 text-xs font-mono">0:00</span>
                  </div>
                  <p className="text-white/50 text-xs text-center">
                    Audio file not uploaded
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          {/* Navigation Buttons (if multiple events) */}
          {hasMultiple && (onPrevious || onNext) && (
            <div className="flex gap-2">
              {onPrevious && (
                <button
                  onClick={onPrevious}
                  className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-all duration-300 border border-white/30"
                >
                  ← Previous
                </button>
              )}
              {onNext && (
                <button
                  onClick={onNext}
                  className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-all duration-300 border border-white/30"
                >
                  Next →
                </button>
              )}
            </div>
          )}

          {/* Main Actions */}
          <div className="flex gap-3">
            {onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="flex-1 px-6 py-3 bg-blue-500/50 hover:bg-blue-600/60 rounded-full text-white font-medium transition-all duration-300 border border-white/30"
              >
                ✏️ Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-all duration-300 border border-white/30"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this event?')) {
                  onDelete(event.id)
                }
              }}
              className="flex-1 px-6 py-3 bg-red-500/50 hover:bg-red-600/60 rounded-full text-white font-medium transition-all duration-300 border border-white/30"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
