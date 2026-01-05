'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { getPatient, getVitals, getVaccines, getAllergies, getFamilyHistory, getPastMedicalHistory } from '@/lib/api'

interface PatientDetailSidebarProps {
  patientId: string
}

interface PreviewData {
  vitals?: any
  vaccines?: any[]
  allergies?: any[]
  familyHistory?: any[]
  pastMedicalHistory?: any[]
  medications?: any[]
}

const PatientDetailSidebar = ({ patientId }: PatientDetailSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isNursePortal = pathname.startsWith('/nurse-portal')
  const isDoctorPortal = pathname.startsWith('/doctor')
  const isNewVisit = pathname.includes('/new-visit')
  const lastLoggedPath = useRef<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<PreviewData>({})
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null)
  const [patient, setPatient] = useState<any>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load patient data on mount for quick access to allergies, etc.
  useEffect(() => {
    if (isNewVisit && patientId) {
      getPatient(patientId)
        .then(res => {
          setPatient(res.patient)
          // Pre-populate allergies from patient data
          if (res.patient?.allergies) {
            const allergies = Array.isArray(res.patient.allergies) 
              ? res.patient.allergies 
              : typeof res.patient.allergies === 'string' 
                ? [res.patient.allergies] 
                : []
            setPreviewData(prev => ({ ...prev, allergies }))
          }
        })
        .catch(err => console.error('Error loading patient:', err))
    }
  }, [patientId, isNewVisit])

  const baseUrl = isNursePortal
    ? '/patients'
    : isDoctorPortal
      ? '/doctor/patients'
      : '/patients'

  const menuItems = [
    { label: 'Overview', href: `${baseUrl}/${patientId}`, hasAlert: false, key: 'overview' },
    { label: 'Visit History', href: `${baseUrl}/${patientId}/history`, hasAlert: false, key: 'history' },
    { label: 'Vitals', href: `${baseUrl}/${patientId}/vitals`, hasAlert: false, key: 'vitals' },
    { label: 'Allergies', href: `${baseUrl}/${patientId}/allergies`, hasAlert: false, key: 'allergies' },
    { label: 'Medications', href: `${baseUrl}/${patientId}/medications`, hasAlert: false, key: 'medications' },
    { label: 'Vaccines', href: `${baseUrl}/${patientId}/vaccines`, hasAlert: false, key: 'vaccines' },
    { label: 'Family History', href: `${baseUrl}/${patientId}/family-history`, hasAlert: false, key: 'family-history' },
    { label: 'Social History', href: `${baseUrl}/${patientId}/social-history`, hasAlert: false, key: 'social-history' },
    { label: 'Surgical History', href: `${baseUrl}/${patientId}/surgical-history`, hasAlert: false, key: 'surgical-history' },
    { label: 'Past Medical History', href: `${baseUrl}/${patientId}/past-medical-history`, hasAlert: false, key: 'past-medical-history' },
    { label: 'Orders', href: `${baseUrl}/${patientId}/orders`, hasAlert: false, key: 'orders' },
    { label: 'Documents', href: `${baseUrl}/${patientId}/documents`, hasAlert: false, key: 'documents' },
    { label: 'Log History', href: `${baseUrl}/${patientId}/log-history`, hasAlert: false, key: 'log-history' },
  ]

  // Load preview data when hovering or clicking
  const loadPreviewData = async (key: string) => {
    if (previewData[key as keyof PreviewData] !== undefined) return // Already loaded
    
    setLoadingPreview(key)
    try {
      switch (key) {
        case 'vitals':
          const vitals = await getVitals(patientId)
          setPreviewData(prev => ({ ...prev, vitals: vitals?.[0] || null }))
          break
        case 'vaccines':
          const vaccines = await getVaccines(patientId)
          setPreviewData(prev => ({ ...prev, vaccines: vaccines || [] }))
          break
        case 'allergies':
          const allergies = await getAllergies(patientId)
          setPreviewData(prev => ({ ...prev, allergies: allergies || [] }))
          break
        case 'family-history':
          const familyHistory = await getFamilyHistory(patientId)
          setPreviewData(prev => ({ ...prev, familyHistory: familyHistory || [] }))
          break
        case 'past-medical-history':
          const pastMedicalHistory = await getPastMedicalHistory(patientId)
          setPreviewData(prev => ({ ...prev, pastMedicalHistory: pastMedicalHistory || [] }))
          break
      }
    } catch (err) {
      console.error(`Error loading preview for ${key}:`, err)
    } finally {
      setLoadingPreview(null)
    }
  }

  const handleMouseEnter = (key: string) => {
    if (!isNewVisit) return
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(key)
      loadPreviewData(key)
    }, 300) // Small delay to avoid flickering
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setHoveredItem(null)
  }

  const handleClick = (e: React.MouseEvent, item: typeof menuItems[0]) => {
    if (!isNewVisit) return // Normal navigation for non-new-visit pages
    
    e.preventDefault()
    // Toggle selection - if already selected, deselect; otherwise select
    if (selectedItem === item.key) {
      setSelectedItem(null)
    } else {
      setSelectedItem(item.key)
      loadPreviewData(item.key)
    }
  }

  const getPreviewContent = (key: string) => {
    if (loadingPreview === key) {
      return <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
    }

    switch (key) {
      case 'vitals':
        const latestVitals = previewData.vitals
        if (!latestVitals || (!latestVitals.bp && !latestVitals.hr && !latestVitals.temp && !latestVitals.weight)) {
          return <div className="text-sm text-gray-500 dark:text-gray-400">No vitals recorded</div>
        }
        return (
          <div className="space-y-2 text-sm">
            {latestVitals.bp && <div><span className="font-semibold">BP:</span> {latestVitals.bp} mmHg</div>}
            {latestVitals.hr && <div><span className="font-semibold">HR:</span> {latestVitals.hr} bpm</div>}
            {latestVitals.temp && <div><span className="font-semibold">Temp:</span> {latestVitals.temp}°F</div>}
            {latestVitals.weight && <div><span className="font-semibold">Weight:</span> {latestVitals.weight} lbs</div>}
            {latestVitals.recordedAt && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Recorded: {new Date(latestVitals.recordedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )
      
      case 'vaccines':
        const vaccines = previewData.vaccines || []
        if (vaccines.length === 0) {
          return <div className="text-sm text-gray-500 dark:text-gray-400">No vaccines recorded</div>
        }
        return (
          <div className="space-y-2 text-sm">
            {vaccines.slice(0, 3).map((v: any, idx: number) => (
              <div key={idx}>
                <span className="font-semibold">{v.name}</span>
                {v.date && <span className="text-gray-500 dark:text-gray-400"> - {new Date(v.date).toLocaleDateString()}</span>}
              </div>
            ))}
            {vaccines.length > 3 && (
              <div className="text-xs text-gray-400 dark:text-gray-500">+{vaccines.length - 3} more</div>
            )}
          </div>
        )
      
      case 'allergies':
        // Check both previewData and patient data
        let allergiesList = previewData.allergies || []
        if (allergiesList.length === 0 && patient?.allergies) {
          allergiesList = Array.isArray(patient.allergies) 
            ? patient.allergies 
            : typeof patient.allergies === 'string' && patient.allergies !== 'None'
              ? [patient.allergies] 
              : []
        }
        if (allergiesList.length === 0) {
          return <div className="text-sm text-gray-500 dark:text-gray-400">No known allergies</div>
        }
        return (
          <div className="space-y-2 text-sm">
            {allergiesList.slice(0, 3).map((a: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                <span className="font-semibold">{typeof a === 'string' ? a : a.name || a.allergen}</span>
                {typeof a === 'object' && a.severity && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">({a.severity})</span>
                )}
              </div>
            ))}
            {allergiesList.length > 3 && (
              <div className="text-xs text-gray-400 dark:text-gray-500">+{allergiesList.length - 3} more</div>
            )}
          </div>
        )
      
      case 'family-history':
        const familyHistory = previewData.familyHistory || []
        if (familyHistory.length === 0) {
          return <div className="text-sm text-gray-500 dark:text-gray-400">No family history recorded</div>
        }
        return (
          <div className="space-y-2 text-sm">
            {familyHistory.slice(0, 3).map((f: any, idx: number) => (
              <div key={idx}>
                <span className="font-semibold">{f.relationship}</span>
                {f.status && <span className="text-gray-500 dark:text-gray-400"> - {f.status}</span>}
                {f.conditions && <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{f.conditions}</div>}
              </div>
            ))}
            {familyHistory.length > 3 && (
              <div className="text-xs text-gray-400 dark:text-gray-500">+{familyHistory.length - 3} more</div>
            )}
          </div>
        )
      
      case 'past-medical-history':
        const pastMedicalHistory = previewData.pastMedicalHistory || []
        if (pastMedicalHistory.length === 0) {
          return <div className="text-sm text-gray-500 dark:text-gray-400">No past medical history recorded</div>
        }
        return (
          <div className="space-y-2 text-sm">
            {pastMedicalHistory.slice(0, 3).map((p: any, idx: number) => (
              <div key={idx}>
                <span className="font-semibold">{p.condition}</span>
                {p.status && <span className="text-gray-500 dark:text-gray-400"> - {p.status}</span>}
                {p.code && <div className="text-xs text-gray-400 dark:text-gray-500">ICD-10: {p.code}</div>}
              </div>
            ))}
            {pastMedicalHistory.length > 3 && (
              <div className="text-xs text-gray-400 dark:text-gray-500">+{pastMedicalHistory.length - 3} more</div>
            )}
          </div>
        )
      
      case 'medications':
        // Check patient data for current medications
        const medications = patient?.current_medications
        if (!medications || (Array.isArray(medications) && medications.length === 0)) {
          return <div className="text-sm text-gray-500 dark:text-gray-400">No current medications</div>
        }
        const medsList = Array.isArray(medications) ? medications : []
        return (
          <div className="space-y-2 text-sm">
            {medsList.slice(0, 3).map((m: any, idx: number) => (
              <div key={idx}>
                <span className="font-semibold">{typeof m === 'string' ? m : m.name || m.medication}</span>
                {typeof m === 'object' && m.dosage && (
                  <div className="text-xs text-gray-400 dark:text-gray-500">{m.dosage}</div>
                )}
              </div>
            ))}
            {medsList.length > 3 && (
              <div className="text-xs text-gray-400 dark:text-gray-500">+{medsList.length - 3} more</div>
            )}
          </div>
        )
      
      case 'social-history':
      case 'surgical-history':
      case 'orders':
        return <div className="text-sm text-gray-500 dark:text-gray-400">Preview not available. Click "See More" to view details.</div>
      
      default:
        return <div className="text-sm text-gray-500 dark:text-gray-400">No preview available</div>
    }
  }

  useEffect(() => {
    const patientBasePath = `${baseUrl}/${patientId}`
    if (!patientId || !pathname.includes(patientBasePath)) return
    if (lastLoggedPath.current === pathname) return
    lastLoggedPath.current = pathname

    const segments = pathname.split(patientBasePath)[1]?.split('/').filter(Boolean) || []
    const sectionSegment = segments[0] || 'overview'
    const section = sectionSegment === 'history' ? 'visit-history' : sectionSegment
    PatientDataManager.logActionAuto(patientId, 'view', section, {
      notes: `Viewed ${section}`
    })
  }, [patientId, pathname])

  const hasPreview = selectedItem && ['vitals', 'vaccines', 'allergies', 'medications', 'family-history', 'past-medical-history'].includes(selectedItem)
  
  return (
    <aside className={`${isCollapsed ? 'w-16' : hasPreview ? 'w-96' : 'w-64'} bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0 overflow-y-auto transition-all duration-300`}>
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
        <nav className="flex-1 space-y-0.5 text-sm relative">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href
            const hasPreviewSupport = ['vitals', 'vaccines', 'allergies', 'medications', 'family-history', 'past-medical-history'].includes(item.key)
            const showHoverPreview = isNewVisit && hoveredItem === item.key && hasPreviewSupport && selectedItem !== item.key
            const isSelected = isNewVisit && selectedItem === item.key && hasPreviewSupport
            
            return (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.key)}
                onMouseLeave={handleMouseLeave}
              >
                {isNewVisit && hasPreviewSupport ? (
                  <button
                    onClick={(e) => handleClick(e, item)}
                    className={`w-full flex items-center justify-between px-4 py-2 relative transition-colors text-left ${isActive || isSelected
                        ? 'bg-white dark:bg-gray-700 border-l-4 border-primary text-primary font-medium shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-transparent hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center">
                      {item.hasAlert && (
                        <div className="absolute left-1 top-1/2 -mt-4 w-0.5 h-8 bg-red-400 rounded" />
                      )}
                      {item.label}
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-sm">expand_less</span>
                    )}
                  </button>
                ) : (
                  <Link
                    className={`flex items-center px-4 py-2 relative transition-colors ${isActive
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
                )}
                
                {/* Hover Preview Tooltip (only when not selected) */}
                {showHoverPreview && (
                  <div className="absolute left-full ml-2 top-0 z-50 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 pointer-events-none">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{item.label}</h4>
                    <div className="max-h-48 overflow-y-auto">
                      {getPreviewContent(item.key)}
                    </div>
                  </div>
                )}
                
                {/* Selected Preview Panel (inline in sidebar) */}
                {isSelected && (
                  <div className="px-4 pb-4 bg-white dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-3 pt-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{item.label}</h4>
                      <Link
                        href={item.href}
                        className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                        onClick={() => setSelectedItem(null)}
                      >
                        See More
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </Link>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {getPreviewContent(item.key)}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      )}

    </aside>
  )
}

export default PatientDetailSidebar
