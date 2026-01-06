import NurseSidebar from '@/components/NurseSidebar'
import SearchBar from '@/components/SearchBar'
import PatientsList from '@/components/PatientsList'

export default function NursePatientsPage() {
  return (
    <div className="relative flex min-h-screen w-full">
      <NurseSidebar />
      
      <main className="flex-1 p-8 grid grid-cols-12 gap-8">
        <SearchBar />
        <PatientsList />
      </main>
    </div>
  )
}