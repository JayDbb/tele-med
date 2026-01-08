import NurseSidebar from '@/components/NurseSidebar'
import SearchBar from '@/components/SearchBar'
import PatientsList from '@/components/PatientsList'

export default function NursePatientsPage() {
  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen w-full">
      <NurseSidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-6">
          <SearchBar />
        </div>
        <PatientsList />
      </main>
    </div>
  )
}