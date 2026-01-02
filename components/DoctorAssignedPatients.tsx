'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { useDoctor } from '@/contexts/DoctorContext'
import { useVideoCall } from '@/contexts/VideoCallContext'

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
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([])

  useEffect(() => {
    const loadAppointments = () => {
      const allPatients = PatientDataManager.getAllPatients()
      const nextAppointments: AppointmentRecord[] = []
      allPatients.forEach((patient) => {
        const patientAppointments = PatientDataManager.getPatientSectionList<AppointmentRecord>(
          patient.id,
          'appointments'
        )
        patientAppointments.forEach((appointment) => {
          nextAppointments.push({
            ...appointment,
            patientId: appointment.patientId || patient.id,
            patientName: appointment.patientName || patient.name || 'Unnamed Patient',
            contactEmail: appointment.contactEmail || patient.email || '',
            contactPhone: appointment.contactPhone || patient.phone || ''
          })
        })
      })
      setAppointments(nextAppointments)
    }

    loadAppointments()
    const handleStorageChange = () => loadAppointments()
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const assignedAppointments = useMemo(() => {
    if (!doctor) return []
    const normalizedName = doctor.name.toLowerCase()
    return appointments
      .filter((appointment) => {
        const doctorName = `${appointment.doctorName || appointment.doctorDisplayName || ''}`.toLowerCase()
        return appointment.doctorId === doctor.id
          || appointment.doctorEmail === doctor.email
          || (doctorName && (doctorName.includes(normalizedName) || normalizedName.includes(doctorName)))
      })
      .filter((appointment) => `${appointment.status || ''}`.toLowerCase() !== 'completed')
      .sort((a, b) => {
        const aTime = a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0
        const bTime = b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0
        return aTime - bTime
      })
  }, [appointments, doctor])

  const formatScheduledTime = (value?: string) => {
    if (!value) return 'Immediate'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Immediate'
    return date.toLocaleString()
  }

  const handleMarkCompleted = (appointment: AppointmentRecord) => {
    const patient = PatientDataManager.getPatient(appointment.patientId)
    if (!patient) return

    const appointmentsList = PatientDataManager.getPatientSectionList<AppointmentRecord>(
      appointment.patientId,
      'appointments'
    )
    const updatedAppointments = appointmentsList.map((item) =>
      item.id === appointment.id
        ? { ...item, status: 'completed', updatedAt: new Date().toISOString() }
        : item
    )
    PatientDataManager.savePatientSectionList(appointment.patientId, 'appointments', updatedAppointments, doctor?.id || 'system')

    PatientDataManager.savePatient(
      {
        ...patient,
        status: 'Completed',
        appointment: 'Completed',
        updatedAt: new Date().toISOString()
      },
      'update',
      doctor?.id || 'system'
    )

    endVideoCall()

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === appointment.id
          ? { ...item, status: 'completed', updatedAt: new Date().toISOString() }
          : item
      )
    )
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
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {appointment.status || 'Scheduled'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  {appointment.deliveryMethod === 'text' ? appointment.contactPhone || 'Text delivery' : appointment.contactEmail || 'Email delivery'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {appointment.location || 'Virtual visit'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/doctor/patients/${appointment.patientId}`}
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
