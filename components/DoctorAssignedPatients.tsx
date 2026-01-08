'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { useDoctor } from '@/contexts/DoctorContext'
import { useVideoCall } from '@/contexts/VideoCallContext'

interface AppointmentRecord {
  id: string
  patientId: string
  patientName: string
  scheduledFor?: string
  status?: string
  type?: string
  visitMode?: string
  priority?: string
  createdAt?: string
  waitingStatus?: string
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
    window.addEventListener('patient-data-updated', handleStorageChange as EventListener)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('patient-data-updated', handleStorageChange as EventListener)
    }
  }, [])

  const isUnassignedAppointment = (appointment: AppointmentRecord) => {
    const doctorId = `${appointment.doctorId ?? ''}`.trim()
    const doctorEmail = `${appointment.doctorEmail ?? ''}`.trim()
    const doctorName = `${appointment.doctorName || appointment.doctorDisplayName || ''}`.trim().toLowerCase()
    return !doctorId && !doctorEmail && (!doctorName || doctorName === 'waiting pool' || doctorName === 'unassigned')
  }

  const waitingPoolAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => isUnassignedAppointment(appointment))
      .filter((appointment) => `${appointment.status || ''}`.toLowerCase() !== 'completed')
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return aTime - bTime
      })
  }, [appointments])

  const assignedAppointments = useMemo(() => {
    if (!doctor) return []
    const normalizedName = doctor.name.toLowerCase()
    return appointments
      .filter((appointment) => !isUnassignedAppointment(appointment))
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

  const formatWaitTime = (value?: string) => {
    if (!value) return 'Waiting'
    const start = new Date(value).getTime()
    if (Number.isNaN(start)) return 'Waiting'
    const minutes = Math.max(0, Math.floor((Date.now() - start) / 60000))
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainder = minutes % 60
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`
  }

  const getWaitClass = (value?: string) => {
    if (!value) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
    const start = new Date(value).getTime()
    if (Number.isNaN(start)) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
    const minutes = Math.max(0, Math.floor((Date.now() - start) / 60000))
    if (minutes < 15) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
    if (minutes < 30) return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
    return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
  }

  const getPriorityBadge = (appointment: AppointmentRecord) => {
    const raw = `${appointment.priority || ''}`.toLowerCase()
    if (!raw) return null
    if (raw === 'mild') return { label: 'Mild', style: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' }
    if (raw === 'urgent') return { label: 'Urgent', style: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200' }
    if (raw === 'critical') return { label: 'Critical', style: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200' }
    return { label: raw, style: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' }
  }

  const resolveScheduledStatus = (appointment: AppointmentRecord) => {
    const typeValue = `${appointment.type || ''}`.toLowerCase()
    if (typeValue === 'scheduled') return true
    if (typeValue === 'immediate') return false
    if (!appointment.scheduledFor) return false
    const scheduledAt = new Date(appointment.scheduledFor).getTime()
    return !Number.isNaN(scheduledAt) && scheduledAt > Date.now()
  }

  const isVirtualVisit = (appointment: AppointmentRecord) => {
    const mode = `${appointment.visitMode || ''}`.toLowerCase()
    const status = `${appointment.status || ''}`.toLowerCase()
    const location = `${appointment.location || ''}`.toLowerCase()
    return (
      mode.includes('virtual')
      || mode.includes('video')
      || status.includes('virtual')
      || location.includes('virtual')
    )
  }

  const claimAppointment = (appointment: AppointmentRecord) => {
    if (!doctor) return { linkedVisitId: '' }
    const patientExists = PatientDataManager.getPatient(appointment.patientId)
    if (!patientExists) return { linkedVisitId: '' }
    if (appointment.doctorId && appointment.doctorId !== doctor.id) return { linkedVisitId: '' }

    const appointmentsList = PatientDataManager.getPatientSectionList<AppointmentRecord>(
      appointment.patientId,
      'appointments'
    )
    const visitsList = PatientDataManager.getPatientSectionList<any>(
      appointment.patientId,
      'visits'
    )
    const linkedVisit = visitsList.find((visit) => visit?.appointmentId === appointment.id)
      || visitsList.find((visit) => `${visit?.status || ''}`.toLowerCase() === 'draft')
    let linkedVisitId = linkedVisit?.id || ''
    if (!linkedVisitId) {
      linkedVisitId = `visit-${Date.now()}`
      const nowIso = new Date().toISOString()
      const draftVisit = {
        id: linkedVisitId,
        recordedAt: nowIso,
        providerId: doctor.id,
        providerName: doctor.name,
        status: 'Draft',
        appointmentId: appointment.id,
        scheduledFor: appointment.scheduledFor || '',
        scheduledProvider: appointment.doctorDisplayName || appointment.doctorName || '',
        visitMode: appointment.visitMode || '',
        appointmentLocation: appointment.location || '',
        appointmentStatus: appointment.status || '',
        priority: appointment.priority || ''
      }
      PatientDataManager.savePatientSectionList(
        appointment.patientId,
        'visits',
        [draftVisit, ...visitsList],
        doctor.id
      )
    }
    const isScheduled = resolveScheduledStatus(appointment)
    const updatedAppointments = appointmentsList.map((item) =>
      item.id === appointment.id
        ? {
            ...item,
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorDisplayName: doctor.name,
            doctorEmail: doctor.email || '',
            status: isScheduled ? 'scheduled' : 'claimed',
            linkedVisitId,
            updatedAt: new Date().toISOString()
          }
        : item
    )

    PatientDataManager.savePatientSectionList(
      appointment.patientId,
      'appointments',
      updatedAppointments,
      doctor.id
    )

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === appointment.id
          ? {
              ...item,
              doctorId: doctor.id,
              doctorName: doctor.name,
              doctorDisplayName: doctor.name,
              doctorEmail: doctor.email || '',
              status: isScheduled ? 'scheduled' : 'claimed',
              linkedVisitId,
              updatedAt: new Date().toISOString()
            }
          : item
      )
    )

    return { linkedVisitId }
  }

  const handleClaimAppointment = (appointment: AppointmentRecord) => {
    const { linkedVisitId } = claimAppointment(appointment)

    if (linkedVisitId) {
      router.push(`/doctor/patients/${appointment.patientId}/history?visit=${linkedVisitId}&appointment=${appointment.id}`)
    } else {
      router.push(`/doctor/patients/${appointment.patientId}/history?appointment=${appointment.id}`)
    }
  }

  const handleJoinVideoCall = (appointment: AppointmentRecord) => {
    const { linkedVisitId } = claimAppointment(appointment)
    if (linkedVisitId) {
      router.push(`/doctor/patients/${appointment.patientId}/history?visit=${linkedVisitId}&appointment=${appointment.id}`)
    } else {
      router.push(`/doctor/patients/${appointment.patientId}/history?appointment=${appointment.id}`)
    }
    startVideoCall(appointment.patientName, appointment.contactEmail || '', {
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      visitId: linkedVisitId,
      doctorId: doctor?.id
    })
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Waiting Pool</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Unclaimed patients ready to be picked up.</p>
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {waitingPoolAppointments.length} Waiting
        </span>
      </div>

      {!doctor ? (
        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 py-10">
          Sign in as a doctor to view assignments.
        </div>
      ) : waitingPoolAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
          <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600 mb-2">event_available</span>
          No patients waiting right now.
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {waitingPoolAppointments.map((appointment) => (
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
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                  {appointment.status || 'Waiting'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                {(() => {
                  const badge = getPriorityBadge(appointment)
                  if (!badge) return null
                  return (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${badge.style}`}>
                      {badge.label}
                    </span>
                  )
                })()}
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${getWaitClass(appointment.createdAt)}`}>
                  {formatWaitTime(appointment.createdAt)} waiting
                </span>
                {isVirtualVisit(appointment) && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                    {appointment.deliveryMethod === 'text' ? appointment.contactPhone || 'Text delivery' : appointment.contactEmail || 'Email delivery'}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {appointment.location || 'Virtual visit'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {isVirtualVisit(appointment) && (
                  <button
                    onClick={() => handleJoinVideoCall(appointment)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Join Video Call
                  </button>
                )}
                <button
                  onClick={() => handleClaimAppointment(appointment)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90"
                >
                  Claim Visit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {doctor && assignedAppointments.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          You have {assignedAppointments.length} claimed visit{assignedAppointments.length === 1 ? '' : 's'}.
        </div>
      )}
    </div>
  )
}

export default DoctorAssignedPatients
