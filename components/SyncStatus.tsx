'use client'

import { useState, useEffect, useCallback, memo } from 'react'

interface PendingChange {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: string
  timestamp: number
}

interface SyncStatusProps {
  className?: string
  showDetails?: boolean
  onSyncClick?: () => void
}

const SyncStatus = memo(function SyncStatus({
  className = '',
  showDetails = false,
  onSyncClick
}: SyncStatusProps) {
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load pending changes from localStorage
  useEffect(() => {
    const loadPendingChanges = () => {
      try {
        const stored = localStorage.getItem('pending-sync-changes')
        if (stored) {
          const changes = JSON.parse(stored) as PendingChange[]
          setPendingChanges(changes)
        }
      } catch (err) {
        console.error('Failed to load pending changes:', err)
      }
    }

    loadPendingChanges()
    
    // Listen for storage events (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pending-sync-changes') {
        loadPendingChanges()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Load last sync time
  useEffect(() => {
    const stored = localStorage.getItem('last-sync-time')
    if (stored) {
      setLastSyncTime(parseInt(stored, 10))
    }
  }, [])

  const syncChanges = useCallback(async () => {
    if (!isOnline || pendingChanges.length === 0 || isSyncing) {
      return
    }

    setIsSyncing(true)
    onSyncClick?.()

    try {
      // Simulate sync process - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Clear pending changes after successful sync
      setPendingChanges([])
      localStorage.removeItem('pending-sync-changes')
      
      const now = Date.now()
      setLastSyncTime(now)
      localStorage.setItem('last-sync-time', now.toString())
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, pendingChanges.length, isSyncing, onSyncClick])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingChanges.length > 0 && !isSyncing) {
      syncChanges()
    }
  }, [isOnline, pendingChanges.length, isSyncing, syncChanges])

  const pendingCount = pendingChanges.length
  const hasPendingChanges = pendingCount > 0

  if (!hasPendingChanges && !showDetails) {
    return null
  }

  return (
    <div className={`${className}`}>
      <button
        onClick={syncChanges}
        disabled={!isOnline || isSyncing || !hasPendingChanges}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          touch-target
          transition-smooth
          ${hasPendingChanges
            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/50'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        aria-label={`Sync ${pendingCount} pending ${pendingCount === 1 ? 'change' : 'changes'}`}
      >
        {isSyncing ? (
          <>
            <span className="material-symbols-outlined animate-spin text-lg">sync</span>
            <span className="text-sm font-medium">Syncing...</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-lg">
              {isOnline ? 'sync' : 'cloud_off'}
            </span>
            <span className="text-sm font-medium">
              {hasPendingChanges 
                ? `${pendingCount} pending ${pendingCount === 1 ? 'change' : 'changes'}`
                : 'All synced'
              }
            </span>
          </>
        )}
      </button>

      {showDetails && (
        <div className="mt-2 space-y-1">
          {lastSyncTime && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
            </p>
          )}
          {!isOnline && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Offline - changes will sync when connection is restored
            </p>
          )}
        </div>
      )}
    </div>
  )
})

// Utility function to add a pending change (can be used throughout the app)
export function addPendingChange(change: Omit<PendingChange, 'timestamp'>) {
  try {
    const stored = localStorage.getItem('pending-sync-changes')
    const changes: PendingChange[] = stored ? JSON.parse(stored) : []
    
    const newChange: PendingChange = {
      ...change,
      timestamp: Date.now()
    }
    
    changes.push(newChange)
    localStorage.setItem('pending-sync-changes', JSON.stringify(changes))
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new Event('storage'))
  } catch (err) {
    console.error('Failed to add pending change:', err)
  }
}

export default SyncStatus

