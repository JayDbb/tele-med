'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import { useVideoCall } from '../contexts/VideoCallContext'
import { getPatients } from '@/lib/api'
import { usePatientRoutes } from '@/lib/usePatientRoutes'
import type { Patient } from '@/lib/types'
import AssignPatientModal from './AssignPatientModal'

const PatientsList = () => {
  const { startVideoCall } = useVideoCall()
  const router = useRouter()
  const pathname = usePathname()
  const [allPatients, setAllPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null)
  const { getPatientUrl, getNewVisitUrl } = usePatientRoutes()

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

  const loadAllPatients = async () => {
    try {
      setLoading(true)
      setError(null)
      const patients = await getPatients()

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
      const patientsWithPhysicians = await Promise.all(
        patients.map(async (patient: Patient) => {
          const physicianName = await fetchClinicianName(patient.clinician_id)

          return {
            id: patient.id,
            name: patient.full_name || 'Unknown',
            email: patient.email || '',
            dob: patient.dob || '',
            phone: patient.phone || '',
            gender: patient.sex_at_birth || patient.gender_identity || 'Not provided',
            address: patient.address || '',
            allergies: patient.allergies || '',
            physician: physicianName,
            lastConsultation: '', // Will be populated from visits if needed
            appointment: '', // Will be populated from appointments if needed
            status: 'Active',
            statusColor: 'green',
            doctorId: patient.clinician_id || '',
            createdAt: patient.created_at || new Date().toISOString(),
            updatedAt: patient.created_at || new Date().toISOString(),
            image: undefined, // Can be added later if you store patient images
          }
        })
      )

      setAllPatients(patientsWithPhysicians)
    } catch (err: any) {
      console.error('Error loading patients:', err)
      setError(err?.message || 'Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoCall = async (patientEmail: string, patientName: string, patientId: string) => {
    await startVideoCall(patientName, patientEmail, patientId)
  }

  const handleAssignClick = (e: React.MouseEvent, patient: any) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedPatient({ id: patient.id, name: patient.name })
    setAssignModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
        <button
          onClick={loadAllPatients}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Patients List</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage and view all patient information</p>
        </div>
        <Link
          href="/patients/create"
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Patient
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPatients.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">person_add</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No patients found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start by adding a new patient.</p>
            <Link
              href="/patients/create"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add First Patient
            </Link>
          </div>
        ) : (
          allPatients.map((patient) => (
            <div
              key={patient.id}
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
                  <Link href={getPatientUrl(patient.id)}>
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate hover:text-primary transition-colors">{patient.name}</h4>
                  </Link>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{patient.email}</p>
                    <button
                      onClick={async (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        await handleVideoCall(patient.email, patient.name, patient.id)
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
                  <span className="text-gray-500 dark:text-gray-400">Gender</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {patient.gender || 'Not provided'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">DOB</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {patient.dob || 'Not provided'}
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
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Link
                    href={`${getPatientUrl(patient.id)}/schedule`}
                    className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors"
                    title="Assign To Doctor"
                  >
                    <span className="material-symbols-outlined text-sm">medical_services</span>
                    Assign To Doctor
                  </Link>

                </div>
                <Link href={getPatientUrl(patient.id)} className="text-primary hover:text-primary/80 transition-colors">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {assignModalOpen && selectedPatient && (
        <AssignPatientModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false)
            setSelectedPatient(null)
          }}
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
          onSuccess={() => {
            loadAllPatients()
          }}
        />
      )}
    </div>
  )
}

export default PatientsList
