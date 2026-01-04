'use client'

import { useState, useEffect } from 'react'

interface Doctor {
  id: string
  email: string
  name: string
  portalName: string
  portalId: string
  specialty: string
  status: 'available' | 'busy' | 'unavailable'
  next: string | null
}

interface AssignDoctorModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName?: string
  currentDoctorId?: string | null
  onSuccess?: () => void
}

export default function AssignDoctorModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  currentDoctorId,
  onSuccess,
}: AssignDoctorModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(currentDoctorId || '')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadDoctors()
      setSelectedDoctorId(currentDoctorId || '')
    } else {
      setSearchQuery('')
      setError(null)
      setSuccess(false)
    }
  }, [isOpen, currentDoctorId])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = (await import('@/lib/supabaseBrowser')).supabaseBrowser()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const res = await fetch('/api/doctors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        cache: 'no-store',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to load doctors' }))
        throw new Error(errorData.error || `Failed to load doctors: ${res.status} ${res.statusText}`)
      }

      const doctorsData = await res.json()
      
      // Format doctor names to include "Dr." prefix if not already present
      const formattedDoctors = doctorsData.map((doctor: any) => ({
        ...doctor,
        name: doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`,
        portalName: doctor.portalName || doctor.name,
      }))
      
      setDoctors(formattedDoctors)
    } catch (err: any) {
      console.error('Error loading doctors:', err)
      setError(err?.message || 'Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedDoctorId) {
      setError('Please select a doctor to assign')
      return
    }

    try {
      setAssigning(true)
      setError(null)

      const supabase = (await import('@/lib/supabaseBrowser')).supabaseBrowser()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const selectedDoctor = doctors.find(d => d.id === selectedDoctorId)
      if (!selectedDoctor) {
        throw new Error('Selected doctor not found')
      }

      // Update patient's clinician_id
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          clinician_id: selectedDoctorId,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to assign doctor' }))
        throw new Error(errorData.error || `Failed to assign doctor: ${res.status} ${res.statusText}`)
      }

      setSuccess(true)
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        }
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error('Error assigning doctor:', err)
      setError(err?.message || 'Failed to assign doctor')
    } finally {
      setAssigning(false)
    }
  }

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <span className="material-symbols-outlined text-xl">person_add</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Assign Doctor
              </h3>
              {patientName && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {patientName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
              close
            </span>
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Doctor Assigned Successfully!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The patient has been assigned to the selected doctor.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search for Doctor
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or specialty..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error && !doctors.length ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No doctors found
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {filteredDoctors.map((doctor) => (
                    <label
                      key={doctor.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedDoctorId === doctor.id
                          ? 'bg-primary/5 border-l-4 border-primary'
                          : 'border-l-4 border-transparent'
                      }`}
                    >
                      <input
                        type="radio"
                        name="doctor"
                        value={doctor.id}
                        checked={selectedDoctorId === doctor.id}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {doctor.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {doctor.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {doctor.specialty}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {error && doctors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedDoctorId || assigning}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    <span>Assign Doctor</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

