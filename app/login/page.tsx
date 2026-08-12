'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginWithUsernameAndBirthday } from '@/lib/auth/auth'

export default function LoginPage() {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [username, setUsername] = useState('')
  const [birthday, setBirthday] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState<'username' | 'birthday' | 'both' | null>(null)
  const [showExplosion, setShowExplosion] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hasAttempted, setHasAttempted] = useState(false)

  // Only render random elements on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setErrorField(null)
    setShowErrorMessage(false)
    setHasAttempted(true)
    
    // Login with Supabase
    const result = await loginWithUsernameAndBirthday({ username, birthday })
    
    if (result.success) {
      // Success - show loading state then redirect
      setTimeout(() => {
        router.push('/home')
      }, 1000)
    } else {
      // Error - show PLAYFUL EXPLOSION! 🎉
      setIsLoading(false)
      
      // Determine which field is wrong
      const errorMsg = result.error || 'Login failed'
      if (errorMsg.toLowerCase().includes('username')) {
        setErrorField('username')
        setError("That username isn't quite right 👀")
      } else if (errorMsg.toLowerCase().includes('birthday') || errorMsg.toLowerCase().includes('date')) {
        setErrorField('birthday')
        setError("That special date doesn't seem right 🎂")
      } else {
        setErrorField('both')
        setError("Oops! Something isn't quite right yet 👀")
      }
      
      // Start explosion animation
      setShowExplosion(true)
      
      // Show error message after explosion
      setTimeout(() => {
        setShowErrorMessage(true)
      }, 700)
      
      // Reset explosion after animation
      setTimeout(() => {
        setShowExplosion(false)
      }, 1500)
    }
  }

  // Clear error when user starts typing again
  useEffect(() => {
    if (hasAttempted && (username || birthday)) {
      setShowErrorMessage(false)
      setError('')
    }
  }, [username, birthday, hasAttempted])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Animated decorative circles in corners */}
      <motion.div
        className="absolute hidden sm:block"
        style={{ top: '15%', right: '10%' }}
        animate={prefersReducedMotion ? {} : {
          y: [0, -15, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="relative w-20 h-20">
          {/* Red button */}
          <motion.div
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 10px rgba(229, 57, 53, 0.8)',
                '0 0 25px rgba(229, 57, 53, 1)',
                '0 0 10px rgba(229, 57, 53, 0.8)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-0 left-0 w-8 h-8 bg-buzz-red rounded-full border-2 border-white/40"
          />
          {/* Green button */}
          <motion.div
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 10px rgba(139, 195, 74, 0.8)',
                '0 0 25px rgba(139, 195, 74, 1)',
                '0 0 10px rgba(139, 195, 74, 0.8)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            className="absolute top-0 right-0 w-8 h-8 bg-buzz-green rounded-full border-2 border-white/40"
          />
          {/* Yellow button */}
          <motion.div
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 10px rgba(251, 192, 45, 0.8)',
                '0 0 25px rgba(251, 192, 45, 1)',
                '0 0 10px rgba(251, 192, 45, 0.8)',
              ],
            }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }}
            className="absolute bottom-0 left-0 w-8 h-8 bg-yellow-400 rounded-full border-2 border-white/40"
          />
          {/* Blue button */}
          <motion.div
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 10px rgba(66, 165, 245, 0.8)',
                '0 0 25px rgba(66, 165, 245, 1)',
                '0 0 10px rgba(66, 165, 245, 0.8)',
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.9 }}
            className="absolute bottom-0 right-0 w-8 h-8 bg-blue-400 rounded-full border-2 border-white/40"
          />
        </div>
      </motion.div>

      {/* Left side decorative cluster */}
      <motion.div
        className="absolute hidden md:block"
        style={{ top: '30%', left: '8%' }}
        animate={prefersReducedMotion ? {} : {
          x: [-10, 10, -10],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="relative w-16 h-24">
          <motion.div
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-buzz-red rounded-full border-2 border-white/50"
            style={{ boxShadow: '0 0 15px rgba(229, 57, 53, 0.8)' }}
          />
          <motion.div
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute top-8 left-0 w-7 h-7 bg-buzz-green rounded-full border-2 border-white/50"
            style={{ boxShadow: '0 0 15px rgba(139, 195, 74, 0.8)' }}
          />
          <motion.div
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.25, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}
            className="absolute top-8 right-0 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white/50"
            style={{ boxShadow: '0 0 15px rgba(251, 192, 45, 0.8)' }}
          />
        </div>
      </motion.div>

      {/* Right bottom decorative */}
      <motion.div
        className="absolute hidden sm:block"
        style={{ bottom: '20%', right: '15%' }}
        animate={prefersReducedMotion ? {} : {
          rotate: [0, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="relative w-16 h-16">
          <motion.div
            animate={prefersReducedMotion ? {} : {
              boxShadow: [
                '0 0 10px rgba(126, 87, 194, 0.8)',
                '0 0 20px rgba(126, 87, 194, 1)',
                '0 0 10px rgba(126, 87, 194, 0.8)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 bg-buzz-purple rounded-full border-2 border-white/40"
          />
          <motion.div
            animate={prefersReducedMotion ? {} : {
              boxShadow: [
                '0 0 10px rgba(139, 195, 74, 0.8)',
                '0 0 20px rgba(139, 195, 74, 1)',
                '0 0 10px rgba(139, 195, 74, 0.8)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-5 bg-buzz-green rounded-full border-2 border-white/40"
          />
        </div>
      </motion.div>

      {/* Left bottom floating button */}
      <motion.div
        className="absolute hidden md:block"
        style={{ bottom: '25%', left: '12%' }}
        animate={prefersReducedMotion ? {} : {
          y: [0, -25, 0],
          x: [0, 15, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.div
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.4, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white/50"
          style={{ boxShadow: '0 0 20px rgba(66, 165, 245, 0.9)' }}
        />
      </motion.div>

      {/* Stars background */}
      {mounted && [...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
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

      {/* Main login form - STAGGER ENTRANCE */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0.1 } : { duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* 🎉 PLAYFUL CELEBRATION EXPLOSION for Wrong Input 🎉 */}
        <AnimatePresence>
          {showExplosion && (
            <>
              {/* Confetti, ribbons, sparkles */}
              {[...Array(prefersReducedMotion ? 8 : 20)].map((_, i) => {
                const angle = (i * 360) / (prefersReducedMotion ? 8 : 20)
                const distance = prefersReducedMotion ? 80 : (120 + Math.random() * 80)
                const x = Math.cos((angle * Math.PI) / 180) * distance
                const y = Math.sin((angle * Math.PI) / 180) * distance
                const emoji = ['🎉', '🎊', '✨', '⭐', '💫', '🔴', '🟢', '🟡', '🔵'][i % 9]
                
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
                    animate={{
                      x: x,
                      y: y,
                      scale: prefersReducedMotion ? 0 : [1, 1.5, 0],
                      opacity: 0,
                      rotate: prefersReducedMotion ? angle : angle + 360
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0.6 : 1.2,
                      ease: "easeOut"
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-3xl"
                  >
                    {emoji}
                  </motion.div>
                )
              })}
              
              {/* Central "POP" flash */}
              {!prefersReducedMotion && (
                <>
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-pink-500 to-yellow-400 rounded-full blur-2xl pointer-events-none"
                  />
                  
                  {/* Shockwave rings */}
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <motion.div
                      key={`ring-${i}`}
                      initial={{ scale: 0, opacity: 0.8 }}
                      animate={{ scale: 3.5, opacity: 0 }}
                      transition={{ duration: 0.9, delay }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-4 border-yellow-400 rounded-full pointer-events-none"
                    />
                  ))}
                </>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Header with Buzz - STAGGERED */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { 
            delay: 0.2, 
            duration: 0.7,
            ease: "easeOut"
          }}
          className="text-center mb-8"
        >
          <motion.div
            animate={prefersReducedMotion ? {} : {
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative inline-block mb-6"
          >
            {/* Buzz Lightyear character image */}
            <motion.div
              animate={prefersReducedMotion ? {} : {
                boxShadow: [
                  '0 0 30px rgba(139, 195, 74, 0.4)',
                  '0 0 50px rgba(139, 195, 74, 0.7)',
                  '0 0 30px rgba(139, 195, 74, 0.4)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border-4 border-buzz-green/30"
            >
              <img 
                src="/buzz/download (1),jpg"
                alt="Buzz Lightyear"
                className="w-full h-full object-contain p-1"
              />
            </motion.div>

            {/* Animated circles around Buzz - gentle floating */}
            <motion.div
              animate={prefersReducedMotion ? {} : { 
                scale: [1, 1.25, 1], 
                opacity: [0.7, 1, 0.7],
                x: [0, 2, 0],
                y: [0, -2, 0]
              }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-buzz-red rounded-full border-2 border-white/50"
              style={{ boxShadow: '0 0 12px rgba(229, 57, 53, 0.9)' }}
            />
            <motion.div
              animate={prefersReducedMotion ? {} : { 
                scale: [1, 1.3, 1], 
                opacity: [0.7, 1, 0.7],
                x: [0, -2, 0],
                y: [0, 2, 0]
              }}
              transition={{ duration: 2.1, repeat: Infinity, delay: 0.3 }}
              className="absolute -top-1 -left-1 w-5 h-5 bg-buzz-green rounded-full border-2 border-white/50"
              style={{ boxShadow: '0 0 12px rgba(139, 195, 74, 0.9)' }}
            />
            <motion.div
              animate={prefersReducedMotion ? {} : { 
                scale: [1, 1.28, 1], 
                opacity: [0.7, 1, 0.7],
                x: [0, -3, 0],
                y: [0, 3, 0]
              }}
              transition={{ duration: 1.9, repeat: Infinity, delay: 0.6 }}
              className="absolute -bottom-1 -left-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white/50"
              style={{ boxShadow: '0 0 12px rgba(251, 192, 45, 0.9)' }}
            />
            <motion.div
              animate={prefersReducedMotion ? {} : { 
                scale: [1, 1.32, 1], 
                opacity: [0.7, 1, 0.7],
                x: [0, 3, 0],
                y: [0, -2, 0]
              }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 0.9 }}
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-400 rounded-full border-2 border-white/50"
              style={{ boxShadow: '0 0 12px rgba(66, 165, 245, 0.9)' }}
            />
          </motion.div>

          {/* Title - STAGGERED */}
          <motion.h1 
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { delay: 0.4, duration: 0.6 }}
            className="text-2xl sm:text-3xl font-bold mb-2 tracking-wide" 
            style={{ textShadow: '0 0 20px rgba(139, 195, 74, 0.5)' }}
          >
            Welcome Back!
          </motion.h1>
          
          {/* Subtitle - STAGGERED */}
          <motion.p 
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { delay: 0.6, duration: 0.6 }}
            className="text-buzz-green-light text-xs sm:text-sm"
          >
            Enter your details to continue
          </motion.p>
        </motion.div>

        {/* Login Form - REFINED GLASSMORPHISM & STAGGERED */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { 
            delay: 0.5, 
            duration: 0.6,
            ease: "easeOut"
          }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-buzz-green/30 relative overflow-hidden"
          style={{
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 40px rgba(139, 195, 74, 0.15)'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 relative z-10">
            {/* Username Input - REFINED STATES */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-bold text-buzz-green-light mb-2 flex items-center gap-2"
              >
                <span className="text-lg">👤</span> USERNAME
              </label>
              <motion.input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                animate={errorField === 'username' || errorField === 'both' ? {
                  x: prefersReducedMotion ? 0 : [-10, 10, -10, 10, 0],
                } : {}}
                transition={{ duration: 0.4 }}
                className={`
                  w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-white/40 
                  font-medium transition-all duration-200
                  ${(errorField === 'username' || errorField === 'both') 
                    ? 'border-2 border-red-400/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/30' 
                    : 'border-2 border-buzz-green/40 hover:border-buzz-green/70 hover:shadow-[0_0_15px_rgba(139,195,74,0.3)] focus:border-buzz-green focus:ring-2 focus:ring-buzz-green/40 focus:shadow-[0_0_20px_rgba(139,195,74,0.5)]'
                  }
                  outline-none
                `}
                placeholder="Enter your username"
              />
            </div>

            {/* Birthday Input - REFINED STATES */}
            <div>
              <label
                htmlFor="birthday"
                className="block text-sm font-bold text-buzz-green-light mb-2 flex items-center gap-2"
              >
                <motion.span 
                  className="text-lg inline-block"
                  animate={birthday ? {
                    filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  🎂
                </motion.span> 
                BIRTHDAY
              </label>
              <motion.input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                required
                animate={errorField === 'birthday' || errorField === 'both' ? {
                  x: prefersReducedMotion ? 0 : [-10, 10, -10, 10, 0],
                } : {}}
                transition={{ duration: 0.4 }}
                className={`
                  w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-white/40 
                  font-medium transition-all duration-200 [color-scheme:dark]
                  ${(errorField === 'birthday' || errorField === 'both') 
                    ? 'border-2 border-red-400/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/30' 
                    : 'border-2 border-buzz-green/40 hover:border-buzz-green/70 hover:shadow-[0_0_15px_rgba(139,195,74,0.3)] focus:border-buzz-green focus:ring-2 focus:ring-buzz-green/40 focus:shadow-[0_0_20px_rgba(139,195,74,0.5)]'
                  }
                  outline-none
                `}
                placeholder="dd/mm/yyyy"
              />
              {/* Helper text */}
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="mt-2 text-xs text-buzz-green-light/70 flex items-center gap-1"
              >
                <span className="text-sm">🎂</span>
                <span>Enter your special day</span>
              </motion.p>
            </div>

            {/* Friendly Error Message - appears AFTER explosion */}
            <AnimatePresence>
              {showErrorMessage && error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-pink-500/20 to-yellow-400/20 border-2 border-pink-400/40 rounded-xl p-4 text-center"
                >
                  <motion.p 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-white font-bold text-lg mb-1"
                  >
                    Oops! Almost there! 🎉
                  </motion.p>
                  <p className="text-white/90 font-medium text-sm">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button - SUCCESS STATE */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={isLoading ? {} : (prefersReducedMotion ? {} : { scale: 1.02, y: -2 })}
              whileTap={isLoading ? {} : (prefersReducedMotion ? {} : { scale: 0.98 })}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-buzz-green via-buzz-green-dark to-buzz-green rounded-xl text-white font-bold text-base sm:text-lg transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed border-4 border-white/30 relative overflow-hidden"
              style={{
                boxShadow: '0 0 30px rgba(139, 195, 74, 0.6)',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white border-t-transparent rounded-full"
                  />
                  <span>Opening your world... ✨</span>
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base">
                  ENTER MY WORLD 🎁
                </span>
              )}
            </motion.button>
          </form>

          {/* Decorative dots at bottom */}
          <div className="mt-6 flex justify-center gap-2">
            <motion.div
              animate={prefersReducedMotion ? {} : { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-3 h-3 bg-buzz-red rounded-full"
              style={{ boxShadow: '0 0 10px rgba(229, 57, 53, 0.8)' }}
            />
            <motion.div
              animate={prefersReducedMotion ? {} : { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-3 h-3 bg-buzz-green rounded-full"
              style={{ boxShadow: '0 0 10px rgba(139, 195, 74, 0.8)' }}
            />
            <motion.div
              animate={prefersReducedMotion ? {} : { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-3 h-3 bg-yellow-400 rounded-full"
              style={{ boxShadow: '0 0 10px rgba(251, 192, 45, 0.8)' }}
            />
            <motion.div
              animate={prefersReducedMotion ? {} : { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              className="w-3 h-3 bg-blue-400 rounded-full"
              style={{ boxShadow: '0 0 10px rgba(66, 165, 245, 0.8)' }}
            />
          </div>
        </motion.div>

        {/* Back Link - STAGGERED */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { delay: 0.8, duration: 0.6 }}
          className="text-center mt-8"
        >
          <Link
            href="/"
            className="group text-sm text-buzz-green-light hover:text-buzz-green transition-colors duration-300 font-medium flex items-center justify-center gap-2"
          >
            <motion.span
              className="inline-block"
              whileHover={prefersReducedMotion ? {} : { x: -3 }}
              transition={{ duration: 0.2 }}
            >
              ←
            </motion.span> 
            Back to home
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}
