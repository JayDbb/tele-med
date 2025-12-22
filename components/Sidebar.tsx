'use client'

import { useState, useEffect } from 'react'

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

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
  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: true },
    { icon: 'calendar_month', label: 'Calendar', active: false },
    { icon: 'groups', label: 'Patients', active: false },
    { icon: 'monitor_heart', label: 'Diagnosis', active: false },
  ]

  const bottomItems = [
    { icon: 'notifications', label: 'Notifications' },
    { icon: 'settings', label: 'Settings' },
  ]

  return (
    <aside className={`flex h-screen ${isCollapsed ? 'w-16' : 'w-64'} flex-col bg-white dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-800 sticky top-0 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-8">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'hidden' : ''}`}>
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAIvhsI2mvBKXaHlCUz0PA5n5FW4lyFIJhxJpNXoPyBoHFL72A1graDo7-FmfcUdzvHyJAKBwcmxr83-yxj9STK928Og--F5_H0wNRQ_9VdAzZrxxk-eeBdZ8P8Xcsyp5jqHD2KCc3UBFPnoePLA69iZaeOKgxg5mRsGO14CqdGLak3vlMb-KYEDtX0z3re05rOcoV-vlF1Ky8Hn3MqrxdKFFhIT8pCiW3iMVgbHKKzpkRHw-741kfhXZ6RRnrsHalhB4WafkR6mKs")'
            }}
          />
          <h1 className="text-gray-900 dark:text-white text-lg font-medium">Medical.</h1>
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
            {isCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        {navItems.map((item) => (
          <a
            key={item.label}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              item.active
                ? 'bg-primary/10 text-primary'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            href={item.label === 'Patients' ? '/patients' : item.label === 'Dashboard' ? '/' : '#'}
          >
            <span className={`material-symbols-outlined ${item.active ? 'fill' : ''}`}>
              {item.icon}
            </span>
            {!isCollapsed && <p className="text-sm font-medium">{item.label}</p>}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          {bottomItems.map((item) => (
            <a
              key={item.label}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              href="#"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {!isCollapsed && <p className="text-sm font-medium">{item.label}</p>}
            </a>
          ))}
          
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
            {!isCollapsed && <p className="text-sm font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</p>}
          </button>
        </div>

        <div className={`border-t border-gray-200 dark:border-gray-700 pt-4 ${isCollapsed ? 'hidden' : ''}`}>
          <div className="flex items-center gap-3">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBevzzTiuFvj77hHgIQO-zsMGw3JH6wML3gRur0C6z0xrjqm75RCjxpea_yuq9YxdfbrSCVugctD9ckg66H_Es4AnRjNeKVKJN-3hhwq3uoZVX4xXctMFHvTAZDBz3PUNqzdAGDvX-raEXyNcmiBKZItUurchM50ZCy5v92O7NEIIYv1seAmACOaiGlWAfwACk8nZhn6Wvww3wdpeK0QrFBb8yGpQA7M9plB7puFkf9xxic63ekREoqqelmGMm-v3TzjOMdbL4291I")'
              }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Dr. Alex Robin</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Surgeon</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar