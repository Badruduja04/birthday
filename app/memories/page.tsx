'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/auth'
import { supabase } from '@/lib/supabase/client'

interface Memory {
  id: string
  title: string
  description: string | null
  image_url: string
  memory_date: string | null
  created_at: string
}

export default function MemoriesPage() {
  const router = useRouter()
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [memoryToDelete, setMemoryToDelete] = useState<{ id: string, url: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    loadMemories(user.id)
  }, [router])

  const loadMemories = async (userId: string) => {
    try {
      setIsLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setMemories(data || [])
    } catch (err: any) {
      console.error('Load memories error:', err)
      setError(err.message || 'Failed to load memories')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadImage = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.replace(/\s+/g, '-')}-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download image')
    }
  }

  const confirmDelete = (memoryId: string, imageUrl: string) => {
    setMemoryToDelete({ id: memoryId, url: imageUrl })
    setShowDeleteConfirm(true)
  }

  const deleteMemory = async () => {
    if (!memoryToDelete) return

    try {
      setIsDeleting(true)

      // Delete from database
      const { error: dbError } = await supabase
        .from('memories')
        .delete()
        .eq('id', memoryToDelete.id)

      if (dbError) throw dbError

      // Delete from storage
      const filename = memoryToDelete.url.split('/').pop()
      if (filename) {
        const user = getCurrentUser()
        const path = `${user.id}/${filename}`
        await supabase.storage.from('memories').remove([path])
      }

      // Update UI
      setMemories(memories.filter(m => m.id !== memoryToDelete.id))
      setSelectedImage(null)
      setShowDeleteConfirm(false)
      setMemoryToDelete(null)
    } catch (err: any) {
      console.error('Delete error:', err)
      alert('Failed to delete memory')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <main className="min-h-screen p-6 relative overflow-hidden">
      {/* Background effects */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-10 w-40 h-40 bg-buzz-green/20 rounded-full blur-3xl"
      />

      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          suppressHydrationWarning
        />
      ))}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl mb-6"
          >
            📸
          </motion.div>
          <h1 className="text-5xl font-bold mb-4" style={{ textShadow: '0 0 20px rgba(139, 195, 74, 0.5)' }}>
            Our Memory Book
          </h1>
          <p className="text-white/70 text-lg mb-2">Stories We Built Together</p>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-white/50 text-sm italic"
          >
            This holds the love we have grown through time
          </motion.p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-buzz-red/20 border-2 border-buzz-red rounded-xl p-4 text-center"
            >
              <p className="text-buzz-red font-medium">⚠️ {error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block w-16 h-16 border-4 border-buzz-green border-t-transparent rounded-full"
            />
            <p className="text-white/70 mt-4">Loading memories...</p>
          </div>
        ) : memories.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-8xl mb-6">📷</div>
            <h2 className="text-3xl font-bold mb-4">No memories yet</h2>
            <p className="text-white/70 mb-8">Take your first photo!</p>
            <Link
              href="/camera"
              className="inline-block px-8 py-4 bg-gradient-to-r from-buzz-green to-buzz-green-dark rounded-full text-white font-bold text-lg border-4 border-white/30 hover:scale-105 transition-all duration-300"
              style={{ boxShadow: '0 0 30px rgba(139, 195, 74, 0.6)' }}
            >
              📸 Go to Camera
            </Link>
          </motion.div>
        ) : (
          /* Gallery Grid - Scrapbook/Polaroid Style */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          >
            {memories.map((memory, index) => {
              // Random rotation for polaroid effect (-3 to +3 degrees)
              const rotation = (Math.random() - 0.5) * 6
              
              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, scale: 0.8, rotate: rotation - 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotate: rotation,
                  }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    rotate: 0,
                    zIndex: 10,
                    transition: { duration: 0.3 }
                  }}
                  onClick={() => setSelectedImage(memory.image_url)}
                  className="cursor-pointer relative"
                >
                  {/* Polaroid Card */}
                  <div className="bg-white rounded-lg p-4 pb-16 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                    {/* Photo */}
                    <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-3">
                      <img
                        src={memory.image_url}
                        alt={memory.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Caption (Handwriting style) */}
                    <div className="text-center">
                      <p className="text-gray-700 font-medium text-sm truncate">
                        {memory.title}
                      </p>
                      {memory.memory_date && (
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(memory.memory_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                    </div>

                    {/* Decorative tape effect */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-yellow-100/60 opacity-50 rounded-sm" 
                      style={{ transform: 'translateX(-50%) rotate(-2deg)' }}
                    />
                  </div>

                  {/* Shadow/Depth effect */}
                  <div 
                    className="absolute inset-0 bg-black/5 rounded-lg -z-10"
                    style={{ 
                      transform: `translate(4px, 4px) rotate(${rotation}deg)`,
                      filter: 'blur(8px)'
                    }}
                  />
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Back Button */}
        <div className="text-center">
          <Link
            href="/home"
            className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full text-white/80 hover:text-white border-2 border-white/30 transition-all duration-300 text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full"
            >
              <img
                src={selectedImage}
                alt="Memory"
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              />
              
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-full flex items-center justify-center text-white text-2xl border-2 border-white/30"
              >
                ×
              </motion.button>

              {/* Action buttons */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-3">
                {/* Download button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const memory = memories.find(m => m.image_url === selectedImage)
                    if (memory) downloadImage(memory.image_url, memory.title)
                  }}
                  className="flex-1 px-4 py-2 bg-green-500/80 hover:bg-green-500 backdrop-blur-lg rounded-full text-white font-medium border-2 border-white/30 flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  <span>Download</span>
                </motion.button>

                {/* Delete button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const memory = memories.find(m => m.image_url === selectedImage)
                    if (memory) confirmDelete(memory.id, memory.image_url)
                  }}
                  className="flex-1 px-4 py-2 bg-red-500/80 hover:bg-red-500 backdrop-blur-lg rounded-full text-white font-medium border-2 border-white/30 flex items-center justify-center gap-2"
                >
                  <span>🗑️</span>
                  <span>Delete</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
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
                {/* Warning Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-5xl">⚠️</span>
                </motion.div>
                
                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-gray-800 mb-2"
                >
                  Delete Memory?
                </motion.h2>
                
                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-600 mb-6"
                >
                  This action cannot be undone. Are you sure?
                </motion.p>
                
                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setMemoryToDelete(null)
                    }}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl text-gray-800 font-bold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteMemory}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl text-white font-bold transition-all disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
