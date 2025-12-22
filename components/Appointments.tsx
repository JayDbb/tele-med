'use client'

import { Appointment } from '@/types'

const Appointments = () => {
  const appointments: Appointment[] = [
    { id: '1', patientName: 'Martin Coblen', time: '08:00', status: 'done' },
    { id: '2', patientName: 'Katie-Mary Tannebe', time: '08:30', status: 'done' },
    { id: '3', patientName: 'Amanda Kimber', time: '09:00', status: 'current' },
    { id: '4', patientName: 'Robert Mirro', time: '09:30', status: 'upcoming' },
    { id: '5', patientName: 'Chester Bennington', time: '10:00', status: 'upcoming' },
  ]

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
      
      <div className="space-y-2">
        {appointments.map((appointment) => (
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
    </div>
  )
}

export default Appointments