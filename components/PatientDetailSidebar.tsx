'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { PatientDataManager } from '@/utils/PatientDataManager'

interface PatientDetailSidebarProps {
  patientId: string
  onNavigate?: (href: string) => void
  activeHref?: string
}

const PatientDetailSidebar = ({ patientId, onNavigate, activeHref }: PatientDetailSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isNursePortal = pathname.startsWith('/nurse-portal')
  const isDoctorPortal = pathname.startsWith('/doctor')
  const lastLoggedPath = useRef<string | null>(null)
  const isValidPatientId = (value?: string) => {
    const normalized = `${value ?? ''}`.trim()
    return normalized.length > 0 && normalized !== 'undefined' && normalized !== 'null'
  }

  if (searchParams.get('peek') === '1') {
    return null
  }

  const baseUrl = isNursePortal
    ? '/nurse-portal/patients'
    : isDoctorPortal
      ? '/doctor/patients'
      : '/patients'

  const nurseMenuItems = [
    { label: 'Overview', href: `${baseUrl}/${patientId}`, hasAlert: false },
    { label: 'Personal Details', href: `${baseUrl}/${patientId}/personal-details`, hasAlert: false },
    { label: 'Visit History', href: `${baseUrl}/${patientId}/history`, hasAlert: false },
    { label: 'Vitals', href: `${baseUrl}/${patientId}/vitals`, hasAlert: false },
    { label: 'Allergies', href: `${baseUrl}/${patientId}/allergies`, hasAlert: false },
    { label: 'Medications', href: `${baseUrl}/${patientId}/medications`, hasAlert: false },
    { label: 'Vaccines', href: `${baseUrl}/${patientId}/vaccines`, hasAlert: false },
    { label: 'Family History', href: `${baseUrl}/${patientId}/family-history`, hasAlert: false },
    { label: 'Social History', href: `${baseUrl}/${patientId}/social-history`, hasAlert: false },
    { label: 'Surgical History', href: `${baseUrl}/${patientId}/surgical-history`, hasAlert: false },
    { label: 'Past Medical History', href: `${baseUrl}/${patientId}/past-medical-history`, hasAlert: false },
    { label: 'Orders', href: `${baseUrl}/${patientId}/orders`, hasAlert: false },
    { label: 'Documents', href: `${baseUrl}/${patientId}/documents`, hasAlert: false },
    { label: 'Log History', href: `${baseUrl}/${patientId}/log-history`, hasAlert: false },
  ]

  const doctorMenuItems = [
    { label: 'Overview', href: `${baseUrl}/${patientId}`, hasAlert: false },
    { label: 'Personal Details', href: `${baseUrl}/${patientId}/personal-details`, hasAlert: false },
    { label: 'Visit History', href: `${baseUrl}/${patientId}/history`, hasAlert: false },
    { label: 'Vitals', href: `${baseUrl}/${patientId}/vitals`, hasAlert: false },
    { label: 'Allergies', href: `${baseUrl}/${patientId}/allergies`, hasAlert: false },
    { label: 'Medications', href: `${baseUrl}/${patientId}/medications`, hasAlert: false },
    { label: 'Vaccines', href: `${baseUrl}/${patientId}/vaccines`, hasAlert: false },
    { label: 'Family History', href: `${baseUrl}/${patientId}/family-history`, hasAlert: false },
    { label: 'Social History', href: `${baseUrl}/${patientId}/social-history`, hasAlert: false },
    { label: 'Surgical History', href: `${baseUrl}/${patientId}/surgical-history`, hasAlert: false },
    { label: 'Past Medical History', href: `${baseUrl}/${patientId}/past-medical-history`, hasAlert: false },
    { label: 'Orders', href: `${baseUrl}/${patientId}/orders`, hasAlert: false },
    { label: 'Documents', href: `${baseUrl}/${patientId}/documents`, hasAlert: false },
    { label: 'Log History', href: `${baseUrl}/${patientId}/log-history`, hasAlert: false },
  ]

  const menuItems = isDoctorPortal ? doctorMenuItems : nurseMenuItems
  const visibleItems = onNavigate
    ? menuItems.filter((item) => item.label !== 'Overview')
    : menuItems

  useEffect(() => {
    const patientBasePath = `${baseUrl}/${patientId}`
    if (!isValidPatientId(patientId) || !pathname.includes(patientBasePath)) return
    if (lastLoggedPath.current === pathname) return
    lastLoggedPath.current = pathname

    const segments = pathname.split(patientBasePath)[1]?.split('/').filter(Boolean) || []
    const sectionSegment = segments[0] || 'overview'
    const section = sectionSegment === 'history' ? 'visit-history' : sectionSegment
    PatientDataManager.logActionAuto(patientId, 'view', section, {
      notes: `Viewed ${section}`
    })
  }, [patientId, pathname])

  if (!isValidPatientId(patientId)) {
    return (
      <aside className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Link href={baseUrl} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Patient Details</h1>
          </div>
        </div>
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
          Select a patient to view chart sections.
        </div>
      </aside>
    )
  }

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0 overflow-y-auto transition-all duration-300`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Link href={baseUrl} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
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
        {visibleItems.map((item, index) => {
          const isActive = activeHref ? activeHref === item.href : pathname === item.href
          return (
            onNavigate ? (
              <button
                key={index}
                type="button"
                onClick={() => onNavigate(item.href)}
                className={`w-full text-left flex items-center px-4 py-2 relative transition-colors ${
                  isActive
                    ? 'bg-white dark:bg-gray-700 border-l-4 border-primary text-primary font-medium shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-transparent hover:border-gray-300'
                }`}
              >
                {item.hasAlert && (
                  <div className="absolute left-1 top-1/2 -mt-4 w-0.5 h-8 bg-red-400 rounded" />
                )}
                {item.label}
              </button>
            ) : (
              <Link
                key={index}
                className={`flex items-center px-4 py-2 relative transition-colors ${
                  isActive
                    ? 'bg-white dark:bg-gray-700 border-l-4 border-primary text-primary font-medium shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-transparent hover:border-gray-300'
                }`}
                href={item.href}
              >
                {item.hasAlert && (
                  <div className="absolute left-1 top-1/2 -mt-4 w-0.5 h-8 bg-red-400 rounded" />
                )}
                {item.label}
              </Link>
            )
          )
        })}
        </nav>
      )}
    </aside>
  )
}

export default PatientDetailSidebar
