'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import NurseSidebar from '@/components/NurseSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { PatientDataManager } from '@/utils/PatientDataManager'

export default function NursePortalPage() {
  const [patients, setPatients] = useState<any[]>([])

  useEffect(() => {
    const loadPatients = () => {
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

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NurseSidebar />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
          <Link href={`/nurse-portal/patients/${Date.now()}/new-visit`} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Patient Intake
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Nurse Dashboard</h2>
                <p className="text-slate-600 dark:text-gray-400">Monday, Oct 24 • Shift A</p>
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
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer group">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 shrink-0 group-hover:scale-105 transition-transform" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBBA0LuUPvPheNTBMOBEDsV3g3prL1Xqs0FFDmjqEw5tQ0P_0mX0GvoGJ1RNOeA9YkVAsK_SUCxrB5flyFJeyIvKMY5LcxrDAgmyHx12E8pTJWQZ1dJVArlWTzEsivnSO5t94DU6TB4fJKzbd0RJvtkucIEg8Ru-Yfe2N9jRsqpT06a-7d0G3nGd6itkQCfTATz5K_5aMa6I_5kB72GERA9HkVTG1RLp7nSn8CWPM7NmaZT0SAksrzlKfP3gphfd4QWfT4UhIL2UA")'}} />
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-gray-900 dark:text-white text-base font-bold">Dr. Emily Chen</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">Remote</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Oncologist</p>
                      <div className="flex items-center gap-1 mt-1 text-green-600 dark:text-green-400 text-xs font-medium">
                        <span className="material-symbols-outlined text-[14px]">videocam</span>
                        Online
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer group">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 shrink-0 group-hover:scale-105 transition-transform" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAah71yzOcaCPS3iSjs5EjrZX2CDavOkYz_IS_fYISxhgcliJT12zcXA6SNN3k3yXQo-IzpeuqSXRiqvvE-kTCysKa39c_GV_ck_B4mSUkr26DiBBLPMtLvyGtiCgXFUuxXlypXfW28M2-PizLoyNalJU1ArkhpCeyy0Qh1Cey3Eo4QbSgITJdq0x2ZY9tkktDB6yaR37ORhHf3oIa_eesiWO3JCRaM91rhj4gDmhdfR-OM9e2NyFTv-pqeVVD4W1xxUTD1RcTh0g")'}} />
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-gray-900 dark:text-white text-base font-bold">Dr. Mark Ross</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 uppercase">In-Person</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Hematologist</p>
                      <div className="flex items-center gap-1 mt-1 text-gray-500 dark:text-gray-400 text-xs font-medium">
                        <span className="material-symbols-outlined text-[14px]">meeting_room</span>
                        Room 302
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Busy Doctors */}
              <div className="flex flex-col gap-4">
                <h2 className="text-gray-900 dark:text-white text-lg font-bold flex items-center gap-2">
                  <span className="size-2 rounded-full bg-orange-400" />
                  Busy Doctors
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100 cursor-pointer">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 shrink-0 grayscale" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCmKZn89cHc9GTgvk50-SUjgjBJRaljZFDNZtjhLUZVGmJ-W7jxyefzEAPe5c-eLWje2I42QckN3bAu5DSX_i-jFKq1xgffkbxTXpkDNXioyjulP5_8sIXYvl1YvdE1QfCgeK_csNaOVVenkCqeDfBHWNxhNXtqPeuPxoEfQnXBLscAK33hIUtLFzTaRH9LuSZT_xk-hkWwjWanoe9Bz7-3MouGAq4Dy8iVkshy4GrpFegE_BY0vV7UTq4tb7RPxWYfOjZzU7Xm_A")'}} />
                    <div className="flex flex-col flex-1 gap-1">
                      <h3 className="text-gray-900 dark:text-white text-base font-bold">Dr. Sarah Lee</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Radiologist</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 uppercase">In Surgery</span>
                        <span className="text-[10px] text-gray-400">~45m left</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100 cursor-pointer">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 shrink-0 grayscale" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAsjxUnSY9ibAb1o15wuohiAukHKquH2bgmfDH3UUyC3qCuZv6SfI0qgy-jT6i32f4rNXqwOVfy9W_YOPgNE1vhI8S8WTCmK1kgTGGIIf_6BMvV1jp1uRDgvnkG9RKX1A6NzjWi8O1IMv26jqgL_L_u2JjXUDKqN2oZzH3D_2WkkIQXN5z401Urzi8lQl0szJaKJaaVQBVZLQ4PvuOv5JCt1URDjqLsAYzrgOYAaHz-q50ydgZoH9NL-pNuoMjtnm4vmk6wFuRGiQ")'}} />
                    <div className="flex flex-col flex-1 gap-1">
                      <h3 className="text-gray-900 dark:text-white text-base font-bold">Dr. James Wu</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Oncologist</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 uppercase">Consultation</span>
                        <span className="text-[10px] text-gray-400">~10m left</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </section>

            {/* Recent Patients Section */}
            <section className="flex flex-col gap-4 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-gray-700 mt-2">
                <nav className="flex gap-6 -mb-px">
                  <button className="pb-4 px-2 border-b-2 border-primary text-primary font-semibold text-sm flex items-center gap-2">
                    My Patients
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">{patients.length}</span>
                  </button>
                  <button className="pb-4 px-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium text-sm transition-all dark:text-gray-400 dark:hover:text-gray-200">
                    All Patients
                  </button>
                  <button className="pb-4 px-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium text-sm transition-all dark:text-gray-400 dark:hover:text-gray-200">
                    Completed
                  </button>
                </nav>
              </div>
              
              <div className="flex flex-col gap-4">
                {patients.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="size-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-slate-400 dark:text-gray-500">group</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No patients yet</h3>
                    <p className="text-slate-500 dark:text-gray-400 mb-4">Start by adding a new patient intake</p>
                    <Link href={`/nurse-portal/patients/${Date.now()}/new-visit`} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      New Patient Intake
                    </Link>
                  </div>
                ) : (
                  patients.map((patient) => {
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
                                Active
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