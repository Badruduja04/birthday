'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout } from '@/lib/auth/auth'
import { supabase } from '@/lib/supabase/client'

// Get dynamic greeting based on time
function getGreeting(): string {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 12) {
    return 'Good morning'
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon'
  } else if (hour >= 17 && hour < 22) {
    return 'Good evening'
  } else {
    return 'Good night'
  }
}

// Menu items for the dashboard
const menuItems = [
  { 
    id: 'memories',
    icon: '📸', 
    title: 'Memories', 
    description: 'Photo gallery',
    href: '/memories',
    color: 'from-buzz-green to-buzz-green-dark'
  },
  { 
    id: 'puzzle',
    icon: '🧩', 
    title: 'Puzzle', 
    description: 'Photo puzzle game',
    href: '/puzzle',
    color: 'from-purple-500 to-indigo-500'
  },
  { 
    id: 'diary',
    icon: '📔', 
    title: 'Diary', 
    description: 'Your thoughts',
    href: '/diary',
    color: 'from-buzz-purple to-buzz-purple-dark'
  },
  { 
    id: 'music',
    icon: '🎵', 
    title: 'Music', 
    description: 'Your playlist',
    href: '/music',
    color: 'from-blue-500 to-blue-700'
  },
  { 
    id: 'camera',
    icon: '📷', 
    title: 'Camera', 
    description: 'Photobooth',
    href: '/camera/photobooth',
    color: 'from-pink-500 to-pink-700'
  },
  { 
    id: 'surprise',
    icon: '🎁', 
    title: 'Surprise', 
    description: 'Something special',
    href: '/surprise',
    color: 'from-buzz-red to-red-600'
  },
]

