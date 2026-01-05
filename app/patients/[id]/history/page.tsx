import RoleBasedSidebar from '@/components/RoleBasedSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import VisitHistory from '@/components/VisitHistory'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default async function VisitHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="relative flex min-h-screen w-full">
      <RoleBasedSidebar />
      <PatientDetailSidebar patientId={id} />

      <main className="flex-1 p-8">
        <div className="mb-6">
          <GlobalSearchBar />
        </div>
        <VisitHistory patientId={id} />
      </main>
    </div>
  )
}