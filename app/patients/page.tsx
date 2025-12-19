import Sidebar from '@/components/Sidebar'
import SearchBar from '@/components/SearchBar'
import PatientsList from '@/components/PatientsList'

export default function PatientsPage() {
  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      
      <main className="flex-1 p-8 grid grid-cols-12 gap-8">
        <SearchBar />
        <PatientsList />
      </main>
    </div>
  )
}