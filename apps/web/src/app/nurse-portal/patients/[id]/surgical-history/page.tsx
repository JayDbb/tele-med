import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import SurgicalHistory from '@/components/SurgicalHistory'
import GlobalSearchBar from '@/components/GlobalSearchBar'

interface SurgicalHistoryPageProps {
  params: {
    id: string
  }
}

export default function SurgicalHistoryPage({ params }: SurgicalHistoryPageProps) {
  return (
    <div className="relative flex min-h-screen w-full">
      <NurseSidebar />
      <PatientDetailSidebar patientId={params.id} />
      
      <main className="flex-1 p-8">
        <div className="mb-6">
          <GlobalSearchBar />
        </div>
        <SurgicalHistory patientId={params.id} />
      </main>
    </div>
  )
}