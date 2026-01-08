import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import VisitDetail from '@/components/VisitDetail'

export default async function VisitDetailPage({ params }: { params: Promise<{ id: string; visitId: string }> }) {
  const { id, visitId } = await params
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex">
        <PatientDetailSidebar patientId={id} />
        <main className="flex-1 p-6">
          <VisitDetail patientId={id} visitId={visitId} />
        </main>
      </div>
    </div>
  )
}
