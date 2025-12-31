'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { PatientDataManager } from '@/utils/PatientDataManager'

interface Nurse {
  id: string
  name: string
  email: string
  department: string
  avatar?: string
}

interface NurseContextType {
  nurse: Nurse | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  setNurse: (nurse: Nurse | null) => void
  setIsAuthenticated: (auth: boolean) => void
}

const NurseContext = createContext<NurseContextType | undefined>(undefined)

// Mock nurse data - in real app this would come from API
const mockNurses: Nurse[] = [
  {
    id: 'nurse-001',
    name: 'Sarah Williams',
    email: 'sarah.williams@telemedclinic.com',
    department: 'Emergency',
    avatar: '/avatars/nurse-williams.jpg'
  },
  {
    id: 'nurse-002', 
    name: 'Maria Garcia',
    email: 'maria.garcia@telemedclinic.com',
    department: 'ICU',
    avatar: '/avatars/nurse-garcia.jpg'
  },
  {
    id: 'nurse-003',
    name: 'Jennifer Lee',
    email: 'jennifer.lee@telemedclinic.com', 
    department: 'Pediatrics',
    avatar: '/avatars/nurse-lee.jpg'
  }
]

export function NurseProvider({ children }: { children: ReactNode }) {
  const [nurse, setNurseState] = useState<Nurse | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for existing session
    const savedNurse = localStorage.getItem('authenticated-nurse')
    const savedAuth = localStorage.getItem('nurse-authenticated')
    if (savedNurse && savedAuth === 'true') {
      const parsedNurse = JSON.parse(savedNurse)
      setNurseState(parsedNurse)
      setIsAuthenticated(true)
      PatientDataManager.setCurrentUser({
        id: parsedNurse.id,
        name: parsedNurse.name,
        email: parsedNurse.email,
        role: 'nurse'
      })
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // This is handled by DoctorContext now
    return false
  }

  const setNurse = (nextNurse: Nurse | null) => {
    setNurseState(nextNurse)
    if (nextNurse) {
      PatientDataManager.setCurrentUser({
        id: nextNurse.id,
        name: nextNurse.name,
        email: nextNurse.email,
        role: 'nurse'
      })
    } else {
      PatientDataManager.setCurrentUser(null)
    }
  }

  const logout = () => {
    setNurseState(null)
    setIsAuthenticated(false)
    localStorage.removeItem('authenticated-nurse')
    localStorage.removeItem('nurse-authenticated')
    PatientDataManager.setCurrentUser(null)
  }

  return (
    <NurseContext.Provider value={{ nurse, login, logout, isAuthenticated, setNurse, setIsAuthenticated }}>
      {children}
    </NurseContext.Provider>
  )
}

export function useNurse() {
  const context = useContext(NurseContext)
  if (context === undefined) {
    throw new Error('useNurse must be used within a NurseProvider')
  }
  return context
}
