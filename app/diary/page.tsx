'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/auth'
import CalendarOfUs from './CalendarOfUs'

export default function DiaryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [greeting, setGreeting] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)
    setUserName(user.display_name || user.username)
    setIsLoading(false)

    // Set greeting based on time
    const updateGreeting = () => {
      const hour = new Date().getHours()
      const date = new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
      
      setCurrentDate(date)
      
      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning!')
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon!')
      } else if (hour >= 17 && hour < 21) {
        setGreeting('Good Evening!')
      } else {
        setGreeting('Good Night!')
      }
    }

    updateGreeting()
    // Update every minute
    const interval = setInterval(updateGreeting, 60000)
    return () => clearInterval(interval)
  }, [router])

  if (isLoading) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">📖</div>
          <p className="text-purple-600">Loading diary...</p>
        </motion.div>
      </main>
    )
  }

  if (!userId) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Decorative elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-10 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl"
      />
      
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header with Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Diary App</h1>
            <Link href="/home">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all border border-purple-100"
              >
                <span className="text-2xl">🏠</span>
              </motion.button>
            </Link>
          </div>

          {/* Greeting Card with Cat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl p-6 shadow-xl overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20" />
            </div>

            <div className="relative flex items-center justify-between">
              {/* Greeting Text */}
              <div className="flex-1">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-bold text-white mb-1"
                >
                  {greeting}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90 text-sm"
                >
                  {currentDate}
                </motion.p>
              </div>

              {/* Cute Cat Illustration */}
              <motion.div
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.5,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className="relative"
              >
                <div className="text-8xl md:text-9xl filter drop-shadow-2xl">
                  😺
                </div>
                {/* Peeking effect - cat paws */}
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -bottom-4 -left-2 text-4xl"
                >
                  🐾
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Calendar Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CalendarOfUs userId={userId} />
        </motion.div>
      </div>
    </main>
  )
}
