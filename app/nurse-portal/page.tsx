'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import NurseSidebar from '@/components/NurseSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { getPatients } from '@/lib/api'
import type { Patient } from '@/lib/types'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { useNurse } from '@/contexts/NurseContext'

type TabType = 'waitlist' | 'all' | 'my' | 'completed'

export default function NursePortalPage() {
  const [allPatients, setAllPatients] = useState<any[]>([])
  const [filteredPatients, setFilteredPatients] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('waitlist')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPatients()

    // Refresh patient list when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadPatients()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    filterPatients()
  }, [activeTab, allPatients])

  const loadPatients = async () => {
    try {
      setLoading(true)
      setError(null)
      const patients = await getPatients()

      // Get auth token for API calls
      const { supabaseBrowser } = await import('@/lib/supabaseBrowser')
      const supabase = supabaseBrowser()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      // Helper function to fetch clinician name
      const fetchClinicianName = async (clinicianId: string | null | undefined): Promise<string> => {
        if (!clinicianId || !token) return 'Unassigned'

        try {
          const clinicianRes = await fetch(`/api/clinicians/${clinicianId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (clinicianRes.ok) {
            const clinicianData = await clinicianRes.json()
            return clinicianData.full_name || clinicianData.email?.split('@')[0] || 'Unknown Clinician'
          }
        } catch (clinicianError) {
          console.warn('Could not fetch clinician info:', clinicianError)
        }
        return 'Unassigned'
      }

      // Fetch clinician names for all patients in parallel
      const patientsWithData = await Promise.all(
        patients.map(async (patient: Patient) => {
          const physicianName = await fetchClinicianName(patient.clinician_id)
          const initials = patient.full_name ? patient.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'P'
          const age = patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'Unknown'

          return {
            id: patient.id,
            name: patient.full_name || 'Unknown',
            email: patient.email || '',
            dob: patient.dob || '',
            phone: patient.phone || '',
            gender: patient.sex_at_birth || patient.gender_identity || 'Not provided',
            address: patient.address || '',
            allergies: patient.allergies || '',
            physician: physicianName,
            clinician_id: patient.clinician_id || null,
            createdAt: patient.created_at || new Date().toISOString(),
            updatedAt: patient.created_at || new Date().toISOString(),
            initials,
            age,
            image: undefined,
          }
        })
      )

      setAllPatients(patientsWithData)
    } catch (err: any) {
      console.error('Error loading patients:', err)
      setError(err?.message || 'Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  const filterPatients = () => {
    let filtered: any[] = []

    switch (activeTab) {
      case 'waitlist':
        // Patients without a clinician_id (unassigned)
        filtered = allPatients.filter(p => !p.clinician_id)
        break
      case 'all':
        // All patients
        filtered = allPatients
        break
      case 'my':
        // For nurses, "my patients" could mean all patients they can see
        // Or we could filter by some assignment logic if needed
        filtered = allPatients
        break
      case 'completed':
        // Patients with completed visits or status
        // For now, we'll show all patients (can be enhanced later with visit status)
        filtered = allPatients
        break
      default:
        filtered = allPatients
    }

    setFilteredPatients(filtered)
  }
  const [patients, setPatients] = useState<any[]>([])
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
      : activeTab === 'my'
        ? myPatients
        : [])
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NurseSidebar />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
          <Link href={`/patients/create`} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Patient Intake
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Nurse Dashboard</h2>
                <p className="text-slate-600 dark:text-gray-400">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} • Shift not set</p>
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
                    onClick={() => setActiveTab('waitlist')}
                    className={`pb-4 px-2 border-b-2 text-sm flex items-center gap-2 transition-all ${activeTab === 'waitlist'
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                  >
                    Wait List
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeTab === 'waitlist'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                      {allPatients.filter(p => !p.clinician_id).length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-4 px-2 border-b-2 text-sm flex items-center gap-2 transition-all ${activeTab === 'all'
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                  >
                    All Patients
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeTab === 'all'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                      {allPatients.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('my')}
                    className={`pb-4 px-2 border-b-2 text-sm flex items-center gap-2 transition-all ${activeTab === 'my'
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                  >
                    My Patients
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeTab === 'my'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                      {allPatients.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`pb-4 px-2 border-b-2 text-sm flex items-center gap-2 transition-all ${activeTab === 'completed'
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                  >
                    Completed
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeTab === 'completed'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                      {allPatients.length}
                    </span>
                  </button>
                </nav>
              </div>

              <div className="flex flex-col gap-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-500 dark:text-gray-400">Loading patients...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="size-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-red-500 dark:text-red-400">error</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Error loading patients</h3>
                    <p className="text-slate-500 dark:text-gray-400 mb-4">{error}</p>
                    <button
                      onClick={loadPatients}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">refresh</span>
                      Retry
                    </button>
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="size-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-slate-400 dark:text-gray-500">group</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {activeTab === 'waitlist' ? 'No patients in wait list' : 'No patients found'}
                    </h3>
                    <p className="text-slate-500 dark:text-gray-400 mb-4">
                      {activeTab === 'waitlist'
                        ? 'All patients have been assigned to a physician'
                        : 'Start by adding a new patient intake'}
                    </p>
                    <Link href={`/patients/create`} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      New Patient Intake
                    </Link>
                  </div>
                ) : (
                  filteredPatients.map((patient) => {
                    return (
                      <Link key={patient.id} href={`/nurse-portal/patients/${patient.id}`} className="group bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-1 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 block">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 gap-4 lg:gap-8">
                          <div className="flex items-center gap-4 min-w-[240px]">
                            <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                              {patient.initials}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{patient.name || 'Unnamed Patient'}</h3>
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                <span className="material-symbols-outlined text-[14px] text-slate-400">cake</span>
                                {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'DOB not provided'} ({patient.age}y)
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Physician</span>
                              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-gray-300">
                                <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                                {patient.physician || 'Unassigned'}
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
                                <span className="text-sm font-medium">{patient.clinician_id ? 'Assigned' : 'Ready for Care'}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">ID: {patient.id.slice(0, 8)}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm ${patient.clinician_id
                                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200/60 dark:border-green-800'
                                : 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800'
                                }`}>
                                <span className={`size-1.5 rounded-full ${patient.clinician_id ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                {patient.clinician_id ? 'Assigned' : 'Wait List'}
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

              {filteredPatients.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 dark:border-gray-700 gap-4">
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Showing {filteredPatients.length} of {allPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
