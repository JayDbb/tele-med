'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getAllVisits } from '@/lib/api'
import { useAuthGuard } from '@/lib/useAuthGuard'
import type { Visit } from '@/lib/types'
import RoleBasedSidebar from '@/components/RoleBasedSidebar'
import AvailabilityToggle from '@/components/AvailabilityToggle'
import { useDoctor } from '@/contexts/DoctorContext'
import { useNurse } from '@/contexts/NurseContext'

interface VisitWithPatient extends Visit {
  patients?: {
    full_name: string
    email: string
    dob: string
    id: string
  } | null
}

export default function VisitsPage() {
  const { ready } = useAuthGuard()
  const router = useRouter()
  const pathname = usePathname()
  const { doctor } = useDoctor()
  const { nurse } = useNurse()
  const [visits, setVisits] = useState<VisitWithPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isNurse = pathname.startsWith('/nurse-portal')
  const isDoctor = pathname.startsWith('/doctor') || doctor

  useEffect(() => {
    if (!ready) return
    loadVisits()
  }, [ready])

  const loadVisits = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllVisits()
      setVisits(data.visits || [])
    } catch (err: any) {
      console.error('Error loading visits:', err)
      setError(err?.message || 'Failed to load visits')
    } finally {
      setLoading(false)
    }
  }

  const getVisitStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'completed':
      case 'finalized':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'waiting':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getVisitUrl = (patientId: string) => {
    return `patients/${patientId}/history`
  }

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full">
        <RoleBasedSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative flex min-h-screen w-full">
        <RoleBasedSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={loadVisits}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Group visits by status
  const openVisits = visits.filter(v => v.status === 'draft' || v.status === 'in-progress' || v.status === 'waiting')
  const completedVisits = visits.filter(v => v.status === 'completed' || v.status === 'finalized')

  return (
    <div className="relative flex min-h-screen w-full">
      <RoleBasedSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Visits</h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all your visits
              </p>
            </div>
            <AvailabilityToggle />
          </div>

          {openVisits.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Current Visits ({openVisits.length})
              </h2>
              <div className="space-y-3">
                {openVisits.map((visit) => (
                  <Link
                    key={visit.id}
                    href={getVisitUrl(visit.id)}
                    className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {visit.patients?.full_name || 'Unknown Patient'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisitStatusColor(visit.status)}`}>
                            {visit.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {visit.patients?.email || 'No email'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDate(visit.created_at)}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Past Visits ({completedVisits.length})
            </h2>
            {completedVisits.length > 0 ? (
              <div className="space-y-3">
                {completedVisits.map((visit) => (
                  <Link
                    key={visit.id}
                    href={getVisitUrl(visit.patient_id)}
                    className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {visit.patients?.full_name || 'Unknown Patient'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisitStatusColor(visit.status)}`}>
                            {visit.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {visit.patients?.email || 'No email'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDate(visit.created_at)}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No completed visits yet</p>
              </div>
            )}
          </div>

          {visits.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No visits found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

