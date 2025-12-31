'use client'

import { useVideoCall } from '../contexts/VideoCallContext'

const AppointmentDetail = () => {
  const { startVideoCall } = useVideoCall()
  
  // Show empty state when no appointment is selected
  const hasAppointment = false // This would be managed by state/context in real app
  
  if (!hasAppointment) {
    return (
      <div className="col-span-2 md:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-4">event_note</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No appointment selected</h3>
          <p className="text-gray-500 dark:text-gray-400">Select an appointment to view details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="col-span-2 md:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-4">event_note</span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No appointment selected</h3>
        <p className="text-gray-500 dark:text-gray-400">Select an appointment to view details</p>
      </div>
    </div>
  )
}

export default AppointmentDetail