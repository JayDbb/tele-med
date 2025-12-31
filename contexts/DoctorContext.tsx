'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { login as supabaseLogin } from '@/lib/api'
import type { User } from '@supabase/supabase-js'

interface Doctor {
  id: string
  name: string
  email: string
  specialty: string
  avatar?: string
}

interface DoctorContextType {
  doctor: Doctor | null
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
  loading: boolean
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined)

export function DoctorProvider({ children }: { children: ReactNode }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing Supabase session
    checkSession()

    // Listen for auth changes
    const supabase = supabaseBrowser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        loadUserData(session.user)
      } else if (event === 'SIGNED_OUT') {
        setDoctor(null)
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
        await loadUserData(session.user)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error in checkSession:', error)
      setLoading(false)
    }
  }

  const loadUserData = async (user: User) => {
    try {
      // Get user metadata to determine role
      const role = user.user_metadata?.role || 'doctor' // Default to doctor
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
      const specialty = user.user_metadata?.specialty || 'General Practice'

      const doctorData: Doctor = {
        id: user.id,
        name: fullName,
        email: user.email || '',
        specialty: specialty,
        avatar: user.user_metadata?.avatar
      }

      setDoctor(doctorData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: string; error?: string }> => {
    try {
      // Use Supabase auth
      await supabaseLogin(email, password)
      
      // Get the session and user
      const supabase = supabaseBrowser()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session?.user) {
        return { success: false, error: error?.message || 'Failed to get session' }
      }

      const user = session.user
      const role = user.user_metadata?.role || 'doctor' // Default to doctor
      
      // Load user data
      await loadUserData(user)

      return { success: true, role }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      const supabase = supabaseBrowser()
      await supabase.auth.signOut()
      setDoctor(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <DoctorContext.Provider value={{ doctor, login, logout, isAuthenticated, loading }}>
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