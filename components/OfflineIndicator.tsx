'use client'

import { useState, useEffect, memo } from 'react'

interface OfflineIndicatorProps {
  className?: string
  showWhenOnline?: boolean
}

const OfflineIndicator = memo(function OfflineIndicator({ 
  className = '',
  showWhenOnline = false 
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setWasOffline(true)
      // Clear the wasOffline flag after showing the message
      setTimeout(() => setWasOffline(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showWhenOnline && !wasOffline) {
    return null
  }

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50
        px-4 py-3
        transition-transform duration-300 ease-in-out
        ${isOnline 
          ? (wasOffline ? 'translate-y-0' : '-translate-y-full')
          : 'translate-y-0'
        }
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
          ${isOnline
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
          }
        `}
      >
        <span className="material-symbols-outlined">
          {isOnline ? 'wifi' : 'wifi_off'}
        </span>
        <div className="flex-1">
          <p className="font-medium text-sm">
            {isOnline ? 'Back online' : 'You are offline'}
          </p>
          {!isOnline && (
            <p className="text-xs opacity-90 mt-0.5">
              Some features may be unavailable. Changes will sync when connection is restored.
            </p>
          )}
        </div>
        {isOnline && wasOffline && (
          <button
            onClick={() => setWasOffline(false)}
            className="touch-target p-1 rounded hover:bg-white/20 transition-smooth"
            aria-label="Dismiss"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>
    </div>
  )
})

export default OfflineIndicator

