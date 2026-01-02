'use client'

import Sidebar from '@/components/Sidebar'

const MedicationsPage = () => {
  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medication History</h1>
          <a href="/medications/new" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            <span className="material-symbols-outlined text-sm">add</span>
            Add
          </a>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
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
      </main>
    </div>
  )
}

export default MedicationsPage