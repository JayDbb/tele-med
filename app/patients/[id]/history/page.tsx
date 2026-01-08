import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import VisitHistory from '@/components/VisitHistory'

export default async function VisitHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <PatientDetailSidebar patientId={id} />
        <main className="flex-1 overflow-y-auto p-6">
          <VisitHistory patientId={id} />
        </main>
      </div>
    </div>
  )
}
