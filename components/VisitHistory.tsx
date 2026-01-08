'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { useDoctor } from '@/contexts/DoctorContext'

interface VisitHistoryProps {
  patientId: string
}

const VisitHistory = ({ patientId }: VisitHistoryProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isNursePortal = pathname.startsWith('/nurse-portal')
  const isDoctorPortal = pathname.startsWith('/doctor')
  const { doctor } = useDoctor()
  const fallbackDoctor = PatientDataManager.getCurrentUser()
  const resolvedDoctor = doctor || fallbackDoctor || null
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const transcriptionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [draftChiefComplaint, setDraftChiefComplaint] = useState('')
  const [draftHpi, setDraftHpi] = useState('')
  const [draftAssessment, setDraftAssessment] = useState('')
  const [draftPlan, setDraftPlan] = useState('')
  const [expandedSections, setExpandedSections] = useState({
    subjective: true,
    objective: true,
    assessmentPlan: true,
    diabetes: false,
    medications: false,
    vaccines: false,
    familyHistory: false,
    riskFlags: false,
    surgicalHistory: false,
    pastMedicalHistory: false,
    orders: false
  })
  const [visitsData, setVisitsData] = useState<any[]>(
    () => PatientDataManager.getPatientSectionList(patientId, 'visits')
  )

  useEffect(() => {
    setVisitsData(PatientDataManager.getPatientSectionList(patientId, 'visits'))
  }, [patientId])

  useEffect(() => {
    const visitFromQuery = searchParams.get('visit')
    const appointmentFromQuery = searchParams.get('appointment')
    if (visitFromQuery) {
      const exists = visitsData.some((visit) => visit?.id === visitFromQuery)
      if (exists) {
        setSelectedVisit(visitFromQuery)
        return
      }
    }
    if (appointmentFromQuery) {
      const matchingVisit = visitsData.find((visit) => visit?.appointmentId === appointmentFromQuery)
      if (matchingVisit) {
        setSelectedVisit(matchingVisit.id)
      }
    }
  }, [searchParams, visitsData])

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return 'Not recorded'
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return 'Not recorded'
    return date.toLocaleDateString()
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const visits = useMemo(() => visitsData.map((visit: any) => ({
    id: visit.id,
    date: formatDate(visit.recordedAt),
    time: formatTime(visit.recordedAt),
    type: visit.type || 'Visit',
    provider: visit.providerName || 'Unknown provider',
    chiefComplaint: visit.subjective?.chiefComplaint || 'No chief complaint recorded',
    hpi: visit.subjective?.hpi || 'No HPI recorded',
    assessmentPlan: visit.assessmentPlan?.assessment || visit.assessmentPlan?.plan || 'No assessment recorded',
    vitals: visit.objective || {},
    signature: {
      signedBy: visit.signedBy || 'Unsigned',
      signedDate: visit.signedAt || '',
      status: visit.status || 'Draft',
      cosignRequired: false
    }
  })), [visitsData])

  const selectedVisitData = visits.find(v => v.id === selectedVisit)
  const selectedVisitRaw = visitsData.find((visit) => visit.id === selectedVisit)
  const isDraftVisit = `${selectedVisitRaw?.status || ''}`.toLowerCase() === 'draft'
  const isCompletedVisit = `${selectedVisitRaw?.status || ''}`.toLowerCase() === 'completed'
  const selectedAppointment = useMemo(() => {
    if (!selectedVisitRaw?.appointmentId) return null
    const appointments = PatientDataManager.getPatientSectionList<any>(patientId, 'appointments')
    return appointments.find((appointment) => appointment?.id === selectedVisitRaw.appointmentId) || null
  }, [patientId, selectedVisitRaw])
  const appointmentFromQuery = useMemo(() => searchParams.get('appointment'), [searchParams])
  const appointmentByQuery = useMemo(() => {
    if (!appointmentFromQuery) return null
    const appointments = PatientDataManager.getPatientSectionList<any>(patientId, 'appointments')
    return appointments.find((appointment) => appointment?.id === appointmentFromQuery) || null
  }, [patientId, appointmentFromQuery])
  const activeAppointment = selectedAppointment || appointmentByQuery
  const activeVisit = selectedVisitRaw || (activeAppointment
    ? visitsData.find((visit) => visit?.appointmentId === activeAppointment.id) || null
    : null)
  const canAssignToMe = Boolean(
    isDoctorPortal
    && resolvedDoctor
    && activeAppointment
    && !isCompletedVisit
    && (!activeAppointment.doctorId || activeAppointment.doctorId === resolvedDoctor.id)
  )
  const canReturnToWaitingRoom = Boolean(
    isDoctorPortal
    && resolvedDoctor
    && activeAppointment
    && !isCompletedVisit
    && activeAppointment.doctorId === resolvedDoctor.id
  )

  useEffect(() => {
    if (!selectedVisitRaw) return
    setDraftChiefComplaint(selectedVisitRaw?.subjective?.chiefComplaint || '')
    setDraftHpi(selectedVisitRaw?.subjective?.hpi || '')
    setDraftAssessment(selectedVisitRaw?.assessmentPlan?.assessment || '')
    setDraftPlan(selectedVisitRaw?.assessmentPlan?.plan || '')
    setIsEditing(false)
  }, [selectedVisitRaw?.id])

  useEffect(() => {
    return () => {
      if (transcriptionTimerRef.current) {
        clearTimeout(transcriptionTimerRef.current)
        transcriptionTimerRef.current = null
      }
    }
  }, [])

  const handleAssignToMe = () => {
    if (!resolvedDoctor || !activeAppointment) return
    const appointments = PatientDataManager.getPatientSectionList<any>(patientId, 'appointments')
    const updatedAppointments = appointments.map((appointment) =>
      appointment.id === activeAppointment.id
        ? {
            ...appointment,
            status: 'in-progress',
            claimConfirmedAt: new Date().toISOString(),
            claimConfirmedBy: resolvedDoctor.name,
            claimConfirmedById: resolvedDoctor.id,
            doctorId: resolvedDoctor.id,
            doctorName: resolvedDoctor.name,
            doctorDisplayName: resolvedDoctor.name,
            doctorEmail: resolvedDoctor.email || '',
            updatedAt: new Date().toISOString()
          }
        : appointment
    )
    PatientDataManager.savePatientSectionList(patientId, 'appointments', updatedAppointments, resolvedDoctor.id)

    const visits = PatientDataManager.getPatientSectionList<any>(patientId, 'visits')
    const updatedVisits = visits.map((visit) =>
      visit.id === activeVisit?.id
        ? { ...visit, status: 'In Progress' }
        : visit
    )
    PatientDataManager.savePatientSectionList(patientId, 'visits', updatedVisits, resolvedDoctor.id)

    const patient = PatientDataManager.getPatient(patientId)
    if (patient) {
      PatientDataManager.savePatient(
        {
          ...patient,
          physician: resolvedDoctor.name,
          doctorId: resolvedDoctor.id,
          status: 'In Progress',
          updatedAt: new Date().toISOString()
        },
        'update',
        resolvedDoctor.id
      )
    }
  }

  const handleReturnToWaitingRoom = () => {
    if (!resolvedDoctor || !activeAppointment) return
    const waitingStatus = activeAppointment.waitingStatus || 'waiting'
    const appointments = PatientDataManager.getPatientSectionList<any>(patientId, 'appointments')
    const updatedAppointments = appointments.map((appointment) =>
      appointment.id === activeAppointment.id
        ? {
            ...appointment,
            status: waitingStatus,
            claimConfirmedAt: '',
            claimConfirmedBy: '',
            claimConfirmedById: '',
            doctorId: '',
            doctorName: 'Waiting Pool',
            doctorDisplayName: 'Waiting Pool',
            doctorEmail: '',
            updatedAt: new Date().toISOString()
          }
        : appointment
    )
    PatientDataManager.savePatientSectionList(patientId, 'appointments', updatedAppointments, resolvedDoctor.id)

    const visits = PatientDataManager.getPatientSectionList<any>(patientId, 'visits')
    const updatedVisits = visits.map((visit) =>
      visit.id === activeVisit?.id
        ? { ...visit, status: 'Draft' }
        : visit
    )
    PatientDataManager.savePatientSectionList(patientId, 'visits', updatedVisits, resolvedDoctor.id)

    const patient = PatientDataManager.getPatient(patientId)
    if (patient) {
      PatientDataManager.savePatient(
        {
          ...patient,
          physician: 'Waiting Pool',
          doctorId: '',
          status: waitingStatus,
          appointment: waitingStatus,
          updatedAt: new Date().toISOString()
        },
        'update',
        resolvedDoctor.id
      )
    }
  }

  const handleCompleteVisit = () => {
    if (!resolvedDoctor || !activeVisit) return
    const visits = PatientDataManager.getPatientSectionList<any>(patientId, 'visits')
    const updatedVisits = visits.map((visit) =>
      visit.id === activeVisit.id
        ? {
            ...visit,
            subjective: {
              ...(visit.subjective || {}),
              chiefComplaint: draftChiefComplaint,
              hpi: draftHpi
            },
            assessmentPlan: {
              ...(visit.assessmentPlan || {}),
              assessment: draftAssessment,
              plan: draftPlan
            },
            status: 'Completed',
            completedAt: new Date().toISOString()
          }
        : visit
    )
    PatientDataManager.savePatientSectionList(patientId, 'visits', updatedVisits, resolvedDoctor.id)

    if (selectedAppointment) {
      const appointments = PatientDataManager.getPatientSectionList<any>(patientId, 'appointments')
      const updatedAppointments = appointments.map((appointment) =>
        appointment.id === selectedAppointment.id
          ? { ...appointment, status: 'completed', updatedAt: new Date().toISOString() }
          : appointment
      )
      PatientDataManager.savePatientSectionList(patientId, 'appointments', updatedAppointments, resolvedDoctor.id)
    }

    const patient = PatientDataManager.getPatient(patientId)
    if (patient) {
      PatientDataManager.savePatient(
        {
          ...patient,
          status: 'Completed',
          appointment: 'Completed',
          updatedAt: new Date().toISOString()
        },
        'update',
        resolvedDoctor.id
      )
    }

    setIsEditing(false)
  }

  const markDocumentationStarted = () => {
    if (!resolvedDoctor || !activeVisit) return
    if (activeVisit.documentationStartedAt) return
    const visits = PatientDataManager.getPatientSectionList<any>(patientId, 'visits')
    const updatedVisits = visits.map((visit) =>
      visit.id === activeVisit.id
        ? { ...visit, documentationStartedAt: new Date().toISOString() }
        : visit
    )
    PatientDataManager.savePatientSectionList(patientId, 'visits', updatedVisits, resolvedDoctor.id)
  }

  const handleRecordingToggle = () => {
    if (isTranscribing) return
    if (isRecording) {
      setIsRecording(false)
      setIsTranscribing(true)
      if (transcriptionTimerRef.current) {
        clearTimeout(transcriptionTimerRef.current)
      }
      transcriptionTimerRef.current = setTimeout(() => {
        setIsTranscribing(false)
      }, 2000)
      return
    }
    setIsRecording(true)
  }
  const hasSectionValues = (section?: Record<string, any>) => {
    if (!section) return false
    return Object.values(section).some((value) => {
      if (value === null || value === undefined) return false
      if (typeof value === 'boolean') return value
      if (typeof value === 'number') return value !== 0
      if (typeof value === 'string') return value.trim().length > 0
      return true
    })
  }
  const sectionKeys = [
    'subjective',
    'objective',
    'assessmentPlan',
    'diabetes',
    'medications',
    'vaccines',
    'familyHistory',
    'riskFlags',
    'surgicalHistory',
    'pastMedicalHistory',
    'orders'
  ] as const
  const reviewCount = sectionKeys.reduce((count, key) => {
    const section = (selectedVisitRaw as any)?.[key]
    return count + (hasSectionValues(section) ? 1 : 0)
  }, 0)
  const reviewProgress = Math.round((reviewCount / sectionKeys.length) * 100)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visit History</h3>
        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
          {visits.length} visits
        </span>
      </div>

      {!selectedVisit ? (
        <div className="space-y-3">
          {visits.length > 0 ? (
            visits.map((visit) => (
              <div
                key={visit.id}
                onClick={() => setSelectedVisit(visit.id)}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {visit.date}
                    </span>
                    {visit.time && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {visit.time}
                      </span>
                    )}
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      {visit.type}
                    </span>
                    {visit.signature.status.toLowerCase() === 'draft' && (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                  <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{visit.provider}</p>
                <p className="text-sm text-gray-900 dark:text-white">{visit.chiefComplaint}</p>
              </div>
            ))
          ) : (
            <div className="p-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center text-sm text-gray-500 dark:text-gray-400">
              No visits recorded yet.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Visit Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedVisitData?.date} - {selectedVisitData?.type}
              </h4>
              <div className="flex items-center gap-2">
                {isDoctorPortal && (
                  <>
                    <button
                      onClick={handleAssignToMe}
                      disabled={!canAssignToMe}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold shadow-sm ${
                        canAssignToMe
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      title="Assign to Me"
                    >
                      Assign to Me
                    </button>
                    <button
                      onClick={handleReturnToWaitingRoom}
                      disabled={!canReturnToWaitingRoom}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold shadow-sm ${
                        canReturnToWaitingRoom
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      title="Return to Waiting Room"
                    >
                      Return to Waiting Room
                    </button>
                    <button
                      onClick={() => {
                        if (!isEditing) {
                          markDocumentationStarted()
                        }
                        setIsEditing((prev) => !prev)
                      }}
                      disabled={isCompletedVisit}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold shadow-sm border ${
                        isCompletedVisit
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                      title="Edit Visit Note"
                    >
                      {isEditing ? 'Cancel Edit' : 'Edit Note'}
                    </button>
                    {isEditing && !isCompletedVisit && (
                      <button
                        onClick={handleCompleteVisit}
                        className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-emerald-700"
                        title="Save and Complete"
                      >
                        Save & Complete
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => window.print()}
                  className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Print Record"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                </button>
                {isDraftVisit && isNursePortal && (
                  <button
                    onClick={() => router.push(`/nurse-portal/patients/${patientId}/new-visit`)}
                    className="flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold"
                    title="Edit Draft"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit Draft
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedVisitData?.provider} • {selectedVisitData?.time}
            </p>
            {selectedVisitRaw?.priority && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {(() => {
                  const raw = `${selectedVisitRaw.priority || ''}`.toLowerCase()
                  const badge =
                    raw === 'mild'
                      ? { label: 'Mild', style: 'bg-emerald-100/70 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' }
                      : raw === 'urgent'
                        ? { label: 'Urgent', style: 'bg-amber-100/70 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200' }
                        : raw === 'critical' || raw === 'severe'
                          ? { label: raw === 'critical' ? 'Critical' : 'Severe', style: 'bg-rose-100/70 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200' }
                          : { label: selectedVisitRaw.priority, style: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' }
                  return (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${badge.style}`}>
                      {badge.label}
                    </span>
                  )
                })()}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-lg">
                  <span className="material-symbols-outlined text-sm">description</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Visit Note</h2>
              </div>
            </div>
            <div className="px-6 pt-5">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span>Review progress</span>
                <span>{reviewProgress}% complete</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${reviewProgress}%` }} />
              </div>
            </div>
            <div className="px-6 pt-5">
              <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-gray-500">mic</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Ready to Capture</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Start recording the consultation to automatically generate clinical notes.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRecordingToggle}
                  disabled={isTranscribing}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold"
                >
                  <span className="material-symbols-outlined text-sm">fiber_manual_record</span>
                  {isTranscribing ? 'Transcribing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
              </div>
            </div>
            <div className="p-6 space-y-8 overflow-y-auto flex-1">
              <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, subjective: !expandedSections.subjective })}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Subjective
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Chief Complaint & HPI</span>
                  </h3>
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                    {expandedSections.subjective ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedSections.subjective && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Chief Complaint</label>
                      {isEditing && !isCompletedVisit ? (
                        <input
                          value={draftChiefComplaint}
                          onChange={(event) => setDraftChiefComplaint(event.target.value)}
                          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white px-3 py-2"
                          placeholder="Chief complaint"
                        />
                      ) : (
                        <div className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white px-3 py-2">
                          {selectedVisitRaw?.subjective?.chiefComplaint || 'No chief complaint recorded'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">History of Present Illness</label>
                      {isEditing && !isCompletedVisit ? (
                        <textarea
                          value={draftHpi}
                          onChange={(event) => setDraftHpi(event.target.value)}
                          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white px-3 py-2"
                          rows={3}
                          placeholder="History of present illness"
                        />
                      ) : (
                        <div className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white px-3 py-2">
                          {selectedVisitRaw?.subjective?.hpi || 'No HPI recorded'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, diabetes: !expandedSections.diabetes })}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Diabetes / Sugar Intake</h3>
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                    {expandedSections.diabetes ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedSections.diabetes && (
                  <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Fasting Blood Glucose</span>
                        {selectedVisitRaw?.diabetes?.fastingGlucose || 'Not recorded'}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Random Blood Glucose</span>
                        {selectedVisitRaw?.diabetes?.randomGlucose || 'Not recorded'}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">HbA1c</span>
                        {selectedVisitRaw?.diabetes?.hbA1cValue || 'Not recorded'}
                        {selectedVisitRaw?.diabetes?.hbA1cDate ? ` • ${selectedVisitRaw.diabetes.hbA1cDate}` : ''}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Home Monitoring</span>
                        {selectedVisitRaw?.diabetes?.homeMonitoring || 'Not recorded'}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Average Readings</span>
                        {selectedVisitRaw?.diabetes?.averageReadings || 'Not recorded'}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Hypoglycemia Episodes</span>
                        {selectedVisitRaw?.diabetes?.hypoglycemiaEpisodes || 'Not recorded'}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Hyperglycemia Symptoms</span>
                        {selectedVisitRaw?.diabetes?.hyperglycemiaSymptoms || 'Not recorded'}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Foot Exam Performed</span>
                        {selectedVisitRaw?.diabetes?.footExam || 'Not recorded'}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Eye Exam Due</span>
                        {selectedVisitRaw?.diabetes?.eyeExamDue || 'Not recorded'}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, objective: !expandedSections.objective })}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Objective
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Vitals & Exam</span>
                  </h3>
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                    {expandedSections.objective ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedSections.objective && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">BP (mmHg)</label>
                        <div className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white flex items-center">
                          {selectedVisitRaw?.objective?.bp || '--'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">HR (bpm)</label>
                        <div className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white flex items-center">
                          {selectedVisitRaw?.objective?.hr || '--'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Temp (°F)</label>
                        <div className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white flex items-center">
                          {selectedVisitRaw?.objective?.temp || '--'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Weight (lbs)</label>
                        <div className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white flex items-center">
                          {selectedVisitRaw?.objective?.weight || '--'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Height (in)</label>
                        <div className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white flex items-center">
                          {selectedVisitRaw?.objective?.height || '--'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Physical Exam Findings</label>
                      <div className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white px-3 py-2">
                        {selectedVisitRaw?.objective?.examFindings || 'No exam findings recorded'}
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Vision Exam</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Visual acuity and symptoms</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Right Eye (OD)</span>
                          {selectedVisitRaw?.objective?.visionOd || '--'}
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Left Eye (OS)</span>
                          {selectedVisitRaw?.objective?.visionOs || '--'}
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Both Eyes (OU)</span>
                          {selectedVisitRaw?.objective?.visionOu || '--'}
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Correction</span>
                          {selectedVisitRaw?.objective?.visionCorrection || '--'}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Blurry Vision</span>
                          {selectedVisitRaw?.objective?.visionBlurry || '--'}
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Floaters / Flashes</span>
                          {selectedVisitRaw?.objective?.visionFloaters || '--'}
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Eye Pain</span>
                          {selectedVisitRaw?.objective?.visionPain || '--'}
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Last Eye Exam</span>
                          {selectedVisitRaw?.objective?.visionLastExamDate || '--'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, medications: !expandedSections.medications })}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Medications</h3>
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                    {expandedSections.medications ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedSections.medications && (
                  <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Current Medications</span>
                      <div className="whitespace-pre-wrap rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white">
                        {selectedVisitRaw?.medications?.currentList || 'Not recorded'}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Taking as prescribed</span>
                        {selectedVisitRaw?.medications?.takingAsPrescribed ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Missed doses</span>
                        {selectedVisitRaw?.medications?.missedDoses ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Side effects</span>
                        {selectedVisitRaw?.medications?.sideEffects ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Insulin Type</span>
                        {selectedVisitRaw?.medications?.insulinType || 'Not recorded'}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Dose</span>
                        {selectedVisitRaw?.medications?.insulinDose || 'Not recorded'}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Timing</span>
                        {selectedVisitRaw?.medications?.insulinTiming || 'Not recorded'}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Glucose-lowering (oral)</span>
                        {selectedVisitRaw?.medications?.glucoseOral ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Glucose-lowering (injectable)</span>
                        {selectedVisitRaw?.medications?.glucoseInjectable ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Acknowledged by nurse: {selectedVisitRaw?.medications?.acknowledged ? 'Yes' : 'No'}
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, assessmentPlan: !expandedSections.assessmentPlan })}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Assessment & Plan</h3>
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                    {expandedSections.assessmentPlan ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedSections.assessmentPlan && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Assessment / Diagnosis</label>
                      <div className="relative">
                        <span className="absolute top-2.5 left-3 text-gray-500 dark:text-gray-400">
                          <span className="material-symbols-outlined text-sm">medical_services</span>
                        </span>
                        {isEditing && !isCompletedVisit ? (
                          <textarea
                            value={draftAssessment}
                            onChange={(event) => setDraftAssessment(event.target.value)}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white pl-10 py-2"
                            rows={3}
                            placeholder="Assessment / diagnosis"
                          />
                        ) : (
                          <div className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white pl-10 py-2">
                            {selectedVisitRaw?.assessmentPlan?.assessment || 'No assessment recorded'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Treatment Plan</label>
                      <div className="relative">
                        <span className="absolute top-2.5 left-3 text-gray-500 dark:text-gray-400">
                          <span className="material-symbols-outlined text-sm">healing</span>
                        </span>
                        {isEditing && !isCompletedVisit ? (
                          <textarea
                            value={draftPlan}
                            onChange={(event) => setDraftPlan(event.target.value)}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white pl-10 py-2"
                            rows={3}
                            placeholder="Treatment plan"
                          />
                        ) : (
                          <div className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white pl-10 py-2">
                            {selectedVisitRaw?.assessmentPlan?.plan || 'No treatment plan recorded'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, vaccines: !expandedSections.vaccines })}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Vaccines
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Immunizations</span>
                  </h3>
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                    {expandedSections.vaccines ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedSections.vaccines && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Vaccine</span>
                        {selectedVisitRaw?.vaccines?.name || 'Not recorded'}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Date</span>
                        {selectedVisitRaw?.vaccines?.date || 'Not recorded'}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Dose</span>
                        {selectedVisitRaw?.vaccines?.dose || 'Not recorded'}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, familyHistory: !expandedSections.familyHistory })}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Family Health History
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Genetic Risk Factors</span>
                  </h3>
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                    {expandedSections.familyHistory ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedSections.familyHistory && (
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div>Relationship: {selectedVisitRaw?.familyHistory?.relationship || 'Not recorded'}</div>
                    <div>Status: {selectedVisitRaw?.familyHistory?.status || 'Not recorded'}</div>
                    <div>Conditions: {selectedVisitRaw?.familyHistory?.conditions || 'Not recorded'}</div>
                  </div>
                )}
              </section>

              <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, riskFlags: !expandedSections.riskFlags })}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Risk Flags
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Social & Lifestyle</span>
                  </h3>
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                    {expandedSections.riskFlags ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedSections.riskFlags && (
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div>Tobacco Use: {selectedVisitRaw?.riskFlags?.tobaccoUse || 'Not recorded'}</div>
                    <div>Alcohol Use: {selectedVisitRaw?.riskFlags?.alcoholUse || 'Not recorded'}</div>
                    <div>Housing Status: {selectedVisitRaw?.riskFlags?.housingStatus || 'Not recorded'}</div>
                    <div>Occupation: {selectedVisitRaw?.riskFlags?.occupation || 'Not recorded'}</div>
                  </div>
                )}
              </section>

              <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, surgicalHistory: !expandedSections.surgicalHistory })}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Surgical History
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Procedures & Operations</span>
                  </h3>
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                    {expandedSections.surgicalHistory ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedSections.surgicalHistory && (
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div>Procedure: {selectedVisitRaw?.surgicalHistory?.procedure || 'Not recorded'}</div>
                    <div>Date: {selectedVisitRaw?.surgicalHistory?.date || 'Not recorded'}</div>
                    <div>Surgeon: {selectedVisitRaw?.surgicalHistory?.surgeon || 'Not recorded'}</div>
                    <div>Outcome: {selectedVisitRaw?.surgicalHistory?.outcome || 'Not recorded'}</div>
                  </div>
                )}
              </section>

              <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, pastMedicalHistory: !expandedSections.pastMedicalHistory })}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Past Medical History
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Chronic Conditions</span>
                  </h3>
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                    {expandedSections.pastMedicalHistory ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedSections.pastMedicalHistory && (
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div>Condition: {selectedVisitRaw?.pastMedicalHistory?.condition || 'Not recorded'}</div>
                    <div>Status: {selectedVisitRaw?.pastMedicalHistory?.status || 'Not recorded'}</div>
                    <div>Diagnosed: {selectedVisitRaw?.pastMedicalHistory?.diagnosedDate || 'Not recorded'}</div>
                  </div>
                )}
              </section>

              <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, orders: !expandedSections.orders })}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Orders
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Labs, Imaging & Medications</span>
                  </h3>
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                    {expandedSections.orders ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedSections.orders && (
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div>Type: {selectedVisitRaw?.orders?.type || 'Not recorded'}</div>
                    <div>Priority: {selectedVisitRaw?.orders?.priority || 'Not recorded'}</div>
                    <div>Status: {selectedVisitRaw?.orders?.status || 'Not recorded'}</div>
                  </div>
                )}
              </section>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 italic">
                <span>Last saved: {selectedVisitData?.date} {selectedVisitData?.time}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VisitHistory
