'use client'

import { useVideoCall } from '@/contexts/VideoCallContext'
import VideoCallPiP from './VideoCallPiP'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

export default function VideoCallWrapper() {
  const { videoCall, endVideoCall } = useVideoCall()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <VideoCallPiP
      isOpen={videoCall.isOpen}
      onClose={endVideoCall}
      patientName={videoCall.patientName}
      patientEmail={videoCall.patientEmail}
    />,
    document.body
  )
}