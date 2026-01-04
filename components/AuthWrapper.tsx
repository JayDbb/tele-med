'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useDoctor } from '@/contexts/DoctorContext'
import { useNurse } from '@/contexts/NurseContext'
import LoginPage from '@/app/login/page'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/api'

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: doctorAuth, loading: doctorLoading } = useDoctor()
  const { isAuthenticated: nurseAuth, loading: nurseLoading } = useNurse()
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [timedOut, setTimedOut] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)

  useEffect(() => {
    // Small delay to prevent flash
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // If providers take too long, fallback to rendering to aid debugging
    // Increased timeout to 5 seconds to allow session checks to complete
    const t = setTimeout(() => {
      console.log('[AuthWrapper] Timeout reached, allowing render')
      setTimedOut(true)
    }, 5000)
    return () => clearTimeout(t)
  }, [])

  // Fetch user role - try to get it even if contexts haven't loaded yet
  useEffect(() => {
    async function fetchUserRole() {
      try {
        const user = await getCurrentUser()
        if (user) {
          setUserRole(user.role || null)
        } else {
          // If getCurrentUser fails, try to get role from Supabase session
          const supabase = (await import('@/lib/supabaseBrowser')).supabaseBrowser()
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const role = session.user.user_metadata?.role
            if (role) {
              setUserRole(role)
            }
          }
        }
      } catch (error) {
        console.error('[AuthWrapper] Failed to fetch user role:', error)
      } finally {
        setRoleLoading(false)
      }
    }

    // Always try to fetch role, even if contexts haven't loaded
    // This helps with page reloads
    fetchUserRole()
  }, [])

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup']

  // Shared routes - accessible by both nurses and doctors
  const sharedRoutes = ['/patients']

  // Nurse portal routes - only accessible by nurses
  const nurseRoutes = ['/nurse-portal']

  // Doctor portal routes - only accessible by doctors
  const doctorRoutes = ['/doctor', '/dashboard', '/calendar', '/inbox', '/visits', '/medications']

  // If any provider is still checking session, don't decide yet — prevent flash-to-login
  // But if we have a role and it matches the route, we can proceed
  const shouldWait = isLoading || doctorLoading || nurseLoading || (roleLoading && !userRole)

  if (shouldWait) {
    if (!timedOut) {
      console.log('[AuthWrapper] waiting for providers to finish loading', { pathname, doctorLoading, nurseLoading, roleLoading, userRole })
      return null
    } else {
      console.log('[AuthWrapper] providers still loading but timed out, checking if we can proceed', { pathname, userRole })
    }
  }

  // Debug: show route and auth states
  console.log('[AuthWrapper] pathname, doctorAuth, nurseAuth, userRole:', pathname, doctorAuth, nurseAuth, userRole)

  // Treat public routes as prefix matches so trailing slashes or query params don't cause mis-matches
  if (publicRoutes.some(route => pathname?.startsWith(route))) {
    return <>{children}</>
  }

  // Check if user is authenticated at all
  const isAuthenticated = doctorAuth || nurseAuth

  if (!isAuthenticated) {
    return <LoginPage />
  }

  // Role-based access control
  const isSharedRoute = sharedRoutes.some(route => pathname.startsWith(route))
  const isNurseRoute = nurseRoutes.some(route => pathname.startsWith(route))
  const isDoctorRoute = doctorRoutes.some(route => pathname.startsWith(route))

  // If role is still loading and user is authenticated, wait a bit more
  if (isAuthenticated && userRole === null && !timedOut) {
    return null
  }

  // If accessing shared routes (accessible by both nurses and doctors)
  if (isSharedRoute) {
    // Both nurses and doctors can access shared routes
    if (userRole === 'nurse' && nurseAuth) {
      return <>{children}</>
    }
    if (userRole === 'doctor' && doctorAuth) {
      return <>{children}</>
    }
    // If authenticated but role doesn't match, still allow (for edge cases)
    if (isAuthenticated) {
      return <>{children}</>
    }
    return <LoginPage />
  }

  // If accessing nurse portal
  if (isNurseRoute) {
    // Only nurses can access nurse routes
    if (userRole === 'doctor') {
      console.log('[AuthWrapper] Doctor trying to access nurse route, redirecting to doctor dashboard')
      router.replace('/doctor/dashboard')
      return null
    }
    if (userRole !== 'nurse' || !nurseAuth) {
      return <LoginPage />
    }
    return <>{children}</>
  }

  // If accessing doctor portal routes
  if (isDoctorRoute) {
    // Only doctors can access doctor routes
    if (userRole === 'nurse') {
      console.log('[AuthWrapper] Nurse trying to access doctor route, redirecting to nurse portal')
      router.replace('/nurse-portal')
      return null
    }
    if (userRole !== 'doctor' || !doctorAuth) {
      return <LoginPage />
    }
    return <>{children}</>
  }

  // Default: treat as doctor route for backward compatibility
  // But if user is a nurse, redirect them to their portal
  if (userRole === 'nurse') {
    console.log('[AuthWrapper] Nurse accessing unknown route, redirecting to nurse portal')
    router.replace('/nurse-portal')
    return null
  }

  // For other routes, default to doctor portal
  if (!doctorAuth) {
    return <LoginPage />
  }

  return <>{children}</>
}
