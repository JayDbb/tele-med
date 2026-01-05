'use client'

import { useState, useEffect } from 'react'
import { getPatients } from '@/lib/api'
import type { Patient } from '@/lib/types'
import { useVideoCall } from '@/contexts/VideoCallContext'

const PatientCards = () => {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { startVideoCall } = useVideoCall()

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const apiPatients = await getPatients()

      // Get auth token for API calls
      const { supabaseBrowser } = await import('@/lib/supabaseBrowser')
      const supabase = supabaseBrowser()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      // Helper function to fetch clinician name
      const fetchClinicianName = async (clinicianId: string | null | undefined): Promise<string> => {
        if (!clinicianId || !token) return 'Unassigned'
        
        try {
          const clinicianRes = await fetch(`/api/clinicians/${clinicianId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (clinicianRes.ok) {
            const clinicianData = await clinicianRes.json()
            return clinicianData.full_name || clinicianData.email?.split('@')[0] || 'Unknown Clinician'
          }
        } catch (clinicianError) {
          console.warn('Could not fetch clinician info:', clinicianError)
        }
        return 'Unassigned'
      }

      // Fetch clinician names for all patients in parallel
      const mappedPatients = await Promise.all(
        apiPatients.map(async (patient: Patient) => {
          const physicianName = await fetchClinicianName(patient.clinician_id)
          
          return {
            id: patient.id,
            name: patient.full_name || 'Unknown',
            email: patient.email || '',
            dob: patient.dob || '',
            phone: patient.phone || '',
            gender: patient.sex_at_birth || patient.gender_identity || 'Not provided',
            physician: physicianName,
            lastConsultation: '',
            appointment: '',
            image: undefined,
          }
        })
      )
      
      setPatients(mappedPatients)
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 pb-6">
        <div className="col-span-full flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 pb-6">
      {patients.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">person_add</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No patients yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Add your first patient to get started</p>
        </div>
      ) : (
        patients.map((patient, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-blue-900 group"
        >
          <div className="flex items-start gap-4 mb-6">
            {patient.image ? (
              <img 
                alt={patient.name} 
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900" 
                src={patient.image}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm font-semibold ring-2 ring-blue-100 dark:ring-blue-900">
                {(patient.name || 'P').slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 dark:text-white truncate">{patient.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{patient.email}</p>
              <div className="flex gap-2 mt-2">
                <button className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-800/40 transition">
                  <span className="material-icons-outlined text-[12px] mr-1">call</span> Phone
                </button>
                <button 
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (patient.email) {
                      await startVideoCall(patient.name, patient.email, patient.id)
                    }
                  }}
                  className="text-[10px] font-medium text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded flex items-center hover:bg-green-100 dark:hover:bg-green-800/40 transition"
                  title="Start Video Call"
                >
                  <span className="material-icons-outlined text-[12px] mr-1">videocam</span> Video Call
                </button>
                <button className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-800/40 transition">
                  <span className="material-icons-outlined text-[12px] mr-1">monitor_heart</span> Live Vital
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs mb-4">
            <div className="text-gray-500 dark:text-gray-400">Gender, Age</div>
            <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.gender}</div>
            <div className="text-gray-500 dark:text-gray-400">Physician</div>
            <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.physician}</div>
            <div className="text-gray-500 dark:text-gray-400">Last Consultation</div>
            <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.lastConsultation}</div>
            <div className="text-gray-500 dark:text-gray-400">Appointments</div>
            <div className="text-right font-medium text-gray-800 dark:text-gray-200">{patient.appointment}</div>
          </div>
          
          <div className="flex items-center justify-end mt-2 pt-4 border-t border-gray-100 dark:border-slate-700">
            <button className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-700 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors">
              <span className="material-icons-outlined text-sm">arrow_downward</span>
            </button>
          </div>
        </div>
        ))
      )}
    </section>
  )
}

export default PatientCards
