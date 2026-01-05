'use client'

import { useState, useEffect } from 'react'
import { useDoctor } from '@/contexts/DoctorContext'
import { useNurse } from '@/contexts/NurseContext'

type AvailabilityStatus = 'available' | 'offline' | 'busy'

interface AvailabilityToggleProps {
  className?: string
}

export default function AvailabilityToggle({ className = '' }: AvailabilityToggleProps) {
  const { doctor } = useDoctor()
  const { nurse } = useNurse()
  const currentUser = doctor || nurse
  const userId = currentUser?.id

  const [availability, setAvailability] = useState<AvailabilityStatus>('offline')
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchAvailability()
    }
  }, [userId])

  const fetchAvailability = async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${userId}/availability`)
      if (response.ok) {
        const data = await response.json()
        setAvailability(data.availability || 'offline')
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAvailability = async (newStatus: AvailabilityStatus) => {
    if (!userId || updating) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/users/${userId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ availability: newStatus }),
      })

      if (response.ok) {
        setAvailability(newStatus)
      } else {
        const error = await response.json()
        console.error('Error updating availability:', error)
        alert('Failed to update availability: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating availability:', error)
      alert('Failed to update availability')
    } finally {
      setUpdating(false)
    }
  }

  if (!currentUser || loading) {
    return null
  }

  const getStatusColor = (status: AvailabilityStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-500'
      case 'busy':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor(availability)} ${updating ? 'animate-pulse' : ''}`} />
        <select
          value={availability}
          onChange={(e) => updateAvailability(e.target.value as AvailabilityStatus)}
          disabled={updating}
          className="bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="offline">Offline</option>
        </select>
      </div>
    </div>
  )
}

