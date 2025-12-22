'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'

interface CalendarEvent {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
}

const Calendar = () => {
  const { data: session } = useSession()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  useEffect(() => {
    if (session?.accessToken) {
      loadCalendarEvents()
    }
  }, [session])

  const connectGoogleCalendar = async () => {
    setLoading(true)
    try {
      await signIn('google')
    } catch (error) {
      console.error('Failed to connect Google Calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCalendarEvents = async () => {
    if (!session?.accessToken) return
    
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${startOfMonth.toISOString()}&` +
        `timeMax=${endOfMonth.toISOString()}&` +
        `singleEvents=true&` +
        `orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setEvents(data.items || [])
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  const getEventsForDate = (date: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date)
    const dateStr = targetDate.toISOString().split('T')[0]
    
    return events.filter(event => {
      const eventDate = event.start.dateTime ? 
        event.start.dateTime.split('T')[0] : 
        event.start.date
      return eventDate === dateStr
    })
  }

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const isToday = (day: number | null) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear()
  }

  return (
    <div className="col-span-2 md:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          {!session ? (
            <button
              onClick={connectGoogleCalendar}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-full disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">event</span>
              {loading ? 'Connecting...' : 'Connect Google Calendar'}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white text-xs rounded-full">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Connected
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-72 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => navigateMonth(-1)}
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button 
            onClick={() => navigateMonth(1)}
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-gray-500 dark:text-gray-400 text-xs font-bold flex h-8 w-full items-center justify-center">
              {day}
            </div>
          ))}
          
          {getDaysInMonth().map((day, index) => {
            if (day === null) {
              return <div key={index} className="h-10 w-full" />
            }
            
            const dayEvents = getEventsForDate(day)
            const todayClass = isToday(day)
            
            return (
              <button
                key={day}
                className={`h-10 w-full text-sm font-medium relative hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
                  todayClass
                    ? 'bg-primary text-white'
                    : 'text-gray-800 dark:text-gray-100'
                }`}
                title={dayEvents.length > 0 ? dayEvents.map(e => e.summary).join(', ') : ''}
              >
                <div className="flex size-full items-center justify-center rounded">
                  {day}
                  {dayEvents.length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {dayEvents.length}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
        
        {session && events.length > 0 && (
          <div className="mt-4 max-h-32 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Upcoming Events</h4>
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">
                {event.summary}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Calendar