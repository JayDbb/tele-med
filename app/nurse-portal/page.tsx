'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import NurseSidebar from '@/components/NurseSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { useNurse } from '@/contexts/NurseContext'

export default function NursePortalPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'my' | 'all' | 'completed'>('my')
  const { nurse } = useNurse()
  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
  const isValidPatientId = (patientId: unknown) => {
    const value = `${patientId ?? ''}`.trim()
    return value.length > 0 && value !== 'undefined' && value !== 'null'
  }

  useEffect(() => {
    const loadPatients = () => {
      PatientDataManager.cleanupBlankPatients()
      const allPatients = PatientDataManager.getAllPatients()
      setPatients(allPatients)
    }
    
    loadPatients()
    
    // Listen for patient updates
    const handleStorageChange = () => {
      loadPatients()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleClearPatients = () => {
    if (!window.confirm('Clear all demo patients and locally saved visits?')) return
    PatientDataManager.clearAllPatients()
    setPatients([])
  }

  const myPatients = useMemo(() => {
    if (!nurse?.id) return []
    return patients.filter((patient) => {
      const isCompleted = `${patient.status}`.toLowerCase() === 'completed'
      return patient.nurseId === nurse.id && !isCompleted
    })
  }, [nurse?.id, patients])
  const completedPatients = useMemo(
    () => patients.filter((patient) => `${patient.status}`.toLowerCase() === 'completed'),
    [patients]
  )

  const visiblePatients = (activeTab === 'completed'
    ? completedPatients
    : activeTab === 'all'
      ? patients
      : myPatients
  ).filter((patient) => isValidPatientId(patient?.id))

  const getQueueStatus = (status?: string) => {
    const normalized = `${status || ''}`.toLowerCase()
    if (normalized.includes('completed') || normalized.includes('done')) return 'Done'
    if (normalized.includes('provider') || normalized.includes('pending')) return 'With Provider'
    if (normalized.includes('progress') || normalized.includes('active')) return 'In Progress'
    return 'Waiting'
  }

  const getStatusStyles = (label: string) => {
    switch (label) {
      case 'With Provider':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
      case 'Done':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
      <NurseSidebar />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearPatients}
              className="flex items-center gap-2 px-3 py-2 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Clear Demo Patients
            </button>
            <Link href={`/nurse-portal/patients/${Date.now()}/new`} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Patient
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Nurse Dashboard</h2>
                <p className="text-slate-600 dark:text-gray-400">{todayLabel} • Hybrid workflow ready</p>
              </div>
            </div>

            <section className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-gray-700">
                  <nav className="flex gap-6 -mb-px">
                    <button
                      onClick={() => setActiveTab('my')}
                      className={`pb-4 px-2 border-b-2 font-semibold text-sm flex items-center gap-2 ${
                        activeTab === 'my'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      My Tasks
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">{myPatients.length}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`pb-4 px-2 border-b-2 font-medium text-sm transition-all ${
                        activeTab === 'all'
                          ? 'border-primary text-primary font-semibold'
                          : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      All Patients
                    </button>
                    <button
                      onClick={() => setActiveTab('completed')}
                      className={`pb-4 px-2 border-b-2 font-medium text-sm transition-all ${
                        activeTab === 'completed'
                          ? 'border-primary text-primary font-semibold'
                          : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      Completed
                    </button>
                  </nav>
                  <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Queue live
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                  <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 text-xs uppercase tracking-wide text-slate-400 dark:text-gray-500 border-b border-slate-100 dark:border-gray-700">
                    <span>Patient</span>
                    <span>Arrival</span>
                    <span>Status</span>
                    <span>Task / Visit Type</span>
                  </div>
                  <div className="flex flex-col divide-y divide-slate-100 dark:divide-gray-700">
                    {visiblePatients.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="size-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl text-slate-400 dark:text-gray-500">group</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          {activeTab === 'completed' ? 'No completed visits yet' : 'No patients yet'}
                        </h3>
                        <p className="text-slate-500 dark:text-gray-400 mb-4">
                          {activeTab === 'completed'
                            ? 'Patients marked as completed will show up here.'
                            : 'Start by adding a new walk-in or scheduled intake.'}
                        </p>
                        {activeTab !== 'completed' && (
                          <Link href={`/nurse-portal/patients/${Date.now()}/new`} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Add Patient
                          </Link>
                        )}
                      </div>
                    ) : (
                      visiblePatients.map((patient) => {
                        const initials = patient.name ? patient.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'P'
                        const arrivalSource = patient.arrivalTime || patient.createdAt
                        const arrival = arrivalSource ? new Date(arrivalSource) : null
                        const waitMinutes = arrival ? Math.floor((Date.now() - arrival.getTime()) / 60000) : 0
                        const statusLabel = getQueueStatus(patient.status)
                        const taskLabel = patient.visitType || patient.appointment || 'General'
                        const waitingFlag = statusLabel === 'Waiting' && waitMinutes >= 15

                        return (
                          <Link
                            key={patient.id}
                            href={`/nurse-portal/patients/${patient.id}`}
                            className={`group flex flex-col lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors ${
                              waitingFlag ? 'bg-amber-50/40 dark:bg-amber-900/10' : ''
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                                {initials}
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                  {patient.name || 'Unnamed Patient'}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                  <span className="material-symbols-outlined text-[14px] text-slate-400">id_card</span>
                                  MRN {patient.mrn || 'Not assigned'}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-gray-300">
                              <span className="text-xs text-slate-400 dark:text-gray-500">Arrival</span>
                              <span className={`font-medium ${waitingFlag ? 'text-amber-700 dark:text-amber-300' : ''}`}>
                                {arrival ? arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                {waitMinutes > 0 ? ` • ${waitMinutes}m` : ''}
                              </span>
                            </div>
                            <div className="flex flex-col gap-2">
                              <span className="text-xs text-slate-400 dark:text-gray-500">Status</span>
                              <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(statusLabel)}`}>
                                {statusLabel}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-gray-300">
                              <span className="text-xs text-slate-400 dark:text-gray-500">Task</span>
                              <span className="font-medium">{taskLabel}</span>
                            </div>
                          </Link>
                        )
                      })
                    )}
                  </div>
                </div>

                {patients.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-2 text-xs text-slate-500 dark:text-gray-400">
                    Showing {visiblePatients.length} patient{visiblePatients.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
