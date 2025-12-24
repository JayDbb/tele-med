'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Patient {
  id: string
  name: string
  email: string
  dob: string
  phone: string
}

interface SearchBarProps {
  placeholder?: string
}

export default function GlobalSearchBar({ placeholder = "Search patients, MRN, or appointments..." }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [recentPatients, setRecentPatients] = useState<Patient[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPatients()
    loadRecentPatients()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients')
      const data = await response.json()
      setPatients(data.patients)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const loadRecentPatients = () => {
    const recent = localStorage.getItem('recent-patients')
    if (recent) {
      setRecentPatients(JSON.parse(recent))
    }
  }

  const addToRecentPatients = (patient: Patient) => {
    const recent = recentPatients.filter(p => p.id !== patient.id)
    const updated = [patient, ...recent].slice(0, 5) // Keep only 5 recent
    setRecentPatients(updated)
    localStorage.setItem('recent-patients', JSON.stringify(updated))
  }

  const handleSearch = (value: string) => {
    setQuery(value)
    if (value.length > 0) {
      const filtered = patients.filter(patient => 
        patient.name.toLowerCase().includes(value.toLowerCase()) ||
        patient.id.toLowerCase().includes(value.toLowerCase()) ||
        patient.email.toLowerCase().includes(value.toLowerCase()) ||
        patient.phone.includes(value)
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
    router.push(`/patients/${patient.id}`)
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