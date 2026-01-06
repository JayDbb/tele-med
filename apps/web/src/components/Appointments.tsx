'use client'

import { useState, useEffect } from 'react'
import { useAppointments } from '@/contexts/AppointmentsContext'

interface Appointment {
  id: string
  patientName: string
  time: string
  status: 'done' | 'current' | 'upcoming'
}

const Appointments = () => {
  const { appointments } = useAppointments()
  const [processedAppointments, setProcessedAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const now = new Date()
    const processed = appointments.map((event, index) => {
      const startTime = new Date(event.start.dateTime || event.start.date || '')
      const endTime = new Date(event.end.dateTime || event.end.date || '')
      
      let status: 'done' | 'current' | 'upcoming'
      if (now > endTime) {
        status = 'done'
      } else if (now >= startTime && now <= endTime) {
        status = 'current'
      } else {
        status = 'upcoming'
      }
      
      return {
        id: event.id || index.toString(),
        patientName: event.summary || 'Untitled Appointment',
        time: startTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        status
      }
    })
    
    setProcessedAppointments(processed)
    setLoading(false)
  }, [appointments])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'done':
        return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50'
      case 'current':
        return 'text-primary bg-primary/20'
      case 'upcoming':
        return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const getRowStyle = (status: string) => {
    if (status === 'current') {
      return 'bg-primary/10 ring-1 ring-primary'
    }
    return 'hover:bg-gray-50 dark:hover:bg-gray-800'
  }

  const getTextStyle = (status: string) => {
    if (status === 'current') {
      return 'text-primary'
    }
    return 'text-gray-800 dark:text-gray-200'
  }

  const getTimeStyle = (status: string) => {
    if (status === 'current') {
      return 'text-primary'
    }
    return 'text-gray-500 dark:text-gray-400'
  }

  return (
    <div className="col-span-2 md:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appointments</h3>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500 dark:text-gray-400">Loading appointments...</div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No appointments today
        </div>
      ) : (
        <div className="space-y-2">
          {processedAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`flex justify-between items-center p-3 rounded-lg ${getRowStyle(appointment.status)}`}
            >
              <p className={`font-medium text-sm ${getTextStyle(appointment.status)}`}>
                {appointment.patientName}
              </p>
              <div className="flex items-center gap-4">
                <p className={`text-sm ${getTimeStyle(appointment.status)}`}>
                  {appointment.time}
                </p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${getStatusStyle(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Appointments