export default function HomePage() {
  const router = useRouter()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [greeting, setGreeting] = useState('Good morning')
  
  // Real stats from database
  const [stats, setStats] = useState({
    memories: 0,
    diary: 0,
    music: 0
  })
  const [loadingStats, setLoadingStats] = useState(true)
  
  useEffect(() => {
    setMounted(true)
    setGreeting(getGreeting())
    
    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getGreeting())
    }, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    // Check if user is logged in
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    
    // Fetch real stats
    fetchStats(currentUser.id)
  }, [router])

  const fetchStats = async (userId: string) => {
    try {
      // Fetch memories count
      const { count: memoriesCount } = await supabase
        .from('memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Fetch diary entries count
      const { count: diaryCount } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Fetch music count
      const { count: musicCount } = await supabase
        .from('music')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      setStats({
        memories: memoriesCount || 0,
        diary: diaryCount || 0,
        music: musicCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    )
  }
  
  const displayName = user.display_name || user.username || "Birthday Star"

  return (
    <main className="min-h-screen p-6 relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-10 w-40 h-40 bg-buzz-green/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-20 left-10 w-48 h-48 bg-buzz-purple/20 rounded-full blur-3xl"
      />

      {/* Stars - only render on client */}
      {mounted && [...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Animated buttons (Buzz theme) - Top Right */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-10 right-10 w-16 h-16"
      >
        <div className="w-4 h-4 bg-buzz-red rounded-full absolute top-0 left-0" 
          style={{ boxShadow: '0 0 10px rgba(229, 57, 53, 0.8)' }} />
        <div className="w-4 h-4 bg-buzz-green rounded-full absolute top-0 right-0"
          style={{ boxShadow: '0 0 10px rgba(139, 195, 74, 0.8)' }} />
        <div className="w-4 h-4 bg-yellow-400 rounded-full absolute bottom-0 left-0"
          style={{ boxShadow: '0 0 10px rgba(251, 192, 45, 0.8)' }} />
        <div className="w-4 h-4 bg-blue-400 rounded-full absolute bottom-0 right-0"
          style={{ boxShadow: '0 0 10px rgba(66, 165, 245, 0.8)' }} />
      </motion.div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header with Buzz */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          {/* Buzz Lightyear floating */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative inline-block mb-6"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 30px rgba(139, 195, 74, 0.4)',
                  '0 0 50px rgba(139, 195, 74, 0.7)',
                  '0 0 30px rgba(139, 195, 74, 0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-28 h-28 mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border-4 border-buzz-green/30"
            >
              <img 
                src="/buzz.webp"
                alt="Buzz Lightyear"
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Animated buttons around Buzz */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-buzz-red rounded-full border-2 border-white/50"
              style={{ boxShadow: '0 0 12px rgba(229, 57, 53, 0.9)' }}
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              className="absolute -top-2 -left-2 w-6 h-6 bg-buzz-green rounded-full border-2 border-white/50"
              style={{ boxShadow: '0 0 12px rgba(139, 195, 74, 0.9)' }}
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white/50"
              style={{ boxShadow: '0 0 12px rgba(251, 192, 45, 0.9)' }}
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
              className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-400 rounded-full border-2 border-white/50"
              style={{ boxShadow: '0 0 12px rgba(66, 165, 245, 0.9)' }}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-3"
            style={{ textShadow: '0 0 20px rgba(139, 195, 74, 0.5)' }}
          >
            {greeting}, {displayName}! 💚
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg text-buzz-green-light mb-8"
          >
            A little space made just for you ✨
          </motion.p>

          {/* Dashboard Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="max-w-3xl mx-auto mb-8"
          >
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-buzz-green/20 relative overflow-hidden shadow-xl">
              {/* Subtle background glow */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-br from-buzz-green/10 to-buzz-purple/10 blur-xl"
              />

              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="text-center mb-6"
                >
                  <div className="text-3xl mb-2">✨</div>
                  <h2 className="text-2xl font-bold text-white mb-1">Your Little Space</h2>
                  <p className="text-white/60 text-sm">Everything here is just a little bit more you</p>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="text-3xl mb-2">📸</div>
                    <div className="text-2xl font-bold text-buzz-green">
                      {loadingStats ? '...' : stats.memories}
                    </div>
                    <div className="text-xs text-white/60 mt-1">Memories</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="text-3xl mb-2">📖</div>
                    <div className="text-2xl font-bold text-buzz-purple">
                      {loadingStats ? '...' : stats.diary}
                    </div>
                    <div className="text-xs text-white/60 mt-1">Diary</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="text-3xl mb-2">🎵</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {loadingStats ? '...' : stats.music}
                    </div>
                    <div className="text-xs text-white/60 mt-1">Music</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Today's Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="bg-gradient-to-r from-buzz-green/10 to-buzz-purple/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
              <p className="text-white/80 text-sm text-center italic">
                Take a break. You have done enough today. ✨
              </p>
            </div>
          </motion.div>
        </motion.div>
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ textShadow: '0 0 15px rgba(139, 195, 74, 0.3)' }}>
            Explore Your Space 🚀
          </h2>
          <p className="text-white/60 text-sm">
            Choose your adventure
          </p>
        </motion.div>

        {/* Menu Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12"
        >
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoveredItem(item.id)}
              onHoverEnd={() => setHoveredItem(null)}
            >
              <Link
                href={item.href}
                className="block relative"
              >
                <div className={`
                  bg-white/5 backdrop-blur-lg rounded-3xl p-6 md:p-8
                  border ${hoveredItem === item.id ? 'border-buzz-green' : 'border-white/10'}
                  transition-all duration-300
                  shadow-lg hover:shadow-2xl
                  relative overflow-hidden
                  group
                `}>
                  {/* Subtle glow on hover */}
                  {hoveredItem === item.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.1 }}
                      className={`absolute inset-0 bg-gradient-to-br ${item.color}`}
                    />
                  )}

                  {/* Content */}
                  <div className="relative z-10">
                    <motion.div
                      animate={{
                        scale: hoveredItem === item.id ? 1.2 : 1,
                        rotate: hoveredItem === item.id ? [0, -10, 10, -10, 0] : 0,
                      }}
                      transition={{ duration: 0.5 }}
                      className="text-5xl md:text-6xl mb-4"
                    >
                      {item.icon}
                    </motion.div>

                    <h3 className="text-xl md:text-2xl font-bold mb-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-white/70">
                      {item.description}
                    </p>
                  </div>

                  {/* Subtle border glow on hover */}
                  {hoveredItem === item.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 border border-buzz-green rounded-3xl"
                      style={{ boxShadow: '0 0 20px rgba(139, 195, 74, 0.3)' }}
                    />
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Recently Added Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold text-center mb-6" style={{ textShadow: '0 0 15px rgba(139, 195, 74, 0.3)' }}>
            ✨ Recently Added
          </h3>
          
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {/* Recent Photo */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10 hover:border-buzz-green transition-all duration-300 cursor-pointer"
            >
              <div className="text-4xl mb-3 text-center">📷</div>
              <p className="text-sm text-white/80 text-center font-medium">New Photo</p>
              <p className="text-xs text-white/50 text-center mt-1">2 hours ago</p>
            </motion.div>

            {/* Recent Note */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10 hover:border-buzz-purple transition-all duration-300 cursor-pointer"
            >
              <div className="text-4xl mb-3 text-center">📖</div>
              <p className="text-sm text-white/80 text-center font-medium">New Entry</p>
              <p className="text-xs text-white/50 text-center mt-1">Yesterday</p>
            </motion.div>

            {/* Recent Song */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10 hover:border-blue-400 transition-all duration-300 cursor-pointer"
            >
              <div className="text-4xl mb-3 text-center">🎵</div>
              <p className="text-sm text-white/80 text-center font-medium">New Song</p>
              <p className="text-xs text-white/50 text-center mt-1">3 days ago</p>
            </motion.div>
          </div>
        </motion.div>
        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="text-center"
        >
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full text-white/80 hover:text-white border-2 border-white/30 transition-all duration-300 text-sm font-medium"
          >
            Logout
          </button>
        </motion.div>

        {/* Bottom decorative buttons */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="fixed bottom-10 left-10 w-12 h-12 hidden md:block"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
            className="w-full h-full bg-gradient-to-br from-buzz-purple to-buzz-purple-dark rounded-full border-2 border-white/40"
            style={{ boxShadow: '0 0 20px rgba(126, 87, 194, 0.8)' }}
          />
        </motion.div>
      </div>
    </main>
  )
}
