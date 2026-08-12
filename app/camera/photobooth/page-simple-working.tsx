'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/auth'
import { supabase } from '@/lib/supabase/client'

type Template = {
  id: number
  name: string
  slots: number
}

const TEMPLATES: Template[] = [
  { id: 1, name: 'Single', slots: 1 },
  { id: 2, name: 'Double', slots: 2 },
  { id: 3, name: 'Triple', slots: 3 }
]

export default function PhotoBoothSimple() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const [step, setStep] = useState<'select' | 'capture'>('select')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  
  useEffect(() => {
    const user = getCurrentUser()
    if (!user) router.push('/login')
  }, [router])

  // Cleanup
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const selectTemplate = async (template: Template) => {
    setSelectedTemplate(template)
    setStep('capture')
    
    // Start camera
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        console.log('Camera started, stream:', mediaStream.active)
      }
    } catch (err) {
      console.error('Camera error:', err)
      alert('Cannot access camera')
    }
  }

  const takePhoto = () => {
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
      
      console.log(`Photo ${newPhotos.length} of ${selectedTemplate?.slots} captured`)
      
      if (newPhotos.length >= (selectedTemplate?.slots || 1)) {
        alert('All photos captured! (Would save here)')
        // Reset
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
        setCapturedPhotos([])
        setStep('select')
      }
    }
  }

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-green-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Simple Photo Booth Test
        </h1>

        {step === 'select' && (
          <div className="grid grid-cols-3 gap-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => selectTemplate(template)}
                className="bg-white/10 hover:bg-white/20 p-8 rounded-2xl text-white font-bold text-xl border-2 border-white/30"
              >
                {template.name}
                <br />
                <span className="text-sm">({template.slots} photos)</span>
              </button>
            ))}
          </div>
        )}

        {step === 'capture' && (
          <div className="space-y-4">
            <p className="text-white text-center text-xl">
              Photo {capturedPhotos.length + 1} of {selectedTemplate?.slots}
            </p>
            
            {/* Simple video - NO complexity */}
            <div className="relative bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ display: 'block' }}
              />
            </div>

            {/* Thumbnails */}
            {capturedPhotos.length > 0 && (
              <div className="flex gap-2 justify-center">
                {capturedPhotos.map((photo, i) => (
                  <img key={i} src={photo} alt={`Photo ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border-2 border-green-500" />
                ))}
              </div>
            )}

            {/* Simple buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={takePhoto}
                className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full text-lg"
              >
                📸 Take Photo {capturedPhotos.length + 1}
              </button>
              <button
                onClick={() => {
                  if (stream) stream.getTracks().forEach(track => track.stop())
                  setCapturedPhotos([])
                  setStep('select')
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/camera" className="text-white/70 hover:text-white">
            ← Back
          </Link>
        </div>
      </div>
    </main>
  )
}
