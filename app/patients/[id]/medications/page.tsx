'use client'

import { useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default function PatientMedicationsPage() {
  const params = useParams()

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
      <Sidebar />
      <PatientDetailSidebar patientId={params.id as string} />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Medication History</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  Print List
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Medication
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">Brand Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">Generic</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">Strength</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">Form</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">Lisinopril</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">Lisinopril</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">10mg</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">Tab</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">Ibuprofen</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">Ibuprofen</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">400mg</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">Tab</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                        Discontinued
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}