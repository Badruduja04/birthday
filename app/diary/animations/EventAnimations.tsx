'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

// ========================================
// MEMORY - FLOWER PETALS ANIMATION
// ========================================
export function MemoryPetalsAnimation({ onComplete }: { onComplete: () => void }) {
  const [petals, setPetals] = useState<Array<{
    id: number
    x: number
    y: number
    rotation: number
    delay: number
    duration: number
  }>>([])

  useEffect(() => {
    // Generate 15-20 petals
    const petalCount = 15 + Math.floor(Math.random() * 6)
    const generatedPetals = Array.from({ length: petalCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Start position across screen
      y: -20, // Start above screen
      rotation: Math.random() * 360,
      delay: i * 0.08, // Staggered appearance
      duration: 1.5 + Math.random() * 0.5,
    }))
    
    setPetals(generatedPetals)

    // Complete animation after 1.5s
    const timer = setTimeout(onComplete, 1500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Soft glow background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gradient-to-b from-pink-500/20 to-transparent"
      />

      {/* Petals */}
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          initial={{
            x: `${petal.x}vw`,
            y: petal.y,
            opacity: 0,
            scale: 0,
            rotate: petal.rotation,
          }}
          animate={{
            x: `${petal.x + (Math.random() - 0.5) * 20}vw`,
            y: '110vh',
            opacity: [0, 1, 1, 0.8, 0],
            scale: [0, 1, 1, 0.9, 0.8],
            rotate: petal.rotation + 360 * (Math.random() > 0.5 ? 1 : -1),
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="absolute"
        >
          <div className="text-4xl md:text-5xl">🌸</div>
        </motion.div>
      ))}

      {/* Sparkles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          initial={{
            x: `${20 + Math.random() * 60}vw`,
            y: `${20 + Math.random() * 60}vh`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: 0.3 + i * 0.1,
            ease: 'easeOut',
          }}
          className="absolute text-2xl"
        >
          ✨
        </motion.div>
      ))}
    </div>
  )
}

// ========================================
// PHOTO - CAMERA FLASH ANIMATION
// ========================================
export function PhotoFlashAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Camera flash - quick white flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.15, times: [0, 0.5, 1] }}
        className="absolute inset-0 bg-white"
      />

      {/* Camera shutter effect */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: [0, 1, 1, 0] }}
        transition={{ 
          duration: 0.4, 
          times: [0, 0.3, 0.7, 1],
          delay: 0.15 
        }}
        className="absolute inset-0 bg-black/80 origin-top"
      />

      {/* Camera icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.2, 1],
          opacity: [0, 1, 1],
        }}
        transition={{ 
          duration: 0.5,
          delay: 0.2,
          ease: [0.34, 1.56, 0.64, 1]
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="text-8xl">📸</div>
      </motion.div>

      {/* Polaroid border effect */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="absolute inset-0 m-8 md:m-16 border-8 border-white"
      />
    </div>
  )
}

// ========================================
// MESSAGE - ENVELOPE OPENING ANIMATION
// ========================================
export function MessageEnvelopeAnimation({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<'appear' | 'open' | 'letter'>('appear')

  useEffect(() => {
    const timer1 = setTimeout(() => setStage('open'), 400)
    const timer2 = setTimeout(() => setStage('letter'), 900)
    const timer3 = setTimeout(onComplete, 1600)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Background overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-pink-900/30"
      />

      {/* Envelope */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ 
          scale: stage === 'appear' ? 1 : stage === 'open' ? 1 : 0.9,
          rotate: 0,
          y: stage === 'letter' ? -20 : 0,
        }}
        transition={{ 
          duration: 0.5,
          type: 'spring',
          stiffness: 200,
          damping: 15
        }}
        className="relative"
      >
        {/* Envelope body */}
        <div className="relative w-64 h-40 md:w-80 md:h-48">
          {/* Back */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-pink-300 rounded-lg shadow-2xl" />
          
          {/* Flap */}
          <motion.div
            animate={{
              rotateX: stage === 'open' || stage === 'letter' ? -180 : 0,
            }}
            transition={{ duration: 0.5, delay: stage === 'open' ? 0.1 : 0 }}
            style={{
              transformOrigin: 'top',
              transformStyle: 'preserve-3d',
            }}
            className="absolute inset-x-0 top-0 h-24 md:h-32"
          >
            <div 
              className="absolute inset-0 bg-gradient-to-br from-pink-300 to-pink-400"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }}
            />
          </motion.div>

          {/* Letter coming out */}
          <AnimatePresence>
            {stage === 'letter' && (
              <motion.div
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: -80, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute inset-x-4 top-8 h-32 bg-white rounded shadow-xl flex items-center justify-center"
              >
                <div className="text-6xl">💌</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Heart seal */}
          <motion.div
            animate={{
              scale: stage === 'open' ? [1, 1.2, 0] : 1,
              rotate: stage === 'open' ? 360 : 0,
            }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl"
          >
            ❤️
          </motion.div>
        </div>
      </motion.div>

      {/* Sparkles */}
      {stage === 'letter' && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
              }}
              className="absolute text-2xl"
              style={{
                left: `${40 + Math.random() * 20}%`,
                top: `${30 + Math.random() * 20}%`,
              }}
            >
              ✨
            </motion.div>
          ))}
        </>
      )}
    </div>
  )
}

