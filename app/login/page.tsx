'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDoctor } from '@/contexts/DoctorContext'
import { useNurse } from '@/contexts/NurseContext'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

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
        // Get the user to determine role
        const supabase = supabaseBrowser()
        const { data: { session } } = await supabase.auth.getSession()
        const userRole = session?.user.user_metadata?.role || 'doctor'

        if (userRole === 'nurse') {
          // Load nurse data
          const user = session?.user
          if (user) {
            const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
            const department = user.user_metadata?.department || 'General'

            setNurse({
              id: user.id,
              name: fullName,
              email: user.email || '',
              department: department,
              avatar: user.user_metadata?.avatar
            })
            setIsAuthenticated(true)
          }
          router.push('/nurse-portal')
        } else {
          // Doctor login
          router.push('/doctor/dashboard')
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
          <p className="mt-1 text-xs">Make sure your user has a role set in user_metadata (doctor or nurse)</p>
        </div>
      </div>
    </div>
  )
}