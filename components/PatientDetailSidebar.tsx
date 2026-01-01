'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

interface PatientDetailSidebarProps {
  patientId: string
}

const PatientDetailSidebar = ({ patientId }: PatientDetailSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const isNursePortal = pathname.startsWith('/nurse-portal')

  const baseUrl = isNursePortal ? '/nurse-portal/patients' : '/doctor/patients'
  
  const menuItems = [
    { label: 'Overview', href: `${baseUrl}/${patientId}`, hasAlert: false },
    { label: 'Visit History', href: `${baseUrl}/${patientId}/history`, hasAlert: false },
    { label: 'Vitals', href: `${baseUrl}/${patientId}/vitals`, hasAlert: false },
    { label: 'Allergies', href: `${baseUrl}/${patientId}/allergies`, hasAlert: false },
    { label: 'Medications', href: `${baseUrl}/${patientId}/medications`, hasAlert: false },
    { label: 'Vaccines', href: `${baseUrl}/${patientId}/vaccines`, hasAlert: false },
    { label: 'Family History', href: `${baseUrl}/${patientId}/family-history`, hasAlert: false },
    { label: 'Social History', href: `${baseUrl}/${patientId}/social-history`, hasAlert: false },
    { label: 'Surgical History', href: `${baseUrl}/${patientId}/surgical-history`, hasAlert: false },
    { label: 'Past Medical History', href: `${baseUrl}/${patientId}/past-medical-history`, hasAlert: false },
    { label: 'Screening', href: `${baseUrl}/${patientId}/screening`, hasAlert: false },
    { label: 'Orders', href: `${baseUrl}/${patientId}/orders`, hasAlert: false },
    { label: 'Messages', href: `${baseUrl}/${patientId}/messages`, hasAlert: false },
  ]

  return (
    <aside className={`hidden lg:flex ${isCollapsed ? 'w-16' : 'w-64'} bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0 overflow-y-auto transition-all duration-300`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Link href={isNursePortal ? "/nurse-portal/patients" : "/doctor/patients"} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
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
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={index}
              className={`flex items-center px-4 py-2 relative transition-colors ${
                isActive
                  ? 'bg-white dark:bg-gray-700 border-l-4 border-primary text-primary font-medium shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-transparent hover:border-gray-300'
              }`}
              href={item.href ?? '#'}
            >
              {item.hasAlert && (
                <div className="absolute left-1 top-1/2 -mt-4 w-0.5 h-8 bg-red-400 rounded" />
              )}
              {item.label}
            </Link>
          )
        })}
        </nav>
      )}
    </aside>
  )
}

export default PatientDetailSidebar
