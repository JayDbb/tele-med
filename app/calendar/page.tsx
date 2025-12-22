'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from '@/components/Sidebar'

interface CalendarEvent {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  type: 'consultation' | 'chemotherapy' | 'surgery' | 'follow-up' | 'meeting'
  patient?: string
  location?: string
}

export default function CalendarPage() {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'list'>('week')
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      summary: 'Robert Fox - Chemotherapy',
      start: { dateTime: '2023-10-16T09:00:00' },
      end: { dateTime: '2023-10-16T10:30:00' },
      type: 'chemotherapy',
      patient: 'Robert Fox',
      location: 'Cycle 3/6 • Lung'
    },
    {
      id: '2',
      summary: 'Eleanor Pena - Consultation',
      start: { dateTime: '2023-10-17T11:00:00' },
      end: { dateTime: '2023-10-17T12:00:00' },
      type: 'consultation',
      patient: 'Eleanor Pena',
      location: 'Initial Assessment'
    },
    {
      id: '3',
      summary: 'Guy Hawkins - Follow-up',
      start: { dateTime: '2023-10-18T08:30:00' },
      end: { dateTime: '2023-10-18T09:30:00' },
      type: 'follow-up',
      patient: 'Guy Hawkins',
      location: 'Post-Op Check'
    },
    {
      id: '4',
      summary: 'Savannah Nguyen - Surgery Prep',
      start: { dateTime: '2023-10-18T10:00:00' },
      end: { dateTime: '2023-10-18T11:30:00' },
      type: 'surgery',
      patient: 'Savannah Nguyen',
      location: 'Biopsy • Room 304'
    },
    {
      id: '5',
      summary: 'Tumor Board Meeting',
      start: { dateTime: '2023-10-18T14:00:00' },
      end: { dateTime: '2023-10-18T15:00:00' },
      type: 'meeting',
      location: 'Conference Room A'
    }
  ]

  useEffect(() => {
    setEvents(mockEvents)
  }, [])

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

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center w-96">
            <label className="flex w-full items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 h-10 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">search</span>
              <input 
                className="bg-transparent border-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 w-full h-full p-0" 
                placeholder="Search patients, MRN, or appointments..." 
                type="text"
              />
            </label>
          </div>
          
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
              <span className="text-sm font-medium">October 18, 2023</span>
              <span className="w-1 h-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
              <span className="text-sm">5 Appointments today</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Date Navigation */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="px-3 text-sm font-bold text-gray-900 dark:text-white">Today</span>
              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400">
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
            <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white h-10 px-5 rounded-lg shadow-sm transition-colors">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="text-sm font-bold">New Appointment</span>
            </button>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 relative">
          <div className="min-w-[800px] h-full flex flex-col">
            {/* Week Header */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-30">
              <div className="w-[60px] border-r border-gray-200 dark:border-gray-700 shrink-0"></div>
              <div className="flex-1 grid grid-cols-5 divide-x divide-gray-200 dark:divide-gray-700">
                {['Mon 16', 'Tue 17', 'Wed 18', 'Thu 19', 'Fri 20'].map((day, index) => (
                  <div key={day} className={`p-3 text-center ${index === 2 ? 'bg-primary/5' : ''}`}>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                      {day.split(' ')[0]}
                    </p>
                    <p className={`text-lg font-bold ${index === 2 ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                      {day.split(' ')[1]}
                    </p>
                  </div>
                ))}
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
                  <div key={dayIndex} className={`relative h-[800px] ${dayIndex === 2 ? 'bg-primary/5' : ''}`}>
                    {/* Current Time Indicator (only for today - Wednesday) */}
                    {dayIndex === 2 && (
                      <div className="absolute top-[340px] left-0 right-0 border-t-2 border-red-500 z-20 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                        <span className="text-[10px] font-bold text-red-500 ml-1 bg-white dark:bg-gray-900 px-1 rounded">12:15 PM</span>
                      </div>
                    )}

                    {/* Events for each day */}
                    {events
                      .filter(event => {
                        const eventDate = new Date(event.start.dateTime || event.start.date || '')
                        const targetDay = 16 + dayIndex // Oct 16-20
                        return eventDate.getDate() === targetDay
                      })
                      .map(event => {
                        const startTime = new Date(event.start.dateTime || event.start.date || '')
                        const endTime = new Date(event.end.dateTime || event.end.date || '')
                        const startHour = startTime.getHours()
                        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
                        const topPosition = (startHour - 8) * 80 + (startTime.getMinutes() / 60) * 80
                        const height = duration * 80

                        return (
                          <div
                            key={event.id}
                            className={`absolute left-1 right-1 rounded p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow group ${getEventStyle(event.type)}`}
                            style={{
                              top: `${topPosition}px`,
                              height: `${height}px`
                            }}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold capitalize">{event.type}</span>
                              <span className="material-symbols-outlined text-[16px] opacity-60">
                                {getEventIcon(event.type)}
                              </span>
                            </div>
                            {event.patient && (
                              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{event.patient}</p>
                            )}
                            {event.location && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{event.location}</p>
                            )}
                          </div>
                        )
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}