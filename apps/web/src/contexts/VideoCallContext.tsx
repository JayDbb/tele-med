'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface VideoCallState {
  isOpen: boolean
  patientName: string
  patientEmail: string
}

interface VideoCallContextType {
  videoCall: VideoCallState
  startVideoCall: (patientName: string, patientEmail: string) => void
  endVideoCall: () => void
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined)

const STORAGE_KEY = 'video-call-state'

export function VideoCallProvider({ children }: { children: ReactNode }) {
  const [videoCall, setVideoCall] = useState<VideoCallState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return { isOpen: false, patientName: '', patientEmail: '' }
        }
      }
    }
    return { isOpen: false, patientName: '', patientEmail: '' }
  })

  const startVideoCall = (patientName: string, patientEmail: string) => {
    const newState = { isOpen: true, patientName, patientEmail }
    setVideoCall(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    }
  }

  const endVideoCall = () => {
    const newState = { isOpen: false, patientName: '', patientEmail: '' }
    setVideoCall(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    }
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