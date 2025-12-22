"use client";

import { useOfflineSync } from "../lib/useOfflineSync";

/**
 * Component that shows offline sync status and pending requests
 */
export function OfflineSyncIndicator() {
  const { pendingCount, isSyncing, online, manualSync } = useOfflineSync();

  // Don't show anything if there are no pending requests and we're online
  if (pendingCount === 0 && online && !isSyncing) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!online && (
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg mb-2 flex items-center gap-2">
          <span>⚠️</span>
          <span className="text-sm font-medium">You're offline</span>
        </div>
      )}
      
      {pendingCount > 0 && (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg mb-2 flex items-center gap-2">
          <span>{isSyncing ? "🔄" : "📤"}</span>
          <span className="text-sm font-medium">
            {isSyncing 
              ? `Syncing ${pendingCount} request${pendingCount !== 1 ? 's' : ''}...`
              : `${pendingCount} request${pendingCount !== 1 ? 's' : ''} pending sync`
            }
          </span>
          {!isSyncing && online && (
            <button
              onClick={manualSync}
              className="ml-2 text-xs bg-white text-blue-500 px-2 py-1 rounded hover:bg-blue-50 transition"
            >
              Sync Now
            </button>
          )}
        </div>
      )}
    </div>
  );
}

