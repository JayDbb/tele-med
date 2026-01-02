'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { getCurrentUser } from '@/lib/api'
import { PatientDataManager } from '@/utils/PatientDataManager'
import type { User } from '@supabase/supabase-js'

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
  logout: () => Promise<void>
  isAuthenticated: boolean
  setNurse: (nurse: Nurse | null) => void
  setIsAuthenticated: (auth: boolean) => void
  loading: boolean
}

const NurseContext = createContext<NurseContextType | undefined>(undefined)

export function NurseProvider({ children }: { children: ReactNode }) {
  const [nurse, setNurseState] = useState<Nurse | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing Supabase session with nurse role
    checkSession()

    // Listen for auth changes
    const supabase = supabaseBrowser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const current = await getCurrentUser()
        if (current?.role === 'nurse') {
          loadUserData(current)
        }
      } else if (event === 'SIGNED_OUT') {
        setNurse(null)
        setIsAuthenticated(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    try {
      setLoading(true)
      const supabase = supabaseBrowser()
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error checking session:', error)
        setLoading(false)
        return
      }

      if (session?.user) {
        // Use server-side users table to determine role
        const current = await getCurrentUser()
        if (current && current.role === 'nurse') {
          await loadUserData(current)
        } else {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error in checkSession:', error)
      setLoading(false)
    }
  }

  const loadUserData = async (user: any) => {
    try {
      const fullName = user.name || user.email?.split('@')[0] || 'User'
      const department = user.metadata?.department || user.department || 'General'

      const nurseData: Nurse = {
        id: user.id,
        name: fullName,
        email: user.email || '',
        department: department,
        avatar: user.avatar_url
      }

      setNurse(nurseData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    // This is handled by DoctorContext now, but we can load nurse data if role is nurse
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

  const logout = async () => {
    try {
      const supabase = supabaseBrowser()
      await supabase.auth.signOut()
    setNurse(null)
    setIsAuthenticated(false)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <NurseContext.Provider value={{ nurse, login, logout, isAuthenticated, setNurse, setIsAuthenticated, loading }}>
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
