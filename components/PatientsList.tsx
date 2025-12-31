'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useVideoCall } from '../contexts/VideoCallContext'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { useDoctor } from '@/contexts/DoctorContext'
import { useNurse } from '@/contexts/NurseContext'

const PatientsList = () => {
  const { startVideoCall } = useVideoCall()
  const router = useRouter()
  const [allPatients, setAllPatients] = useState<any[]>([])
  const { doctor } = useDoctor()
  const { nurse } = useNurse()
  
  const getPatientUrl = (patientId: string) => {
    if (nurse) {
      return `/nurse-portal/patients/${patientId}`
    } else {
      return `/doctor/patients/${patientId}`
    }
  }
  
  const getNewVisitUrl = (patientId: string) => {
    if (nurse) {
      return `/nurse-portal/patients/${patientId}/new-visit`
    } else {
      return `/doctor/patients/${patientId}/new-visit`
    }
  }

  useEffect(() => {
    loadAllPatients()
    
    // Refresh patient list when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAllPatients()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const loadAllPatients = () => {
    const savedPatients = PatientDataManager.getAllPatients()
    setAllPatients(savedPatients)
  }

  const handleVideoCall = (patientEmail: string, patientName: string) => {
    startVideoCall(patientName, patientEmail)
  }

  const handleAddPatient = () => {
    // Generate new patient ID
    const newPatientId = Date.now().toString()
    router.push(getNewVisitUrl(newPatientId))
  }

  return (
    <div className="col-span-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Patients List</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage and view all patient information</p>
        </div>
        <button 
          onClick={handleAddPatient}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Patient
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPatients.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">person_add</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No patients yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Add your first patient to get started</p>
            <button 
              onClick={handleAddPatient}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add First Patient
            </button>
          </div>
        ) : (
          allPatients.map((patient, index) => (
            <Link 
              key={index}
              href={getPatientUrl(patient.id)}
              className="block bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start gap-4 mb-4">
                {patient.image ? (
                  <img 
                    alt={patient.name} 
                    className="w-12 h-12 rounded-full object-cover" 
                    src={patient.image}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm font-semibold">
                    {(patient.name || 'P').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">{patient.name}</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{patient.email}</p>
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleVideoCall(patient.email, patient.name)
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white p-1 rounded flex items-center justify-center transition-colors"
                      title="Start Video Call"
                    >
                      <span className="material-symbols-outlined text-sm">videocam</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Gender, Age</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {patient.gender || 'Not provided'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Physician</span>
                  <span className="font-medium text-gray-900 dark:text-white">{patient.physician || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Last Visit</span>
                  <span className="font-medium text-gray-900 dark:text-white">{patient.lastConsultation || 'Not recorded'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Next Appointment</span>
                  <span className="font-medium text-gray-900 dark:text-white">{patient.appointment || 'Not scheduled'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="text-primary hover:text-primary/80 transition-colors">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

export default PatientsList
