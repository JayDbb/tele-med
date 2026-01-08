'use client'

import { useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PatientDetail from '@/components/PatientDetail'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = Array.isArray(params.id) ? params.id[0] : params.id || ''

  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen w-full">
      <Sidebar />
      <PatientDetailSidebar patientId={patientId} />
      
      <main className="flex-1 p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <GlobalSearchBar />
        </div>
        <PatientDetail patientId={patientId} />
      </main>
    </div>
  )
}
