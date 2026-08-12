'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CameraPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect langsung ke photobooth
    router.push('/camera/photobooth')
  }, [router])

  return null
}
