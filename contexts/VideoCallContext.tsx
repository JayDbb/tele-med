'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/api'

interface VideoCallState {
  isOpen: boolean
  patientName: string
  patientEmail: string
  patientId?: string
}

interface VideoCallContextType {
  videoCall: VideoCallState
  startVideoCall: (patientName: string, patientEmail: string, patientId?: string) => Promise<void>
  endVideoCall: () => void
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined)

export function VideoCallProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [videoCall] = useState<VideoCallState>(() => {
    return { isOpen: false, patientName: '', patientEmail: '' }
  })

  const startVideoCall = async (patientName: string, patientEmail: string, patientId?: string) => {
    if (!patientId) {
      console.error('Patient ID is required to start video call')
      alert('Patient ID is required to start video call')
      return
    }

    try {
      // Get current user (doctor/nurse) info for the email
      const currentUser = await getCurrentUser()
      const doctorName = currentUser?.name || 'Your Healthcare Provider'

      // Call the API to start video call and send email
      const response = await fetch('/api/video-call/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientEmail,
          patientName,
          patientId,
          doctorName,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to start video call' }))
        console.error('Failed to start video call:', error)
        // Still redirect even if email fails
      } else {
        const result = await response.json()
        console.log('Video call started:', result)
      }

      // Redirect to the video call page
      router.push(`/patients/${patientId}/video`)
    } catch (error: any) {
      console.error('Error starting video call:', error)
      // Still redirect even if email fails - the video page will handle connection
      router.push(`/patients/${patientId}/video`)
      // Optionally show a toast notification instead of alert
      // You might want to add a toast library for better UX
    }
  }

  const endVideoCall = () => {
    // This is now handled by the video page itself
    // Could be used for cleanup if needed in the future
  }

  return (
    <VideoCallContext.Provider value={{ videoCall, startVideoCall, endVideoCall }}>
      {children}
    </VideoCallContext.Provider>
  )
}

export function useVideoCall() {
  const context = useContext(VideoCallContext)
  if (context === undefined) {
    throw new Error('useVideoCall must be used within a VideoCallProvider')
  }
  return context
}