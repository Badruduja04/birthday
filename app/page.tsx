'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleEnterClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsTransitioning(true)
    
    // Smooth transition to login
    setTimeout(() => {
      router.push('/login')
    }, 600)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Buzz Lightyear inspired floating elements */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-10 w-24 h-24 bg-buzz-green rounded-full opacity-20 blur-2xl"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-20 left-10 w-32 h-32 bg-buzz-purple rounded-full opacity-20 blur-2xl"
      />

      {/* Star decorations - ANIMATED & ALIVE */}
      {[...Array(20)].map((_, i) => {
        const size = Math.random() > 0.7 ? 'w-1.5 h-1.5' : 'w-1 h-1'
        const isSparkle = Math.random() > 0.85
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: isSparkle ? [1, 1.8, 1] : [1, 1.3, 1],
              x: [0, (Math.random() - 0.5) * 3, 0],
              y: [0, (Math.random() - 0.5) * 3, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
            className={`absolute ${size} bg-white rounded-full ${isSparkle ? 'shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''}`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            suppressHydrationWarning
          />
        )
      })}

      {/* Transition overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isTransitioning ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 z-50 pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isTransitioning ? 0 : 1,
        }}
        transition={{ duration: isTransitioning ? 0.5 : 0 }}
        className="text-center space-y-8 relative z-10"
      >
        {/* Buzz Lightyear Image - REFINED ENTRANCE */}
        <motion.div
          initial={prefersReducedMotion ? false : { 
            opacity: 0, 
            scale: 0.92,
            y: -20
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0
          }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { 
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1], // Custom easing for smooth, gentle motion
            delay: 0.2 
          }}
          className="mb-8"
        >
          <motion.div
            animate={prefersReducedMotion ? {} : {
              y: [0, -15, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative inline-block"
          >
            {/* Buzz Lightyear character */}
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
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border-4 border-buzz-green/30"
            >
              <img 
                src="/buzz/download (1).jpg"
                alt="Buzz Lightyear"
                className="w-full h-full object-contain p-2"
              />
            </motion.div>
            
            {/* Animated decorative circles - GENTLE FLOATING */}
            {/* RED circle */}
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
              animate={prefersReducedMotion ? {} : { 
                scale: [1, 1.15, 1], 
                opacity: [0.7, 1, 0.7],
                x: [0, 2, 0],
                y: [0, -3, 0]
              }}
              transition={{ 
                duration: 2.3, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-buzz-red rounded-full border-2 border-white/50"
              style={{ boxShadow: '0 0 15px rgba(229, 57, 53, 0.8)' }}
            />
            {/* GREEN circle */}
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
              animate={prefersReducedMotion ? {} : { 
                scale: [1, 1.2, 1], 
                opacity: [0.7, 1, 0.7],
                x: [0, -2, 0],
                y: [0, 2, 0]
              }}
              transition={{ 
                duration: 2.7, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.7
              }}
              className="absolute -top-2 -left-2 w-6 h-6 bg-buzz-green rounded-full border-2 border-white/50"
              style={{ boxShadow: '0 0 15px rgba(139, 195, 74, 0.8)' }}
            />
            {/* YELLOW circle */}
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
              animate={prefersReducedMotion ? {} : { 
                scale: [1, 1.18, 1], 
                opacity: [0.7, 1, 0.7],
                x: [0, -3, 0],
                y: [0, 3, 0]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.9
              }}
              className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white/50"
              style={{ boxShadow: '0 0 15px rgba(251, 192, 45, 0.8)' }}
            />
            {/* BLUE circle */}
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
              animate={prefersReducedMotion ? {} : { 
                scale: [1, 1.22, 1], 
                opacity: [0.7, 1, 0.7],
                x: [0, 3, 0],
                y: [0, -2, 0]
              }}
              transition={{ 
                duration: 2.9, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.1
              }}
              className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-400 rounded-full border-2 border-white/50"
              style={{ boxShadow: '0 0 15px rgba(66, 165, 245, 0.8)' }}
            />
          </motion.div>
        </motion.div>

        {/* Welcome Text - STAGGERED & PERSONALIZED */}
        <motion.h1
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { 
            delay: 0.6, 
            duration: 0.7,
            ease: "easeOut"
          }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide px-4 mb-3"
          style={{
            textShadow: '0 0 20px rgba(139, 195, 74, 0.5)',
          }}
        >
          Welcome, Caramel! ✨
        </motion.h1>
        
        {/* Subtitle - STAGGERED & MORE PERSONAL */}
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { 
            delay: 0.9, 
            duration: 0.7,
            ease: "easeOut"
          }}
          className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-md mx-auto leading-relaxed px-4"
        >
          I made a little something
          <br />
          special for your birthday
        </motion.p>

        {/* ENTER Button - STAGGERED with MICRO-INTERACTIONS */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: isTransitioning ? 1.05 : 1
          }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { 
            delay: 1.2, 
            duration: 0.5
          }}
          className="flex flex-col items-center gap-3"
        >
          <Link
            href="/login"
            onClick={handleEnterClick}
            className="group inline-block mt-8 px-8 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-buzz-green via-buzz-green-dark to-buzz-green rounded-full text-white font-bold text-base sm:text-lg transition-all duration-300 border-4 border-white/30 relative overflow-hidden"
          >
            {/* Shimmer effect on hover only */}
            <motion.span
              initial={{ x: '-100%' }}
              whileHover={{ 
                x: '100%',
                transition: { duration: 0.6, ease: "easeInOut" }
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
            
            {/* Button content */}
            <motion.span
              className="relative z-10 block"
              whileHover={prefersReducedMotion ? {} : { y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
              animate={isTransitioning ? {
                boxShadow: '0 0 40px rgba(139, 195, 74, 0.9)'
              } : {}}
            >
              ENTER
            </motion.span>
          </Link>

          {/* Helper text below button */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { 
              delay: 1.5, 
              duration: 0.6,
              ease: "easeOut"
            }}
            className="text-sm text-white/50 font-light tracking-wide"
          >
            Your little space awaits ✨
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Animated Buzz "buttons" in corner - GENTLE FLOATING */}
      <motion.div
        animate={prefersReducedMotion ? {} : {
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-10 right-10 w-16 h-16"
      >
        <motion.div 
          animate={prefersReducedMotion ? {} : {
            x: [0, 2, 0],
            y: [0, -2, 0]
          }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="w-4 h-4 bg-buzz-red rounded-full absolute top-0 left-0 opacity-70" 
          style={{ boxShadow: '0 0 10px rgba(229, 57, 53, 0.8)' }} 
        />
        <motion.div 
          animate={prefersReducedMotion ? {} : {
            x: [0, -2, 0],
            y: [0, 2, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="w-4 h-4 bg-buzz-green rounded-full absolute top-0 right-0 opacity-70"
          style={{ boxShadow: '0 0 10px rgba(139, 195, 74, 0.8)' }} 
        />
        <motion.div 
          animate={prefersReducedMotion ? {} : {
            x: [0, -3, 0],
            y: [0, 3, 0]
          }}
          transition={{ duration: 2.8, repeat: Infinity }}
          className="w-4 h-4 bg-yellow-400 rounded-full absolute bottom-0 left-0 opacity-70"
          style={{ boxShadow: '0 0 10px rgba(251, 192, 45, 0.8)' }} 
        />
        <motion.div 
          animate={prefersReducedMotion ? {} : {
            x: [0, 3, 0],
            y: [0, -3, 0]
          }}
          transition={{ duration: 3.1, repeat: Infinity }}
          className="w-4 h-4 bg-blue-400 rounded-full absolute bottom-0 right-0 opacity-70"
          style={{ boxShadow: '0 0 10px rgba(66, 165, 245, 0.8)' }} 
        />
      </motion.div>
    </main>
  )
}
