'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { useNurse } from '@/contexts/NurseContext'
import { useDoctor } from '@/contexts/DoctorContext'

interface NurseNewVisitFormProps {
  patientId: string
}

const NurseNewVisitForm = ({ patientId }: NurseNewVisitFormProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const { nurse } = useNurse()
  const { doctor } = useDoctor()
  const isDoctorPortal = pathname.startsWith('/doctor')
  const isNursePortal = pathname.startsWith('/nurse-portal')
  const portalBase = isDoctorPortal ? '/doctor/patients' : isNursePortal ? '/nurse-portal/patients' : '/patients'
  const actor = doctor ?? nurse
  const actorId = actor?.id || ''
  const actorName = actor?.name || (doctor ? 'Doctor' : 'Nurse')
  const [peekHref, setPeekHref] = useState<string | null>(null)
  const [peekLabel, setPeekLabel] = useState<string>('Medical Section')
  const [existingPatient, setExistingPatient] = useState<any | null>(() => (
    PatientDataManager.getPatient(patientId)
  ))
  const isNewPatient = !existingPatient
  const [activeTab, setActiveTab] = useState('record')
  const profilePhotoInputRef = useRef<HTMLInputElement | null>(null)
  const documentsInputRef = useRef<HTMLInputElement | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
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
  const [reviewedSections, setReviewedSections] = useState<Record<string, boolean>>(() => (
    sectionKeys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  ))
  const [patientData, setPatientData] = useState(() => ({
    name: existingPatient?.name || '',
    dob: existingPatient?.dob || '',
    mrn: existingPatient?.mrn || `MRN-${Date.now().toString().slice(-6)}`,
    allergies: existingPatient?.allergies || '',
    email: existingPatient?.email || '',
    phone: existingPatient?.phone || '',
    gender: existingPatient?.gender || '',
    address: existingPatient?.address || '',
    image: existingPatient?.image || ''
  }))
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  const [visitData, setVisitData] = useState({
    subjective: {
      chiefComplaint: '',
      hpi: ''
    },
    objective: {
      bp: '',
      hr: '',
      temp: '',
      weight: '',
      height: '',
      examFindings: '',
      visionOd: '',
      visionOs: '',
      visionOu: '',
      visionCorrection: '',
      visionBlurry: '',
      visionFloaters: '',
      visionPain: '',
      visionLastExamDate: ''
    },
    diabetes: {
      fastingGlucose: '',
      randomGlucose: '',
      hbA1cValue: '',
      hbA1cDate: '',
      homeMonitoring: '',
      averageReadings: '',
      hypoglycemiaEpisodes: '',
      hyperglycemiaSymptoms: '',
      footExam: '',
      eyeExamDue: ''
    },
    medications: {
      currentList: '',
      takingAsPrescribed: false,
      missedDoses: false,
      sideEffects: false,
      insulinType: '',
      insulinDose: '',
      insulinTiming: '',
      glucoseOral: false,
      glucoseInjectable: false,
      acknowledged: false
    },
    assessmentPlan: {
      assessment: '',
      plan: ''
    },
    vaccines: {
      name: '',
      date: '',
      dose: '',
      site: '',
      route: '',
      lotNumber: '',
      manufacturer: ''
    },
    familyHistory: {
      relationship: '',
      status: '',
      conditions: ''
    },
    riskFlags: {
      tobaccoUse: '',
      tobaccoAmount: '',
      alcoholUse: '',
      alcoholFrequency: '',
      housingStatus: '',
      occupation: ''
    },
    surgicalHistory: {
      procedure: '',
      date: '',
      site: '',
      surgeon: '',
      outcome: '',
      source: ''
    },
    pastMedicalHistory: {
      condition: '',
      status: '',
      diagnosedDate: '',
      impact: '',
      icd10: '',
      source: ''
    },
    orders: {
      type: '',
      priority: '',
      details: '',
      status: '',
      dateOrdered: ''
    }
  })
  const draftKey = 'new-visit-nurse'
  const reviewedCount = sectionKeys.filter((key) => reviewedSections[key]).length
  const reviewProgress = Math.round((reviewedCount / sectionKeys.length) * 100)
  const allReviewed = reviewedCount === sectionKeys.length
  const bmiValue = useMemo(() => {
    const weight = Number(visitData.objective.weight)
    const height = Number(visitData.objective.height)
    if (!Number.isFinite(weight) || !Number.isFinite(height) || height <= 0) return ''
    const bmi = (weight / (height * height)) * 703
    return Number.isFinite(bmi) ? bmi.toFixed(1) : ''
  }, [visitData.objective.height, visitData.objective.weight])
  const diabetesPrefillDone = useRef(false)
  const medicationsPrefillDone = useRef(false)
  const isA1cOverdue = (dateValue?: string) => {
    if (!dateValue) return false
    const parsed = new Date(dateValue)
    if (Number.isNaN(parsed.getTime())) return false
    const daysSince = (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24)
    return daysSince > 180
  }
  const isVisionAbnormal = (value?: string) => {
    if (!value) return false
    const match = value.match(/(\d+)\s*\/\s*(\d+)/)
    if (!match) return false
    const denominator = Number(match[2])
    return Number.isFinite(denominator) && denominator > 40
  }
  const hasDiabetesValues = (section: Record<string, string>) =>
    Object.values(section).some((value) => value && value.trim().length > 0)

  const handleToggleSection = (key: typeof sectionKeys[number]) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
    setReviewedSections((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
  }
  const openPeekPanel = (href: string) => {
    const peekUrl = href.includes('?') ? `${href}&peek=1` : `${href}?peek=1`
    setPeekHref(peekUrl)
    const label = href.split('/').pop()?.replace(/-/g, ' ') || 'Medical Section'
    setPeekLabel(label.replace(/\b\w/g, (char) => char.toUpperCase()))
  }

  useEffect(() => {
    const patient = PatientDataManager.getPatient(patientId)
    setExistingPatient(patient)
    if (patient) {
      setPatientData((prev) => ({
        ...prev,
        name: patient.name || prev.name,
        dob: patient.dob || prev.dob,
        mrn: patient.mrn || prev.mrn,
        allergies: patient.allergies || prev.allergies,
        email: patient.email || prev.email,
        phone: patient.phone || prev.phone,
        gender: patient.gender || prev.gender,
        address: patient.address || prev.address,
        image: patient.image || prev.image
      }))
    }
  }, [patientId])

  useEffect(() => {
    if (medicationsPrefillDone.current) return
    const existingMeds = PatientDataManager.getPatientSectionList<any>(patientId, 'medications')
    if (existingMeds.length === 0) {
      medicationsPrefillDone.current = true
      return
    }
    if (!visitData.medications.currentList.trim()) {
      const summary = existingMeds
        .map((med) => {
          const name = med.name || 'Medication'
          const detail = med.dose || med.frequency || med.instructions || ''
          return detail ? `${name} - ${detail}` : name
        })
        .join('\n')
      setVisitData((prev) => ({
        ...prev,
        medications: { ...prev.medications, currentList: summary }
      }))
    }
    medicationsPrefillDone.current = true
  }, [patientId, visitData.medications.currentList])

  useEffect(() => {
    const draft = PatientDataManager.getDraft(patientId, draftKey)
    if (!draft?.data) return
    if (draft.data.patientData) {
      setPatientData((prev) => ({ ...prev, ...draft.data.patientData }))
    }
    if (draft.data.visitData) {
      const incoming = draft.data.visitData
      setVisitData((prev) => ({
        ...prev,
        ...incoming,
        objective: { ...prev.objective, ...incoming.objective },
        diabetes: { ...prev.diabetes, ...incoming.diabetes },
        medications: { ...prev.medications, ...incoming.medications },
        subjective: { ...prev.subjective, ...incoming.subjective },
        assessmentPlan: { ...prev.assessmentPlan, ...incoming.assessmentPlan },
        vaccines: { ...prev.vaccines, ...incoming.vaccines },
        familyHistory: { ...prev.familyHistory, ...incoming.familyHistory },
        riskFlags: { ...prev.riskFlags, ...incoming.riskFlags },
        surgicalHistory: { ...prev.surgicalHistory, ...incoming.surgicalHistory },
        pastMedicalHistory: { ...prev.pastMedicalHistory, ...incoming.pastMedicalHistory },
        orders: { ...prev.orders, ...incoming.orders }
      }))
    }
    if (draft.data.uploadedDocuments) {
      setUploadedDocuments(draft.data.uploadedDocuments)
    }
  }, [patientId])

  useEffect(() => {
    const timeout = setTimeout(() => {
      PatientDataManager.saveDraft(patientId, draftKey, {
        patientData,
        visitData,
        uploadedDocuments
      })
    }, 500)
    return () => clearTimeout(timeout)
  }, [patientId, patientData, visitData, uploadedDocuments])

  useEffect(() => {
    if (diabetesPrefillDone.current) return
    const visits = PatientDataManager.getPatientSectionList<any>(patientId, 'visits')
    const latestWithDiabetes = visits.find((visit) => visit?.diabetes && hasDiabetesValues(visit.diabetes))
    if (!latestWithDiabetes) {
      diabetesPrefillDone.current = true
      return
    }
    if (!hasDiabetesValues(visitData.diabetes)) {
      const sanitized = Object.fromEntries(
        Object.entries(latestWithDiabetes.diabetes || {}).map(([key, value]) => [key, value ?? ''])
      ) as Record<string, string>
      setVisitData((prev) => ({
        ...prev,
        diabetes: {
          ...prev.diabetes,
          ...sanitized
        }
      }))
      setReviewedSections((prev) => ({ ...prev, diabetes: true }))
    }
    diabetesPrefillDone.current = true
  }, [patientId, visitData.diabetes])

  const savePatientData = (visitStatus: 'draft' | 'completed' = 'completed') => {
    if (!actorId) {
      setSaveError('Please sign in to save this patient.')
      return null
    }
    const nameValue = patientData.name.trim()
    const dobValue = patientData.dob.trim()
    if (!nameValue || !dobValue) {
      setSaveError('Name and date of birth are required to save a patient.')
      return null
    }
    setSaveError(null)

    const newPatientId = patientId
    const hasValues = (section: Record<string, string>) =>
      Object.values(section).some((value) => value && value.trim().length > 0)

    const nowIso = new Date().toISOString()
    const isCompleted = visitStatus === 'completed'
    const newPatient = {
      id: newPatientId,
      name: nameValue,
      email: patientData.email,
      dob: dobValue,
      phone: patientData.phone,
      mrn: patientData.mrn,
      gender: patientData.gender,
      allergies: patientData.allergies,
      address: patientData.address,
      image: patientData.image,
      physician: 'To be assigned',
      lastConsultation: new Date().toLocaleDateString(),
      appointment: 'To be scheduled',
      status: isCompleted ? 'Completed' : 'In Progress',
      statusColor: isCompleted
        ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300'
        : 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300',
      doctorId: doctor?.id || '',
      nurseId: nurse?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: nowIso,
      completedAt: isCompleted ? nowIso : ''
    }
    
    PatientDataManager.savePatient(newPatient, isNewPatient ? 'create' : 'update', actorId)
    
    if (isCompleted) {
      PatientDataManager.clearDraft(patientId, draftKey)
    }

    const visits = PatientDataManager.getPatientSectionList(newPatientId, 'visits')
    const visitId = Date.now().toString()
    const visitRecord: any = {
      id: visitId,
      recordedAt: nowIso,
      providerId: actorId,
      providerName: actorName,
      subjective: visitData.subjective,
      objective: visitData.objective,
      diabetes: visitData.diabetes,
      medications: visitData.medications,
      assessmentPlan: visitData.assessmentPlan,
      status: isCompleted ? 'Completed' : 'Draft'
    }
    const appointments = PatientDataManager.getPatientSectionList<any>(newPatientId, 'appointments')
    const sortedAppointments = [...appointments].sort((a, b) => {
      const aTime = new Date(a?.updatedAt || a?.createdAt || a?.scheduledFor || 0).getTime()
      const bTime = new Date(b?.updatedAt || b?.createdAt || b?.scheduledFor || 0).getTime()
      return bTime - aTime
    })
    const linkedAppointment = sortedAppointments.find((appointment) => {
      const status = `${appointment?.status || ''}`.toLowerCase()
      return status !== 'completed'
    }) || sortedAppointments[0]
    if (linkedAppointment) {
      const location = `${linkedAppointment.location || ''}`.trim()
      const locationLower = location.toLowerCase()
      const visitMode = locationLower.includes('virtual')
        || locationLower.includes('video')
        || locationLower.includes('tele')
        || linkedAppointment.deliveryMethod
        ? 'Video Call'
        : 'In Person'
      visitRecord.appointmentId = linkedAppointment.id
      visitRecord.scheduledFor = linkedAppointment.scheduledFor || ''
      visitRecord.scheduledProvider = linkedAppointment.doctorDisplayName || linkedAppointment.doctorName || ''
      visitRecord.visitMode = visitMode
      visitRecord.appointmentLocation = location
      visitRecord.appointmentStatus = linkedAppointment.status || ''
      visitRecord.priority = linkedAppointment.priority || ''
    }
    const intakeSection = PatientDataManager.getPatientSection(newPatientId, 'intake')
    if (intakeSection?.data) {
      visitRecord.intakeSnapshot = intakeSection.data
      PatientDataManager.updatePatientSection(newPatientId, 'intake', {
        ...intakeSection,
        data: intakeSection.data,
        status: 'linked',
        linkedVisitId: visitId
      }, actorId)
    }
    PatientDataManager.savePatientSectionList(newPatientId, 'visits', [visitRecord, ...visits], actorId)

    if (hasValues(visitData.objective)) {
      const vitals = PatientDataManager.getPatientSectionList(newPatientId, 'vitals')
      PatientDataManager.savePatientSectionList(newPatientId, 'vitals', [
        {
          id: visitId,
          recordedAt: new Date().toISOString(),
          ...visitData.objective
        },
        ...vitals
      ], actorId)
    }

    if (patientData.allergies.trim()) {
      const allergies = PatientDataManager.getPatientSectionList(newPatientId, 'allergies')
      const allergyItems = patientData.allergies
        .split(',')
        .map((name: string) => name.trim())
        .filter(Boolean)
        .map((name: string) => ({
          id: `${visitId}-${name}`,
          name,
          severity: '',
          reactions: '',
          status: 'Active',
          recordedAt: new Date().toISOString()
        }))
      PatientDataManager.savePatientSectionList(newPatientId, 'allergies', [...allergyItems, ...allergies], actorId)
    }

    if (hasValues(visitData.vaccines)) {
      const vaccines = PatientDataManager.getPatientSectionList(newPatientId, 'vaccines')
      PatientDataManager.savePatientSectionList(newPatientId, 'vaccines', [
        { id: visitId, ...visitData.vaccines, recordedAt: new Date().toISOString() },
        ...vaccines
      ], actorId)
    }

    if (hasValues(visitData.familyHistory)) {
      const familyHistory = PatientDataManager.getPatientSectionList(newPatientId, 'family-history')
      PatientDataManager.savePatientSectionList(newPatientId, 'family-history', [
        { id: visitId, ...visitData.familyHistory, recordedAt: new Date().toISOString() },
        ...familyHistory
      ], actorId)
    }

    if (hasValues(visitData.riskFlags)) {
      const socialHistory = PatientDataManager.getPatientSectionList(newPatientId, 'social-history')
      PatientDataManager.savePatientSectionList(newPatientId, 'social-history', [
        { id: visitId, ...visitData.riskFlags, recordedAt: new Date().toISOString() },
        ...socialHistory
      ], actorId)
    }

    if (hasValues(visitData.surgicalHistory)) {
      const surgicalHistory = PatientDataManager.getPatientSectionList(newPatientId, 'surgical-history')
      PatientDataManager.savePatientSectionList(newPatientId, 'surgical-history', [
        { id: visitId, ...visitData.surgicalHistory, recordedAt: new Date().toISOString() },
        ...surgicalHistory
      ], actorId)
    }

    if (hasValues(visitData.pastMedicalHistory)) {
      const pastMedicalHistory = PatientDataManager.getPatientSectionList(newPatientId, 'past-medical-history')
      PatientDataManager.savePatientSectionList(newPatientId, 'past-medical-history', [
        { id: visitId, ...visitData.pastMedicalHistory, recordedAt: new Date().toISOString() },
        ...pastMedicalHistory
      ], actorId)
    }

    if (hasValues(visitData.orders)) {
      const orders = PatientDataManager.getPatientSectionList(newPatientId, 'orders')
      PatientDataManager.savePatientSectionList(newPatientId, 'orders', [
        { id: visitId, ...visitData.orders, recordedAt: new Date().toISOString() },
        ...orders
      ], actorId)
    }

    if (uploadedDocuments.length > 0) {
      const documents = PatientDataManager.getPatientSectionList(newPatientId, 'documents')
      PatientDataManager.savePatientSectionList(newPatientId, 'documents', [
        ...uploadedDocuments,
        ...documents
      ], actorId)
    }

    PatientDataManager.clearDraft(patientId, draftKey)

    return newPatientId
  }

  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setPatientData({ ...patientData, image: result })
    }
    reader.readAsDataURL(file)
  }

  const handleDocumentsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : ''
        setUploadedDocuments((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${file.name}`,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            dataUrl: result
          }
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSavePatientAndSchedule = () => {
    savePatientData('completed')
    router.push(`${portalBase}/${patientId}/schedule`)
  }

  const handleSavePatientAndClose = () => {
    const newPatientId = savePatientData('completed')
    if (!newPatientId) return
    router.push(isDoctorPortal ? '/doctor' : '/nurse-portal')
  }

  const handleSavePatient = () => {
    const newPatientId = savePatientData('completed')
    if (!newPatientId) return
    router.push(`${portalBase}/${newPatientId}`)
  }

  const handleSaveVisitOnly = () => {
    const newPatientId = savePatientData('completed')
    if (!newPatientId) return
    router.push(`${portalBase}/${newPatientId}`)
  }

  const handleSaveVisitAndSchedule = () => {
    const newPatientId = savePatientData('completed')
    if (!newPatientId) return
    router.push(`${portalBase}/${newPatientId}/schedule`)
  }

  const handleSaveVisitDraft = () => {
    const newPatientId = savePatientData('draft')
    if (!newPatientId) return
    setSaveError(null)
    router.push(`${portalBase}/${newPatientId}`)
  }

  const handleCancel = () => {
    if (isNewPatient) {
      PatientDataManager.deletePatient(patientId)
      PatientDataManager.clearDraft(patientId, draftKey)
      router.push(isDoctorPortal ? '/doctor' : '/nurse-portal')
      return
    }
    router.push(`${portalBase}/${patientId}`)
  }

  const patient = useMemo(() => ({
    name: patientData.name || (existingPatient?.name ?? 'Patient'),
    dob: patientData.dob
      ? new Date(patientData.dob).toLocaleDateString()
      : existingPatient?.dob
        ? new Date(existingPatient.dob).toLocaleDateString()
        : 'Not provided',
    mrn: patientData.mrn || existingPatient?.mrn || 'Not assigned',
    allergies: patientData.allergies || existingPatient?.allergies || 'None'
  }), [existingPatient, patientData.allergies, patientData.dob, patientData.mrn, patientData.name])

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
      {isDoctorPortal ? <Sidebar /> : <NurseSidebar />}
      <PatientDetailSidebar
        patientId={patientId}
        onNavigate={openPeekPanel}
        activeHref={peekHref ? peekHref.replace(/\?.*$/, '') : undefined}
      />
      
      {peekHref && (
        <aside className="hidden xl:flex w-[360px] 2xl:w-[420px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="h-full flex flex-col w-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{peekLabel}</div>
              <button
                type="button"
                onClick={() => setPeekHref(null)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="material-symbols-outlined text-sm text-gray-500">close</span>
              </button>
            </div>
            <iframe
              src={peekHref}
              className="w-full h-full bg-white dark:bg-gray-900"
              title="Patient chart preview"
            />
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-6 min-w-0">
          <div className="w-full flex flex-col gap-6 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
                  {isNewPatient && (
                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold border border-yellow-200 dark:border-yellow-800">Draft</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">calendar_today</span> 
                    DOB: {patient.dob}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">id_card</span> 
                    MRN: {patient.mrn}
                  </span>
                  <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                    <span className="material-symbols-outlined text-sm">warning</span> 
                    Allergies: {patient.allergies}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                {isNewPatient ? (
                  <>
                    <button 
                      onClick={handleSavePatientAndSchedule}
                      disabled={!allReviewed}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Save Patient & Schedule Doctor</span>
                      <span className="material-symbols-outlined text-sm">event</span>
                    </button>
                    <button 
                      onClick={handleSavePatientAndClose}
                      disabled={!allReviewed}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Save Patient & Close</span>
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                    <button 
                      onClick={handleSavePatient}
                      disabled={!allReviewed}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Save Patient & Visit</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSaveVisitAndSchedule}
                      disabled={!allReviewed}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">event</span>
                      Save &amp; Schedule
                    </button>
                    <button
                      onClick={handleSaveVisitOnly}
                      disabled={!allReviewed}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Save Visit</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </>
                )}
              </div>
              {saveError && (
                <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {saveError}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-w-0">
              <div className="xl:col-span-4 flex flex-col gap-6 min-w-0">
                {isNewPatient && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-sm">person_add</span>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Patient Registration</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={patientData.name}
                          onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Enter patient's full name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth *</label>
                          <input
                            type="date"
                            value={patientData.dob}
                            onChange={(e) => setPatientData({...patientData, dob: e.target.value})}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">MRN</label>
                          <input
                            type="text"
                            value={patientData.mrn}
                            readOnly
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                          <select
                            value={patientData.gender}
                            onChange={(e) => setPatientData({...patientData, gender: e.target.value})}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                          >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={patientData.phone}
                            onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                          type="email"
                          value={patientData.email}
                          onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="patient@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Known Allergies</label>
                        <input
                          type="text"
                          value={patientData.allergies}
                          onChange={(e) => setPatientData({...patientData, allergies: e.target.value})}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="e.g., Penicillin, Shellfish (or 'None')"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex gap-6">
                      <button 
                        onClick={() => setActiveTab('record')}
                        className={`flex flex-col items-center justify-center border-b-2 gap-1 pb-3 pt-4 px-2 ${
                          activeTab === 'record' 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined">mic</span>
                        <span className="text-sm font-medium">Record</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('upload')}
                        className={`flex flex-col items-center justify-center border-b-2 gap-1 pb-3 pt-4 px-2 ${
                          activeTab === 'upload' 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined">cloud_upload</span>
                        <span className="text-sm font-medium">Upload</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('type')}
                        className={`flex flex-col items-center justify-center border-b-2 gap-1 pb-3 pt-4 px-2 ${
                          activeTab === 'type' 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined">keyboard</span>
                        <span className="text-sm font-medium">Profile Photo</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                    {activeTab === 'record' ? (
                      <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/30 dark:bg-gray-800/30 p-8 text-center gap-6 hover:border-primary/40 transition-colors cursor-pointer">
                        <div className="size-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-2">
                          <span className="material-symbols-outlined text-4xl">mic</span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ready to Capture</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-[280px] mx-auto">
                            Start recording the consultation to automatically generate clinical notes.
                          </p>
                        </div>
                        <button className="flex items-center justify-center rounded-lg px-6 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-sm transition-colors w-full max-w-[200px] gap-2">
                          <span className="material-symbols-outlined text-sm">fiber_manual_record</span>
                          <span>Start Recording</span>
                        </button>
                      </div>
                    ) : activeTab === 'upload' ? (
                      <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/30 dark:bg-gray-800/30 p-8 text-center gap-6 hover:border-primary/40 transition-colors cursor-pointer">
                        <div className="size-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-2">
                          <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ready to Capture</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-[280px] mx-auto">
                            Upload documents, insurance cards, or medical records.
                          </p>
                        </div>
                        <button
                          onClick={() => documentsInputRef.current?.click()}
                          className="flex items-center justify-center rounded-lg px-6 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-sm transition-colors w-full max-w-[200px] gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">upload</span>
                          <span>Upload Document</span>
                        </button>
                        <input
                          ref={documentsInputRef}
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          multiple
                          className="hidden"
                          onChange={handleDocumentsUpload}
                        />
                        {uploadedDocuments.length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {uploadedDocuments.length} document{uploadedDocuments.length > 1 ? 's' : ''} ready to save
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/30 dark:bg-gray-800/30 p-8 text-center gap-6 hover:border-primary/40 transition-colors cursor-pointer">
                        <div className="size-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-2">
                          <span className="material-symbols-outlined text-4xl">photo_camera</span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ready to Capture</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-[280px] mx-auto">
                            Capture a profile photo using the device camera.
                          </p>
                        </div>
                        <button
                          onClick={() => profilePhotoInputRef.current?.click()}
                          className="flex items-center justify-center rounded-lg px-6 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-sm transition-colors w-full max-w-[200px] gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">photo_camera</span>
                          <span>Take Profile Photo</span>
                        </button>
                        <input
                          ref={profilePhotoInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={handleProfilePhotoChange}
                        />
                        {patientData.image && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Profile photo ready
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-8 flex flex-col min-w-0">
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
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${reviewProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-6 space-y-8 overflow-y-auto flex-1">
                    <section className={`space-y-3 relative pl-4 border-l-2 ${reviewedSections.subjective ? 'border-blue-400/60' : 'border-red-400/60'}`}>
                      <div className={`absolute -left-2 top-0 size-4 rounded-full border-2 border-white dark:border-gray-900 ${reviewedSections.subjective ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                      <button 
                        onClick={() => handleToggleSection('subjective')}
                        className="w-full flex items-center justify-between text-left"
                        title="Click to review. No changes required."
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Subjective
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Chief Complaint & HPI</span>
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                            {expandedSections.subjective ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>
                      </button>
                      {expandedSections.subjective && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Chief Complaint</label>
                            <input 
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2" 
                              placeholder="e.g., Persistent cough, fever" 
                              value={visitData.subjective.chiefComplaint}
                              onChange={(e) => setVisitData({
                                ...visitData,
                                subjective: { ...visitData.subjective, chiefComplaint: e.target.value }
                              })}
                              type="text"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">History of Present Illness</label>
                            <textarea 
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 resize-none" 
                              placeholder="Describe the HPI..." 
                              value={visitData.subjective.hpi}
                              onChange={(e) => setVisitData({
                                ...visitData,
                                subjective: { ...visitData.subjective, hpi: e.target.value }
                              })}
                              rows={4}
                            />
                          </div>
                        </div>
                      )}
                    </section>

                    <section className={`space-y-3 relative pl-4 border-l-2 ${reviewedSections.objective ? 'border-blue-400/60' : 'border-red-400/60'}`}>
                      <div className={`absolute -left-2 top-0 size-4 rounded-full border-2 border-white dark:border-gray-900 ${reviewedSections.objective ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                      <button 
                        onClick={() => handleToggleSection('objective')}
                        className="w-full flex items-center justify-between text-left"
                        title="Click to review. No changes required."
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Objective
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Vitals & Exam</span>
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                            {expandedSections.objective ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>
                      </button>
                      {expandedSections.objective && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">BP (mmHg)</label>
                              <input
                                className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="120/80"
                                type="text"
                                value={visitData.objective.bp}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  objective: { ...visitData.objective, bp: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">HR (bpm)</label>
                              <input
                                className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="72"
                                type="text"
                                value={visitData.objective.hr}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  objective: { ...visitData.objective, hr: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Temp (°F)</label>
                              <input
                                className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="98.6"
                                type="text"
                                value={visitData.objective.temp}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  objective: { ...visitData.objective, temp: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Weight (lbs)</label>
                              <input
                                className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="165"
                                type="text"
                                value={visitData.objective.weight}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  objective: { ...visitData.objective, weight: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Height (in)</label>
                              <input
                                className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="65"
                                type="text"
                                value={visitData.objective.height}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  objective: { ...visitData.objective, height: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">BMI (kg/m2)</label>
                              <input
                                className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="--"
                                type="text"
                                value={bmiValue}
                                readOnly
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Physical Exam Findings</label>
                            <textarea 
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 resize-none" 
                              placeholder="General appearance, HEENT, Lungs, Heart..." 
                              value={visitData.objective.examFindings}
                              onChange={(e) => setVisitData({
                                ...visitData,
                                objective: { ...visitData.objective, examFindings: e.target.value }
                              })}
                              rows={3}
                            />
                          </div>

                          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Vision Exam</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Visual acuity and symptom screening</p>
                              </div>
                              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Entry</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Right Eye (OD)</label>
                                <input
                                  className={`w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary ${isVisionAbnormal(visitData.objective.visionOd) ? 'border-rose-400' : 'border-gray-200 dark:border-gray-700'}`}
                                  placeholder="20/20"
                                  value={visitData.objective.visionOd}
                                  onChange={(e) => setVisitData({
                                    ...visitData,
                                    objective: { ...visitData.objective, visionOd: e.target.value }
                                  })}
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Left Eye (OS)</label>
                                <input
                                  className={`w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary ${isVisionAbnormal(visitData.objective.visionOs) ? 'border-rose-400' : 'border-gray-200 dark:border-gray-700'}`}
                                  placeholder="20/20"
                                  value={visitData.objective.visionOs}
                                  onChange={(e) => setVisitData({
                                    ...visitData,
                                    objective: { ...visitData.objective, visionOs: e.target.value }
                                  })}
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Both Eyes (OU)</label>
                                <input
                                  className={`w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary ${isVisionAbnormal(visitData.objective.visionOu) ? 'border-rose-400' : 'border-gray-200 dark:border-gray-700'}`}
                                  placeholder="20/20"
                                  value={visitData.objective.visionOu}
                                  onChange={(e) => setVisitData({
                                    ...visitData,
                                    objective: { ...visitData.objective, visionOu: e.target.value }
                                  })}
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Correction</label>
                                <select
                                  className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                  value={visitData.objective.visionCorrection}
                                  onChange={(e) => setVisitData({
                                    ...visitData,
                                    objective: { ...visitData.objective, visionCorrection: e.target.value }
                                  })}
                                >
                                  <option value="">Select</option>
                                  <option value="With correction">With correction</option>
                                  <option value="Without correction">Without correction</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Blurry Vision</label>
                                <select
                                  className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                  value={visitData.objective.visionBlurry}
                                  onChange={(e) => setVisitData({
                                    ...visitData,
                                    objective: { ...visitData.objective, visionBlurry: e.target.value }
                                  })}
                                >
                                  <option value="">Select</option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Floaters / Flashes</label>
                                <select
                                  className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                  value={visitData.objective.visionFloaters}
                                  onChange={(e) => setVisitData({
                                    ...visitData,
                                    objective: { ...visitData.objective, visionFloaters: e.target.value }
                                  })}
                                >
                                  <option value="">Select</option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Eye Pain</label>
                                <select
                                  className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                  value={visitData.objective.visionPain}
                                  onChange={(e) => setVisitData({
                                    ...visitData,
                                    objective: { ...visitData.objective, visionPain: e.target.value }
                                  })}
                                >
                                  <option value="">Select</option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Last Eye Exam</label>
                                <input
                                  type="date"
                                  className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                  value={visitData.objective.visionLastExamDate}
                                  onChange={(e) => setVisitData({
                                    ...visitData,
                                    objective: { ...visitData.objective, visionLastExamDate: e.target.value }
                                  })}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className={`space-y-3 relative pl-4 border-l-2 ${reviewedSections.diabetes ? 'border-blue-400/60' : 'border-red-400/60'}`}>
                      <div className={`absolute -left-2 top-0 size-4 rounded-full border-2 border-white dark:border-gray-900 ${reviewedSections.diabetes ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                      <button
                        onClick={() => handleToggleSection('diabetes')}
                        className="w-full flex items-center justify-between text-left"
                        title="Click to review. No changes required."
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">Diabetes / Sugar Intake</h3>
                          {isA1cOverdue(visitData.diabetes.hbA1cDate) && (
                            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                              A1c overdue
                            </span>
                          )}
                        </div>
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                          {expandedSections.diabetes ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedSections.diabetes && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Fasting Blood Glucose</label>
                              <input
                                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="mg/dL"
                                value={visitData.diabetes.fastingGlucose}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  diabetes: { ...visitData.diabetes, fastingGlucose: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Random Blood Glucose</label>
                              <input
                                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="mg/dL"
                                value={visitData.diabetes.randomGlucose}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  diabetes: { ...visitData.diabetes, randomGlucose: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">HbA1c</label>
                              <div className="flex gap-2">
                                <input
                                  className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                  placeholder="e.g. 7.1%"
                                  value={visitData.diabetes.hbA1cValue}
                                  onChange={(e) => setVisitData({
                                    ...visitData,
                                    diabetes: { ...visitData.diabetes, hbA1cValue: e.target.value }
                                  })}
                                />
                                <input
                                  type="date"
                                  className="h-9 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                  value={visitData.diabetes.hbA1cDate}
                                  onChange={(e) => setVisitData({
                                    ...visitData,
                                    diabetes: { ...visitData.diabetes, hbA1cDate: e.target.value }
                                  })}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Home Glucose Monitoring</label>
                              <select
                                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                value={visitData.diabetes.homeMonitoring}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  diabetes: { ...visitData.diabetes, homeMonitoring: e.target.value }
                                })}
                              >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Average Readings</label>
                              <input
                                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="mg/dL"
                                value={visitData.diabetes.averageReadings}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  diabetes: { ...visitData.diabetes, averageReadings: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Hypoglycemia Episodes</label>
                              <input
                                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="Frequency / notes"
                                value={visitData.diabetes.hypoglycemiaEpisodes}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  diabetes: { ...visitData.diabetes, hypoglycemiaEpisodes: e.target.value }
                                })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Hyperglycemia Symptoms</label>
                              <input
                                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="Symptoms noted"
                                value={visitData.diabetes.hyperglycemiaSymptoms}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  diabetes: { ...visitData.diabetes, hyperglycemiaSymptoms: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Foot Exam Performed</label>
                              <select
                                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                value={visitData.diabetes.footExam}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  diabetes: { ...visitData.diabetes, footExam: e.target.value }
                                })}
                              >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Eye Exam Due</label>
                              <select
                                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                value={visitData.diabetes.eyeExamDue}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  diabetes: { ...visitData.diabetes, eyeExamDue: e.target.value }
                                })}
                              >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className={`space-y-3 relative pl-4 border-l-2 ${reviewedSections.medications ? 'border-blue-400/60' : 'border-red-400/60'}`}>
                      <div className={`absolute -left-2 top-0 size-4 rounded-full border-2 border-white dark:border-gray-900 ${reviewedSections.medications ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                      <button
                        onClick={() => handleToggleSection('medications')}
                        className="w-full flex items-center justify-between text-left"
                        title="Click to review. No changes required."
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Medications
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Adherence</span>
                        </h3>
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                          {expandedSections.medications ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedSections.medications && (
                        <div className="space-y-5">
                          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Medications</div>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                {PatientDataManager.getPatientSectionList(patientId, 'medications').length || 0} on file
                              </span>
                            </div>
                            <textarea
                              className="w-full min-h-[110px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                              placeholder="List current medications and dosing instructions..."
                              value={visitData.medications.currentList}
                              onChange={(e) => setVisitData({
                                ...visitData,
                                medications: { ...visitData.medications, currentList: e.target.value }
                              })}
                            />
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              Auto-filled from the chart when available. Update only if needed.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={visitData.medications.takingAsPrescribed}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  medications: { ...visitData.medications, takingAsPrescribed: e.target.checked }
                                })}
                              />
                              Taking as prescribed
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={visitData.medications.missedDoses}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  medications: { ...visitData.medications, missedDoses: e.target.checked }
                                })}
                              />
                              Missed doses
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={visitData.medications.sideEffects}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  medications: { ...visitData.medications, sideEffects: e.target.checked }
                                })}
                              />
                              Side effects
                            </label>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Insulin Type</label>
                              <input
                                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="e.g. Lispro"
                                value={visitData.medications.insulinType}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  medications: { ...visitData.medications, insulinType: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Insulin Dose</label>
                              <input
                                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="Units"
                                value={visitData.medications.insulinDose}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  medications: { ...visitData.medications, insulinDose: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Insulin Timing</label>
                              <input
                                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="e.g. Before meals"
                                value={visitData.medications.insulinTiming}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  medications: { ...visitData.medications, insulinTiming: e.target.value }
                                })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={visitData.medications.glucoseOral}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  medications: { ...visitData.medications, glucoseOral: e.target.checked }
                                })}
                              />
                              Glucose-lowering agents (oral)
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={visitData.medications.glucoseInjectable}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  medications: { ...visitData.medications, glucoseInjectable: e.target.checked }
                                })}
                              />
                              Glucose-lowering agents (injectable)
                            </label>
                          </div>

                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              checked={visitData.medications.acknowledged}
                              onChange={(e) => {
                                const acknowledged = e.target.checked
                                setVisitData({
                                  ...visitData,
                                  medications: { ...visitData.medications, acknowledged }
                                })
                                setReviewedSections((prev) => ({ ...prev, medications: acknowledged }))
                              }}
                            />
                            Nurse acknowledgment required
                          </label>
                        </div>
                      )}
                    </section>

                    <section className={`space-y-3 relative pl-4 border-l-2 ${reviewedSections.assessmentPlan ? 'border-blue-400/60' : 'border-red-400/60'}`}>
                      <div className={`absolute -left-2 top-0 size-4 rounded-full border-2 border-white dark:border-gray-900 ${reviewedSections.assessmentPlan ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                      <button 
                        onClick={() => handleToggleSection('assessmentPlan')}
                        className="w-full flex items-center justify-between text-left"
                        title="Click to review. No changes required."
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Assessment & Plan</h3>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                            {expandedSections.assessmentPlan ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>
                      </button>
                      {expandedSections.assessmentPlan && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Assessment / Diagnosis</label>
                            <div className="relative">
                              <span className="absolute top-2.5 left-3 text-gray-500 dark:text-gray-400">
                                <span className="material-symbols-outlined text-sm">medical_services</span>
                              </span>
                              <textarea 
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 pl-10 py-2 resize-none" 
                                placeholder="Primary diagnosis..." 
                                value={visitData.assessmentPlan.assessment}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  assessmentPlan: { ...visitData.assessmentPlan, assessment: e.target.value }
                                })}
                                rows={5}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Treatment Plan</label>
                            <div className="relative">
                              <span className="absolute top-2.5 left-3 text-gray-500 dark:text-gray-400">
                                <span className="material-symbols-outlined text-sm">healing</span>
                              </span>
                              <textarea 
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 pl-10 py-2 resize-none" 
                                placeholder="Medications, referrals, follow-up..." 
                                value={visitData.assessmentPlan.plan}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  assessmentPlan: { ...visitData.assessmentPlan, plan: e.target.value }
                                })}
                                rows={5}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className={`space-y-3 relative pl-4 border-l-2 ${reviewedSections.vaccines ? 'border-blue-400/60' : 'border-red-400/60'}`}>
                      <div className={`absolute -left-2 top-0 size-4 rounded-full border-2 border-white dark:border-gray-900 ${reviewedSections.vaccines ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                      <button 
                        onClick={() => handleToggleSection('vaccines')}
                        className="w-full flex items-center justify-between text-left"
                        title="Click to review. No changes required."
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Vaccines
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Immunizations</span>
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                            {expandedSections.vaccines ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>
                      </button>
                      {expandedSections.vaccines && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Vaccine</label>
                            <input 
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2" 
                              placeholder="Search vaccine (e.g. Tdap)" 
                              value={visitData.vaccines.name}
                              onChange={(e) => setVisitData({
                                ...visitData,
                                vaccines: { ...visitData.vaccines, name: e.target.value }
                              })}
                              type="text"
                            />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Date</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                type="date"
                                value={visitData.vaccines.date}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  vaccines: { ...visitData.vaccines, date: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Dose #</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.vaccines.dose}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  vaccines: { ...visitData.vaccines, dose: e.target.value }
                                })}
                              >
                                <option>Booster</option>
                                <option>1st</option>
                                <option>2nd</option>
                                <option>3rd</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Site</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.vaccines.site}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  vaccines: { ...visitData.vaccines, site: e.target.value }
                                })}
                              >
                                <option>Left Deltoid</option>
                                <option>Right Deltoid</option>
                                <option>Left Thigh</option>
                                <option>Right Thigh</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Route</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.vaccines.route}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  vaccines: { ...visitData.vaccines, route: e.target.value }
                                })}
                              >
                                <option>Intramuscular (IM)</option>
                                <option>Subcutaneous (SC)</option>
                                <option>Oral</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Lot Number</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="Lot #"
                                type="text"
                                value={visitData.vaccines.lotNumber}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  vaccines: { ...visitData.vaccines, lotNumber: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Manufacturer</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.vaccines.manufacturer}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  vaccines: { ...visitData.vaccines, manufacturer: e.target.value }
                                })}
                              >
                                <option>Select Manufacturer</option>
                                <option>Pfizer</option>
                                <option>Moderna</option>
                                <option>Johnson & Johnson</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className={`space-y-3 relative pl-4 border-l-2 ${reviewedSections.familyHistory ? 'border-blue-400/60' : 'border-red-400/60'}`}>
                      <div className={`absolute -left-2 top-0 size-4 rounded-full border-2 border-white dark:border-gray-900 ${reviewedSections.familyHistory ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                      <button 
                        onClick={() => handleToggleSection('familyHistory')}
                        className="w-full flex items-center justify-between text-left"
                        title="Click to review. No changes required."
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Family Health History
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Genetic Risk Factors</span>
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                            {expandedSections.familyHistory ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>
                      </button>
                      {expandedSections.familyHistory && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Relationship</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.familyHistory.relationship}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  familyHistory: { ...visitData.familyHistory, relationship: e.target.value }
                                })}
                              >
                                <option>Select...</option>
                                <option>Mother</option>
                                <option>Father</option>
                                <option>Sibling</option>
                                <option>Grandparent</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Status</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.familyHistory.status}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  familyHistory: { ...visitData.familyHistory, status: e.target.value }
                                })}
                              >
                                <option>Living</option>
                                <option>Deceased</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Known Conditions</label>
                            <input 
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2" 
                              placeholder="Search other conditions..." 
                              value={visitData.familyHistory.conditions}
                              onChange={(e) => setVisitData({
                                ...visitData,
                                familyHistory: { ...visitData.familyHistory, conditions: e.target.value }
                              })}
                              type="text"
                            />
                          </div>
                        </div>
                      )}
                    </section>

                    <section className={`space-y-3 relative pl-4 border-l-2 ${reviewedSections.riskFlags ? 'border-blue-400/60' : 'border-red-400/60'}`}>
                      <div className={`absolute -left-2 top-0 size-4 rounded-full border-2 border-white dark:border-gray-900 ${reviewedSections.riskFlags ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                      <button 
                        onClick={() => handleToggleSection('riskFlags')}
                        className="w-full flex items-center justify-between text-left"
                        title="Click to review. No changes required."
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Risk Flags
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Social & Lifestyle</span>
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                            {expandedSections.riskFlags ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>
                      </button>
                      {expandedSections.riskFlags && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Tobacco Use</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.riskFlags.tobaccoUse}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  riskFlags: { ...visitData.riskFlags, tobaccoUse: e.target.value }
                                })}
                              >
                                <option>Current</option>
                                <option>Former</option>
                                <option>Never</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Amount</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="10 cigs / day"
                                type="text"
                                value={visitData.riskFlags.tobaccoAmount}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  riskFlags: { ...visitData.riskFlags, tobaccoAmount: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Alcohol Use</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.riskFlags.alcoholUse}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  riskFlags: { ...visitData.riskFlags, alcoholUse: e.target.value }
                                })}
                              >
                                <option>Social</option>
                                <option>Heavy</option>
                                <option>None</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Frequency</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="2-3 drinks / week"
                                type="text"
                                value={visitData.riskFlags.alcoholFrequency}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  riskFlags: { ...visitData.riskFlags, alcoholFrequency: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Housing Status</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.riskFlags.housingStatus}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  riskFlags: { ...visitData.riskFlags, housingStatus: e.target.value }
                                })}
                              >
                                <option>Stable</option>
                                <option>Unstable</option>
                                <option>Homeless</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Occupation</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="Logistics Manager"
                                type="text"
                                value={visitData.riskFlags.occupation}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  riskFlags: { ...visitData.riskFlags, occupation: e.target.value }
                                })}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className={`space-y-3 relative pl-4 border-l-2 ${reviewedSections.surgicalHistory ? 'border-blue-400/60' : 'border-red-400/60'}`}>
                      <div className={`absolute -left-2 top-0 size-4 rounded-full border-2 border-white dark:border-gray-900 ${reviewedSections.surgicalHistory ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                      <button 
                        onClick={() => handleToggleSection('surgicalHistory')}
                        className="w-full flex items-center justify-between text-left"
                        title="Click to review. No changes required."
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Surgical History
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Procedures & Operations</span>
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                            {expandedSections.surgicalHistory ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>
                      </button>
                      {expandedSections.surgicalHistory && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Procedure</label>
                              <input 
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2" 
                                placeholder="e.g. Appendectomy" 
                                value={visitData.surgicalHistory.procedure}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  surgicalHistory: { ...visitData.surgicalHistory, procedure: e.target.value }
                                })}
                                type="text"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Date / Year</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="YYYY"
                                type="text"
                                value={visitData.surgicalHistory.date}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  surgicalHistory: { ...visitData.surgicalHistory, date: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Site</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="Left Knee"
                                type="text"
                                value={visitData.surgicalHistory.site}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  surgicalHistory: { ...visitData.surgicalHistory, site: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Surgeon</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="Dr. R. Miller"
                                type="text"
                                value={visitData.surgicalHistory.surgeon}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  surgicalHistory: { ...visitData.surgicalHistory, surgeon: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Outcome</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.surgicalHistory.outcome}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  surgicalHistory: { ...visitData.surgicalHistory, outcome: e.target.value }
                                })}
                              >
                                <option>No Issues</option>
                                <option>Complications</option>
                                <option>Unknown</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Source</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.surgicalHistory.source}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  surgicalHistory: { ...visitData.surgicalHistory, source: e.target.value }
                                })}
                              >
                                <option>Patient Reported</option>
                                <option>Medical Records</option>
                                <option>External Record</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className={`space-y-3 relative pl-4 border-l-2 ${reviewedSections.pastMedicalHistory ? 'border-blue-400/60' : 'border-red-400/60'}`}>
                      <div className={`absolute -left-2 top-0 size-4 rounded-full border-2 border-white dark:border-gray-900 ${reviewedSections.pastMedicalHistory ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                      <button 
                        onClick={() => handleToggleSection('pastMedicalHistory')}
                        className="w-full flex items-center justify-between text-left"
                        title="Click to review. No changes required."
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Past Medical History
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Chronic Conditions</span>
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                            {expandedSections.pastMedicalHistory ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>
                      </button>
                      {expandedSections.pastMedicalHistory && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Condition</label>
                              <input 
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2" 
                                placeholder="Type 2 Diabetes Mellitus" 
                                value={visitData.pastMedicalHistory.condition}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  pastMedicalHistory: { ...visitData.pastMedicalHistory, condition: e.target.value }
                                })}
                                type="text"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Status</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.pastMedicalHistory.status}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  pastMedicalHistory: { ...visitData.pastMedicalHistory, status: e.target.value }
                                })}
                              >
                                <option>Active</option>
                                <option>Resolved</option>
                                <option>Inactive</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Date Diagnosed</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                type="date"
                                value={visitData.pastMedicalHistory.diagnosedDate}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  pastMedicalHistory: { ...visitData.pastMedicalHistory, diagnosedDate: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Impact</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.pastMedicalHistory.impact}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  pastMedicalHistory: { ...visitData.pastMedicalHistory, impact: e.target.value }
                                })}
                              >
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">ICD-10 Code</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="E11.9"
                                type="text"
                                value={visitData.pastMedicalHistory.icd10}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  pastMedicalHistory: { ...visitData.pastMedicalHistory, icd10: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Source</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.pastMedicalHistory.source}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  pastMedicalHistory: { ...visitData.pastMedicalHistory, source: e.target.value }
                                })}
                              >
                                <option>Clinician</option>
                                <option>Patient</option>
                                <option>Lab</option>
                                <option>Imaging</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className={`space-y-3 relative pl-4 border-l-2 ${reviewedSections.orders ? 'border-blue-400/60' : 'border-red-400/60'}`}>
                      <div className={`absolute -left-2 top-0 size-4 rounded-full border-2 border-white dark:border-gray-900 ${reviewedSections.orders ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                      <button 
                        onClick={() => handleToggleSection('orders')}
                        className="w-full flex items-center justify-between text-left"
                        title="Click to review. No changes required."
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Orders
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Labs, Imaging & Medications</span>
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                            {expandedSections.orders ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>
                      </button>
                      {expandedSections.orders && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Order Type</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.orders.type}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  orders: { ...visitData.orders, type: e.target.value }
                                })}
                              >
                                <option>Medication</option>
                                <option>Lab</option>
                                <option>Imaging</option>
                                <option>Referral</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Priority</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.orders.priority}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  orders: { ...visitData.orders, priority: e.target.value }
                                })}
                              >
                                <option>Routine</option>
                                <option>Urgent</option>
                                <option>STAT</option>
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Order Details</label>
                              <input 
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2" 
                                placeholder="CBC with Differential" 
                                value={visitData.orders.details}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  orders: { ...visitData.orders, details: e.target.value }
                                })}
                                type="text"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Status</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.orders.status}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  orders: { ...visitData.orders, status: e.target.value }
                                })}
                              >
                                <option>Pending</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                                <option>Cancelled</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Date Ordered</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                type="date"
                                value={visitData.orders.dateOrdered}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  orders: { ...visitData.orders, dateOrdered: e.target.value }
                                })}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </section>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default NurseNewVisitForm
