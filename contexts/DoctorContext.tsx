'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { login as supabaseLogin, getCurrentUser } from '@/lib/api'
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Try to load server-side profile first
        const current = await getCurrentUser()
        if (current) {
          await loadUserData(null)
        } else if (session.user) {
          await loadUserData(session.user)
        }
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
    let timeoutId: NodeJS.Timeout | null = null
    try {
      setLoading(true)

      // Dev-only safety: if checkSession stalls, stop loading after 2s
      timeoutId = setTimeout(() => {
        if (loading) {
          setLoading(false)
        }
      }, 2000)

      // Prefer server-side session if available (cookie)
      const serverUser = await getCurrentUser()
      if (serverUser) {
        await loadUserData(serverUser as any)
        return
      }

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
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }

  const loadUserData = async (user: User | null) => {
    try {
      // Prefer server-side users table for authoritative profile
      const current = await getCurrentUser()

      if (current) {
        const doctorData: Doctor = {
          id: current.id,
          name: current.name || current.email || 'User',
          email: current.email || '',
          specialty: current.metadata?.specialty || current.specialty || 'General Practice',
          avatar: current.avatar_url || null,
        }
        setDoctor(doctorData)
        setIsAuthenticated(true)
      } else if (user) {
        // Fallback to auth user metadata
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
      }
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
      // Load user data (server-side users table preferred)
      const current = await getCurrentUser()
      await loadUserData(user)

      const role = current?.role || user.user_metadata?.role || 'doctor'

      return { success: true, role }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      const supabase = supabaseBrowser()
      await supabase.auth.signOut()
      // Clear server-side cookie
      await fetch('/api/auth/clear-session', { method: 'POST' })
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
