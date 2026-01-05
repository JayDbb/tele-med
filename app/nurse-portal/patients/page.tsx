import RoleBasedSidebar from '@/components/RoleBasedSidebar'
import SearchBar from '@/components/SearchBar'
import PatientsList from '@/components/PatientsList'

export default function NursePatientsPage() {
  return (
    <div className="relative flex min-h-screen w-full">
      <RoleBasedSidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-6">
          <SearchBar />
        </div>
        <PatientsList />
      </main>
    </div>
  )
}