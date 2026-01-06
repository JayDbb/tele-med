'use client'

import NurseSidebar from '@/components/NurseSidebar'
import NurseHeader from '@/components/NurseHeader'
import DoctorsStatus from '@/components/DoctorsStatus'
import RecentPatients from '@/components/RecentPatients'

export default function NurseDashboard() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-[#111418] dark:text-white overflow-hidden h-screen w-full flex">
      <NurseSidebar />
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative">
        <NurseHeader />
        <div className="px-8 pb-10 flex flex-col gap-8">
          <DoctorsStatus />
          <RecentPatients />
        </div>
      </main>
    </div>
  )
}