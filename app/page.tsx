import Sidebar from '@/components/Sidebar'
import SearchBar from '@/components/SearchBar'
import Calendar from '@/components/Calendar'
import Timeline from '@/components/Timeline'
import Appointments from '@/components/Appointments'
import AppointmentDetail from '@/components/AppointmentDetail'
import PatientConditions from '@/components/PatientConditions'
import ImportantUpdates from '@/components/ImportantUpdates'

export default function Dashboard() {
  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      
      <main className="flex-1 p-8 grid grid-cols-12 gap-8">
        <SearchBar />
        
        {/* Center Column */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-8">
          <Calendar />
          <Timeline />
          <Appointments />
          <AppointmentDetail />
        </div>
        
        {/* Right Utility Panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <PatientConditions />
          <ImportantUpdates />
        </div>
      </main>
    </div>
  )
}