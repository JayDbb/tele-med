'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useDoctor } from '@/contexts/DoctorContext'
import { useNurse } from '@/contexts/NurseContext'
import LoginPage from '@/app/login/page'
import { useEffect, useState } from 'react'

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: doctorAuth } = useDoctor()
  const { isAuthenticated: nurseAuth } = useNurse()
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Small delay to prevent flash
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login']
  
  // Nurse portal routes
  const nurseRoutes = ['/nurse-portal']

  // Doctor portal routes
  const doctorRoutes = ['/doctor']

  useEffect(() => {
    if (isLoading) return
    
    const isDoctorPath = doctorRoutes.some(route => pathname.startsWith(route))
      || pathname.startsWith('/dashboard')
      || pathname.startsWith('/patients')
      || pathname.startsWith('/calendar')
      || pathname.startsWith('/inbox')
    const isNursePath = nurseRoutes.some(route => pathname.startsWith(route))
    
    // Only redirect if there's a clear authentication mismatch
    if (nurseAuth && !doctorAuth && isDoctorPath) {
      router.replace('/nurse-portal')
    } else if (doctorAuth && !nurseAuth && isNursePath) {
      router.replace('/doctor/dashboard')
    }
  }, [doctorAuth, isLoading, nurseAuth, pathname, router])

  if (isLoading) {
    return null // Prevent flash during initial load
  }
  
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>
  }
  
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
