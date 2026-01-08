'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { PatientDataManager } from '@/utils/PatientDataManager'

interface VideoCallState {
  isOpen: boolean
  patientName: string
  patientEmail: string
  meta?: {
    patientId?: string
    appointmentId?: string
    visitId?: string
    doctorId?: string
  }
}

interface VideoCallContextType {
  videoCall: VideoCallState
  startVideoCall: (
    patientName: string,
    patientEmail: string,
    meta?: VideoCallState['meta']
  ) => void
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

  const startVideoCall = (
    patientName: string,
    patientEmail: string,
    meta?: VideoCallState['meta']
  ) => {
    const newState = { isOpen: true, patientName, patientEmail, meta }
    setVideoCall(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    }
  }

  const endVideoCall = () => {
    if (videoCall?.meta?.patientId && videoCall?.meta?.appointmentId) {
      try {
        const appointments = PatientDataManager.getPatientSectionList<any>(
          videoCall.meta.patientId,
          'appointments'
        )
        const appointment = appointments.find(
          (item: any) => item?.id === videoCall.meta?.appointmentId
        )
        if (
          appointment
          && !appointment.claimConfirmedAt
          && (!appointment.doctorId || appointment.doctorId === videoCall.meta?.doctorId)
        ) {
          const visits = PatientDataManager.getPatientSectionList<any>(
            videoCall.meta.patientId,
            'visits'
          )
          const visit =
            visits.find((item: any) => item?.id === videoCall.meta?.visitId)
            || visits.find((item: any) => item?.appointmentId === appointment.id)
          const documentationStarted = Boolean(
            visit?.documentationStartedAt
            || `${visit?.status || ''}`.toLowerCase() === 'in progress'
            || `${visit?.status || ''}`.toLowerCase() === 'completed'
          )
          if (!documentationStarted) {
            const waitingStatus = appointment.waitingStatus || 'waiting'
            const updatedAppointments = appointments.map((item: any) =>
              item.id === appointment.id
                ? {
                    ...item,
                    status: waitingStatus,
                    claimConfirmedAt: '',
                    claimConfirmedBy: '',
                    claimConfirmedById: '',
                    doctorId: '',
                    doctorName: 'Waiting Pool',
                    doctorDisplayName: 'Waiting Pool',
                    doctorEmail: '',
                    updatedAt: new Date().toISOString()
                  }
                : item
            )
            PatientDataManager.savePatientSectionList(
              videoCall.meta.patientId,
              'appointments',
              updatedAppointments,
              'system'
            )
            const updatedVisits = visits.map((item: any) =>
              item.id === visit?.id
                ? { ...item, status: 'Draft' }
                : item
            )
            PatientDataManager.savePatientSectionList(
              videoCall.meta.patientId,
              'visits',
              updatedVisits,
              'system'
            )
            const patient = PatientDataManager.getPatient(videoCall.meta.patientId)
            if (patient) {
              PatientDataManager.savePatient(
                {
                  ...patient,
                  physician: 'Waiting Pool',
                  doctorId: '',
                  status: waitingStatus,
                  appointment: waitingStatus,
                  updatedAt: new Date().toISOString()
                },
                'update',
                'system'
              )
            }
          }
        }
      } catch (error) {
        console.error('Failed to reconcile video call exit:', error)
      }
    }
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
