import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import PatientDetail from '@/components/PatientDetail'
import GlobalSearchBar from '@/components/GlobalSearchBar'

interface PatientPageProps {
  params: {
    id: string
  }
}

export default function PatientPage({ params }: PatientPageProps) {
  return (
    <div className="relative flex min-h-screen w-full">
      <NurseSidebar />
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