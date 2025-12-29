'use client'

import Link from 'next/link'
import { useState } from 'react'

interface PatientDetailSidebarProps {
  patientId: string
}

const PatientDetailSidebar = ({ patientId }: PatientDetailSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const patients = [
    {
      id: '1',
      name: 'Leslie Alexander',
      email: 'willie.jennings@example.com',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM3ICbZ8z0Efd_JndI0nxLf1xoPT9Qu5u7JOVQk1C4v9jvf9Imxxeihie4tzXRP0fxByp_jZ5-t8ZaRReubpV0Ot7RZKtjdd8nGeVTenCfxbFkmtAsfproneHcg9ObslryS-maUvfjOKzKMwNQty7FtvQQQxjA1isNwGRxWyk22ra2LTOLu7zUo-PaEREQDs7soTQIxrs7kYcD34Y4qyjxuDJhM3QFIVNUMAuKPbslsBc8K2Zv2KbHENeK-FlWUql8LUgxgSwU-4cl',
      gender: 'Male, 24y',
      physician: 'Ronald',
      lastConsultation: 'May 12, 2019',
      appointment: '15 May 2020 8:00 am',
      status: 'Under Observation',
      statusColor: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300'
    }
  ]

  const patient = patients[0]

  const menuItems = [
    { label: 'Overview', active: true, hasAlert: false },
    { label: 'Visit History', active: false, hasAlert: false },
    { label: 'Vitals', active: false, hasAlert: false },
    { label: 'Allergies', active: false, hasAlert: true },
    { label: 'Medications', active: false, hasAlert: false },
    { label: 'Vaccines', active: false, hasAlert: false },
    { label: 'Family History', active: false, hasAlert: false },
    { label: 'Social History', active: false, hasAlert: false },
    { label: 'Surgical History', active: false, hasAlert: false },
    { label: 'Past Medical History', active: false, hasAlert: false },
    { label: 'Screening', active: false, hasAlert: false },
    { label: 'Orders', active: false, hasAlert: false },
    { label: 'Messages', active: false, hasAlert: false },
  ]

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0 overflow-y-auto transition-all duration-300`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Link href="/patients" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </Link>
          {!isCollapsed && <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Patient Details</h1>}
        </div>
      </div>
      
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <span className="font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">
            Medical Sections
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <span className="material-symbols-outlined text-sm text-gray-500">
            {isCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
      </div>
      
      {!isCollapsed && (
        <nav className="flex-1 space-y-0.5 text-sm">
        {menuItems.map((item, index) => (
          <a
            key={index}
            className={`flex items-center px-4 py-2 relative transition-colors ${
              item.active
                ? 'bg-white dark:bg-gray-700 border-l-4 border-primary text-primary font-medium shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-transparent hover:border-gray-300'
            }`}
            href={item.label === 'Visit History' ? `/patients/${patientId}/history` : item.label === 'Overview' ? `/patients/${patientId}` : item.label === 'Screening' ? `/patients/${patientId}/screening` : item.label === 'Medications' ? `/patients/${patientId}/medications` : item.label === 'Vitals' ? `/patients/${patientId}/vitals` : item.label === 'Allergies' ? `/patients/${patientId}/allergies` : item.label === 'Family History' ? `/patients/${patientId}/family-history` : item.label === 'Vaccines' ? `/patients/${patientId}/vaccines` : item.label === 'Social History' ? `/patients/${patientId}/social-history` : item.label === 'Surgical History' ? `/patients/${patientId}/surgical-history` : item.label === 'Past Medical History' ? `/patients/${patientId}/past-medical-history` : item.label === 'Orders' ? `/patients/${patientId}/orders` : item.label === 'Messages' ? `/patients/${patientId}/messages` : '#'}
          >
            {item.hasAlert && (
              <div className="absolute left-1 top-1/2 -mt-4 w-0.5 h-8 bg-red-400 rounded" />
            )}
            {item.label}
          </a>
        ))}
        </nav>
      )}
    </aside>
  )
}

export default PatientDetailSidebar