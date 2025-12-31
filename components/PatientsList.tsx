'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getPatients } from '../lib/api'
import type { Patient } from '../lib/types'
import { useAuthGuard } from '../lib/useAuthGuard'

const PatientsList = () => {
  const { ready } = useAuthGuard()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ready) return
      ; (async () => {
        try {
          const data = await getPatients()
          setPatients(data)
        } catch (err) {
          setError((err as Error).message)
        } finally {
          setLoading(false)
        }
      })()
  }, [ready])

  const startVideoCall = async (patientEmail: string, patientName: string, patientId: string) => {
    try {
      const response = await fetch('/api/video-call/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientEmail,
          patientName,
          patientId,
          doctorName: 'Dr. Alex Robin'
        })
      })

      const data = await response.json()

      if (data.success) {
        window.open(data.callUrl, '_blank')
      } else {
        alert('Failed to start video call')
      }
    } catch (error) {
      console.error('Error starting video call:', error)
      alert('Error starting video call')
    }
  }

  // Helper function to calculate age from date of birth
  const calculateAge = (dob: string | null | undefined): string => {
    if (!dob) return 'N/A'
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return `${age}y`
  }

  // Helper function to format gender and age
  const formatGenderAge = (patient: Patient): string => {
    const gender = patient.sex_at_birth || 'N/A'
    const age = calculateAge(patient.dob)
    return `${gender}, ${age}`
  }

  // Helper function to get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="col-span-12">
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading patients...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="col-span-12">
        <div className="flex justify-center items-center py-12">
          <p className="text-red-500">Error loading patients: {error}</p>
        </div>
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="col-span-12">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No patients found</p>
            <Link
              href="/patients/new"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Your First Patient
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="col-span-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Patients List</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage and view all patient information</p>
        </div>
        <Link
          href="/patients/new"
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Patient
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <Link
            key={patient.id}
            href={`/patients/${patient.id}`}
            className="block bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {getInitials(patient.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">{patient.full_name}</h4>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {patient.email || patient.phone || 'No contact info'}
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      startVideoCall(patient.email || '', patient.full_name, patient.id)
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
                <span className="font-medium text-gray-900 dark:text-white">{formatGenderAge(patient)}</span>
              </div>
              {patient.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Phone</span>
                  <span className="font-medium text-gray-900 dark:text-white">{patient.phone}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Address</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                    {patient.address}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              {patient.is_shared && (
                <span className="text-xs font-medium px-3 py-1 rounded-full text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300">
                  Shared
                </span>
              )}
              <button className="text-primary hover:text-primary/80 transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default PatientsList