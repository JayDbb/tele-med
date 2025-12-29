'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

// Mock doctor data - in real app this would come from API
const mockUsers = [
  {
    id: 'dr-001',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@telemedclinic.com',
    specialty: 'Internal Medicine',
    avatar: '/avatars/dr-johnson.jpg',
    role: 'doctor'
  },
  {
    id: 'dr-002', 
    name: 'Dr. Michael Chen',
    email: 'michael.chen@telemedclinic.com',
    specialty: 'Pediatrics',
    avatar: '/avatars/dr-chen.jpg',
    role: 'doctor'
  },
  {
    id: 'nurse-001',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@telemedclinic.com', 
    specialty: 'Nursing',
    avatar: '/avatars/nurse-rodriguez.jpg',
    role: 'nurse'
  }
]

export function DoctorProvider({ children }: { children: ReactNode }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for existing session
    const savedDoctor = localStorage.getItem('authenticated-doctor')
    if (savedDoctor) {
      setDoctor(JSON.parse(savedDoctor))
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: string }> => {
    // Mock authentication - in real app this would be API call
    const foundUser = mockUsers.find(u => u.email === email)
    
    if (foundUser && password === 'password') { // Mock password check
      if (foundUser.role === 'doctor') {
        setDoctor(foundUser)
        setIsAuthenticated(true)
        localStorage.setItem('authenticated-doctor', JSON.stringify(foundUser))
        return { success: true, role: 'doctor' }
      } else if (foundUser.role === 'nurse') {
        // Store nurse data in nurse context
        localStorage.setItem('authenticated-nurse', JSON.stringify(foundUser))
        localStorage.setItem('nurse-authenticated', 'true')
        return { success: true, role: 'nurse' }
      }
    }
    
    return { success: false }
  }

  const logout = () => {
    setDoctor(null)
    setIsAuthenticated(false)
    localStorage.removeItem('authenticated-doctor')
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