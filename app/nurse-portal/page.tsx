'use client'

import Link from 'next/link'
import NurseSidebar from '@/components/NurseSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default function NursePortalPage() {
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
                    My Tasks
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">4</span>
                  </button>
                  <button className="pb-4 px-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium text-sm transition-all dark:text-gray-400 dark:hover:text-gray-200">
                    All Patients
                  </button>
                  <button className="pb-4 px-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium text-sm transition-all dark:text-gray-400 dark:hover:text-gray-200">
                    Completed
                  </button>
                </nav>
                <div className="flex items-center gap-6 py-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-500"></span>
                    <span className="text-xs font-medium text-slate-600 dark:text-gray-400">Avg Wait: <span className="text-slate-900 dark:text-white font-bold">12m</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary"></span>
                    <span className="text-xs font-medium text-slate-600 dark:text-gray-400">In Progress: <span className="text-slate-900 dark:text-white font-bold">5</span></span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <Link href="/nurse-portal/patients/7" className="group bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-1 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 block">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 gap-4 lg:gap-8">
                    <div className="flex items-center gap-4 min-w-[240px]">
                      <div className="size-12 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-100 dark:border-amber-800 shadow-sm">
                        MJ
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Johnson, Mary</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">cake</span>
                          03/15/1965 (59y)
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Visit Reason</span>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-gray-300">
                          <span className="material-symbols-outlined text-primary text-[18px]">cardiology</span>
                          BP Check
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Arrival</span>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-gray-400">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">schedule</span>
                          09:15 AM
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 min-w-[280px] justify-between lg:justify-end border-t lg:border-t-0 border-slate-100 dark:border-gray-700 pt-3 lg:pt-0 w-full lg:w-auto">
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                          <span className="material-symbols-outlined text-[18px] animate-pulse">timer</span>
                          <span className="text-sm font-bold">Waiting 18 min</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">Target: &lt;15 min</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800 uppercase tracking-wide shadow-sm">
                          <span className="size-1.5 rounded-full bg-amber-500"></span>
                          Waiting
                        </span>
                        <button className="size-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-gray-700/50 border-t border-slate-100 dark:border-gray-700 px-4 py-2 flex justify-end gap-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity h-0 group-hover:h-auto overflow-hidden">
                    <button className="text-xs font-medium text-slate-600 dark:text-gray-400 hover:text-primary px-3 py-1 hover:bg-white dark:hover:bg-gray-600 rounded border border-transparent hover:border-slate-200 dark:hover:border-gray-600 transition">View History</button>
                    <button className="text-xs font-medium text-white bg-primary hover:bg-blue-600 px-3 py-1 rounded shadow-sm transition">Call Patient</button>
                  </div>
                </Link>

                <Link href="/nurse-portal/patients/8" className="group bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-1 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 block">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 gap-4 lg:gap-8">
                    <div className="flex items-center gap-4 min-w-[240px]">
                      <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                        SR
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Smith, Robert</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">cake</span>
                          07/22/1978 (45y)
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Visit Reason</span>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-gray-300">
                          <span className="material-symbols-outlined text-primary text-[18px]">medical_services</span>
                          Screening
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Arrival</span>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-gray-400">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">schedule</span>
                          09:25 AM
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 min-w-[280px] justify-between lg:justify-end border-t lg:border-t-0 border-slate-100 dark:border-gray-700 pt-3 lg:pt-0 w-full lg:w-auto">
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                          <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                          <span className="text-sm font-bold">Wait: 8 min</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">Vitals Room 2</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800 uppercase tracking-wide shadow-sm">
                          <span className="size-1.5 rounded-full bg-blue-500"></span>
                          In Progress
                        </span>
                        <button className="size-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/nurse-portal/patients/9" className="group bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-1 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 block">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 gap-4 lg:gap-8">
                    <div className="flex items-center gap-4 min-w-[240px]">
                      <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-100 dark:border-purple-800 shadow-sm">
                        PD
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Davis, Patricia</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">cake</span>
                          11/03/1952 (71y)
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Visit Reason</span>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-gray-300">
                          <span className="material-symbols-outlined text-primary text-[18px]">assignment_turned_in</span>
                          Follow-up
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Arrival</span>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-gray-400">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">schedule</span>
                          09:30 AM
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 min-w-[280px] justify-between lg:justify-end border-t lg:border-t-0 border-slate-100 dark:border-gray-700 pt-3 lg:pt-0 w-full lg:w-auto">
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          <span className="text-sm font-medium">Waited 3 min</span>
                        </div>
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">On Schedule</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800 uppercase tracking-wide shadow-sm">
                          <span className="size-1.5 rounded-full bg-purple-500"></span>
                          With Provider
                        </span>
                        <button className="size-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/nurse-portal/patients/10" className="group bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-1 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 relative overflow-hidden block">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600"></div>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 gap-4 lg:gap-8 pl-5">
                    <div className="flex items-center gap-4 min-w-[240px]">
                      <div className="size-12 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 flex items-center justify-center font-bold text-lg border border-slate-200 dark:border-gray-600 shadow-sm">
                        WJ
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Wilson, James</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">cake</span>
                          05/18/1988 (36y)
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Visit Reason</span>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-gray-300">
                          <span className="material-symbols-outlined text-primary text-[18px]">biotech</span>
                          Lab Review
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Arrival</span>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-gray-400">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">schedule</span>
                          09:35 AM
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 min-w-[280px] justify-between lg:justify-end border-t lg:border-t-0 border-slate-100 dark:border-gray-700 pt-3 lg:pt-0 w-full lg:w-auto">
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                          <span className="material-symbols-outlined text-[18px]">new_releases</span>
                          <span className="text-sm font-bold">Just Now</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">Ready for Intake</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-gray-600 uppercase tracking-wide shadow-sm">
                          <span className="size-1.5 rounded-full bg-slate-400"></span>
                          Waiting
                        </span>
                        <button className="size-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-gray-700/50 border-t border-slate-100 dark:border-gray-700 px-4 py-2 flex justify-end gap-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity h-0 group-hover:h-auto overflow-hidden">
                    <button className="text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded shadow-sm transition flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">play_arrow</span> Start Intake
                    </button>
                  </div>
                </Link>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 dark:border-gray-700 gap-4">
                <p className="text-xs text-slate-500 dark:text-gray-400">Showing 1-4 of 24 active patients</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-xs font-semibold text-slate-400 dark:text-gray-500 hover:bg-slate-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors" disabled>
                    Previous
                  </button>
                  <button className="px-3 py-1.5 border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-primary transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}