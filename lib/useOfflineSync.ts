/**
 * React hook for offline sync functionality
 * Sets up automatic syncing when connection is restored
 */

import { useEffect, useState } from 'react';
import { setupAutoSync, syncQueue, getQueueCount } from './offlineQueue';

export function useOfflineSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // Initialize online status and queue count
    if (typeof window !== 'undefined') {
      setOnline(navigator.onLine);
      getQueueCount().then(setPendingCount);
    }

    // Setup auto-sync on connection restore
    const cleanup = setupAutoSync((synced, failed) => {
      setIsSyncing(false);
      getQueueCount().then(setPendingCount);
    });

    // Listen for online/offline events
    const handleOnline = () => {
      setOnline(true);
      setIsSyncing(true);
      syncQueue().then((result) => {
        setIsSyncing(false);
        getQueueCount().then(setPendingCount);
      });
    };

    const handleOffline = () => {
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update pending count periodically
    const interval = setInterval(() => {
      getQueueCount().then(setPendingCount);
    }, 2000);

    return () => {
      cleanup();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const manualSync = async () => {
    if (!online || isSyncing) return;
    
    setIsSyncing(true);
    const result = await syncQueue();
    setIsSyncing(false);
    await getQueueCount().then(setPendingCount);
    return result;
  };

  return {
    pendingCount,
    isSyncing,
    online,
    manualSync,
  };
}

