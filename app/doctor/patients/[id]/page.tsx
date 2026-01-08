'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PatientDetail from '@/components/PatientDetail'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { useDoctor } from '@/contexts/DoctorContext'

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = Array.isArray(params.id) ? params.id[0] : params.id || ''
  const { doctor } = useDoctor()
  const [isCompleting, setIsCompleting] = useState(false)

  const handleMarkComplete = () => {
    const patient = PatientDataManager.getPatient(patientId)
    if (!patient || isCompleting) return
    setIsCompleting(true)
    const nowIso = new Date().toISOString()
    PatientDataManager.savePatient(
      {
        ...patient,
        status: 'Completed',
        appointment: 'Completed',
        updatedAt: nowIso
      },
      'update',
      doctor?.id || 'system'
    )
    PatientDataManager.logAction(
      patientId,
      'complete',
      'patient-profile',
      doctor?.id || 'system',
      doctor?.name || 'System',
      { notes: 'Marked patient profile as completed.' }
    )
    setIsCompleting(false)
  }

  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      <PatientDetailSidebar patientId={patientId} />
      
      <main className="flex-1 p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <GlobalSearchBar />
          <button
            onClick={handleMarkComplete}
            disabled={isCompleting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Mark Complete
          </button>
        </div>
        <PatientDetail patientId={patientId} />
      </main>
    </div>
  )
}
