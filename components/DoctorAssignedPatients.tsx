'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDoctor } from '@/contexts/DoctorContext'
import { useVideoCall } from '@/contexts/VideoCallContext'
import { getAllVisits } from '@/lib/api'
import type { Visit } from '@/lib/types'

interface VisitWithPatient extends Visit {
  patients?: {
    full_name: string
    email: string
    dob: string
    id: string
  } | null
}

interface AppointmentRecord {
  id: string
  patientId: string
  patientName: string
  scheduledFor?: string
  status?: string
  doctorId?: string
  doctorName?: string
  doctorDisplayName?: string
  doctorEmail?: string
  contactEmail?: string
  contactPhone?: string
  deliveryMethod?: 'email' | 'text'
  location?: string
  updatedAt?: string
}

const DoctorAssignedPatients = () => {
  const { doctor } = useDoctor()
  const { startVideoCall, endVideoCall } = useVideoCall()
  const router = useRouter()
  const [visits, setVisits] = useState<VisitWithPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!doctor) {
      setLoading(false)
      return
    }
    loadVisits()
  }, [doctor])

  const loadVisits = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllVisits()
      // The API already filters visits for the current doctor
      setVisits(data.visits || [])
    } catch (err: any) {
      console.error('Error loading visits:', err)
      setError(err?.message || 'Failed to load visits')
    } finally {
      setLoading(false)
    }
  }

  const assignedAppointments = useMemo(() => {
    if (!doctor) return []

    return visits
      .filter((visit) => {
        // Filter out completed/finalized visits
        const status = (visit.status || '').toLowerCase()
        return status !== 'completed' && status !== 'finalized'
      })
      .map((visit) => {
        // Map visit to AppointmentRecord format
        // The API returns visits with nested patient data as `patients` (plural)
        const patient = visit.patients
        return {
          id: visit.id,
          patientId: visit.patient_id,
          patientName: patient?.full_name || 'Unknown Patient',
          scheduledFor: visit.created_at,
          status: visit.status || 'draft',
          doctorId: visit.clinician_id || doctor.id,
          contactEmail: patient?.email || '',
          contactPhone: undefined, // Phone not in visit/patient data from API
          deliveryMethod: 'email' as const,
          location: 'Virtual visit',
          updatedAt: visit.created_at
        }
      })
      .sort((a, b) => {
        const aTime = a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0
        const bTime = b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0
        return aTime - bTime
      })
  }, [visits, doctor])

  const formatScheduledTime = (value?: string) => {
    if (!value) return 'Immediate'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Immediate'
    return date.toLocaleString()
  }

  const handleMarkCompleted = (appointment: AppointmentRecord) => {
    // Navigate to patient's visit history page where they can sign the note to complete
    endVideoCall()
    router.push(`/patients/${appointment.patientId}/history`)
  }

  const getStatusColor = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'completed' || s === 'finalized') {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    }
    if (s === 'waiting') {
      return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    }
    if (s === 'in-progress') {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    }
    return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned Patients</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Patients scheduled with you</p>
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {assignedAppointments.length} Active
        </span>
      </div>

      {!doctor ? (
        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 py-10">
          Sign in as a doctor to view assignments.
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 py-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
          Loading visits...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center text-sm text-red-600 dark:text-red-400 py-10">
          {error}
        </div>
      ) : assignedAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-sm text-gray-500 dark:text-gray-400 py-10 text-center">
          <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600 mb-2">event_available</span>
          No patients assigned yet.
        </div>
      ) : (
        <div className="space-y-3">
          {assignedAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col gap-3 hover:border-primary/50 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {appointment.patientName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatScheduledTime(appointment.scheduledFor)}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${getStatusColor(appointment.status)}`}>
                  {appointment.status || 'Scheduled'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                {appointment.contactEmail && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                    {appointment.contactEmail}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {appointment.location || 'Virtual visit'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/patients/${appointment.patientId}`}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Open Profile
                </Link>
                <button
                  onClick={() => startVideoCall(appointment.patientName, appointment.contactEmail || '')}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90"
                >
                  Join Video Call
                </button>
                <button
                  onClick={() => handleMarkCompleted(appointment)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DoctorAssignedPatients
