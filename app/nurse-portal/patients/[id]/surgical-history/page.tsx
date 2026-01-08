'use client'

import { useParams } from 'next/navigation'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { useState } from 'react'

export default function SurgicalHistoryPage() {
  const params = useParams()
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const surgeries: any[] = []

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
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Surgical History</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 font-semibold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-700 dark:hover:text-gray-300 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">block</span>
                  No Known Surgeries
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Procedure
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">medical_services</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Surgeries</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">0</span>
                  <span className="text-xs text-slate-400 font-medium">Lifetime Procedures</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">event</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Most Recent</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-gray-700 px-2 py-0.5 rounded">—</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-bold text-slate-900 dark:text-white truncate">Not recorded</span>
                  <span className="text-xs text-slate-500 dark:text-gray-400">No recent procedures</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">flag</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Risk Flags</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">High Visibility</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium border border-slate-200 dark:border-gray-600">
                    No risk flags recorded
                  </span>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Last Reviewed</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-lg font-bold text-blue-900 dark:text-blue-300">Not recorded</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-blue-700 dark:text-blue-400">
                  <span>by Not recorded</span>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Surgical Procedures Table */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col">
                  <div className="p-5 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">format_list_bulleted</span>
                      <h3 className="font-bold text-slate-900 dark:text-white">Surgical Procedures</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-2 top-1.5 text-slate-400 text-[18px]">search</span>
                        <input 
                          className="pl-8 pr-3 py-1 text-xs border border-slate-200 dark:border-gray-600 rounded-md focus:border-primary focus:ring-0 text-slate-700 dark:text-gray-300 dark:bg-gray-700 w-48" 
                          placeholder="Filter procedures..." 
                          type="text"
                        />
                      </div>
                      <select className="text-xs border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md text-slate-600 font-medium focus:ring-primary focus:border-primary py-1">
                        <option>Sort: Newest First</option>
                        <option>Sort: Oldest First</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-slate-50 dark:bg-gray-700 border-b border-slate-200 dark:border-gray-600 px-4 py-2 grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1fr_1fr_30px] gap-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      <div>Procedure</div>
                      <div>Site</div>
                      <div>Date</div>
                      <div>Surgeon / Facility</div>
                      <div>Outcome</div>
                      <div>Status</div>
                      <div></div>
                    </div>

                    {/* Table Rows */}
                    {surgeries.map((surgery, index) => (
                      <div key={surgery.id} className={`group border-b border-slate-100 dark:border-gray-700 ${index === 0 ? 'bg-blue-50/30 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-gray-700'} transition-colors`}>
                        <div 
                          className="px-4 py-3 grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1fr_1fr_30px] gap-4 cursor-pointer"
                          onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`${surgery.iconBg} p-1.5 rounded`}>
                              <span className="material-symbols-outlined text-[18px]">{surgery.icon}</span>
                            </div>
                            <div>
                              <span className="block text-sm font-bold text-slate-900 dark:text-white">{surgery.procedure}</span>
                              <span className="block text-[10px] text-slate-500 dark:text-gray-400">{surgery.code}</span>
                            </div>
                          </div>
                          <div className="text-sm text-slate-700 dark:text-gray-300 font-medium">{surgery.site}</div>
                          <div className="text-sm text-slate-700 dark:text-gray-300">{surgery.date}</div>
                          <div className="text-xs text-slate-500 dark:text-gray-400">
                            <span className="block font-medium text-slate-700 dark:text-gray-300">{surgery.surgeon}</span>
                            {surgery.facility}
                          </div>
                          <div>
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                              surgery.outcome === 'No Issues' 
                                ? 'text-green-700 bg-green-50 dark:bg-green-900/40 dark:text-green-300' 
                                : 'text-amber-700 bg-amber-50 dark:bg-amber-900/40 dark:text-amber-300'
                            }`}>
                              <span className="material-symbols-outlined text-[14px]">
                                {surgery.outcome === 'No Issues' ? 'check' : 'info'}
                              </span>
                              {surgery.outcome}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-600 dark:text-gray-400">{surgery.status}</span>
                          </div>
                          <div className="text-right">
                            <span className="material-symbols-outlined text-slate-400">
                              {expandedRow === index ? 'expand_less' : 'expand_more'}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedRow === index && surgery.indication && (
                          <div className="border-t border-slate-200/60 dark:border-gray-600 px-4 py-4 bg-white dark:bg-gray-800 mx-4 mb-4 mt-0 rounded-b-lg shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-3">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400">Indication</span>
                                  <p className="text-sm text-slate-800 dark:text-gray-200 font-medium">{surgery.indication}</p>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400">Approach</span>
                                  <p className="text-sm text-slate-800 dark:text-gray-200">{surgery.approach}</p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400">Implants Placed</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="material-symbols-outlined text-slate-400 text-sm">hardware</span>
                                    <span className="text-sm text-primary font-bold hover:underline cursor-pointer">{surgery.implants}</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400">Complications</span>
                                  <p className="text-sm text-slate-500 dark:text-gray-400 italic">{surgery.complications}</p>
                                </div>
                              </div>
                              <div className="bg-slate-50 dark:bg-gray-700 p-3 rounded border border-slate-100 dark:border-gray-600">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Post-Op Summary</span>
                                <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">{surgery.summary}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* External Records */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-500 text-[18px]">cloud_sync</span>
                      External & Patient-Reported Records
                    </h3>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-gray-700 text-xs text-slate-600 dark:text-gray-400 rounded font-medium">1 Unverified Record</span>
                  </div>
                  <div className="bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-amber-500">warning</span>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Tonsillectomy (Childhood)</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Source: Patient Intake Form (2010). No clinical documentation found.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 text-xs font-bold rounded shadow-sm hover:bg-slate-50 dark:hover:bg-gray-600">Dismiss</button>
                      <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded shadow-sm hover:bg-blue-600">Verify & Add</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Implants & Devices */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/20 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">pacemaker</span>
                      Implants & Devices
                    </h3>
                    <span className="material-symbols-outlined text-blue-300 text-lg">radiology</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex gap-3">
                      <div className="size-10 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-slate-500">accessibility</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Left Knee System</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Zimmer Biomet Persona</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-[10px] font-bold rounded">MRI Conditional</span>
                          <span className="text-[10px] text-slate-400">Placed: 2022</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-gray-700"></div>
                    <div className="flex gap-3">
                      <div className="size-10 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-slate-500">grid_4x4</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Surgical Mesh (Hernia)</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Historical - Detail Unknown</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex px-1.5 py-0.5 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 text-[10px] font-bold rounded">Standard</span>
                          <span className="text-[10px] text-slate-400">Placed: ~2010</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clinical Impact & Alerts */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                  <div className="p-4 border-b border-slate-100 dark:border-gray-700">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">psychology</span>
                      Clinical Impact & Alerts
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-red-500 text-sm">warning</span>
                        <span className="text-xs font-bold text-red-800 dark:text-red-300 uppercase">Pre-Op Alert</span>
                      </div>
                      <p className="text-xs text-red-700 dark:text-red-300 font-medium">History of Post-Op Hemorrhage (C-Section 2012).</p>
                      <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">Consider Coagulation Screen prior to future procedures.</p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-amber-500 text-sm">medication</span>
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">Anesthesia</span>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Moderate PONV (Nausea) reported.</p>
                    </div>
                  </div>
                </div>

                {/* Quick Chart Surgery */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                  <div className="p-4 border-b border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-700">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">edit_square</span>
                      Quick Chart Surgery
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Procedure Search</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-2 top-2 text-slate-400 text-sm">search</span>
                        <input 
                          className="w-full pl-8 py-1.5 text-sm border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded focus:border-primary focus:ring-primary placeholder:text-slate-300 dark:placeholder:text-gray-500" 
                          placeholder="e.g. Appendectomy" 
                          type="text"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Date / Year</label>
                        <input 
                          className="w-full py-1.5 text-sm border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded focus:border-primary focus:ring-primary" 
                          placeholder="YYYY" 
                          type="text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Laterality</label>
                        <select className="w-full py-1.5 text-sm border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded focus:border-primary focus:ring-primary text-slate-600">
                          <option>N/A</option>
                          <option>Left</option>
                          <option>Right</option>
                          <option>Bilateral</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Source</label>
                      <select className="w-full py-1.5 text-sm border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded focus:border-primary focus:ring-primary text-slate-600">
                        <option>Patient Reported</option>
                        <option>External Records</option>
                        <option>Clinician Confirmed</option>
                      </select>
                    </div>
                    <button className="w-full py-2 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-xs font-bold rounded border border-slate-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-600 hover:text-primary hover:border-primary transition-all mt-2">
                      Save Entry
                    </button>
                  </div>
                </div>

                {/* Surgical Timeline Notes */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col flex-1 min-h-[150px]">
                  <div className="p-3 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-500 text-[18px]">notes</span>
                      Surgical Timeline Notes
                    </h3>
                    <span className="text-[10px] text-slate-400">Last: Oct 24</span>
                  </div>
                  <div className="p-4 flex-1">
                    <textarea 
                      className="w-full h-full min-h-[80px] resize-none text-sm text-slate-700 dark:text-gray-300 border-0 focus:ring-0 p-0 bg-transparent placeholder-slate-300 dark:placeholder-gray-500 leading-relaxed" 
                      placeholder="Add surgical history context..."
                      defaultValue=""
                    />
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-gray-700 flex justify-end">
                    <button className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 text-xs font-bold rounded shadow hover:bg-slate-50 dark:hover:bg-gray-600 transition">Save Note</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
