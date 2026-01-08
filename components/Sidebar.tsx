'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDoctor } from '@/contexts/DoctorContext'

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { doctor, logout } = useDoctor()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  useEffect(() => {
    document.body.classList.add('has-bottom-bar')
    return () => {
      document.body.classList.remove('has-bottom-bar')
    }
  }, [])

  const navItems = [
    { icon: 'home', label: 'Home', href: '/doctor/dashboard' },
    { icon: 'groups', label: 'My Patients', href: '/patients' },
  ]

  const bottomItems: Array<{ icon: string; label: string; href: string }> = []

  return (
    <aside className={`flex w-full ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} flex-col bg-white dark:bg-gray-900 p-2 lg:p-4 border-b lg:border-b-0 border-gray-200 dark:border-gray-800 lg:border-r lg:h-screen lg:sticky top-0 transition-all duration-300 overflow-x-hidden lg:overflow-y-auto`}>
      <div className="flex items-center justify-between mb-1 lg:mb-8">
        <div className={`flex items-center gap-2 ${isCollapsed ? 'lg:hidden' : ''}`}>
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-5 lg:size-10"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAIvhsI2mvBKXaHlCUz0PA5n5FW4lyFIJhxJpNXoPyBoHFL72A1graDo7-FmfcUdzvHyJAKBwcmxr83-yxj9STK928Og--F5_H0wNRQ_9VdAzZrxxk-eeBdZ8P8Xcsyp5jqHD2KCc3UBFPnoePLA69iZaeOKgxg5mRsGO14CqdGLak3vlMb-KYEDtX0z3re05rOcoV-vlF1Ky8Hn3MqrxdKFFhIT8pCiW3iMVgbHKKzpkRHw-741kfhXZ6RRnrsHalhB4WafkR6mKs")'
            }}
          />
          <h1 className="text-gray-900 dark:text-white text-[13px] leading-tight lg:text-lg font-medium">Intellibus Tele-Medicine</h1>
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:inline-flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
            menu
          </span>
        </button>
      </div>

      <nav className="hidden lg:flex flex-row lg:flex-col gap-2 flex-grow lg:overflow-visible pb-2 lg:pb-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === '/patients' && pathname.startsWith('/patients')) ||
            (item.href === '/medications' && pathname.startsWith('/medications'))
          return (
            <Link
              key={item.label}
              className={`flex items-center gap-3 ${isCollapsed ? 'lg:justify-center' : ''} px-3 py-2 rounded-lg relative shrink-0 ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              href={item.href}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-blue-500 rounded-r"></div>
              )}
              <div className="relative">
                <span className={`material-symbols-outlined text-xl w-6 h-6 flex items-center justify-center ${isActive ? 'fill' : ''}`}>
                  {item.icon}
                </span>
                {item.href === '/doctor/inbox' && hasUnreadMessages && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
              <p className={`text-sm font-medium ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</p>
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          {bottomItems.map((item) => (
            <Link
              key={item.label}
              className={`flex items-center gap-3 ${isCollapsed ? 'lg:justify-center' : ''} px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
              href={item.href}
            >
              <span className="material-symbols-outlined text-xl w-6 h-6 flex items-center justify-center">{item.icon}</span>
              <p className={`text-sm font-medium ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</p>
            </Link>
          ))}
          
          <button
            onClick={handleLogout}
            className={`hidden lg:flex items-center gap-3 ${isCollapsed ? 'lg:justify-center' : ''} px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
          >
            <span className="material-symbols-outlined text-xl w-6 h-6 flex items-center justify-center">logout</span>
            <p className={`text-sm font-medium ${isCollapsed ? 'lg:hidden' : ''}`}>Logout</p>
          </button>
        </div>

        <div className={`border-t border-gray-200 dark:border-gray-700 pt-4 ${isCollapsed ? 'lg:hidden' : ''} hidden lg:block`}>
          <div className="flex items-center gap-3">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage: doctor?.avatar ? `url("${doctor.avatar}")` : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBevzzTiuFvj77hHgIQO-zsMGw3JH6wML3gRur0C6z0xrjqm75RCjxpea_yuq9YxdfbrSCVugctD9ckg66H_Es4AnRjNeKVKJN-3hhwq3uoZVX4xXctMFHvTAZDBz3PUNqzdAGDvX-raEXyNcmiBKZItUurchM50ZCy5v92O7NEIIYv1seAmACOaiGlWAfwACk8nZhn6Wvww3wdpeK0QrFBb8yGpQA7M9plB7puFkf9xxic63ekREoqqelmGMm-v3TzjOMdbL4291I")'
              }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{doctor?.name || 'Doctor'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{doctor?.specialty || 'Physician'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/patients' && pathname.startsWith('/patients'))
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
                  isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
