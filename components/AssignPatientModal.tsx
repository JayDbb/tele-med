'use client'

import { useState, useEffect } from 'react'
import { sharePatient } from '@/lib/api'

interface User {
  id: string
  email: string
  full_name: string
  role?: string
}

interface AssignPatientModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName?: string
  onSuccess?: () => void
}

export default function AssignPatientModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  onSuccess,
}: AssignPatientModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadUsers()
    } else {
      // Reset state when modal closes
      setSelectedEmail('')
      setSearchQuery('')
      setError(null)
      setSuccess(false)
    }
  }, [isOpen])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = (await import('@/lib/supabaseBrowser')).supabaseBrowser()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const res = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: 'include', // Include cookies for server-side auth fallback
        cache: 'no-store', // Ensure fresh data, bypass service worker cache
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to load users' }))
        throw new Error(errorData.error || `Failed to load users: ${res.status} ${res.statusText}`)
      }

      const usersData = await res.json()
      setUsers(usersData)
    } catch (err: any) {
      console.error('Error loading users:', err)
      setError(err?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedEmail) {
      setError('Please select a user to assign')
      return
    }

    try {
      setAssigning(true)
      setError(null)

      await sharePatient(patientId, selectedEmail)

      setSuccess(true)
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        }
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error('Error assigning patient:', err)
      setError(err?.message || 'Failed to assign patient')
    } finally {
      setAssigning(false)
    }
  }

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <span className="material-symbols-outlined text-xl">person_add</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Assign Patient
              </h3>
              {patientName && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {patientName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
              close
            </span>
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Patient Assigned Successfully!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The patient has been shared with the selected user.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search for Doctor or Nurse
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error && !users.length ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No users found
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedEmail === user.email
                          ? 'bg-primary/5 border-l-4 border-primary'
                          : 'border-l-4 border-transparent'
                      }`}
                    >
                      <input
                        type="radio"
                        name="user"
                        value={user.email}
                        checked={selectedEmail === user.email}
                        onChange={(e) => setSelectedEmail(e.target.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </div>
                        {user.role && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {user.role}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {error && users.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedEmail || assigning}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    <span>Assign Patient</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

