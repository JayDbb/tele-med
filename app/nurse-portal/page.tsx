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
  const availableDoctors: any[] = []
  const busyDoctors: any[] = []
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

  return (
    <div className="flex h-screen w-full overflow-hidden">
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
            <Link href={`/nurse-portal/patients/${Date.now()}/new-visit`} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Patient Intake
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Nurse Dashboard</h2>
                <p className="text-slate-600 dark:text-gray-400">{todayLabel} • Shift not set</p>
              </div>
            </div>

            {/* Doctors Status Section */}
            <section>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Available Doctors */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-gray-900 dark:text-white text-lg font-bold flex items-center gap-2">
                    <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                    Available Doctors
                  </h2>
                  <a className="text-primary text-sm font-bold hover:underline" href="#">View All</a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableDoctors.length === 0 ? (
                    <div className="col-span-full flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 text-sm text-gray-500 dark:text-gray-400">
                      No available doctors recorded.
                    </div>
                  ) : (
                    availableDoctors.map((doctor) => (
                      <div key={doctor.id} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer group">
                        <div className="size-12 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-slate-400">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="flex flex-col flex-1 gap-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-gray-900 dark:text-white text-base font-bold">{doctor.name}</h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">{doctor.mode}</span>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">{doctor.specialty}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Busy Doctors */}
              <div className="flex flex-col gap-4">
                <h2 className="text-gray-900 dark:text-white text-lg font-bold flex items-center gap-2">
                  <span className="size-2 rounded-full bg-orange-400" />
                  Busy Doctors
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {busyDoctors.length === 0 ? (
                    <div className="col-span-full flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 text-sm text-gray-500 dark:text-gray-400">
                      No busy doctors recorded.
                    </div>
                  ) : (
                    busyDoctors.map((doctor) => (
                      <div key={doctor.id} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100 cursor-pointer">
                        <div className="size-12 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-slate-400">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="flex flex-col flex-1 gap-1">
                          <h3 className="text-gray-900 dark:text-white text-base font-bold">{doctor.name}</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">{doctor.specialty}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              </div>
            </section>

            {/* Recent Patients Section */}
            <section className="flex flex-col gap-4 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-gray-700 mt-2">
                <nav className="flex gap-6 -mb-px">
                  <button
                    onClick={() => setActiveTab('my')}
                    className={`pb-4 px-2 border-b-2 font-semibold text-sm flex items-center gap-2 ${
                      activeTab === 'my'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    My Patients
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
              </div>
              
              <div className="flex flex-col gap-4">
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
                        : 'Start by adding a new patient intake.'}
                    </p>
                    {activeTab !== 'completed' && (
                      <Link href={`/nurse-portal/patients/${Date.now()}/new-visit`} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        New Patient Intake
                      </Link>
                    )}
                  </div>
                ) : (
                  visiblePatients.map((patient) => {
                    const initials = patient.name ? patient.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'P'
                    const age = patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'Unknown'
                    
                    return (
                      <Link key={patient.id} href={`/nurse-portal/patients/${patient.id}`} className="group bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-1 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 block">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 gap-4 lg:gap-8">
                          <div className="flex items-center gap-4 min-w-[240px]">
                            <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                              {initials}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{patient.name || 'Unnamed Patient'}</h3>
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                <span className="material-symbols-outlined text-[14px] text-slate-400">cake</span>
                                {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'DOB not provided'} ({age}y)
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Status</span>
                              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-gray-300">
                                <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                                {patient.status || 'New Patient'}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Created</span>
                              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-gray-400">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">schedule</span>
                                {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Today'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-8 min-w-[280px] justify-between lg:justify-end border-t lg:border-t-0 border-slate-100 dark:border-gray-700 pt-3 lg:pt-0 w-full lg:w-auto">
                            <div className="flex flex-col items-end gap-0.5">
                              <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400">
                                <span className="material-symbols-outlined text-[18px]">medical_information</span>
                                <span className="text-sm font-medium">Ready for Care</span>
                              </div>
                              <span className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">MRN: {patient.mrn || 'Not assigned'}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200/60 dark:border-green-800 uppercase tracking-wide shadow-sm">
                                <span className="size-1.5 rounded-full bg-green-500"></span>
                                {`${patient.status || 'Active'}`}
                              </span>
                              <button className="size-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                                <span className="material-symbols-outlined">more_vert</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
              
              {patients.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 dark:border-gray-700 gap-4">
                  <p className="text-xs text-slate-500 dark:text-gray-400">Showing {patients.length} patient{patients.length !== 1 ? 's' : ''}</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
