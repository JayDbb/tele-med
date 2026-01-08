'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PatientData, PatientDataManager } from '@/utils/PatientDataManager'

interface PatientDetailProps {
  patientId: string
}

const PatientDetail = ({ patientId }: PatientDetailProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const [patient, setPatient] = useState<PatientData | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [sections, setSections] = useState({
    vitals: [] as any[],
    allergies: [] as any[],
    medications: [] as any[],
    visits: [] as any[],
    familyHistory: [] as any[],
    socialHistory: [] as any[],
    surgicalHistory: [] as any[],
    pastMedicalHistory: [] as any[],
    orders: [] as any[],
    documents: [] as any[]
  })
  const isNursePortal = pathname.startsWith('/nurse-portal')
  const isDoctorPortal = pathname.startsWith('/doctor')
  const basePath = isNursePortal
    ? '/nurse-portal/patients'
    : isDoctorPortal
      ? '/doctor/patients'
      : '/patients'
  const patientBasePath = `${basePath}/${patientId}`
  
  useEffect(() => {
    const loadPatient = () => {
      setPatient(PatientDataManager.getPatient(patientId))
      setSections({
        vitals: PatientDataManager.getPatientSectionList(patientId, 'vitals'),
        allergies: PatientDataManager.getPatientSectionList(patientId, 'allergies'),
        medications: PatientDataManager.getPatientSectionList(patientId, 'medications'),
        visits: PatientDataManager.getPatientSectionList(patientId, 'visits'),
        familyHistory: PatientDataManager.getPatientSectionList(patientId, 'family-history'),
        socialHistory: PatientDataManager.getPatientSectionList(patientId, 'social-history'),
        surgicalHistory: PatientDataManager.getPatientSectionList(patientId, 'surgical-history'),
        pastMedicalHistory: PatientDataManager.getPatientSectionList(patientId, 'past-medical-history'),
        orders: PatientDataManager.getPatientSectionList(patientId, 'orders'),
        documents: PatientDataManager.getPatientSectionList(patientId, 'documents')
      })
      setHasLoaded(true)
    }
    loadPatient()
    window.addEventListener('storage', loadPatient)
    window.addEventListener('patient-data-updated', loadPatient as EventListener)
    return () => {
      window.removeEventListener('storage', loadPatient)
      window.removeEventListener('patient-data-updated', loadPatient as EventListener)
    }
  }, [patientId])

  const latestVitals = useMemo(() => {
    const sorted = [...sections.vitals].sort((a, b) => {
      const aTime = new Date(a?.recordedAt || a?.updatedAt || a?.createdAt || 0).getTime()
      const bTime = new Date(b?.recordedAt || b?.updatedAt || b?.createdAt || 0).getTime()
      return bTime - aTime
    })
    return sorted[0] || null
  }, [sections.vitals])

  const latestVisit = useMemo(() => {
    const sorted = [...sections.visits].sort((a, b) => {
      const aTime = new Date(a?.recordedAt || a?.updatedAt || a?.createdAt || 0).getTime()
      const bTime = new Date(b?.recordedAt || b?.updatedAt || b?.createdAt || 0).getTime()
      return bTime - aTime
    })
    return sorted[0] || null
  }, [sections.visits])

  const formatDateTime = (value?: string) => {
    if (!value) return 'Not recorded'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Not recorded'
    return date.toLocaleString()
  }

  const parseBp = (value?: string) => {
    if (!value) return null
    const match = value.match(/(\d+)\s*\/\s*(\d+)/)
    if (!match) return null
    return { systolic: Number(match[1]), diastolic: Number(match[2]) }
  }

  const riskFlags = useMemo(() => {
    const flags: string[] = []
    const bpValue = latestVitals?.bp || latestVitals?.bloodPressure
    const parsedBp = typeof bpValue === 'string' ? parseBp(bpValue) : null
    const systolic = parsedBp?.systolic ?? latestVitals?.systolic
    const diastolic = parsedBp?.diastolic ?? latestVitals?.diastolic
    if ((systolic && systolic >= 140) || (diastolic && diastolic >= 90)) {
      flags.push('High blood pressure')
    }
    const hba1c = Number(latestVisit?.diabetes?.hbA1cValue || latestVisit?.diabetes?.hba1cValue || 0)
    if (hba1c && hba1c >= 7.5) {
      flags.push('Uncontrolled sugar')
    }
    if (latestVitals?.temp && Number(latestVitals.temp) >= 100.4) {
      flags.push('Fever')
    }
    return flags
  }, [latestVitals, latestVisit])

  const reviewProgress = useMemo(() => {
    if (!latestVisit) return 0
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
      const section = (latestVisit as any)?.[key]
      return count + (hasSectionValues(section) ? 1 : 0)
    }, 0)
    return Math.round((reviewCount / sectionKeys.length) * 100)
  }, [latestVisit])

  const medicationSummary = useMemo(() => {
    if (sections.medications.length > 0) {
      return sections.medications.slice(0, 3).map((item) =>
        item.name || item.medication || item.drug || item.brandName || item.generic || 'Medication'
      )
    }
    const list = `${latestVisit?.medications?.currentList || ''}`
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    return list.slice(0, 3)
  }, [sections.medications, latestVisit])

  if (!hasLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading patient...</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Patient Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The requested patient could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Overview</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`${patientBasePath}/new-visit`)}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm font-semibold"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">edit_calendar</span>
            Log New Visit
          </button>
          {isNursePortal && (
            <button
              onClick={() => router.push(`${patientBasePath}/intake`)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-sm">assignment</span>
              Begin Intake
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Link href={`${patientBasePath}/history`} className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Last Visit</h3>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">View history</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Date</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{formatDateTime(latestVisit?.recordedAt)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Chief complaint</p>
          <p className="text-sm text-gray-900 dark:text-white">
            {latestVisit?.subjective?.chiefComplaint || 'No chief complaint recorded'}
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
              <span>Visit note progress</span>
              <span>{reviewProgress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${reviewProgress}%` }} />
            </div>
          </div>
        </Link>

        <Link href={`${patientBasePath}/vitals`} className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Vitals Summary</h3>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Vitals</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">BP</p>
              <p className="font-semibold text-gray-900 dark:text-white">{latestVitals?.bp || latestVitals?.bloodPressure || '--'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">HR</p>
              <p className="font-semibold text-gray-900 dark:text-white">{latestVitals?.hr || latestVitals?.heartRate || '--'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Temp</p>
              <p className="font-semibold text-gray-900 dark:text-white">{latestVitals?.temp || latestVitals?.temperature || '--'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Weight</p>
              <p className="font-semibold text-gray-900 dark:text-white">{latestVitals?.weight || '--'}</p>
            </div>
          </div>
        </Link>

        <Link href={`${patientBasePath}/allergies`} className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Allergies</h3>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">{sections.allergies.length} active</span>
          </div>
          <div className="space-y-2 text-sm">
            {sections.allergies.length > 0 ? (
              sections.allergies.slice(0, 3).map((allergy: any) => (
                <div key={allergy.id || allergy.name} className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">{allergy.name || 'Unnamed allergy'}</span>
                  <span className="text-[11px] text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
                    {allergy.severity || 'Unknown'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No known allergies</p>
            )}
          </div>
        </Link>

        <Link href={`${patientBasePath}/medications`} className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Current Medications</h3>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Medications</span>
          </div>
          <div className="space-y-2 text-sm">
            {medicationSummary.length > 0 ? (
              medicationSummary.map((med, index) => (
                <div key={`${med}-${index}`} className="text-sm text-gray-900 dark:text-white font-medium">
                  {med}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No medications recorded</p>
            )}
          </div>
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">History Highlights</h3>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Chart</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link href={`${patientBasePath}/family-history`} className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="text-gray-500 dark:text-gray-400">Family</p>
              <p className="font-semibold text-gray-900 dark:text-white">{sections.familyHistory.length || 0} items</p>
            </Link>
            <Link href={`${patientBasePath}/social-history`} className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="text-gray-500 dark:text-gray-400">Social</p>
              <p className="font-semibold text-gray-900 dark:text-white">{sections.socialHistory.length || 0} items</p>
            </Link>
            <Link href={`${patientBasePath}/surgical-history`} className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="text-gray-500 dark:text-gray-400">Surgical</p>
              <p className="font-semibold text-gray-900 dark:text-white">{sections.surgicalHistory.length || 0} items</p>
            </Link>
            <Link href={`${patientBasePath}/past-medical-history`} className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="text-gray-500 dark:text-gray-400">Past Medical</p>
              <p className="font-semibold text-gray-900 dark:text-white">{sections.pastMedicalHistory.length || 0} items</p>
            </Link>
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Risk Flags</p>
            {riskFlags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {riskFlags.slice(0, 3).map((flag) => (
                  <span key={flag} className="text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200 px-2 py-0.5 rounded-full">
                    {flag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">No flags</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Orders & Documents</h3>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Recent</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link href={`${patientBasePath}/orders`} className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="text-gray-500 dark:text-gray-400">Orders</p>
              <p className="font-semibold text-gray-900 dark:text-white">{sections.orders.length || 0} items</p>
            </Link>
            <Link href={`${patientBasePath}/documents`} className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="text-gray-500 dark:text-gray-400">Documents</p>
              <p className="font-semibold text-gray-900 dark:text-white">{sections.documents.length || 0} files</p>
            </Link>
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.status || 'Not recorded'}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default PatientDetail
