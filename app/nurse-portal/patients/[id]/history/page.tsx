'use client'

import { useParams } from 'next/navigation'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import VisitHistory from '@/components/VisitHistory'

export default function PatientHistoryPage() {
  const params = useParams()
  const patientId = params.id as string

  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen w-full">
      <NurseSidebar />
      <PatientDetailSidebar patientId={patientId} />
      
      <main className="flex-1 p-8">
        <div className="mb-6">
          <GlobalSearchBar />
        </div>
        <VisitHistory patientId={patientId} />
      </main>
    </div>
  )
}
