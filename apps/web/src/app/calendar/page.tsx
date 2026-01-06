'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from '@/components/Sidebar'
import NewAppointmentModal from '@/components/NewAppointmentModal'
import { useAppointments } from '@/contexts/AppointmentsContext'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import type { GoogleCalendarEvent, GoogleCalendarEventsResponse, AppointmentData } from '@/lib/types'

interface CalendarEvent {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  type?: 'consultation' | 'chemotherapy' | 'surgery' | 'follow-up' | 'meeting'
  patient?: string
  location?: string
}

export default function CalendarPage() {
  const { data: session } = useSession()
  const { addAppointment, refreshAppointments } = useAppointments()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'list'>('week')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{date: Date, hour: number} | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    if (session?.accessToken) {
      loadGoogleCalendarEvents()
    }
  }, [session, currentDate])

  const loadGoogleCalendarEvents = async () => {
    if (!session?.accessToken) return
    
    setLoading(true)
    try {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${startOfWeek.toISOString()}&` +
        `timeMax=${endOfWeek.toISOString()}&` +
        `singleEvents=true&` +
        `orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          }
        }
      )
      
      if (response.ok) {
        const data: GoogleCalendarEventsResponse = await response.json()
        const formattedEvents: CalendarEvent[] = data.items?.map((event: GoogleCalendarEvent) => ({
          id: event.id || Date.now().toString(),
          summary: event.summary || '',
          start: event.start || {},
          end: event.end || {},
          type: getEventType(event.summary || ''),
          patient: extractPatientName(event.summary || ''),
          location: event.location || event.description
        })) || []
        setEvents(formattedEvents)
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventType = (summary: string): CalendarEvent['type'] => {
    const lower = summary.toLowerCase()
    if (lower.includes('consultation') || lower.includes('consult')) return 'consultation'
    if (lower.includes('chemotherapy') || lower.includes('chemo')) return 'chemotherapy'
    if (lower.includes('surgery') || lower.includes('operation')) return 'surgery'
    if (lower.includes('follow-up') || lower.includes('followup')) return 'follow-up'
    if (lower.includes('meeting') || lower.includes('board')) return 'meeting'
    return 'consultation'
  }

  const extractPatientName = (summary: string): string => {
    // Extract patient name from summary (assumes format like "John Doe - Consultation")
    const parts = summary.split(' - ')
    return parts.length > 1 ? parts[0] : ''
  }

  const handleTimeSlotClick = (dayIndex: number, hour: number) => {
    const selectedDate = new Date(currentDate)
    selectedDate.setDate(currentDate.getDate() - currentDate.getDay() + 1 + dayIndex) // Monday = 1
    setSelectedTimeSlot({ date: selectedDate, hour })
    setShowNewAppointmentModal(true)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    // Could open event details modal here
    alert(`Event: ${event.summary}\nTime: ${new Date(event.start.dateTime || '').toLocaleTimeString()}\nLocation: ${event.location || 'N/A'}`)
  }

  const createNewAppointment = async (appointmentData: AppointmentData) => {
    // If time slot was selected, use that time
    if (selectedTimeSlot && !appointmentData.date) {
      const date = selectedTimeSlot.date.toISOString().split('T')[0]
      const startTime = `${selectedTimeSlot.hour.toString().padStart(2, '0')}:00`
      const endTime = `${(selectedTimeSlot.hour + 1).toString().padStart(2, '0')}:00`
      appointmentData = {
        ...appointmentData,
        date,
        startTime,
        endTime,
        startDateTime: `${date}T${startTime}:00`,
        endDateTime: `${date}T${endTime}:00`
      }
    }
    
    if (!session?.accessToken) {
      alert('Please sign in to create appointments')
      return
    }
    
    try {
      const event = {
        summary: `${appointmentData.patientName} - ${appointmentData.type}`,
        description: appointmentData.notes || '',
        start: {
          dateTime: appointmentData.startDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: appointmentData.endDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        location: appointmentData.location || ''
      }
      
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      )
      
      if (response.ok) {
        setShowNewAppointmentModal(false)
        setSelectedTimeSlot(null)
        alert('Appointment created successfully!')
        
        // Refresh shared context
        refreshAppointments()
      } else if (response.status === 401) {
        // Create mock appointment for demo
        const mockEvent = {
          id: Date.now().toString(),
          summary: event.summary,
          start: { dateTime: event.start.dateTime },
          end: { dateTime: event.end.dateTime },
          type: appointmentData.type,
          patient: appointmentData.patientName,
          location: event.location
        }
        setEvents([...events, mockEvent])
        setShowNewAppointmentModal(false)
        setSelectedTimeSlot(null)
        alert('Appointment created (demo mode - Google Calendar unavailable)')
        
        // Add to shared context
        addAppointment(mockEvent)
      } else {
        // For now, create a mock appointment to show functionality
        const mockEvent = {
          id: Date.now().toString(),
          summary: event.summary,
          start: { dateTime: event.start.dateTime },
          end: { dateTime: event.end.dateTime },
          type: appointmentData.type,
          patient: appointmentData.patientName,
          location: event.location
        }
        setEvents([...events, mockEvent])
        setShowNewAppointmentModal(false)
        setSelectedTimeSlot(null)
        alert('Appointment created (demo mode)')
        
        // Add to shared context
        addAppointment(mockEvent)
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Error creating appointment. Please try again.')
    }
  }

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  const getCurrentWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
    startOfWeek.setDate(diff)
    
    const days = []
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getCurrentTimePosition = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    
    if (hours < 8 || hours >= 18) return null // Outside calendar hours
    
    const topPosition = (hours - 8) * 80 + (minutes / 60) * 80
    return { topPosition, timeString: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
  }

  const getTodayColumnIndex = () => {
    const today = new Date()
    const weekDays = getCurrentWeekDays()
    return weekDays.findIndex(day => 
      day.toDateString() === today.toDateString()
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const weekDays = getCurrentWeekDays()
  const todayColumnIndex = getTodayColumnIndex()
  const currentTimePos = getCurrentTimePosition()
  const todaysEvents = events.filter(event => {
    const eventDate = new Date(event.start.dateTime || event.start.date || '')
    return isToday(eventDate)
  })

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
      case 'chemotherapy':
        return 'bg-purple-50 border-l-4 border-purple-500 text-purple-700'
      case 'surgery':
        return 'bg-rose-50 border-l-4 border-rose-500 text-rose-700'
      case 'follow-up':
        return 'bg-teal-50 border-l-4 border-teal-500 text-teal-700'
      case 'meeting':
        return 'bg-gray-100 border-l-4 border-gray-500 text-gray-700'
      default:
        return 'bg-gray-50 border-l-4 border-gray-400 text-gray-700'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'consultation': return 'stethoscope'
      case 'chemotherapy': return 'medication'
      case 'surgery': return 'content_cut'
      case 'follow-up': return 'check_circle'
      case 'meeting': return 'groups'
      default: return 'event'
    }
  }

  const renderDayView = () => (
    <div className="text-center py-8 text-gray-500 dark:text-gray-400">Day view - Coming soon</div>
  )

  const renderMonthView = () => (
    <div className="text-center py-8 text-gray-500 dark:text-gray-400">Month view - Coming soon</div>
  )

  const renderListView = () => {
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.start.dateTime || a.start.date || '').getTime() - 
      new Date(b.start.dateTime || b.start.date || '').getTime()
    )
    
    return (
      <div className="space-y-2 p-4">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No appointments scheduled
          </div>
        ) : (
          sortedEvents.map(event => {
            const startTime = new Date(event.start.dateTime || event.start.date || '')
            return (
              <div key={event.id} className={`p-4 rounded-lg border cursor-pointer hover:shadow-md ${getEventStyle(event.type || 'consultation')}`} onClick={() => handleEventClick(event)}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{event.summary}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {startTime.toLocaleDateString()} at {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{event.location}</p>
                    )}
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded capitalize">
                    {event.type || 'Event'}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Calendar Toolbar */}
        <div className="px-8 py-5 flex items-center justify-between shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Calendar</h1>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span className="text-sm font-medium">{formatDate(currentDate)}</span>
              <span className="w-1 h-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
              <span className="text-sm">{todaysEvents.length} Appointments today</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Date Navigation */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
              <button 
                onClick={() => navigateWeek(-1)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-3 text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Today
              </button>
              <button 
                onClick={() => navigateWeek(1)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
            
            {/* View Switcher */}
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex h-9">
              {(['day', 'week', 'month', 'list'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setViewMode(view)}
                  className={`px-4 h-full rounded flex items-center justify-center text-sm font-medium capitalize transition-colors ${
                    viewMode === view
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
            
            {/* New Appointment Button */}
            <button 
              onClick={() => setShowNewAppointmentModal(true)}
              className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white h-10 px-5 rounded-lg shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="text-sm font-bold">New Appointment</span>
            </button>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 relative">
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'week' && (
            <div className="min-w-[800px] h-full flex flex-col">
            {/* Week Header */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-30">
              <div className="w-[60px] border-r border-gray-200 dark:border-gray-700 shrink-0"></div>
              <div className="flex-1 grid grid-cols-5 divide-x divide-gray-200 dark:divide-gray-700">
                {weekDays.map((day, index) => {
                  const isToday = todayColumnIndex === index
                  const dayName = day.toLocaleDateString('en-US', { weekday: 'short' })
                  const dayNumber = day.getDate()
                  
                  return (
                    <div key={index} className={`p-3 text-center ${isToday ? 'bg-primary/5' : ''}`}>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        {dayName}
                      </p>
                      <p className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                        {dayNumber}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Time Grid */}
            <div className="flex flex-1 relative">
              {/* Time Column */}
              <div className="w-[60px] flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0 z-10 text-xs font-medium text-gray-500 dark:text-gray-400 text-right pr-3 pt-3">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="h-[80px] flex items-start">
                    <span className="-mt-3">{8 + i} {8 + i < 12 ? 'AM' : 'PM'}</span>
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="flex-1 grid grid-cols-5 divide-x divide-gray-200 dark:divide-gray-700 relative">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex flex-col pointer-events-none">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="h-[80px] border-b border-gray-200 dark:border-gray-700 border-dashed w-full"></div>
                  ))}
                </div>

                {/* Day Columns */}
                {Array.from({ length: 5 }, (_, dayIndex) => (
                  <div key={dayIndex} className={`relative h-[800px] ${todayColumnIndex === dayIndex ? 'bg-primary/5' : ''}`}>
                    {/* Time Slot Click Areas */}
                    {Array.from({ length: 10 }, (_, hourIndex) => (
                      <div
                        key={hourIndex}
                        className="absolute left-0 right-0 h-[80px] hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer border-b border-gray-200 dark:border-gray-700 border-dashed transition-colors"
                        style={{ top: `${hourIndex * 80}px` }}
                        onClick={() => handleTimeSlotClick(dayIndex, 8 + hourIndex)}
                        title={`Click to add appointment at ${8 + hourIndex}:00`}
                      />
                    ))}
                    {/* Current Time Indicator (only for today) */}
                    {todayColumnIndex === dayIndex && currentTimePos && (
                      <div className="absolute left-0 right-0 border-t-2 border-red-500 z-20 flex items-center" style={{ top: `${currentTimePos.topPosition}px` }}>
                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                        <span className="text-[10px] font-bold text-red-500 ml-1 bg-white dark:bg-gray-900 px-1 rounded">{currentTimePos.timeString}</span>
                      </div>
                    )}

                    {/* Events for each day */}
                    {events
                      .filter(event => {
                        const eventDate = new Date(event.start.dateTime || event.start.date || '')
                        const targetDay = weekDays[dayIndex]
                        return eventDate.toDateString() === targetDay.toDateString()
                      })
                      .map(event => {
                        const startTime = new Date(event.start.dateTime || event.start.date || '')
                        const endTime = new Date(event.end.dateTime || event.end.date || '')
                        const startHour = startTime.getHours()
                        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
                        const topPosition = (startHour - 8) * 80 + (startTime.getMinutes() / 60) * 80
                        const height = Math.max(duration * 80, 40) // Minimum height

                        return (
                          <div
                            key={event.id}
                            className={`absolute left-1 right-1 rounded p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow group ${getEventStyle(event.type || 'consultation')}`}
                            style={{
                              top: `${topPosition}px`,
                              height: `${height}px`
                            }}
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold capitalize">{event.type || 'Event'}</span>
                              <span className="material-symbols-outlined text-[16px] opacity-60">
                                {getEventIcon(event.type || 'consultation')}
                              </span>
                            </div>
                            {event.patient && (
                              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{event.patient}</p>
                            )}
                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-tight">{event.summary}</p>
                            {event.location && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 truncate">{event.location}</p>
                            )}
                          </div>
                        )
                      })}
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* New Appointment Modal */}
      <NewAppointmentModal 
        isOpen={showNewAppointmentModal}
        onClose={() => {
          setShowNewAppointmentModal(false)
          setSelectedTimeSlot(null)
        }}
        onSubmit={createNewAppointment}
        selectedTimeSlot={selectedTimeSlot}
      />
    </div>
  )
}