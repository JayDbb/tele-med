'use client'

import { useState, useEffect, useRef, memo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDoctor } from '@/contexts/DoctorContext'
import { useNurse } from '@/contexts/NurseContext'

interface MenuItem {
  icon: string
  label: string
  href: string
  badge?: number
  onClick?: () => void
}

interface MobileHamburgerMenuProps {
  items: MenuItem[]
  userType?: 'doctor' | 'nurse'
  className?: string
}

const MobileHamburgerMenu = memo(function MobileHamburgerMenu({ 
  items, 
  userType = 'doctor',
  className = '' 
}: MobileHamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { doctor, logout: doctorLogout } = useDoctor()
  const { nurse, logout: nurseLogout } = useNurse()

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') {
      setIsDark(true)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleLogout = () => {
    if (userType === 'doctor') {
      doctorLogout()
    } else {
      nurseLogout()
    }
    router.push('/login')
    setIsOpen(false)
  }

  const currentUser = userType === 'doctor' ? doctor : nurse

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`touch-target p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth md:hidden ${className}`}
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <span className="material-symbols-outlined text-gray-700 dark:text-gray-300 text-2xl">
          {isOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menu Panel */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className={`
          fixed top-0 left-0 h-full w-80 max-w-[85vw] 
          bg-white dark:bg-gray-900 
          shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          safe-area-inset-top
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:hidden
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{
                  backgroundImage: currentUser?.avatar 
                    ? `url("${currentUser.avatar}")` 
                    : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAIvhsI2mvBKXaHlCUz0PA5n5FW4lyFIJhxJpNXoPyBoHFL72A1graDo7-FmfcUdzvHyJAKBwcmxr83-yxj9STK928Og--F5_H0wNRQ_9VdAzZrxxk-eeBdZ8P8Xcsyp5jqHD2KCc3UBFPnoePLA69iZaeOKgxg5mRsGO14CqdGLak3vlMb-KYEDtX0z3re05rOcoV-vlF1Ky8Hn3MqrxdKFFhIT8pCiW3iMVgbHKKzpkRHw-741kfhXZ6RRnrsHalhB4WafkR6mKs")'
                }}
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {currentUser?.name || (userType === 'doctor' ? 'Doctor' : 'Nurse')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userType === 'doctor' 
                    ? (doctor?.specialty || 'Physician')
                    : (nurse?.department || 'Nursing')
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="touch-target p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
                close
              </span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2" role="navigation">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setIsOpen(false)
                    item.onClick?.()
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    touch-target
                    transition-smooth
                    ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="relative">
                    <span className={`material-symbols-outlined text-xl ${isActive ? 'fill' : ''}`}>
                      {item.icon}
                    </span>
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 touch-target w-full transition-smooth"
            >
              <span className="material-symbols-outlined text-xl">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 touch-target w-full transition-smooth"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
})

export default MobileHamburgerMenu

