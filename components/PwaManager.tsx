'use client'

import { useEffect } from 'react'

const PwaManager = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const isDevelopment = process.env.NODE_ENV === 'development'

    // Skip service worker in local development to avoid stale cache issues
    if (isLocalhost || isDevelopment) {
      // Unregister any existing service workers and clear caches in dev
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
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', registration.scope)
      } catch (error) {
        console.error('Service worker registration failed:', error)
      }
    }

    register()
  }, [])

  return null
}

export default PwaManager
