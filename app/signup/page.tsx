'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signup as apiSignup } from '@/lib/api'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'doctor' | 'nurse'>('doctor')
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [department, setDepartment] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const resp = await apiSignup({ email, password, role, name, specialty, department })

      if (resp.success) {
        if (resp.user) {
          // user created and signed in
          if (role === 'nurse') {
            router.push('/nurse-portal')
          } else {
            router.push('/doctor/dashboard')
          }
        } else {
          // Signed up but needs confirmation
          router.push('/login')
        }
      } else {
        setError(resp.message || 'Signup failed')
      }
    } catch (err: any) {
      setError(err?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create an account</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sign up as a doctor or nurse</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <div className="mt-1 flex gap-4">
              <label className="inline-flex items-center">
                <input type="radio" checked={role === 'doctor'} onChange={() => setRole('doctor')} />
                <span className="ml-2">Doctor</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" checked={role === 'nurse'} onChange={() => setRole('nurse')} />
                <span className="ml-2">Nurse</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
            <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
          </div>

          {role === 'doctor' ? (
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specialty</label>
              <input id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
          ) : (
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
              <input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-primary text-white rounded-md">{loading ? 'Creating...' : 'Create Account'}</button>
        </form>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">Already have an account? <a href="/login" className="text-primary">Sign in</a></div>
      </div>
    </div>
  )
}
