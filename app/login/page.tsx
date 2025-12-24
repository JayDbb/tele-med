'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'nurse'>('doctor')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (email && password) {
      if (selectedRole === 'doctor') {
        router.push('/')
      } else {
        router.push('/nurse-portal')
      }
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Login</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Welcome back. Please enter your email and password to access your account.
          </p>
        </div>

        <div className="mb-6">
          <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold ml-1 block mb-2">Select Role</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedRole('doctor')}
              className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'doctor'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="material-symbols-outlined text-sm">medical_services</span>
              <span className="text-sm font-medium">Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('nurse')}
              className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'nurse'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="material-symbols-outlined text-sm">local_hospital</span>
              <span className="text-sm font-medium">Nurse</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold ml-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <input
                className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm shadow-sm"
                id="email"
                name="email"
                placeholder="name@example.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center">
                <span className="material-symbols-outlined text-xl">mail</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-gray-900 dark:text-gray-200 text-sm font-semibold" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative group">
              <input
                className="w-full h-12 pl-4 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm shadow-sm"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                aria-label="Toggle password visibility"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center focus:outline-none"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <div className="text-right mt-1">
              <a className="text-primary hover:text-primary/80 text-sm font-medium transition-colors" href="#">
                Forgot Password?
              </a>
            </div>
          </div>

          <button
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all transform active:scale-[0.99] shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            type="submit"
          >
            <span>Log In as {selectedRole === 'doctor' ? 'Doctor' : 'Nurse'}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Don't have an account?{' '}
            <a className="text-primary font-bold hover:underline" href="#">
              Contact Support
            </a>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 opacity-70">
          <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-lg">lock</span>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Encrypted & HIPAA Compliant</p>
        </div>
      </div>

      <div className="fixed bottom-4 left-0 w-full text-center pointer-events-none">
        <p className="text-xs text-gray-400 dark:text-gray-600">© 2024 Health System. All rights reserved.</p>
      </div>
    </div>
  )
}

export default LoginPage