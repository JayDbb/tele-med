'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDoctor } from '@/contexts/DoctorContext'
import { useNurse } from '@/contexts/NurseContext'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { getCurrentUser } from '@/lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: doctorLogin } = useDoctor()
  const { setNurse, setIsAuthenticated } = useNurse()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await doctorLogin(email, password)

      if (result.success) {
        // Use the role returned by the login call when possible (avoids race with auth state)
        const role = result.role

        if (role === 'nurse') {
          // Nurse: set nurse context and auth then navigate client-side
          const user = await getCurrentUser()
          setNurse({
            id: user?.id || '',
            name: user?.name || user?.email || 'User',
            email: user?.email || '',
            department: user?.metadata?.department || user?.department || 'General',
            avatar: user?.avatar_url || null
          })
          setIsAuthenticated(true)
          router.push('/nurse-portal')
        } else {
          // Doctor: to avoid client-side auth race where AuthWrapper re-renders back to login
          // force a full page navigation so server renders the correct dashboard post-login
          window.location.href = '/doctor/dashboard'
        }
      } else {
        setError(result.error || 'Invalid email or password')
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            TeleMed Portal
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your doctor account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="doctor@telemedclinic.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium">Sign in with your Supabase account</p>
          <p className="mt-1 text-xs">Don't have an account? <a href="/signup" className="text-primary">Sign up</a></p>
        </div>
      </div>
    </div>
  )
}