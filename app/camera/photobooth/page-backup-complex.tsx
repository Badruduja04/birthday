'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/auth'
import { supabase } from '@/lib/supabase/client'

// Template dengan DESIGN/LAYOUT
type TemplateDesign = {
  id: number
  name: string
  description: string
  slots: number // Jumlah foto slot di design
  thumbnail: string // Preview design
  layout: 'vertical-3' | 'grid-4' | 'single-large' | 'horizontal-2'
}

const TEMPLATE_DESIGNS: TemplateDesign[] = [
  {
    id: 2,
    name: 'Stamp Duo',
    description: 'Cute 2-frame stamp design',
    slots: 2,
    thumbnail: '/templates/preview-duo.jpg',
    layout: 'horizontal-2'
  }
]

export default function PhotoBoothPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const [step, setStep] = useState<'select' | 'capture' | 'success'>('select')
  const [selectedDesign, setSelectedDesign] = useState<TemplateDesign | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isCountingDown, setIsCountingDown] = useState(false)
  
  useEffect(() => {
    const user = getCurrentUser()
    if (!user) router.push('/login')
  }, [router])

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop())
    }
  }, [stream])

  const selectDesign = async (design: TemplateDesign) => {
    setSelectedDesign(design)
    setStep('capture')
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
    } catch (err) {
      console.error('Camera error:', err)
      alert('Cannot access camera')
    }
  }

  const takePhoto = () => {
    if (!videoRef.current || isCountingDown) return
    
    // Start countdown
    setIsCountingDown(true)
    setCountdown(3)
    
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval)
          capturePhoto()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }
  
  const capturePhoto = () => {
    if (!videoRef.current) return
    
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      
      const newPhotos = [...capturedPhotos, dataUrl]
      setCapturedPhotos(newPhotos)
      setIsCountingDown(false)
      setCountdown(null)
      
      if (newPhotos.length >= (selectedDesign?.slots || 1)) {
        // All photos captured, generate composite
        generateComposite(newPhotos)
      }
    }
  }

  const generateComposite = async (photos: string[]) => {
    setIsSaving(true)
    
    // Create composite canvas based on stamp template design
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 1800
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Cream/Beige background with wood texture
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#FFF8E7')
    gradient.addColorStop(1, '#FFE8CC')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw scalloped edge border (stamp style)
    const borderSize = 80
    const scallops = 20
    const scalloPadding = 40
    
    ctx.fillStyle = '#FFF8E7'
    ctx.strokeStyle = '#5C6B7A'
    ctx.lineWidth = 12
    
    // Draw main white area
    ctx.fillStyle = 'white'
    ctx.fillRect(borderSize, borderSize, canvas.width - 2 * borderSize, canvas.height - 2 * borderSize)
    
    // Draw scalloped edges using circles
    const drawScallopedBorder = () => {
      const scallopRadius = 35
      const spacing = (canvas.width - 2 * borderSize) / scallops
      
      ctx.fillStyle = '#5C6B7A'
      
      // Top edge
      for (let i = 0; i <= scallops; i++) {
        ctx.beginPath()
        ctx.arc(borderSize + i * spacing, borderSize, scallopRadius, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Bottom edge
      for (let i = 0; i <= scallops; i++) {
        ctx.beginPath()
        ctx.arc(borderSize + i * spacing, canvas.height - borderSize, scallopRadius, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Left edge
      const vSpacing = (canvas.height - 2 * borderSize) / (scallops * 1.5)
      for (let i = 0; i <= scallops * 1.5; i++) {
        ctx.beginPath()
        ctx.arc(borderSize, borderSize + i * vSpacing, scallopRadius, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Right edge
      for (let i = 0; i <= scallops * 1.5; i++) {
        ctx.beginPath()
        ctx.arc(canvas.width - borderSize, borderSize + i * vSpacing, scallopRadius, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    drawScallopedBorder()
    
    // Draw decorative stars (top left)
    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string) => {
      let rot = Math.PI / 2 * 3
      let x = cx
      let y = cy
      const step = Math.PI / spikes
      
      ctx.fillStyle = color
      ctx.strokeStyle = '#8B4513'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.moveTo(cx, cy - outerRadius)
      
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius
        y = cy + Math.sin(rot) * outerRadius
        ctx.lineTo(x, y)
        rot += step
        
        x = cx + Math.cos(rot) * innerRadius
        y = cy + Math.sin(rot) * innerRadius
        ctx.lineTo(x, y)
        rot += step
      }
      
      ctx.lineTo(cx, cy - outerRadius)
      ctx.closePath()
      
      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 15
      ctx.shadowOffsetX = 5
      ctx.shadowOffsetY = 5
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.stroke()
    }
    
    // Stars decoration
    drawStar(230, 280, 5, 50, 25, '#C41E3A')
    drawStar(180, 370, 5, 40, 20, '#C41E3A')
    drawStar(260, 420, 5, 35, 17, '#C41E3A')
    
    // Draw triangle decorations (top right)
    const drawTriangle = (x: number, y: number, size: number, rotation: number, color: string) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation * Math.PI / 180)
      
      ctx.fillStyle = color
      ctx.strokeStyle = '#8B4513'
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(0, -size)
      ctx.lineTo(size * 0.866, size * 0.5)
      ctx.lineTo(-size * 0.866, size * 0.5)
      ctx.closePath()
      
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 12
      ctx.shadowOffsetX = 4
      ctx.shadowOffsetY = 4
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.stroke()
      
      ctx.restore()
    }
    
    drawTriangle(970, 320, 45, 15, '#C41E3A')
    drawTriangle(890, 400, 50, -30, '#8B4513')
    drawTriangle(1020, 450, 40, 60, '#C41E3A')
    
    // Draw cute cat decoration (bottom right)
    const drawCat = (x: number, y: number) => {
      ctx.fillStyle = '#8B4513'
      ctx.strokeStyle = '#5C4033'
      ctx.lineWidth = 4
      
      // Cat body
      ctx.beginPath()
      ctx.ellipse(x, y, 100, 60, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      
      // Cat head
      ctx.beginPath()
      ctx.arc(x + 80, y - 30, 50, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      
      // Ears
      ctx.beginPath()
      ctx.moveTo(x + 60, y - 60)
      ctx.lineTo(x + 50, y - 100)
      ctx.lineTo(x + 75, y - 70)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(x + 100, y - 60)
      ctx.lineTo(x + 110, y - 100)
      ctx.lineTo(x + 85, y - 70)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      
      // Eyes
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(x + 70, y - 35, 12, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x + 95, y - 35, 12, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = 'black'
      ctx.beginPath()
      ctx.arc(x + 72, y - 33, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x + 97, y - 33, 6, 0, Math.PI * 2)
      ctx.fill()
      
      // Wink eye
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(x + 88, y - 35)
      ctx.lineTo(x + 102, y - 35)
      ctx.stroke()
      
      // Mouth
      ctx.beginPath()
      ctx.moveTo(x + 70, y - 20)
      ctx.quadraticCurveTo(x + 83, y - 15, x + 95, y - 20)
      ctx.stroke()
      
      // Whiskers
      ctx.beginPath()
      ctx.moveTo(x + 55, y - 25)
      ctx.lineTo(x + 30, y - 30)
      ctx.moveTo(x + 55, y - 20)
      ctx.lineTo(x + 25, y - 20)
      ctx.moveTo(x + 55, y - 15)
      ctx.lineTo(x + 30, y - 10)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(x + 110, y - 25)
      ctx.lineTo(x + 135, y - 30)
      ctx.moveTo(x + 110, y - 20)
      ctx.lineTo(x + 140, y - 20)
      ctx.moveTo(x + 110, y - 15)
      ctx.lineTo(x + 135, y - 10)
      ctx.stroke()
      
      // Tail
      ctx.lineWidth = 6
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#8B4513'
      ctx.beginPath()
      ctx.moveTo(x - 100, y)
      ctx.quadraticCurveTo(x - 120, y - 60, x - 80, y - 80)
      ctx.stroke()
    }
    
    drawCat(950, 1580)
    
    // Draw photos
    const photoAreaLeft = borderSize + 100
    const photoAreaTop = borderSize + 150
    const photoAreaRight = canvas.width - borderSize - 100
    const photoAreaBottom = canvas.height - borderSize - 250
    
    for (let i = 0; i < photos.length; i++) {
      const img = new Image()
      img.src = photos[i]
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
          let x, y, w, h
          
          if (i === 0) {
            // First photo - large at top
            w = photoAreaRight - photoAreaLeft
            h = (photoAreaBottom - photoAreaTop) * 0.55
            x = photoAreaLeft
            y = photoAreaTop
          } else {
            // Second photo - smaller at bottom
            w = photoAreaRight - photoAreaLeft
            h = (photoAreaBottom - photoAreaTop) * 0.38
            x = photoAreaLeft
            y = photoAreaTop + (photoAreaBottom - photoAreaTop) * 0.60
          }
          
          // White photo border (thicker for polaroid effect)
          ctx.fillStyle = 'white'
          ctx.shadowColor = 'rgba(0,0,0,0.3)'
          ctx.shadowBlur = 20
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 8
          ctx.fillRect(x - 15, y - 15, w + 30, h + 30)
          ctx.shadowColor = 'transparent'
          
          // Draw photo with COVER (maintain aspect ratio)
          const imgAspect = img.width / img.height
          const frameAspect = w / h
          
          let drawWidth, drawHeight, offsetX, offsetY
          
          if (imgAspect > frameAspect) {
            drawHeight = h
            drawWidth = img.width * (h / img.height)
            offsetX = -(drawWidth - w) / 2
            offsetY = 0
          } else {
            drawWidth = w
            drawHeight = img.height * (w / img.width)
            offsetX = 0
            offsetY = -(drawHeight - h) / 2
          }
          
          // Clip to frame
          ctx.save()
          ctx.beginPath()
          ctx.rect(x, y, w, h)
          ctx.clip()
          ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight)
          ctx.restore()
          
          resolve()
        }
      })
    }
    
    // Convert to blob and save
    canvas.toBlob(async (blob) => {
      if (!blob) return
      
      await saveToGallery(blob)
    }, 'image/jpeg', 0.95)
  }

  const saveToGallery = async (imageBlob: Blob) => {
    try {
      const user = getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      const filename = `${user.id}/${Date.now()}.jpg`
      
      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(filename, imageBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('memories')
        .getPublicUrl(filename)

      const { error: dbError } = await supabase
        .from('memories')
        .insert({
          user_id: user.id,
          title: `${selectedDesign?.name}`,
          description: selectedDesign?.description || 'Photo Booth',
          image_url: urlData.publicUrl,
          memory_date: new Date().toISOString().split('T')[0]
        })

      if (dbError) throw dbError

      // Stop camera
      if (stream) stream.getTracks().forEach(track => track.stop())
      
      setIsSaving(false)
      setShowSuccessModal(true)
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/memories')
      }, 3000)
      
    } catch (err: any) {
      console.error('Save error:', err)
      setIsSaving(false)
      alert('Failed to save: ' + err.message)
    }
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-10 w-60 h-60 bg-green-500/20 rounded-full blur-3xl"
      />

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

      <div className="max-w-6xl w-full relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-6xl mb-4">📸</div>
          <h1 className="text-4xl font-bold text-white mb-2" style={{ textShadow: '0 0 20px rgba(236, 72, 153, 0.5)' }}>
            Toy Story Photo Booth
          </h1>
          <p className="text-white/70">
            {step === 'select' && 'Choose your photo booth design'}
            {step === 'capture' && `Taking photo ${capturedPhotos.length + 1} of ${selectedDesign?.slots}`}
          </p>
        </motion.div>

        {/* STEP 1: Design Selection dengan Preview Visual */}
        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {TEMPLATE_DESIGNS.map((design) => (
              <motion.button
                key={design.id}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectDesign(design)}
                className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border-4 border-pink-500/30 hover:border-green-500/60 transition-all duration-300 overflow-hidden"
              >
                {/* Animated background glow */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-20 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-green-500/10 blur-3xl group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Visual Preview - Stamp Design */}
                  <div className="aspect-[3/4] mb-6 rounded-2xl overflow-hidden p-4 relative" style={{
                    background: 'linear-gradient(135deg, #FFF8E7 0%, #FFE8CC 100%)'
                  }}>
                    {/* Scalloped border */}
                    <div className="absolute inset-2 bg-white rounded-lg" style={{
                      border: '8px solid #5C6B7A',
                      boxShadow: 'inset 0 0 0 4px white, 0 4px 12px rgba(0,0,0,0.15)'
                    }}></div>
                    
                    {/* Decorative stars (top left) */}
                    <div className="absolute top-6 left-6 flex gap-1 z-10">
                      <div className="w-5 h-5" style={{
                        background: '#C41E3A',
                        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                      }}></div>
                      <div className="w-4 h-4" style={{
                        background: '#C41E3A',
                        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                      }}></div>
                      <div className="w-3 h-3" style={{
                        background: '#C41E3A',
                        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
                      }}></div>
                    </div>
                    
                    {/* Decorative triangles (top right) */}
                    <div className="absolute top-6 right-6 flex gap-1 z-10">
                      <div className="w-5 h-5 bg-amber-700 transform rotate-45" style={{
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                      }}></div>
                      <div className="w-6 h-6 bg-red-800 transform -rotate-12" style={{
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                      }}></div>
                    </div>
                    
                    {/* Photo slots preview */}
                    <div className="relative flex-1 flex flex-col gap-2 h-full pt-12 px-6 pb-16">
                      {design.layout === 'horizontal-2' && (
                        <>
                          <div className="flex-[3] bg-gray-100 rounded-lg border-4 border-white flex items-center justify-center shadow-lg relative z-10">
                            <span className="text-5xl">📷</span>
                          </div>
                          <div className="flex-[2] bg-gray-100 rounded-lg border-4 border-white flex items-center justify-center shadow-lg relative z-10">
                            <span className="text-4xl">📷</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Cute cat decoration (bottom right) */}
                    <div className="absolute bottom-4 right-4 text-4xl transform rotate-12 z-10">
                      🐱
                    </div>
                  </div>
                  
                  {/* Text Info */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors">{design.name}</h3>
                    <p className="text-white/70 text-sm mb-4">{design.description}</p>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-full border-2 border-green-500/40 group-hover:border-green-400/60 transition-colors">
                      <span className="text-2xl">📸</span>
                      <span className="text-green-300 font-bold">{design.slots} Photo{design.slots > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* STEP 2: Capture */}
        {step === 'capture' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 border-4 border-pink-500/30"
          >
            <div className="relative bg-black rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Countdown Overlay */}
              <AnimatePresence>
                {countdown !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                  >
                    <motion.div
                      key={countdown}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="text-[200px] font-bold text-white"
                      style={{
                        textShadow: '0 0 40px rgba(236, 72, 153, 0.8), 0 0 80px rgba(236, 72, 153, 0.4)'
                      }}
                    >
                      {countdown}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Flash effect when photo is taken */}
              <AnimatePresence>
                {countdown === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-white"
                  />
                )}
              </AnimatePresence>
            </div>

            {capturedPhotos.length > 0 && (
              <div className="flex gap-3 mb-6 justify-center">
                {capturedPhotos.map((photo, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-24 h-24 rounded-lg overflow-hidden border-4 border-green-500 shadow-lg"
                  >
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={takePhoto}
                disabled={isSaving || isCountingDown}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full text-white font-bold text-lg border-4 border-white/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isCountingDown ? '📸 Taking Photo...' : `📸 Take Photo ${capturedPhotos.length + 1}`}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (stream) stream.getTracks().forEach(track => track.stop())
                  setCapturedPhotos([])
                  setStep('select')
                  setCountdown(null)
                  setIsCountingDown(false)
                }}
                disabled={isCountingDown}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium border-2 border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Change Design
              </motion.button>
            </div>
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <Link href="/camera" className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full text-white/80 hover:text-white border-2 border-white/30 transition-all text-sm font-medium">
            ← Back to Camera Hub
          </Link>
        </div>
      </div>

      {/* Success Modal - Simple & Modern */}
      <AnimatePresence>
        {showSuccessModal && (
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
                  className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
                
                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-gray-800 mb-2"
                >
                  Photo Saved!
                </motion.h2>
                
                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-600 mb-4"
                >
                  Your memory has been saved to the gallery
                </motion.p>
                
                {/* Progress indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-2 text-sm text-gray-500"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full"
                  />
                  <span>Redirecting to gallery...</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
