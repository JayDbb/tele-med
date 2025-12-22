import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import VisitDetail from '@/components/VisitDetail'

export default function VisitDetailPage({ params }: { params: { id: string; visitId: string } }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex">
        <PatientDetailSidebar patientId={params.id} />
        <main className="flex-1 p-6">
          <VisitDetail patientId={params.id} visitId={params.visitId} />
        </main>
      </div>
    </div>
  )
}