'use client'

import Sidebar from '@/components/Sidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import PatientsList from '@/components/PatientsList'
import MobileBottomNav from '@/components/MobileBottomNav'
import OfflineIndicator from '@/components/OfflineIndicator'
import SyncStatus from '@/components/SyncStatus'

export default function PatientsPage() {
  const mobileNavItems = [
    { icon: 'home', label: 'Home', href: '/doctor/dashboard' },
    { icon: 'groups', label: 'Patients', href: '/doctor/patients' },
    { icon: 'calendar_month', label: 'Calendar', href: '/doctor/calendar' },
    { icon: 'inbox', label: 'Inbox', href: '/doctor/inbox' },
  ]

  return (
    <div className="relative flex min-h-screen w-full">
      <OfflineIndicator />
      <Sidebar />
      
      <main className="flex-1 p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between mb-4">
            <GlobalSearchBar />
            <div className="hidden sm:block">
              <SyncStatus showDetails={false} />
            </div>
          </div>
          <div className="block sm:hidden">
            <SyncStatus showDetails={false} />
          </div>
        </div>
        <PatientsList />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav items={mobileNavItems} />
    </div>
  )
}