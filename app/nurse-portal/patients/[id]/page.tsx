'use client'

import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import PatientDetail from '@/components/PatientDetail'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { useNurse } from '@/contexts/NurseContext'
import { useRouter } from 'next/navigation'

interface PatientPageProps {
  params: {
    id: string
  }
}

export default function PatientPage({ params }: PatientPageProps) {
  const router = useRouter()
  const { nurse } = useNurse()

  const handleSaveDraft = () => {
    const patient = PatientDataManager.getPatient(params.id)
    if (!patient) return
    const nowIso = new Date().toISOString()
    PatientDataManager.savePatient(
      {
        ...patient,
        status: patient.status || 'Draft',
        draftSavedAt: nowIso,
        draftSavedBy: nurse?.name || 'Staff',
        updatedAt: nowIso
      },
      'update',
      nurse?.id || 'system'
    )
    PatientDataManager.logAction(
      params.id,
      'draft',
      'patient-profile',
      nurse?.id || 'system',
      nurse?.name || 'Staff',
      { notes: 'Saved draft without closing the visit.' }
    )
  }

  const handleFlagForReview = () => {
    const patient = PatientDataManager.getPatient(params.id)
    if (!patient) return
    const nowIso = new Date().toISOString()
    PatientDataManager.savePatient(
      {
        ...patient,
        reviewFlag: true,
        reviewFlaggedAt: nowIso,
        reviewFlaggedBy: nurse?.name || 'Staff',
        updatedAt: nowIso
      },
      'update',
      nurse?.id || 'system'
    )
    PatientDataManager.logAction(
      params.id,
      'flag',
      'patient-profile',
      nurse?.id || 'system',
      nurse?.name || 'Staff',
      { notes: 'Flagged patient profile for review.' }
    )
  }

  const handleSignAndClose = () => {
    const patient = PatientDataManager.getPatient(params.id)
    if (!patient) return
    const nowIso = new Date().toISOString()

    const updatedPatient = {
      ...patient,
      status: 'Completed',
      statusColor: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300',
      appointment: 'Completed',
      completedAt: nowIso,
      completedBy: nurse?.name || 'Staff',
      updatedAt: nowIso
    }
    PatientDataManager.savePatient(updatedPatient, 'update', nurse?.id || 'system')
    PatientDataManager.logAction(
      params.id,
      'complete',
      'patient-profile',
      nurse?.id || 'system',
      nurse?.name || 'Staff',
      { notes: 'Signed and closed visit.' }
    )
    router.push('/nurse-portal')
  }

  return (
    <div className="relative flex min-h-screen w-full">
      <NurseSidebar />
      <PatientDetailSidebar patientId={params.id} />
      
      <main className="flex-1 p-8">
        <div className="mb-6">
          <GlobalSearchBar />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            Save Draft
          </button>
          <button
            onClick={handleFlagForReview}
            className="px-4 py-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">flag</span>
            Flag for Review
          </button>
          <button
            onClick={handleSignAndClose}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Sign & Close Visit
          </button>
        </div>
        
        <PatientDetail patientId={params.id} />
      </main>
    </div>
  )
}
