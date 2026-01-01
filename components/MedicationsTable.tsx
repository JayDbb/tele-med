'use client'

import React, { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

interface Medication {
  id: string
  patient_id?: string | null
  prescriber_id?: string | null
  name?: string | null
  dosage?: string | null
  frequency?: string | null
  start_date?: string | null
  end_date?: string | null
  created_at?: string | null
}

export default function MedicationsTable({ patientId }: { patientId?: string }) {
  const [meds, setMeds] = useState<Medication[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadMeds() }, [patientId])

  async function getToken() {
    const supabase = supabaseBrowser()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  async function loadMeds() {
    setLoading(true)
    try {
      const token = await getToken()
      const url = '/api/medications' + (patientId ? `?patient_id=${patientId}` : '')
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to fetch medications')
      const json = await res.json()
      setMeds(json.medications || [])
    } catch (e) {
      console.error('Failed to load medications', e)
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">Name</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">Dosage</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">Frequency</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
          </tr>
        </thead>
        <tbody>
          {meds.map(m => (
            <tr key={m.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">{m.name}</td>
              <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">{m.dosage || '-'}</td>
              <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">{m.frequency || '-'}</td>
              <td className="py-4 px-6">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">Active</span>
              </td>
            </tr>
          ))}
          {!loading && meds.length === 0 && (
            <tr><td className="p-6 text-gray-500" colSpan={4}>No medications found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
