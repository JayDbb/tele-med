'use client'

import Sidebar from '@/components/Sidebar'
import DoctorAssignedPatients from '@/components/DoctorAssignedPatients'
import GlobalSearchBar from '@/components/GlobalSearchBar'

// Force cache refresh - timestamp: 2025-01-02-13:35
export default function Dashboard() {
  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen w-full">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-6">
          <GlobalSearchBar />
        </div>
        <DoctorAssignedPatients />
      </main>
    </div>
  )
}
