'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { useDoctor } from '@/contexts/DoctorContext'
import { useNurse } from '@/contexts/NurseContext'

interface Patient {
  id: string
  name: string
  email: string
  dob: string
  phone: string
  doctorId?: string
}

interface SearchBarProps {
  placeholder?: string
}

export default function GlobalSearchBar({ placeholder = "Search patients, MRN, or DOB" }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [recentPatients, setRecentPatients] = useState<Patient[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const { doctor } = useDoctor()
  const { nurse } = useNurse()
  
  const currentUser = doctor || nurse
  const userId = doctor?.id || nurse?.id

  useEffect(() => {
    if (currentUser) {
      fetchPatients()
      loadRecentPatients()
    }
    
    // Refresh patients when page becomes visible (to catch new patients)
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser) {
        fetchPatients()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [currentUser])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchPatients = () => {
    if (!currentUser) return
    
    try {
      // Get ALL hardcoded patients (not filtered by doctor)
      const hardcodedPatients = [
        { id: '1', name: 'Leslie Alexander', email: 'willie.jennings@example.com', dob: '12/05/1985', phone: '(555) 123-4567', doctorId: 'dr-001' },
        { id: '2', name: 'Fasai Areyanukul', email: 'bill.sanders@example.com', dob: '03/15/1990', phone: '(555) 234-5678', doctorId: 'dr-001' },
        { id: '3', name: 'Floyd Miles', email: 'michelle.rivera@example.com', dob: '07/22/1988', phone: '(555) 345-6789', doctorId: 'dr-002' },
        { id: '4', name: 'Priscilla Watson', email: 'priscilla.watson@example.com', dob: '11/08/1992', phone: '(555) 456-7890', doctorId: 'dr-002' },
        { id: '5', name: 'Kristin Cooper', email: 'kristin.cooper@example.com', dob: '09/14/1995', phone: '(555) 567-8901', doctorId: 'dr-003' },
        { id: '6', name: 'Robert Johnson', email: 'robert.johnson@example.com', dob: '01/30/2001', phone: '(555) 678-9012', doctorId: 'dr-003' }
      ]
      
      // Get ALL patients from PatientDataManager (not filtered by doctor)
      const savedPatients = PatientDataManager.getAllPatients()
        .map(p => ({
          id: p.id,
          name: p.name,
          email: p.email,
          dob: p.dob,
          phone: p.phone,
          doctorId: p.doctorId
        }))
      
      // Combine all patients in the system
      const allPatients = [...hardcodedPatients, ...savedPatients]
      setPatients(allPatients)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const loadRecentPatients = () => {
    if (!userId) return
    
    const recent = localStorage.getItem(`recent-patients-${userId}`)
    if (recent) {
      setRecentPatients(JSON.parse(recent))
    }
  }

  const addToRecentPatients = (patient: Patient) => {
    if (!userId) return
    
    const recent = recentPatients.filter(p => p.id !== patient.id)
    const updated = [patient, ...recent].slice(0, 5) // Keep only 5 recent
    setRecentPatients(updated)
    localStorage.setItem(`recent-patients-${userId}`, JSON.stringify(updated))
  }

  const handleSearch = (value: string) => {
    setQuery(value)
    if (value.length > 0) {
      const filtered = patients.filter(patient => 
        patient.name.toLowerCase().includes(value.toLowerCase()) ||
        patient.id.toLowerCase().includes(value.toLowerCase()) ||
        patient.email.toLowerCase().includes(value.toLowerCase()) ||
        patient.phone.includes(value) ||
        patient.dob.includes(value)
      )
      setFilteredPatients(filtered)
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }

  const handlePatientSelect = (patient: Patient) => {
    addToRecentPatients(patient)
    setQuery('')
    setShowDropdown(false)
    
    // Route to appropriate portal based on user type
    if (nurse) {
      router.push(`/nurse-portal/patients/${patient.id}`)
    } else {
      router.push(`/doctor/patients/${patient.id}`)
    }
  }

  const handleFocus = () => {
    if (query.length === 0 && recentPatients.length > 0) {
      setShowDropdown(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false)
      setQuery('')
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <label className="flex w-full items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 h-10 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">search</span>
        <input 
          className="bg-transparent border-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 w-full h-full p-0" 
          placeholder={placeholder}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        )}
      </label>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
          {query.length === 0 && recentPatients.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                Recently Viewed
              </div>
              {recentPatients.map(patient => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400 text-sm">history</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{patient.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">ID: {patient.id} • {patient.email}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.length > 0 && (
            <div>
              {filteredPatients.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    Search Results ({filteredPatients.length})
                  </div>
                  {filteredPatients.map(patient => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{patient.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {patient.id} • {patient.email} • {patient.phone}
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                  No patients found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}