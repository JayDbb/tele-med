'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import PatientDetail from '@/components/PatientDetail'

export default function NursePatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  const isValidPatientId = (value?: string) => {
    const normalized = `${value ?? ''}`.trim()
    return normalized.length > 0 && normalized !== 'undefined' && normalized !== 'null'
  }

  useEffect(() => {
    if (!isValidPatientId(patientId)) {
      router.push('/nurse-portal')
    }
  }, [patientId, router])

  if (!isValidPatientId(patientId)) {
    return null
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NurseSidebar />
      <PatientDetailSidebar patientId={patientId} />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <PatientDetail patientId={patientId} />
        </div>
      </main>
    </div>
  )
}
