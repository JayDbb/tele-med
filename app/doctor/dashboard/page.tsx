'use client'

import RoleBasedSidebar from '@/components/RoleBasedSidebar'
import DoctorAssignedPatients from '@/components/DoctorAssignedPatients'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import AvailabilityToggle from '@/components/AvailabilityToggle'

// Force cache refresh - timestamp: 2025-01-02-13:35
export default function Dashboard() {
  return (
    <div className="relative flex min-h-screen w-full">
      <RoleBasedSidebar />

      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <GlobalSearchBar />
          <AvailabilityToggle />
        </div>
        <DoctorAssignedPatients />
      </main>
    </div>
  )
}
