'use client'

import { TimelineEvent } from '@/types/index'

const Timeline = () => {
  const events: TimelineEvent[] = [
    { id: '1', title: 'Brief & Patient rounds', time: '08:00', status: 'completed' },
    { id: '2', title: 'Consultations', time: '09:00 - 11:00', status: 'current' },
    { id: '3', title: 'Surgeries', time: '11:00 - 13:00', status: 'upcoming' },
    { id: '4', title: 'ER shift', time: '14:00', status: 'upcoming' },
  ]

  return (
    <div className="col-span-2 md:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's timeline</h3>
      
      <div className="grid grid-cols-[auto_1fr] gap-x-4">
        {events.map((event, index) => (
          <div key={event.id} className="contents">
            <div className="flex flex-col items-center">
              {index > 0 && <div className="w-px bg-gray-300 dark:bg-gray-600 grow" />}
              <div className={`size-4 rounded-full ring-4 ring-white dark:ring-gray-900 ${
                event.status === 'current' 
                  ? 'bg-primary' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`} />
              {index < events.length - 1 && <div className="w-px bg-gray-300 dark:bg-gray-600 grow" />}
            </div>
            
            <div className={index < events.length - 1 ? 'pb-6' : ''}>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Timeline