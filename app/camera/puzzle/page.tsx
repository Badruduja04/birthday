'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/auth'
import { supabase } from '@/lib/supabase/client'

type Difficulty = '3x3' | '4x4' | '5x5'
type GameState = 'select-photo' | 'select-difficulty' | 'playing' | 'completed'

interface Memory {
  id: string
  image_url: string
  title: string
}

export default function CameraPuzzlePage() {
  const router = useRouter()
  const [gameState, setGameState] = useState<GameState>('select-photo')
  const [memories, setMemories] = useState<Memory[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('3x3')
  const [tiles, setTiles] = useState<number[]>([])
  const [emptyIndex, setEmptyIndex] = useState(0)
  const [moves, setMoves] = useState(0)
  const [isShuffling, setIsShuffling] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) router.push('/login')
    else loadMemories()
  }, [router])

  const loadMemories = async () => {
    try {
      const user = getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from('memories')
        .select('id, image_url, title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMemories(data || [])
    } catch (err) {
      console.error('Load memories error:', err)
    }
  }

  const selectPhoto = (imageUrl: string) => {
    setSelectedPhoto(imageUrl)
    setGameState('select-difficulty')
  }

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff)
    const gridSize = parseInt(diff.split('x')[0])
    const totalTiles = gridSize * gridSize
    
    // Initialize ordered tiles
    const orderedTiles = Array.from({ length: totalTiles }, (_, i) => i)
    
    setTiles(orderedTiles)
    setEmptyIndex(totalTiles - 1)
    setMoves(0)
    setGameState('playing')
    
    // Shuffle after a moment
    setTimeout(() => {
      shuffleTiles(orderedTiles, totalTiles - 1, gridSize)
    }, 500)
  }

  const shuffleTiles = (currentTiles: number[], currentEmpty: number, gridSize: number) => {
    setIsShuffling(true)
    const shuffled = [...currentTiles]
    let emptyPos = currentEmpty

    // Perform 100 random valid moves
    for (let i = 0; i < 100; i++) {
      const validMoves = getValidMoves(emptyPos, gridSize)
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
      
      // Swap
      ;[shuffled[emptyPos], shuffled[randomMove]] = [shuffled[randomMove], shuffled[emptyPos]]
      emptyPos = randomMove
    }

    setTiles(shuffled)
    setEmptyIndex(emptyPos)
    setTimeout(() => setIsShuffling(false), 500)
  }

  const getValidMoves = (emptyPos: number, gridSize: number): number[] => {
    const moves: number[] = []
    const row = Math.floor(emptyPos / gridSize)
    const col = emptyPos % gridSize

    if (row > 0) moves.push(emptyPos - gridSize) // Up
    if (row < gridSize - 1) moves.push(emptyPos + gridSize) // Down
    if (col > 0) moves.push(emptyPos - 1) // Left
    if (col < gridSize - 1) moves.push(emptyPos + 1) // Right

    return moves
  }

  const handleTileClick = (index: number) => {
    if (isShuffling) return

    const gridSize = parseInt(difficulty.split('x')[0])
    const validMoves = getValidMoves(emptyIndex, gridSize)

    if (validMoves.includes(index)) {
      const newTiles = [...tiles]
      ;[newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]]
      
      setTiles(newTiles)
      setEmptyIndex(index)
      setMoves(moves + 1)

      // Check if solved
      const isSolved = newTiles.every((tile, idx) => tile === idx)
      if (isSolved) {
        setShowSuccess(true)
      }
    }
  }

  const resetGame = () => {
    setGameState('select-photo')
    setSelectedPhoto(null)
    setMoves(0)
    setShowSuccess(false)
  }

  const gridSize = parseInt(difficulty.split('x')[0])
  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl"
      />

      {/* Stars */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          suppressHydrationWarning
        />
      ))}

      <div className="relative z-10 w-full max-w-6xl">
        {/* SELECT PHOTO */}
        {gameState === 'select-photo' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-4xl font-bold text-center mb-8 text-white">
              🧩 Select Photo for Puzzle
            </h1>
            
            {memories.length === 0 ? (
              <div className="text-center text-white/70">
                <p className="text-xl mb-4">No photos in gallery</p>
                <Link href="/camera/photobooth" className="text-pink-400 hover:text-pink-300">
                  Take some photos first →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {memories.map((memory) => (
                  <motion.button
                    key={memory.id}
                    onClick={() => selectPhoto(memory.image_url)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="aspect-square rounded-2xl overflow-hidden border-4 border-white/20 hover:border-yellow-400/60 transition-all"
                  >
                    <img src={memory.image_url} alt={memory.title} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}

            <div className="mt-8 text-center">
              <Link href="/camera" className="text-white/70 hover:text-white">
                ← Back
              </Link>
            </div>
          </motion.div>
        )}

        {/* SELECT DIFFICULTY */}
        {gameState === 'select-difficulty' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 text-white">
              Select Difficulty
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {(['3x3', '4x4', '5x5'] as Difficulty[]).map((diff) => (
                <motion.button
                  key={diff}
                  onClick={() => startGame(diff)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-lg p-8 rounded-2xl border-4 border-yellow-400/30 hover:border-yellow-400/60 transition-all"
                >
                  <div className="text-5xl mb-4">
                    {diff === '3x3' ? '😊' : diff === '4x4' ? '😐' : '😰'}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{diff}</h3>
                  <p className="text-white/70">
                    {diff === '3x3' ? 'Easy' : diff === '4x4' ? 'Medium' : 'Hard'}
                  </p>
                  <p className="text-white/50 text-sm mt-2">
                    {parseInt(diff.split('x')[0]) ** 2 - 1} tiles
                  </p>
                </motion.button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => setGameState('select-photo')}
                className="text-white/70 hover:text-white"
              >
                ← Change Photo
              </button>
            </div>
          </motion.div>
        )}

        {/* PLAYING */}
        {gameState === 'playing' && selectedPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-white">
                <span className="text-lg">Moves: </span>
                <span className="text-2xl font-bold text-yellow-400">{moves}</span>
              </div>
              <div className="text-white text-lg font-bold">
                {difficulty}
              </div>
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm"
              >
                Reset
              </button>
            </div>

            {/* Puzzle Grid */}
            <div
              className="grid gap-2 mx-auto bg-white/5 p-4 rounded-2xl"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                maxWidth: '600px'
              }}
            >
              {tiles.map((tileValue, index) => {
                const row = Math.floor(tileValue / gridSize)
                const col = tileValue % gridSize

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleTileClick(index)}
                    className={`aspect-square relative overflow-hidden rounded-lg ${
                      index === emptyIndex
                        ? 'bg-black/50'
                        : 'bg-white/10 hover:bg-white/20 cursor-pointer'
                    }`}
                    whileHover={index !== emptyIndex ? { scale: 1.05 } : {}}
                    whileTap={index !== emptyIndex ? { scale: 0.95 } : {}}
                    disabled={isShuffling}
                  >
                    {index !== emptyIndex && (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url(${selectedPhoto})`,
                          backgroundSize: `${gridSize * 100}%`,
                          backgroundPosition: `${(col * 100) / (gridSize - 1)}% ${(row * 100) / (gridSize - 1)}%`
                        }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setGameState('select-difficulty')}
                className="text-white/70 hover:text-white text-sm"
              >
                Change Difficulty
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 mx-auto mb-4 bg-yellow-400 rounded-full flex items-center justify-center text-5xl"
                >
                  🎉
                </motion.div>
                
                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-gray-800 mb-2"
                >
                  Puzzle Completed!
                </motion.h2>
                
                {/* Stats */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-600 mb-4"
                >
                  Solved in <span className="font-bold text-yellow-600">{moves}</span> moves
                </motion.p>
                
                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={resetGame}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 rounded-xl text-gray-900 font-bold transition-all"
                  >
                    Play Again
                  </button>
                  <Link
                    href="/camera"
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl text-gray-800 font-bold transition-all text-center"
                  >
                    Exit
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
