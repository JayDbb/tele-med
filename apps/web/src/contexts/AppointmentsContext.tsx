'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface CalendarEvent {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  type?: 'consultation' | 'chemotherapy' | 'surgery' | 'follow-up' | 'meeting'
  patient?: string
  location?: string
}

interface AppointmentsContextType {
  appointments: CalendarEvent[]
  addAppointment: (appointment: CalendarEvent) => void
  refreshAppointments: () => void
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined)

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState<CalendarEvent[]>([])

  // Load appointments from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('demo-appointments')
    if (saved) {
      setAppointments(JSON.parse(saved))
    }
  }, [])

  // Save appointments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('demo-appointments', JSON.stringify(appointments))
  }, [appointments])

  const refreshAppointments = async () => {
    if (!session?.accessToken) return
    
    try {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${startOfDay.toISOString()}&` +
        `timeMax=${endOfDay.toISOString()}&` +
        `singleEvents=true&` +
        `orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        const events = data.items || []
        setAppointments(events)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const addAppointment = (appointment: CalendarEvent) => {
    setAppointments(prev => {
      const updated = [...prev, appointment]
      localStorage.setItem('demo-appointments', JSON.stringify(updated))
      return updated
    })
  }

  useEffect(() => {
    if (session?.accessToken) {
      refreshAppointments()
    }
  }, [session])

  return (
    <AppointmentsContext.Provider value={{ appointments, addAppointment, refreshAppointments }}>
      {children}
    </AppointmentsContext.Provider>
  )
}

export function useAppointments() {
  const context = useContext(AppointmentsContext)
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentsProvider')
  }
  return context
}