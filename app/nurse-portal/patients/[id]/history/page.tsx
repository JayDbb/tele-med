import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import VisitHistory from '@/components/VisitHistory'

interface PatientPageProps {
  params: {
    id: string
  }
}

export default function PatientHistoryPage({ params }: PatientPageProps) {
  return (
    <div className="relative flex min-h-screen w-full">
      <NurseSidebar />
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
