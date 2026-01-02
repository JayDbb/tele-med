'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { PatientDataManager } from '@/utils/PatientDataManager'

export default function PatientLogHistoryPage() {
  const params = useParams()
  const patientId = params.id as string
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    const auditLogs = PatientDataManager.getAuditLogs(patientId)
    setLogs(auditLogs)
  }, [patientId])

  const viewCount = useMemo(
    () => logs.filter((log) => `${log.action}`.toLowerCase() === 'view').length,
    [logs]
  )
  const updateCount = useMemo(
    () => logs.filter((log) => `${log.action}`.toLowerCase() === 'update').length,
    [logs]
  )
  const createCount = useMemo(
    () => logs.filter((log) => `${log.action}`.toLowerCase() === 'create').length,
    [logs]
  )

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NurseSidebar />
      <PatientDetailSidebar patientId={params.id as string} />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Log History</h2>
                <p className="text-sm text-slate-500 dark:text-gray-400">Audit trail of views and updates for this patient.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Views</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{viewCount}</p>
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">visibility</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Updates</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{updateCount}</p>
                  </div>
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">edit</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Creates</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{createCount}</p>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Activity Log</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">All recorded actions tied to this patient ID.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Action</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Section</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">User</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 px-6 text-sm text-slate-500 dark:text-gray-400">
                          No audit logs recorded yet.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50">
                          <td className="py-4 px-6 text-slate-600 dark:text-gray-300 capitalize">{log.action}</td>
                          <td className="py-4 px-6 text-slate-600 dark:text-gray-300">{log.section}</td>
                          <td className="py-4 px-6 text-slate-600 dark:text-gray-300">{log.userName || 'Staff'}</td>
                          <td className="py-4 px-6 text-slate-600 dark:text-gray-300">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                          </td>
                          <td className="py-4 px-6 text-slate-500 dark:text-gray-400 text-xs">
                            {log.notes || (log.changes ? JSON.stringify(log.changes) : 'No details recorded')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
