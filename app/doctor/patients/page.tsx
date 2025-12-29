import Sidebar from '@/components/Sidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import PatientsList from '@/components/PatientsList'

export default function PatientsPage() {
  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-6">
          <GlobalSearchBar />
        </div>
        <PatientsList />
      </main>
    </div>
  )
}