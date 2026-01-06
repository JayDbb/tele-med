import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import VisitHistory from '@/components/VisitHistory'
import GlobalSearchBar from '@/components/GlobalSearchBar'

interface HistoryPageProps {
  params: {
    id: string
  }
}

export default function HistoryPage({ params }: HistoryPageProps) {
  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
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