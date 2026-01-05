import RoleBasedSidebar from '@/components/RoleBasedSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import VisitHistory from '@/components/VisitHistory'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default function VisitHistoryPage({ params }: { params: { id: string } }) {
  return (
    <div className="relative flex min-h-screen w-full">
      <RoleBasedSidebar />
      <PatientDetailSidebar patientId={params.id} />

      <main className="flex-1 p-8">
        <div className="mb-6">
          <GlobalSearchBar />
        </div>
        <VisitHistory patientId={params.id} />
      </main>
    </div>
  )
}