'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { PatientDataManager } from '@/utils/PatientDataManager'

interface Doctor {
  id: string
  name: string
  email: string
  specialty: string
  avatar?: string
}

interface DoctorContextType {
  doctor: Doctor | null
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined)

const toDisplayName = (email: string) => {
  const local = email.split('@')[0] || ''
  const words = local.split(/[._-]+/).filter(Boolean)
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'User'
}

export function DoctorProvider({ children }: { children: ReactNode }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for existing session
    const savedDoctor = localStorage.getItem('authenticated-doctor')
    if (savedDoctor) {
      const parsedDoctor = JSON.parse(savedDoctor)
      setDoctor(parsedDoctor)
      setIsAuthenticated(true)
      PatientDataManager.setCurrentUser({
        id: parsedDoctor.id,
        name: parsedDoctor.name,
        email: parsedDoctor.email,
        role: 'doctor'
      })
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: string }> => {
    if (!email || !password) {
      return { success: false }
    }

    const normalized = email.trim().toLowerCase()
    const roleOverride = localStorage.getItem(`staff-role-${normalized}`)
    const knownNurseEmails = new Set(['emily.rodriguez@telemedclinic.com'])
    const resolvedRole = roleOverride === 'nurse' || roleOverride === 'doctor'
      ? roleOverride
      : (knownNurseEmails.has(normalized) || normalized.includes('nurse') ? 'nurse' : 'doctor')
    const role = resolvedRole
    const userRecord = {
      id: `user-${normalized.replace(/[^a-z0-9]+/g, '-')}`,
      name: toDisplayName(normalized),
      email: normalized,
      specialty: role === 'doctor' ? '' : 'Nursing',
      avatar: '',
      role
    }

    if (role === 'doctor') {
      setDoctor(userRecord)
      setIsAuthenticated(true)
      localStorage.setItem('authenticated-doctor', JSON.stringify(userRecord))
      PatientDataManager.setCurrentUser({
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        role: 'doctor'
      })
      return { success: true, role: 'doctor' }
    }

    setDoctor(null)
    setIsAuthenticated(false)
    localStorage.removeItem('authenticated-doctor')
    localStorage.setItem('authenticated-nurse', JSON.stringify(userRecord))
    localStorage.setItem('nurse-authenticated', 'true')
    PatientDataManager.setCurrentUser({
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: 'nurse'
    })
    return { success: true, role: 'nurse' }
    
    return { success: false }
  }

  const logout = () => {
    setDoctor(null)
    setIsAuthenticated(false)
    localStorage.removeItem('authenticated-doctor')
    PatientDataManager.setCurrentUser(null)
  }

  return (
    <DoctorContext.Provider value={{ doctor, login, logout, isAuthenticated }}>
      {children}
    </DoctorContext.Provider>
  )
}

export function useDoctor() {
  const context = useContext(DoctorContext)
  if (context === undefined) {
    throw new Error('useDoctor must be used within a DoctorProvider')
  }
  return context
}
