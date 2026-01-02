'use client'

import { useEffect } from 'react'

const PwaManager = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister())
      })
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)))
      }
      return
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js')
      } catch (error) {
        console.error('Service worker registration failed:', error)
      }
    }

    register()
  }, [])

  return null
}

export default PwaManager
