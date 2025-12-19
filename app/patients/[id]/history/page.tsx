import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import VisitHistory from '@/components/VisitHistory'

export default function VisitHistoryPage({ params }: { params: { id: string } }) {
  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 overflow-hidden">
        <PatientDetailSidebar />
        <VisitHistory patientId={params.id} />
      </div>
    </div>
  )
}