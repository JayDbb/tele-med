'use client'

import { usePathname } from 'next/navigation'
import { useDoctor } from '@/contexts/DoctorContext'
import { useNurse } from '@/contexts/NurseContext'
import LoginPage from '@/app/login/page'
import { useEffect, useState } from 'react'

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: doctorAuth, loading: doctorLoading } = useDoctor()
  const { isAuthenticated: nurseAuth, loading: nurseLoading } = useNurse()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    // Small delay to prevent flash
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // If providers take too long in dev, fallback to rendering to aid debugging
    if (process.env.NODE_ENV === 'development') {
      const t = setTimeout(() => setTimedOut(true), 2000)
      return () => clearTimeout(t)
    }
  }, [])

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup']
  
  // Nurse portal routes
  const nurseRoutes = ['/nurse-portal']
  
  // If any provider is still checking session, don't decide yet — prevent flash-to-login
  if (isLoading || doctorLoading || nurseLoading) {
    if (!timedOut) {
      return null
    }
  }
  
  // Treat public routes as prefix matches so trailing slashes or query params don't cause mis-matches
  if (publicRoutes.some(route => pathname?.startsWith(route))) {
    return <>{children}</>
  }
  
  // Doctor portal routes
  const doctorRoutes = ['/doctor']
  
  // Check if accessing nurse portal
  if (nurseRoutes.some(route => pathname.startsWith(route))) {
    if (!nurseAuth) {
      return <LoginPage />
    }
  } else if (doctorRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/dashboard') || pathname.startsWith('/patients') || pathname.startsWith('/calendar') || pathname.startsWith('/inbox')) {
    // Doctor portal routes (including legacy routes)
    if (!doctorAuth) {
      return <LoginPage />
    }
  } else {
    // Default to doctor portal for other routes
    if (!doctorAuth) {
      return <LoginPage />
    }
  }
  
  return <>{children}</>
}