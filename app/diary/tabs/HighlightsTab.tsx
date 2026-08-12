'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
type EventType = 'memory' | 'photo' | 'message' | 'birthday' | 'special'

interface HighlightsTabProps {
  userId: string
  onEventClick: (event: CalendarEvent) => void
}

const EVENT_ICONS: Record<EventType, string> = {
  memory: '🌸',
  photo: '📸',
  message: '💌',
  birthday: '🎂',
  special: '❤️'
}

interface HighlightCardProps {
  event: CalendarEvent
  onEventClick: (event: CalendarEvent) => void
  index: number
}

function HighlightCard({ event, onEventClick, index }: HighlightCardProps) {
  const prefersReducedMotion = useReducedMotion()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.button
      initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={prefersReducedMotion ? {} : { y: -10 }}
      onClick={() => onEventClick(event)}
      className="group relative overflow-hidden rounded-3xl border-2 border-white/20 bg-white/5 backdrop-blur-lg transition-all duration-500 hover:border-white/40 hover:shadow-2xl text-left"
      style={{
        minHeight: '320px'
      }}
    >
      {/* Background Image or Gradient */}
      {event.image_url ? (
        <div className="absolute inset-0">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>
      ) : (
        <div className={`
          absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500
          ${event.event_type === 'memory' ? 'bg-gradient-to-br from-pink-500 to-rose-500' : ''}
          ${event.event_type === 'photo' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : ''}
          ${event.event_type === 'message' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : ''}
          ${event.event_type === 'birthday' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : ''}
          ${event.event_type === 'special' ? 'bg-gradient-to-br from-red-500 to-pink-600' : ''}
        `} />
      )}

      {/* Content */}
      <div className="relative p-6 flex flex-col h-full justify-between">
        {/* Top section */}
        <div>
          {/* Event icon badge */}
          <div className="inline-block bg-white/20 backdrop-blur-md rounded-full p-3 mb-4 border-2 border-white/30">
            <span className="text-3xl">{EVENT_ICONS[event.event_type]}</span>
          </div>

          {/* Event type label */}
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3 border border-white/30">
            <p className="text-white/90 text-xs font-semibold uppercase tracking-wide capitalize">
              {event.event_type}
            </p>
          </div>
        </div>

        {/* Bottom section */}
        <div>
          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
            {event.title}
          </h3>

          {/* Date */}
          <p className="text-white/80 text-sm mb-3">
            {formatDate(event.event_date)}
          </p>

          {/* Description */}
          {event.description && (
            <p className="text-white/70 text-sm line-clamp-2 mb-3">
              {event.description}
            </p>
          )}

          {/* Music indicator */}
          {(event.music_title || event.music_artist) && (
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <span>🎵</span>
              <span className="truncate">
                {event.music_title || 'Music attached'}
              </span>
            </div>
          )}
        </div>

        {/* Hover indicator */}
        <div className="absolute top-4 right-4 text-white/40 group-hover:text-white/90 transition-all duration-300 text-2xl">
          →
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
    </motion.button>
  )
}

export default function HighlightsTab({ userId, onEventClick }: HighlightsTabProps) {
  const prefersReducedMotion = useReducedMotion()
  const [highlights, setHighlights] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadHighlights()
  }, [userId])

  const loadHighlights = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .eq('is_highlighted', true)
        .order('event_date', { ascending: false })

      if (error) throw error
      setHighlights(data || [])
    } catch (err) {
      console.error('Load highlights error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">⏳</div>
        <p className="text-white/60">Loading highlights...</p>
      </div>
    )
  }

  if (highlights.length === 0) {
    return (
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <motion.div
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="text-8xl mb-6"
        >
          ✨
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-4">No Highlights Yet</h2>
        <p className="text-white/70 mb-2">Mark your favorite moments as highlights.</p>
        <p className="text-white/50 text-sm">
          Special memories you want to keep close
        </p>
      </motion.div>
    )
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <motion.div
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="text-6xl mb-4"
        >
          ✨
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-3">Special Highlights</h2>
        <p className="text-white/60 mb-2">A collection of moments worth keeping close</p>
        <div className="inline-block bg-pink-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-pink-400/30">
          <p className="text-pink-300 text-sm font-medium">
            {highlights.length} {highlights.length === 1 ? 'highlight' : 'highlights'}
          </p>
        </div>
      </motion.div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((event, index) => (
          <HighlightCard
            key={event.id}
            event={event}
            onEventClick={onEventClick}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
