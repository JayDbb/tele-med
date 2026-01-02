'use client'

import { useEffect } from 'react'
import { PatientDataManager } from '@/utils/PatientDataManager'

const SyncManager = () => {
  useEffect(() => {
    const handleOnline = () => {
      PatientDataManager.flushPendingSync()
    }

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      PatientDataManager.flushPendingSync()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  return null
}

export default SyncManager
