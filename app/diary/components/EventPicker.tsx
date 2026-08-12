'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
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

const EVENT_COLORS: Record<EventType, { bg: string; border: string; hover: string }> = {
  memory: { 
    bg: 'bg-pink-500/20', 
    border: 'border-pink-400/40', 
    hover: 'hover:bg-pink-500/30' 
  },
  photo: { 
    bg: 'bg-blue-500/20', 
    border: 'border-blue-400/40', 
    hover: 'hover:bg-blue-500/30' 
  },
  message: { 
    bg: 'bg-purple-500/20', 
    border: 'border-purple-400/40', 
    hover: 'hover:bg-purple-500/30' 
  },
  birthday: { 
    bg: 'bg-yellow-500/20', 
    border: 'border-yellow-400/40', 
    hover: 'hover:bg-yellow-500/30' 
  },
  special: { 
    bg: 'bg-red-500/20', 
    border: 'border-red-400/40', 
    hover: 'hover:bg-red-500/30' 
  }
}

interface EventPickerProps {
  events: CalendarEvent[]
  date: Date
  onSelectEvent: (event: CalendarEvent, index: number) => void
  onClose: () => void
}

export default function EventPicker({ events, date, onSelectEvent, onClose }: EventPickerProps) {
  const prefersReducedMotion = useReducedMotion()
  
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
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
        transition={prefersReducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { delay: 0.1, type: 'spring', stiffness: 200 }}
            className="text-5xl mb-3"
          >
            📅
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Multiple Events
          </h2>
          <p className="text-white/70 text-sm">
            {formatDate(date.toISOString())}
          </p>
          <div className="inline-block bg-pink-500/20 backdrop-blur-sm rounded-full px-3 py-1 mt-2 border border-pink-400/30">
            <p className="text-pink-300 text-sm font-medium">
              {events.length} {events.length === 1 ? 'event' : 'events'} on this day
            </p>
          </div>
        </div>

        {/* Event List */}
        <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {events.map((event, index) => {
            const colors = EVENT_COLORS[event.event_type]
            return (
              <motion.button
                key={event.id}
                initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={prefersReducedMotion ? { duration: 0.1 } : { delay: 0.1 + index * 0.05 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02, x: 5 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                onClick={() => onSelectEvent(event, index)}
                className={`
                  w-full p-4 rounded-2xl border-2 ${colors.border} ${colors.bg} ${colors.hover}
                  backdrop-blur-sm transition-all duration-300 text-left
                  group relative overflow-hidden
                `}
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
                        className="w-full h-full object-cover"
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
                      <h3 className="text-white font-semibold text-lg truncate">
                        {event.title}
                      </h3>
                      {/* Event type badge */}
                      <span className="text-white/60 text-xs capitalize bg-white/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {event.event_type}
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="text-white/70 text-sm line-clamp-2 mb-2">
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

        {/* Close Button */}
        <motion.button
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { delay: 0.2 + events.length * 0.05 }}
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          onClick={onClose}
          className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-all duration-300 border border-white/20"
        >
          Cancel
        </motion.button>
      </motion.div>

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
    </motion.div>
  )
}
