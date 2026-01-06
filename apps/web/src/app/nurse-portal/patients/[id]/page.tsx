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
        
        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">save</span>
            Save Draft
          </button>
          <button className="px-4 py-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">flag</span>
            Flag for Review
          </button>
          <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Sign & Close Visit
          </button>
        </div>
        
        <PatientDetail patientId={params.id} />
      </main>
    </div>
  )
}