'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/auth'
import { Database } from '@/types/database.types'
import CalendarOfUs from './CalendarOfUs'
import DiaryNavigationTabs, { DiaryTab } from './components/DiaryNavigationTabs'
import BookTab from './tabs/BookTab'
import TimelineTab from './tabs/TimelineTab'

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']

export default function DiaryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<DiaryTab>('book')
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationType, setAnimationType] = useState<'memory' | 'photo' | 'message' | 'birthday' | 'special' | null>(null)
  const [selectedEventForAnimation, setSelectedEventForAnimation] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)
    setIsLoading(false)
  }, [router])

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEventForAnimation(event)
    setAnimationType(event.event_type)
    setShowAnimation(true)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-white/60">Loading...</p>
        </motion.div>
      </main>
    )
  }

  if (!userId) {
    return null
  }

  return (
    <main className="min-h-screen p-6 relative overflow-hidden">
      {/* Background effects */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"
      />
      
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-20 right-10 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              rotate: [0, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-8xl mb-6"
          >
            📖
          </motion.div>
          <h1 className="text-5xl font-bold mb-4" style={{ textShadow: '0 0 20px rgba(236, 72, 153, 0.5)' }}>
            My Diary
          </h1>
          <p className="text-white/70 text-lg mb-2">Every special day has a story ✨</p>
          <p className="text-white/50 text-sm italic">A little collection of moments worth remembering</p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DiaryNavigationTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </motion.div>

        {/* Tab Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Book Tab */}
            {activeTab === 'book' && (
              <div className="mb-8">
                <BookTab 
                  userId={userId} 
                  onEventClick={handleEventClick}
                />
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="mb-8">
                <CalendarOfUs userId={userId} />
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="mb-8">
                <TimelineTab 
                  userId={userId} 
                  onEventClick={handleEventClick}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Link
            href="/home"
            className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full text-white/80 hover:text-white border-2 border-white/30 transition-all duration-300 text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
