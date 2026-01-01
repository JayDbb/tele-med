'use client'

import Sidebar from '@/components/Sidebar'
import dynamic from 'next/dynamic'
const MedicationsTable = dynamic(() => import('@/components/MedicationsTable'), { ssr: false })

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
        <div>
          <MedicationsTable />
        </div>
      </main>
    </div>
  )
}

export default MedicationsPage