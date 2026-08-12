'use client'

import { motion, useReducedMotion, useInView } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import EventDetailModal from '../components/EventDetailModal'

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
type EventType = 'memory' | 'photo' | 'message' | 'birthday' | 'special'

interface TimelineTabProps {
  userId: string
  onEventClick?: (event: CalendarEvent) => void
}

const EVENT_ICONS: Record<EventType, string> = {
  memory: '🌸',
  photo: '📸',
  message: '💌',
  birthday: '🎂',
  special: '❤️'
}

interface TimelineItemProps {
  event: CalendarEvent
  onClick: () => void
  index: number
}

function TimelineItem({ event, onClick, index }: TimelineItemProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const prefersReducedMotion = useReducedMotion()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? false : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative"
    >
      <button
        onClick={onClick}
        className="w-full text-left group"
      >
        <div className="flex items-start gap-4">
          {/* Timeline dot and connector */}
          <div className="flex flex-col items-center flex-shrink-0">
            {/* Dot */}
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.2 }}
              className={`
                w-4 h-4 rounded-full border-4 z-10 relative
                ${event.event_type === 'memory' ? 'border-pink-400 bg-pink-500' : ''}
                ${event.event_type === 'photo' ? 'border-blue-400 bg-blue-500' : ''}
                ${event.event_type === 'message' ? 'border-purple-400 bg-purple-500' : ''}
                ${event.event_type === 'birthday' ? 'border-yellow-400 bg-yellow-500' : ''}
                ${event.event_type === 'special' ? 'border-red-400 bg-red-500' : ''}
                group-hover:scale-150 transition-transform duration-300
              `}
              style={{
                boxShadow: '0 0 10px currentColor'
              }}
            />
          </div>

          {/* Content card */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex-1 bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 mb-6 relative overflow-hidden"
          >
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Icon or Image */}
                  {event.image_url ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/20">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <span className="text-3xl">{EVENT_ICONS[event.event_type]}</span>
                  )}
                  
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wide">
                      {formatDate(event.event_date)}
                    </p>
                  </div>
                </div>

                <div className="text-white/40 group-hover:text-white/80 transition-colors">
                  →
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-2">
                {event.title}
              </h3>

              {/* Description */}
              {event.description && (
                <p className="text-white/70 text-sm line-clamp-2 mb-3">
                  {event.description}
                </p>
              )}

              {/* Music/Audio indicator */}
              {(event.audio_url || event.music_title || event.music_artist) && (
                <div className="flex items-center gap-2 text-white/60 text-xs bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                  <span>🎵</span>
                  {event.audio_url ? (
                    <span className="truncate text-white/80">Audio attached • Click to play</span>
                  ) : (
                    <span className="truncate">
                      {event.music_title || 'Music attached'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </button>
    </motion.div>
  )
}

export default function TimelineTab({ userId, onEventClick }: TimelineTabProps) {
  const prefersReducedMotion = useReducedMotion()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventDetail, setShowEventDetail] = useState(false)

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

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventDetail(true)
  }

  const handleCloseEventDetail = () => {
    setShowEventDetail(false)
    setSelectedEvent(null)
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      await loadEvents()
      handleCloseEventDetail()
    } catch (err: any) {
      console.error('Delete event error:', err)
      alert('Failed to delete: ' + err.message)
    }
  }

  // Group events by year and month
  const groupedEvents: Record<string, Record<string, CalendarEvent[]>> = {}
  
  events.forEach(event => {
    const date = new Date(event.event_date)
    const year = date.getFullYear().toString()
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    
    if (!groupedEvents[year]) {
      groupedEvents[year] = {}
    }
    if (!groupedEvents[year][month]) {
      groupedEvents[year][month] = []
    }
    groupedEvents[year][month].push(event)
  })

  const years = Object.keys(groupedEvents).sort((a, b) => parseInt(b) - parseInt(a))

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">⏳</div>
        <p className="text-white/60">Loading timeline...</p>
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
            rotate: [0, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="text-8xl mb-6"
        >
          🕰️
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-4">No Timeline Yet</h2>
        <p className="text-white/70 mb-2">Your journey through time starts here.</p>
        <p className="text-white/50 text-sm">
          Add memories to see them unfold chronologically
        </p>
      </motion.div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Timeline header */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-white mb-2">Your Journey</h2>
        <p className="text-white/60">A chronological story of special moments</p>
      </motion.div>

      {/* Timeline content */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-500/50 via-purple-500/50 to-blue-500/50" />

        {/* Years and months */}
        {years.map((year, yearIndex) => {
          const months = Object.keys(groupedEvents[year])
          
          return (
            <motion.div
              key={year}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: yearIndex * 0.1 }}
              className="mb-12"
            >
              {/* Year header */}
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: yearIndex * 0.1 + 0.1 }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full px-6 py-2 border-2 border-white/30">
                  <h3 className="text-2xl font-bold text-white">{year}</h3>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-white/30 to-transparent" />
              </motion.div>

              {/* Months */}
              {months.map((month, monthIndex) => {
                const monthEvents = groupedEvents[year][month]
                
                return (
                  <div key={`${year}-${month}`} className="mb-8">
                    {/* Month header */}
                    <motion.div
                      initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: yearIndex * 0.1 + monthIndex * 0.05 + 0.2 }}
                      className="flex items-center gap-3 mb-6 pl-8"
                    >
                      <div className="bg-white/10 backdrop-blur-lg rounded-full px-4 py-1 border border-white/20">
                        <h4 className="text-sm font-semibold text-white">{month}</h4>
                      </div>
                      <div className="text-white/40 text-sm">
                        {monthEvents.length} {monthEvents.length === 1 ? 'event' : 'events'}
                      </div>
                    </motion.div>

                    {/* Events */}
                    {monthEvents.map((event, eventIndex) => (
                      <TimelineItem
                        key={event.id}
                        event={event}
                        onClick={() => handleEventClick(event)}
                        index={eventIndex}
                      />
                    ))}
                  </div>
                )
              })}
            </motion.div>
          )
        })}

        {/* End marker */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-start pl-1"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 border-4 border-white/20" 
               style={{ boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)' }} 
          />
        </motion.div>
      </div>

      {/* Event Detail Modal */}
      {showEventDetail && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={handleCloseEventDetail}
          onDelete={handleDeleteEvent}
          onEdit={(event) => {
            // For Timeline, we just reload after edit
            // User can edit from Calendar view
            alert('Please edit this event from Calendar view')
          }}
        />
      )}
    </div>
  )
}
