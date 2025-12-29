import Sidebar from '@/components/Sidebar'
import PatientDetail from '@/components/PatientDetail'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      <PatientDetailSidebar patientId={params.id} />
      
      <main className="flex-1 p-8">
        <div className="mb-6">
          <GlobalSearchBar />
        </div>
        <PatientDetail patientId={params.id} />
      </main>
    </div>
  )
}