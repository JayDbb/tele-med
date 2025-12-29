'use client'

import { useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default function PatientFamilyHistoryPage() {
  const params = useParams()

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <PatientDetailSidebar patientId={params.id as string} />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-primary text-sm font-medium hover:underline">
              <span className="material-symbols-outlined text-lg">lightbulb</span>
              Tips
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>
            <a className="text-sm font-medium text-gray-500 hover:text-primary dark:text-gray-400 transition-colors" href="#">Privacy Policy</a>
          </div>
        </header>

        <div className="flex-1 w-full max-w-[1280px] mx-auto p-6 lg:p-8 overflow-hidden">
          <div className="flex flex-col gap-1 mb-6">
            <h1 className="text-2xl font-black leading-tight tracking-[-0.033em] text-gray-900 dark:text-white">Family Health History</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">Help us care for you better by understanding your background.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            <div className="lg:col-span-7 flex flex-col gap-6 h-full overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 flex flex-col justify-center rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2 text-primary shrink-0">
                      <span className="material-symbols-outlined text-2xl">diversity_3</span>
                    </div>
                    <div>
                      <h2 className="text-base font-bold leading-tight mb-1">Why this matters</h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                        Some conditions run in families. Sharing this helps your doctor identify risks early.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Status</h3>
                      <p className="text-sm font-semibold">2 Added</p>
                    </div>
                  </div>
                  <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-xl">calendar_month</span>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Updated</h3>
                      <p className="text-sm font-semibold">Oct 24, '23</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 flex-1 min-h-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold leading-tight">Family Members</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-2">
                  <div className="flex flex-col gap-3 rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors group">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-primary text-lg font-bold">M</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Mother</h3>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800">
                              Verified
                            </span>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Living, Age 65</p>
                        </div>
                      </div>
                      <button className="text-gray-500 opacity-0 group-hover:opacity-100 hover:text-primary transition-all">
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 dark:bg-red-900/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/30">
                          Hypertension (Age 50)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors group">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 text-lg font-bold">F</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Father</h3>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                              Patient-Reported
                            </span>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Deceased, Age 72</p>
                        </div>
                      </div>
                      <button className="text-gray-500 opacity-0 group-hover:opacity-100 hover:text-primary transition-all">
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 dark:bg-orange-900/20 px-2 py-1 text-xs font-medium text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-900/30">
                          Heart Disease
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                          Diabetes Type 2
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-transparent bg-primary/5 dark:bg-gray-800/50 p-4 mt-auto">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-lg">history</span>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Updates</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-green-500 shrink-0"></div>
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">Mother's record verified</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Dr. Smith • Oct 24, 2023</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-gray-300 shrink-0"></div>
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">Removed duplicate entry "Grandfather"</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">You • Sept 12, 2023</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col h-full gap-4">
              <div className="flex-1 flex flex-col rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-700">
                  <div className="h-full w-1/3 bg-primary"></div>
                </div>
                <div className="p-6 flex flex-col h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold leading-tight">Add Family Member</h2>
                    <span className="rounded-full bg-blue-100 dark:bg-blue-900 text-primary dark:text-blue-300 px-2.5 py-1 text-xs font-bold">Step 1 of 3</span>
                  </div>
                  <div className="flex flex-col gap-6 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Relationship</label>
                        <div className="relative">
                          <select className="w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-2.5 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-900 dark:text-white">
                            <option>Select...</option>
                            <option>Sibling</option>
                            <option>Child</option>
                            <option>Grandparent</option>
                            <option>Aunt/Uncle</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-gray-500 text-lg pointer-events-none">expand_more</span>
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Status</label>
                        <div className="flex gap-2 h-full">
                          <label className="flex-1 cursor-pointer flex items-center justify-center rounded-lg border border-primary bg-primary/5 text-primary text-sm font-medium transition-all hover:bg-primary/10">
                            <input className="hidden" name="status" type="radio" defaultChecked/>
                            Living
                          </label>
                          <label className="flex-1 cursor-pointer flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-700">
                            <input className="hidden" name="status" type="radio"/>
                            Deceased
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                      <label className="text-xs font-bold uppercase tracking-wide text-gray-500 flex justify-between items-center">
                        Known Conditions
                        <span className="normal-case font-normal text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">Select matches</span>
                      </label>
                      <div className="flex flex-wrap gap-2 content-start">
                        <button className="rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary hover:text-primary transition-all">
                          High Blood Pressure
                        </button>
                        <button className="rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary hover:text-primary transition-all">
                          Diabetes
                        </button>
                        <button className="rounded-full border border-primary bg-primary text-white px-3 py-1.5 text-xs font-medium shadow-sm transition-all flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check</span> Heart Disease
                        </button>
                        <button className="rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary hover:text-primary transition-all">
                          Stroke
                        </button>
                        <button className="rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary hover:text-primary transition-all">
                          Cancer
                        </button>
                        <button className="rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary hover:text-primary transition-all">
                          Asthma
                        </button>
                        <button className="rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary hover:text-primary transition-all">
                          Mental Health
                        </button>
                      </div>
                      <div className="relative mt-2">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-500 text-lg">search</span>
                        <input className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 pl-10 p-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-900 dark:text-white" placeholder="Search other conditions..." type="text"/>
                      </div>
                      <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                        <input className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" id="unsure" type="checkbox"/>
                        <label className="text-xs text-gray-500 dark:text-gray-400 leading-snug" htmlFor="unsure">
                          It's okay if you don't know everything. Check here if you are unsure about specific details.
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-5 mt-4 border-t border-gray-100 dark:border-gray-700">
                    <button className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white px-2">Cancel</button>
                    <div className="flex gap-3">
                      <button className="rounded-lg bg-gray-100 dark:bg-gray-700 px-5 py-2 text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Back</button>
                      <button className="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1">
                        Next: Details
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 text-center py-2">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <p className="text-xs">Private & Secure. You choose what to share.</p>
                </div>
                <a className="text-xs font-semibold text-primary hover:underline" href="#">Skip for now</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}