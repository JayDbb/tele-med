import Sidebar from '@/components/Sidebar'
import PatientDetail from '@/components/PatientDetail'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 overflow-hidden">
        <PatientDetailSidebar patientId={params.id} />
        <PatientDetail patientId={params.id} />
      </div>
    </div>
  )
}