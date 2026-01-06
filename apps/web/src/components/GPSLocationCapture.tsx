'use client'

import { useState, useEffect, useCallback, useRef, memo } from 'react'

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number | null
  timestamp: number
  address?: string
}

interface GPSLocationCaptureProps {
  onLocationUpdate?: (location: LocationData) => void
  showMap?: boolean
  className?: string
  autoCapture?: boolean
}

const GPSLocationCapture = memo(function GPSLocationCapture({
  onLocationUpdate,
  showMap = true,
  className = '',
  autoCapture = false
}: GPSLocationCaptureProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    setIsSupported('geolocation' in navigator)
  }, [])

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string | undefined> => {
    try {
      // Using Nominatim (OpenStreetMap) for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'TeleMed App'
          }
        }
      )
      const data = await response.json()
      return data.display_name
    } catch (err) {
      console.error('Reverse geocoding failed:', err)
      return undefined
    }
  }, [])

  const captureLocation = useCallback(async () => {
    if (!isSupported) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsCapturing(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        }

        // Try to get address
        try {
          const address = await reverseGeocode(locationData.latitude, locationData.longitude)
          locationData.address = address
        } catch (err) {
          console.warn('Address lookup failed:', err)
        }

        setLocation(locationData)
        onLocationUpdate?.(locationData)
        setIsCapturing(false)
      },
      (err) => {
        setError(err.message === 'User denied Geolocation' 
          ? 'Location access denied. Please enable location permissions.'
          : 'Failed to capture location. Please try again.'
        )
        setIsCapturing(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [isSupported, onLocationUpdate, reverseGeocode])

  const startWatching = useCallback(() => {
    if (!isSupported || watchIdRef.current !== null) return

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        }

        setLocation(locationData)
        onLocationUpdate?.(locationData)
      },
      (err) => {
        setError(err.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    )
  }, [isSupported, onLocationUpdate])

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  useEffect(() => {
    if (autoCapture) {
      captureLocation()
    }

    return () => {
      stopWatching()
    }
  }, [autoCapture, captureLocation, stopWatching])

  const mapUrl = location
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.01},${location.latitude - 0.01},${location.longitude + 0.01},${location.latitude + 0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}`
    : null

  if (!isSupported) {
    return (
      <div className={`p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg ${className}`}>
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Location services are not available on this device.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={captureLocation}
          disabled={isCapturing}
          className="
            flex-1 touch-target
            bg-primary text-white 
            font-medium px-6 py-3 rounded-lg
            hover:bg-primary/90 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-smooth
            flex items-center justify-center gap-2
          "
          aria-label="Capture current location"
        >
          {isCapturing ? (
            <>
              <span className="material-symbols-outlined animate-spin">sync</span>
              <span>Capturing...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">my_location</span>
              <span>Capture Location</span>
            </>
          )}
        </button>

        {location && (
          <button
            onClick={startWatching}
            className="
              touch-target
              bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
              font-medium px-4 py-3 rounded-lg
              hover:bg-gray-200 dark:hover:bg-gray-700
              transition-smooth
            "
            aria-label="Start tracking location"
          >
            <span className="material-symbols-outlined">gps_fixed</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {location && (
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">place</span>
              <div className="flex-1 min-w-0">
                {location.address ? (
                  <p className="text-sm text-gray-900 dark:text-white break-words">{location.address}</p>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
            
            {location.accuracy && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="material-symbols-outlined text-sm">accuracy</span>
                <span>Accuracy: ±{Math.round(location.accuracy)}m</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>{new Date(location.timestamp).toLocaleString()}</span>
            </div>
          </div>

          {showMap && mapUrl && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <iframe
                src={mapUrl}
                className="w-full h-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location map"
              />
              <a
                href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=15/${location.latitude}/${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 right-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg shadow-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-smooth"
              >
                Open in Maps
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export default GPSLocationCapture

