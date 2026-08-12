'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
type EventType = 'memory' | 'photo' | 'message' | 'birthday' | 'special'

interface BookTabProps {
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

const EVENT_LABELS: Record<EventType, string> = {
  memory: 'Memory',
  photo: 'Photo',
  message: 'Message',
  birthday: 'Birthday',
  special: 'Special'
}

export default function BookTab({ userId, onEventClick }: BookTabProps) {
  const prefersReducedMotion = useReducedMotion()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<EventType | 'all'>('all')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [userId])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('Load events error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.event_type === filterType)

  const displayEvents = showAll ? filteredEvents : filteredEvents.slice(0, 6)
  const featuredEvent = events[0] // Most recent event as featured

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">⏳</div>
        <p className="text-white/60">Loading your stories...</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <motion.div
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="text-8xl mb-6"
        >
          📖✨
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-4">No Stories Yet</h2>
        <p className="text-white/70 mb-2">Every special day needs a story.</p>
        <p className="text-white/50 text-sm">
          Start by adding your first memory in the Calendar tab
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Featured Entry */}
      {featuredEvent && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20 overflow-hidden relative group"
        >
          <div className="absolute top-4 right-4 bg-pink-500/30 backdrop-blur-sm rounded-full px-3 py-1 border border-pink-400/40">
            <p className="text-white text-xs font-semibold">🌸 FEATURED TODAY</p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{EVENT_ICONS[featuredEvent.event_type]}</span>
              <div>
                <p className="text-white/70 text-sm capitalize">{EVENT_LABELS[featuredEvent.event_type]}</p>
                <p className="text-white/60 text-sm">{formatDate(featuredEvent.event_date)}</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              {featuredEvent.title}
            </h2>

            {featuredEvent.image_url && (
              <div className="mb-4 rounded-2xl overflow-hidden border-2 border-white/20">
                <img
                  src={featuredEvent.image_url}
                  alt={featuredEvent.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}

            {featuredEvent.description && (
              <p className="text-white/80 mb-6 line-clamp-3">
                {featuredEvent.description}
              </p>
            )}

            <button
              onClick={() => onEventClick(featuredEvent)}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-all duration-300 border border-white/30"
            >
              Read Story →
            </button>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        <button
          onClick={() => setFilterType('all')}
          className={`
            px-4 py-2 rounded-full font-medium transition-all duration-300 whitespace-nowrap
            ${filterType === 'all'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
            }
          `}
        >
          All
        </button>
        {Object.entries(EVENT_ICONS).map(([type, icon]) => (
          <button
            key={type}
            onClick={() => setFilterType(type as EventType)}
            className={`
              px-4 py-2 rounded-full font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2
              ${filterType === type
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
              }
            `}
          >
            <span>{icon}</span>
            <span className="capitalize">{EVENT_LABELS[type as EventType]}</span>
          </button>
        ))}
      </motion.div>

      {/* Recent Entries */}
      <div>
        <motion.h2
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-6 flex items-center gap-2"
        >
          <span>📝</span>
          Recent Entries
        </motion.h2>

        {filteredEvents.length === 0 ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white/5 rounded-2xl border border-white/10"
          >
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-white/60">No {filterType !== 'all' && `${filterType} `}entries found</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {displayEvents.map((event, index) => (
              <motion.button
                key={event.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02, x: 5 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                onClick={() => onEventClick(event)}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-left transition-all duration-300 hover:bg-white/15 group relative overflow-hidden"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                
                <div className="relative flex items-start gap-4">
                  {/* Icon or Image Thumbnail */}
                  {event.image_url ? (
                    <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 border-white/20">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="text-4xl flex-shrink-0">
                      {EVENT_ICONS[event.event_type]}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white/60 text-sm capitalize">
                        {EVENT_LABELS[event.event_type]}
                      </span>
                      <span className="text-white/40 text-sm">•</span>
                      <span className="text-white/60 text-sm">
                        {formatDate(event.event_date)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">
                      {event.title}
                    </h3>
                    
                    {event.description && (
                      <p className="text-white/70 text-sm line-clamp-2 mb-2">
                        {event.description}
                      </p>
                    )}

                    {/* Music indicator */}
                    {(event.music_title || event.music_artist) && (
                      <div className="flex items-center gap-1 text-white/50 text-xs mt-2">
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
            ))}
          </div>
        )}

        {/* View All Button */}
        {filteredEvents.length > 6 && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-6"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full text-white font-medium transition-all duration-300"
            >
              {showAll ? 'Show Less' : `View All ${filteredEvents.length} Entries →`}
            </button>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
