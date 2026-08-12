'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Memory {
  id: string
  image_url: string
  caption: string | null
  created_at: string
}

type Difficulty = '3x3' | '4x4' | '5x5'

export default function PuzzlePage() {
  const [step, setStep] = useState<'select' | 'difficulty' | 'play'>('select')
  const [memories, setMemories] = useState<Memory[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch memories from database
  useEffect(() => {
    fetchMemories()
  }, [])

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMemories(data || [])
    } catch (error) {
      console.error('Error fetching memories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoSelect = (imageUrl: string) => {
    setSelectedPhoto(imageUrl)
    setStep('difficulty')
  }

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty)
    setStep('play')
  }

  const resetPuzzle = () => {
    setSelectedPhoto(null)
    setSelectedDifficulty(null)
    setStep('select')
  }

  // STEP 1: SELECT PHOTO
  if (step === 'select') {
    return (
      <main className="min-h-screen p-6 relative overflow-hidden">
        {/* Background effects */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
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
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-8xl mb-6"
            >
              🧩
            </motion.div>
            <h1 className="text-5xl font-bold mb-4" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}>
              Choose a Photo
            </h1>
            <p className="text-white/70 text-lg">Select a photo from your memories to play puzzle</p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-white/60">Loading memories...</p>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && memories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">📸</div>
              <p className="text-white/80 text-lg mb-6">No memories yet!</p>
              <p className="text-white/60 mb-8">Add some photos to your memories first</p>
              <Link
                href="/memories"
                className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-full text-white font-medium transition-all duration-300"
              >
                Go to Memories
              </Link>
            </motion.div>
          )}

          {/* Photos Grid */}
          {!loading && memories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"
            >
              {memories.map((memory, index) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePhotoSelect(memory.image_url)}
                  className="cursor-pointer group"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500 transition-all duration-300">
                    <img
                      src={memory.image_url}
                      alt={memory.caption || 'Memory'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white text-sm font-medium truncate">
                          {memory.caption || 'Play Puzzle'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

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

  // STEP 2: SELECT DIFFICULTY
  if (step === 'difficulty') {
    const difficulties = [
      { id: '3x3' as Difficulty, label: '3×3', desc: 'Easy', pieces: 9, color: 'from-green-500 to-emerald-600' },
      { id: '4x4' as Difficulty, label: '4×4', desc: 'Medium', pieces: 16, color: 'from-yellow-500 to-orange-600' },
      { id: '5x5' as Difficulty, label: '5×5', desc: 'Hard', pieces: 25, color: 'from-red-500 to-pink-600' },
    ]

    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background effects */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
        />

        <div className="max-w-4xl mx-auto relative z-10 w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="text-8xl mb-6">🎯</div>
            <h1 className="text-5xl font-bold mb-4" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}>
              Choose Difficulty
            </h1>
            <p className="text-white/70 text-lg">How challenging do you want it?</p>
          </motion.div>

          {/* Selected Photo Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xs mx-auto mb-8"
          >
            <img 
              src={selectedPhoto || ''} 
              alt="Selected" 
              className="w-full rounded-2xl border-2 border-purple-500/50 shadow-2xl"
            />
          </motion.div>

          {/* Difficulty Options */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {difficulties.map((diff, index) => (
              <motion.button
                key={diff.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDifficultySelect(diff.id)}
                className={`
                  bg-gradient-to-br ${diff.color}
                  p-8 rounded-3xl
                  border-2 border-white/20
                  hover:border-white/40
                  transition-all duration-300
                  shadow-xl hover:shadow-2xl
                `}
              >
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2 text-white">
                    {diff.label}
                  </div>
                  <div className="text-xl font-semibold text-white mb-1">
                    {diff.desc}
                  </div>
                  <div className="text-sm text-white/80">
                    {diff.pieces} pieces
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={() => setStep('select')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full text-white/80 hover:text-white border-2 border-white/30 transition-all duration-300 text-sm font-medium"
            >
              ← Choose Different Photo
            </button>
          </motion.div>
        </div>
      </main>
    )
  }

  // STEP 3: PLAY PUZZLE
  if (step === 'play') {
    return (
      <PuzzleGame
        imageUrl={selectedPhoto!}
        difficulty={selectedDifficulty!}
        onBack={() => setStep('difficulty')}
        onReset={resetPuzzle}
      />
    )
  }

  return null
}

// ========================================
// PUZZLE GAME COMPONENT
// ========================================

interface PuzzleGameProps {
  imageUrl: string
  difficulty: Difficulty
  onBack: () => void
  onReset: () => void
}

interface Tile {
  id: number
  currentPosition: number
  correctPosition: number
  isEmpty: boolean
}

function PuzzleGame({ imageUrl, difficulty, onBack, onReset }: PuzzleGameProps) {
  const gridSize = parseInt(difficulty.split('x')[0])
  const totalTiles = gridSize * gridSize
  
  const [tiles, setTiles] = useState<Tile[]>([])
  const [moves, setMoves] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Initialize puzzle
  useEffect(() => {
    initializePuzzle()
    setStartTime(Date.now())
  }, [])

  // Timer
  useEffect(() => {
    if (isComplete) return
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [startTime, isComplete])

  const initializePuzzle = () => {
    // Create tiles
    const initialTiles: Tile[] = Array.from({ length: totalTiles }, (_, i) => ({
      id: i,
      currentPosition: i,
      correctPosition: i,
      isEmpty: i === totalTiles - 1, // Last tile is empty
    }))
    
    // Shuffle tiles (solvable shuffle)
    const shuffled = shuffleTiles(initialTiles, gridSize)
    setTiles(shuffled)
    setMoves(0)
    setIsComplete(false)
  }

  // Solvable shuffle algorithm
  const shuffleTiles = (initialTiles: Tile[], size: number): Tile[] => {
    const tiles = [...initialTiles]
    const emptyIndex = tiles.length - 1
    
    // Perform random valid moves
    let currentEmpty = emptyIndex
    for (let i = 0; i < 100; i++) {
      const neighbors = getNeighbors(currentEmpty, size)
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)]
      
      // Swap
      const temp = tiles[currentEmpty]
      tiles[currentEmpty] = tiles[randomNeighbor]
      tiles[randomNeighbor] = temp
      
      // Update positions
      tiles[currentEmpty].currentPosition = currentEmpty
      tiles[randomNeighbor].currentPosition = randomNeighbor
      
      currentEmpty = randomNeighbor
    }
    
    return tiles
  }

  const getNeighbors = (index: number, size: number): number[] => {
    const neighbors: number[] = []
    const row = Math.floor(index / size)
    const col = index % size
    
    // Up
    if (row > 0) neighbors.push(index - size)
    // Down
    if (row < size - 1) neighbors.push(index + size)
    // Left
    if (col > 0) neighbors.push(index - 1)
    // Right
    if (col < size - 1) neighbors.push(index + 1)
    
    return neighbors
  }

  const handleTileClick = (clickedIndex: number) => {
    if (isComplete) return
    
    const emptyTile = tiles.find(t => t.isEmpty)
    if (!emptyTile) return
    
    const emptyIndex = emptyTile.currentPosition
    const neighbors = getNeighbors(emptyIndex, gridSize)
    
    // Check if clicked tile is adjacent to empty
    if (!neighbors.includes(clickedIndex)) return
    
    // Swap tiles
    const newTiles = [...tiles]
    const clickedTile = newTiles.find(t => t.currentPosition === clickedIndex)
    
    if (clickedTile) {
      // Swap positions
      clickedTile.currentPosition = emptyIndex
      emptyTile.currentPosition = clickedIndex
      
      setTiles(newTiles)
      setMoves(m => m + 1)
      
      // Check if solved
      checkComplete(newTiles)
    }
  }

  const checkComplete = (currentTiles: Tile[]) => {
    const solved = currentTiles.every(tile => 
      tile.currentPosition === tile.correctPosition
    )
    
    if (solved) {
      setIsComplete(true)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
      />

      <div className="max-w-4xl mx-auto relative z-10 w-full">
        {/* Header Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
        >
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-white">{moves}</div>
            <div className="text-xs text-white/60">Moves</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-white">{formatTime(elapsedTime)}</div>
            <div className="text-xs text-white/60">Time</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-white">{difficulty}</div>
            <div className="text-xs text-white/60">Difficulty</div>
          </div>
        </motion.div>

        {/* Puzzle Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 mx-auto"
          style={{ maxWidth: '500px' }}
        >
          {/* Hidden image for loading */}
          <img 
            src={imageUrl} 
            alt="puzzle" 
            className="hidden"
            onLoad={() => setImageLoaded(true)}
          />
          
          <div 
            className="grid gap-1 bg-white/20 p-2 rounded-2xl"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              aspectRatio: '1/1'
            }}
          >
            {/* Render tiles based on currentPosition (not array order) */}
            {Array.from({ length: totalTiles }).map((_, gridPosition) => {
              // Find which tile is at this grid position
              const tile = tiles.find(t => t.currentPosition === gridPosition)
              
              if (!tile) return null
              
              // Calculate background position based on CORRECT position
              const row = Math.floor(tile.correctPosition / gridSize)
              const col = tile.correctPosition % gridSize
              
              return (
                <motion.button
                  key={`${tile.id}-${gridPosition}`}
                  onClick={() => handleTileClick(gridPosition)}
                  whileHover={!tile.isEmpty ? { scale: 1.05 } : {}}
                  whileTap={!tile.isEmpty ? { scale: 0.95 } : {}}
                  className={`
                    relative aspect-square rounded-lg overflow-hidden
                    ${tile.isEmpty ? 'bg-black/30' : 'bg-white cursor-pointer'}
                    ${!tile.isEmpty && 'hover:ring-2 ring-white'}
                    transition-all duration-200
                  `}
                  style={{
                    backgroundImage: tile.isEmpty ? 'none' : `url(${imageUrl})`,
                    backgroundSize: `${gridSize * 100}%`,
                    backgroundPosition: `${col * 100 / (gridSize - 1)}% ${row * 100 / (gridSize - 1)}%`,
                  }}
                  disabled={tile.isEmpty || isComplete}
                >
                  {/* Tile number for debugging - uncomment to see tile positions */}
                  {/* <span className="absolute top-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                    {tile.correctPosition + 1}
                  </span> */}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={initializePuzzle}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-full text-white font-bold transition-all duration-300 shadow-lg"
          >
            🔄 Shuffle
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-all duration-300"
          >
            ← Change Difficulty
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-full text-white font-medium transition-all duration-300"
          >
            🖼️ New Photo
          </motion.button>
        </div>
      </div>

      {/* Success Modal */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-8 max-w-md w-full shadow-2xl mx-4"
          >
            <div className="text-center">
              {/* Celebration Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-8xl mb-6"
              >
                🎉
              </motion.div>
              
              {/* Title */}
              <h2 className="text-4xl font-bold text-white mb-4">
                Puzzle Complete!
              </h2>
              
              {/* Stats */}
              <div className="bg-white/20 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-white">{moves}</div>
                    <div className="text-sm text-white/80">Moves</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{formatTime(elapsedTime)}</div>
                    <div className="text-sm text-white/80">Time</div>
                  </div>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={initializePuzzle}
                  className="w-full px-6 py-4 bg-white hover:bg-gray-100 rounded-full text-purple-600 font-bold text-lg transition-all duration-300 shadow-lg"
                >
                  🔄 Play Again
                </button>
                <button
                  onClick={onReset}
                  className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-all duration-300"
                >
                  Choose Different Photo
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  )
}
