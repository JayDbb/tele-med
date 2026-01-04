'use client'

import { useEffect } from 'react'

const PwaManager = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Skip service worker in local development to avoid stale cache issues during development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || process.env.NODE_ENV === 'development') return
    if (!('serviceWorker' in navigator)) return

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