// ========================================
// BIRTHDAY - CONFETTI ANIMATION
// ========================================
export function BirthdayConfettiAnimation({ onComplete }: { onComplete: () => void }) {
  const [confetti, setConfetti] = useState<Array<{
    id: number
    x: number
    delay: number
    color: string
    rotation: number
    shape: string
  }>>([])

  useEffect(() => {
    // Generate 30-40 confetti pieces
    const confettiCount = 30 + Math.floor(Math.random() * 11)
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCF7F', '#A78BFA', '#F472B6']
    const shapes = ['▮', '●', '■', '★', '♦']
    
    const generatedConfetti = Array.from({ length: confettiCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: i * 0.03,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }))
    
    setConfetti(generatedConfetti)

    // Complete after 2s
    const timer = setTimeout(onComplete, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Warm glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gradient-to-b from-yellow-500/20 via-orange-500/10 to-transparent"
      />

      {/* Party poppers */}
      <motion.div
        initial={{ scale: 0, x: '-50%', y: '-50%' }}
        animate={{ scale: [0, 1, 1], rotate: -20 }}
        transition={{ duration: 0.3 }}
        className="absolute left-[20%] top-[40%] text-6xl"
      >
        🎉
      </motion.div>
      
      <motion.div
        initial={{ scale: 0, x: '50%', y: '-50%' }}
        animate={{ scale: [0, 1, 1], rotate: 20 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="absolute right-[20%] top-[40%] text-6xl"
      >
        🎉
      </motion.div>

      {/* Confetti */}
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: `${piece.x}vw`,
            y: -20,
            opacity: 0,
            rotate: piece.rotation,
          }}
          animate={{
            x: `${piece.x + (Math.random() - 0.5) * 30}vw`,
            y: '110vh',
            opacity: [0, 1, 1, 1, 0.7],
            rotate: piece.rotation + (Math.random() > 0.5 ? 720 : -720),
          }}
          transition={{
            duration: 2 + Math.random() * 0.5,
            delay: piece.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="absolute text-2xl font-bold"
          style={{ color: piece.color }}
        >
          {piece.shape}
        </motion.div>
      ))}

      {/* Birthday cake emoji */}
      <motion.div
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: [0, 1.2, 1], y: 0 }}
        transition={{ 
          duration: 0.6,
          delay: 0.3,
          type: 'spring',
          stiffness: 200,
        }}
        className="absolute inset-0 flex items-center justify-center text-8xl"
      >
        🎂
      </motion.div>
    </div>
  )
}

// ========================================
// SPECIAL - HEARTS & SPARKLES ANIMATION
// ========================================
export function SpecialHeartsAnimation({ onComplete }: { onComplete: () => void }) {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    delay: number
    isHeart: boolean
  }>>([])

  useEffect(() => {
    // Generate mix of hearts and sparkles (12-16 total)
    const particleCount = 12 + Math.floor(Math.random() * 5)
    const generatedParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 40, // Center area
      y: 20 + Math.random() * 60,
      delay: i * 0.08,
      isHeart: Math.random() > 0.4, // 60% hearts, 40% sparkles
    }))
    
    setParticles(generatedParticles)

    // Complete after 1.5s
    const timer = setTimeout(onComplete, 1500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Soft warm glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gradient-radial from-pink-500/20 via-purple-500/10 to-transparent"
      />

      {/* Particles (hearts & sparkles) */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: `${particle.y - 30}vh`,
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0.8],
          }}
          transition={{
            duration: 1.2,
            delay: particle.delay,
            ease: 'easeOut',
          }}
          className="absolute text-3xl"
        >
          {particle.isHeart ? '❤️' : '✨'}
        </motion.div>
      ))}

      {/* Center glow pulse */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.5, 1.2],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 1.5,
          ease: 'easeOut',
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-64 h-64 rounded-full bg-gradient-radial from-pink-400/30 to-transparent" />
      </motion.div>
    </div>
  )
}
