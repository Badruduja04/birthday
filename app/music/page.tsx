'use client'

import { motion, AnimatePresence, Reorder } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/auth'
import { supabase } from '@/lib/supabase/client'
import { createPortal } from 'react-dom'

interface Music {
  id: string
  title: string
  artist: string | null
  file_url: string
  file_path: string
  duration: number | null
  created_at: string
  manual_order: number | null
}

type SortOption = 'recent' | 'title_asc' | 'title_desc' | 'artist_asc' | 'artist_desc' | 'manual'

export default function MusicPage() {
  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [music, setMusic] = useState<Music[]>([])
  const [filteredMusic, setFilteredMusic] = useState<Music[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null)
  const sortButtonRef = useRef<HTMLButtonElement>(null)
  const [sortMenuPosition, setSortMenuPosition] = useState({ top: 0, right: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (showSortMenu && sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect()
      setSortMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      })
    }
  }, [showSortMenu])
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSortMenu(false)
      setShowMoreMenu(null)
    }
    
    if (showSortMenu || showMoreMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showSortMenu, showMoreMenu])
  const [isUploading, setIsUploading] = useState(false)
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Search & Sort
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('recent')
  
  // Upload form
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadArtist, setUploadArtist] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  // Edit form
  const [editingSong, setEditingSong] = useState<Music | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editArtist, setEditArtist] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    loadMusic(user.id)
  }, [router])

  // Apply search and sort whenever music, searchQuery, or sortOption changes
  useEffect(() => {
    applyFiltersAndSort()
  }, [music, searchQuery, sortOption])

  const loadMusic = async (userId: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('music')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMusic(data || [])
    } catch (err: any) {
      console.error('Load music error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let result = [...music]
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(song => 
        song.title.toLowerCase().includes(query) ||
        (song.artist && song.artist.toLowerCase().includes(query))
      )
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'title_asc':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'title_desc':
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'artist_asc':
        result.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''))
        break
      case 'artist_desc':
        result.sort((a, b) => (b.artist || '').localeCompare(a.artist || ''))
        break
      case 'manual':
        result.sort((a, b) => (a.manual_order || 999) - (b.manual_order || 999))
        break
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }
    
    setFilteredMusic(result)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file (MP3, WAV, etc.)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setUploadFile(file)
    // Auto-fill title from filename
    const filename = file.name.replace(/\.[^/.]+$/, '') // Remove extension
    setUploadTitle(filename)
  }

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) {
      alert('Please select a file and enter a title')
      return
    }

    const user = getCurrentUser()
    // Allow upload even without user (for testing)
    const userId = user?.id || 'anonymous'

    try {
      setIsUploading(true)
      setUploadProgress(10)

      // Upload to storage
      const filename = `${userId}/${Date.now()}_${uploadFile.name}`
      
      setUploadProgress(30)
      const { error: uploadError } = await supabase.storage
        .from('music')
        .upload(filename, uploadFile, {
          contentType: uploadFile.type,
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      setUploadProgress(60)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('music')
        .getPublicUrl(filename)

      setUploadProgress(80)

      // Get audio duration
      const audio = new Audio()
      const duration = await new Promise<number>((resolve) => {
        audio.onloadedmetadata = () => {
          resolve(Math.floor(audio.duration))
        }
        audio.onerror = () => resolve(0)
        audio.src = URL.createObjectURL(uploadFile)
      })

      // Save to database - use null if no user
      const { error: dbError } = await supabase
        .from('music')
        .insert({
          user_id: user?.id || null,
          title: uploadTitle.trim(),
          artist: uploadArtist.trim() || null,
          file_url: urlData.publicUrl,
          file_path: filename,
          duration: duration,
          file_size: uploadFile.size
        })

      if (dbError) {
        console.error('Database insert error:', dbError)
        throw new Error(`Save failed: ${dbError.message}`)
      }

      setUploadProgress(100)

      // Reload music list
      if (user?.id) {
        await loadMusic(user.id)
      }

      // Reset form
      setUploadFile(null)
      setUploadTitle('')
      setUploadArtist('')
      setShowUploadModal(false)
      setUploadProgress(0)

      alert('✅ Song uploaded successfully!')

    } catch (err: any) {
      console.error('Upload error:', err)
      alert('❌ Failed to upload: ' + err.message)
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const handlePlay = async (musicId: string, fileUrl: string) => {
    try {
      if (currentPlaying === musicId && isPlaying) {
        // Pause current
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        // Play new or resume
        if (currentPlaying !== musicId) {
          setCurrentPlaying(musicId)
          if (audioRef.current) {
            audioRef.current.src = fileUrl
            audioRef.current.load() // Important: load the audio first
            await audioRef.current.play()
          }
        } else {
          await audioRef.current?.play()
        }
        setIsPlaying(true)
      }
      setShowMoreMenu(null) // Close menu after action
    } catch (error) {
      console.error('Playback error:', error)
      alert('❌ Failed to play audio. Please check if the file is accessible.')
      setIsPlaying(false)
      setCurrentPlaying(null)
    }
  }

  const handleEditClick = (song: Music) => {
    setEditingSong(song)
    setEditTitle(song.title)
    setEditArtist(song.artist || '')
    setShowEditModal(true)
    setShowMoreMenu(null)
  }

  const handleEditSave = async () => {
    if (!editingSong || !editTitle.trim()) {
      alert('Title is required')
      return
    }

    try {
      const { error } = await supabase
        .from('music')
        .update({
          title: editTitle.trim(),
          artist: editArtist.trim() || null
        })
        .eq('id', editingSong.id)

      if (error) throw error

      const user = getCurrentUser()
      if (user) await loadMusic(user.id)

      setShowEditModal(false)
      setEditingSong(null)
      alert('✅ Song updated successfully!')

    } catch (err: any) {
      console.error('Edit error:', err)
      alert('❌ Failed to update: ' + err.message)
    }
  }

  const handleDelete = async (musicId: string, filePath: string, songTitle: string) => {
    console.log('Delete clicked:', { musicId, filePath, songTitle })
    
    if (!confirm(`Delete "${songTitle}"?\n\nThis action cannot be undone.`)) {
      console.log('Delete cancelled by user')
      return
    }

    console.log('User confirmed delete, proceeding...')

    try {
      // Delete from database
      console.log('Deleting from database...')
      const { error: dbError } = await supabase
        .from('music')
        .delete()
        .eq('id', musicId)

      if (dbError) {
        console.error('Database delete error:', dbError)
        throw dbError
      }
      console.log('Database delete successful')

      // Delete from storage
      console.log('Deleting from storage:', filePath)
      const { error: storageError } = await supabase.storage
        .from('music')
        .remove([filePath])

      if (storageError) {
        console.error('Storage delete error:', storageError)
      } else {
        console.log('Storage delete successful')
      }

      // Reload list
      console.log('Reloading music list...')
      const user = getCurrentUser()
      if (user) await loadMusic(user.id)

      // Stop if currently playing
      if (currentPlaying === musicId) {
        audioRef.current?.pause()
        setCurrentPlaying(null)
        setIsPlaying(false)
      }

      setShowMoreMenu(null)
      console.log('Delete completed successfully')
      alert('✅ Song deleted successfully!')

    } catch (err: any) {
      console.error('Delete error:', err)
      alert('❌ Failed to delete: ' + err.message)
    }
  }

  const handleReorder = async (newOrder: Music[]) => {
    // Update local state immediately for smooth UX
    setFilteredMusic(newOrder)
    
    // Save to database in background
    try {
      const updates = newOrder.map((song, index) => ({
        id: song.id,
        manual_order: index
      }))

      for (const update of updates) {
        await supabase
          .from('music')
          .update({ manual_order: update.manual_order })
          .eq('id', update.id)
      }

      // Reload to sync
      const user = getCurrentUser()
      if (user) await loadMusic(user.id)

    } catch (err) {
      console.error('Reorder error:', err)
    }
  }

  const getTotalDuration = () => {
    const total = music.reduce((sum, song) => sum + (song.duration || 0), 0)
    const mins = Math.floor(total / 60)
    return mins
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'recent': return 'Recently Added'
      case 'title_asc': return 'Title A → Z'
      case 'title_desc': return 'Title Z → A'
      case 'artist_asc': return 'Artist A → Z'
      case 'artist_desc': return 'Artist Z → A'
      case 'manual': return 'Manual Order'
      default: return 'Sort'
    }
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 relative overflow-hidden">
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
        className="absolute top-20 right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-20 left-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-6xl sm:text-7xl md:text-8xl mb-4 sm:mb-6"
          >
            🎵
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4" style={{ textShadow: '0 0 20px rgba(66, 165, 245, 0.5)' }}>
            Your Playlist
          </h1>
          <p className="text-white/70 text-base sm:text-lg">Personal music collection</p>
        </motion.div>

        {/* Add Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-center"
        >
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full text-white font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            ➕ Add New Song
          </button>
        </motion.div>

        {/* Collection Info & Controls */}
        {!isLoading && music.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/10 mb-6"
          >
            {/* Collection Stats */}
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white/90 mb-1">YOUR COLLECTION</h2>
              <p className="text-sm sm:text-base text-white/60">
                {music.length} {music.length === 1 ? 'Song' : 'Songs'} • {getTotalDuration()} min
              </p>
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search by title or artist..."
                  className="w-full px-4 py-2.5 sm:py-3 bg-white/10 rounded-xl text-white placeholder-white/40 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all duration-200 text-sm sm:text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  ref={sortButtonRef}
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMoreMenu(null) // Close more menu
                    setShowSortMenu(!showSortMenu)
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white border border-white/20 transition-all duration-200 flex items-center justify-between gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <span>Sort by ▾</span>
                </button>

                {/* Sort Menu - Using Portal */}
                {mounted && showSortMenu && createPortal(
                  <AnimatePresence>
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                        style={{ zIndex: 9996 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowSortMenu(false)
                        }}
                      />
                      {/* Menu Dropdown */}
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed w-48 bg-gray-900 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl overflow-hidden"
                        style={{
                          top: sortMenuPosition.top,
                          right: sortMenuPosition.right,
                          zIndex: 9997
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-2">
                          <p className="text-white/60 text-xs font-bold px-3 py-2">SORT SONGS</p>
                          {[
                            { value: 'recent', label: 'Recently Added' },
                            { value: 'title_asc', label: 'Title A → Z' },
                            { value: 'title_desc', label: 'Title Z → A' },
                            { value: 'artist_asc', label: 'Artist A → Z' },
                            { value: 'artist_desc', label: 'Artist Z → A' },
                            { value: 'manual', label: 'Manual Order' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSortOption(option.value as SortOption)
                                setShowSortMenu(false)
                              }}
                              className={`
                                w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm
                                ${sortOption === option.value 
                                  ? 'bg-blue-500/20 text-blue-400' 
                                  : 'text-white/80 hover:bg-white/10'
                                }
                              `}
                            >
                              {sortOption === option.value && '✓ '}
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  </AnimatePresence>,
                  document.body
                )}
              </div>
            </div>

            {/* Manual Order Helper */}
            {sortOption === 'manual' && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-white/50 text-sm mt-3 flex items-center gap-2"
              >
                <span>☰</span>
                <span>Drag songs to arrange your playlist</span>
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-white/60">Loading playlist...</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && music.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-20"
          >
            <div className="text-5xl sm:text-6xl mb-4">🎵</div>
            <h3 className="text-xl sm:text-2xl text-white/80 font-bold mb-2">Your playlist is waiting</h3>
            <p className="text-white/60 mb-6 sm:mb-8">Add a song and make this space yours ✨</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full text-white font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              ➕ Add Your First Song
            </button>
          </motion.div>
        )}

        {/* No Search Results */}
        {!isLoading && music.length > 0 && filteredMusic.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-20"
          >
            <div className="text-5xl sm:text-6xl mb-4">🎵</div>
            <h3 className="text-lg sm:text-xl text-white/80 font-bold mb-2">No songs found</h3>
            <p className="text-white/60">Try searching by another title or artist.</p>
          </motion.div>
        )}

        {/* Music List */}
        {!isLoading && filteredMusic.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 relative"
          >
            {sortOption === 'manual' ? (
              // Reorderable list
              <Reorder.Group axis="y" values={filteredMusic} onReorder={handleReorder} className="space-y-3 sm:space-y-4">
                {filteredMusic.map((song) => (
                  <Reorder.Item key={song.id} value={song} className="cursor-grab active:cursor-grabbing">
                    <SongCard
                      song={song}
                      currentPlaying={currentPlaying}
                      isPlaying={isPlaying}
                      showMoreMenu={showMoreMenu}
                      sortOption={sortOption}
                      onPlay={handlePlay}
                      onEdit={handleEditClick}
                      onDelete={handleDelete}
                      onMoreMenuToggle={(id) => {
                        setShowSortMenu(false) // Close sort menu
                        setShowMoreMenu(showMoreMenu === id ? null : id)
                      }}
                      formatDuration={formatDuration}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : (
              // Regular list
              <div className="space-y-3 sm:space-y-4">
                {filteredMusic.map((song, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <SongCard
                      song={song}
                      currentPlaying={currentPlaying}
                      isPlaying={isPlaying}
                      showMoreMenu={showMoreMenu}
                      sortOption={sortOption}
                      onPlay={handlePlay}
                      onEdit={handleEditClick}
                      onDelete={handleDelete}
                      onMoreMenuToggle={(id) => {
                        setShowSortMenu(false) // Close sort menu
                        setShowMoreMenu(showMoreMenu === id ? null : id)
                      }}
                      formatDuration={formatDuration}
                    />
                  </motion.div>
                ))}
              </div>
            )}
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
            className="inline-block px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full text-white/80 hover:text-white border-2 border-white/30 transition-all duration-300 text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="auto"
        crossOrigin="anonymous"
        onEnded={() => {
          setIsPlaying(false)
          setCurrentPlaying(null)
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onError={(e) => {
          console.error('Audio error:', e)
          setIsPlaying(false)
          setCurrentPlaying(null)
        }}
      />

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => !isUploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
                Add New Song 🎵
              </h2>

              <div className="space-y-4">
                {/* Title Input */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">SONG TITLE</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    disabled={isUploading}
                    placeholder="Enter song title"
                    className="w-full px-4 py-2.5 sm:py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all duration-300 placeholder-white/40 text-sm sm:text-base"
                  />
                </div>

                {/* Artist Input */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">ARTIST</label>
                  <input
                    type="text"
                    value={uploadArtist}
                    onChange={(e) => setUploadArtist(e.target.value)}
                    disabled={isUploading}
                    placeholder="Enter artist name"
                    className="w-full px-4 py-2.5 sm:py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all duration-300 placeholder-white/40 text-sm sm:text-base"
                  />
                </div>

                {/* File Input */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">AUDIO FILE</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/m4a,audio/x-m4a,audio/*"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full px-4 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white border border-white/20 transition-all duration-300 text-left text-sm sm:text-base"
                  >
                    {uploadFile ? `📁 ${uploadFile.name}` : 'Choose Audio File'}
                  </button>
                  {uploadFile && (
                    <p className="text-xs text-white/50 mt-1">
                      Size: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-white/60">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    disabled={isUploading}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading || !uploadFile || !uploadTitle.trim()}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isUploading ? 'Adding...' : 'Add Song'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingSong && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
                Edit Song ✏️
              </h2>

              <div className="space-y-4">
                {/* Title Input */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">SONG TITLE</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Enter song title"
                    className="w-full px-4 py-2.5 sm:py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all duration-300 placeholder-white/40 text-sm sm:text-base"
                  />
                </div>

                {/* Artist Input */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">ARTIST</label>
                  <input
                    type="text"
                    value={editArtist}
                    onChange={(e) => setEditArtist(e.target.value)}
                    placeholder="Enter artist name"
                    className="w-full px-4 py-2.5 sm:py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all duration-300 placeholder-white/40 text-sm sm:text-base"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-all duration-300 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={!editTitle.trim()}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    Save Changes
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

// Song Card Component
interface SongCardProps {
  song: Music
  currentPlaying: string | null
  isPlaying: boolean
  showMoreMenu: string | null
  sortOption: SortOption
  onPlay: (id: string, url: string) => void
  onEdit: (song: Music) => void
  onDelete: (id: string, path: string, title: string) => void
  onMoreMenuToggle: (id: string) => void
  formatDuration: (seconds: number | null) => string
}

function SongCard({
  song,
  currentPlaying,
  isPlaying,
  showMoreMenu,
  sortOption,
  onPlay,
  onEdit,
  onDelete,
  onMoreMenuToggle,
  formatDuration
}: SongCardProps) {
  const isActive = currentPlaying === song.id
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (showMoreMenu === song.id && moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      })
    }
  }, [showMoreMenu, song.id])

  return (
    <div
      className={`
        bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6
        border ${isActive ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-white/10'}
        hover:border-blue-400/50 transition-all duration-300
        shadow-lg hover:shadow-xl
      `}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Drag Handle (Manual Order only) */}
        {sortOption === 'manual' && (
          <div className="text-white/40 text-xl cursor-grab active:cursor-grabbing select-none">
            ☰
          </div>
        )}

        {/* Play Button */}
        <button
          onClick={() => onPlay(song.id, song.file_url)}
          className={`
            w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0
            ${isActive && isPlaying
              ? 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30'
              : 'bg-white/20 hover:bg-white/30'
            }
            transition-all duration-300 text-xl sm:text-2xl
          `}
        >
          {isActive && isPlaying ? '⏸️' : '▶️'}
        </button>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-base sm:text-lg truncate ${isActive ? 'text-blue-400' : 'text-white'}`}>
            {song.title}
          </h3>
          <p className="text-white/60 text-xs sm:text-sm truncate">
            {song.artist || 'Unknown Artist'} • {formatDuration(song.duration)}
          </p>
        </div>

        {/* More Menu Button */}
        <div className="relative">
          <button
            ref={moreButtonRef}
            onClick={(e) => {
              e.stopPropagation()
              onMoreMenuToggle(song.id)
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all duration-300 text-xl flex-shrink-0"
          >
            ⋮
          </button>

          {/* More Menu Dropdown - Using Portal */}
          {mounted && showMoreMenu === song.id && createPortal(
            <AnimatePresence>
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                  style={{ zIndex: 9998 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoreMenuToggle(song.id)
                  }}
                />
                {/* Menu Dropdown */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="fixed w-48 bg-gray-900 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl overflow-hidden"
                  style={{ 
                    top: menuPosition.top,
                    right: menuPosition.right,
                    zIndex: 9999
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onPlay(song.id, song.file_url)
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-lg text-white/80 hover:bg-white/10 transition-all duration-200 flex items-center gap-3"
                    >
                      <span className="text-lg">{isActive && isPlaying ? '⏸️' : '▶️'}</span>
                      <span className="text-sm">{isActive && isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(song)
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-lg text-white/80 hover:bg-white/10 transition-all duration-200 flex items-center gap-3"
                    >
                      <span className="text-lg">✏️</span>
                      <span className="text-sm">Edit Song</span>
                    </button>
                    <div className="h-px bg-white/10 my-1"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(song.id, song.file_path, song.title)
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200 flex items-center gap-3"
                    >
                      <span className="text-lg">🗑️</span>
                      <span className="text-sm">Delete Song</span>
                    </button>
                  </div>
                </motion.div>
              </>
            </AnimatePresence>,
            document.body
          )}
        </div>
      </div>

      {/* Progress Bar (if playing) */}
      {isActive && isPlaying && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4"
        >
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: song.duration || 180, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50"
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}
