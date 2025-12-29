'use client'

import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default function PatientVitalsPage() {
  const params = useParams()
  const router = useRouter()

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <PatientDetailSidebar patientId={params.id as string} />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">Patients</span>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm">chevron_right</span>
                  <span className="text-primary text-sm font-medium">Sarah Jenkins</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Vitals Management</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Export Report
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Vitals
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">BP</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Normal</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">120/80</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">mmHg</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                  <span className="material-symbols-outlined text-[12px]">airline_seat_recline_normal</span>
                  <span>Sitting (Left Arm)</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">ecg_heart</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">HR</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Elevated</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">92</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">bpm</span>
                </div>
                <div className="flex items-center gap-1 text-red-500 dark:text-red-400 text-[11px] font-medium">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  <span>+12 vs last visit</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">pulmonology</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Resp</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Normal</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">16</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">rpm</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                  <span>Regular rhythm</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">spo2</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">SpO₂</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Normal</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">98</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">%</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                  <span>Room Air</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">thermometer</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Temp</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Normal</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">36.6</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">°C</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                  <span>Oral</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">monitor_weight</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">BMI</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Normal</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">24.2</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">kg/m²</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                  <span>72kg • 172cm</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm text-primary shrink-0">
                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Clinical Insight Detected</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      Patient's systolic BP has shown a consistent upward trend (+5 mmHg avg) over the last 3 visits. Consider evaluating for white coat hypertension or medication adjustment.
                      <a className="text-primary font-semibold hover:underline ml-1" href="#">View Analysis</a>
                    </p>
                  </div>
                  <button className="ml-auto text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-[400px]">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">Blood Pressure Trends</h3>
                      <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">Systolic & Diastolic</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex items-center">
                      <button className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md">Today</button>
                      <button className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md">7D</button>
                      <button className="px-3 py-1 text-xs font-semibold bg-white dark:bg-gray-700 text-primary shadow-sm rounded-md">30D</button>
                      <button className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md">6M</button>
                    </div>
                  </div>
                  <div className="flex-1 p-6 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <span className="material-symbols-outlined text-4xl mb-2 block">show_chart</span>
                      <p className="text-sm">Chart visualization would be rendered here</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Fast Record</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Enter current vitals quickly</p>
                  </div>
                  <div className="p-4 flex flex-col gap-4 flex-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Systolic</label>
                        <input className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary text-gray-900 dark:text-white" placeholder="120" type="number"/>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Diastolic</label>
                        <input className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary text-gray-900 dark:text-white" placeholder="80" type="number"/>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Heart Rate</label>
                        <div className="relative">
                          <input className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary pr-8 text-gray-900 dark:text-white" placeholder="72" type="number"/>
                          <span className="absolute right-2 top-2 text-[10px] text-gray-400 dark:text-gray-500">bpm</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">SpO₂</label>
                        <div className="relative">
                          <input className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary pr-6 text-gray-900 dark:text-white" placeholder="98" type="number"/>
                          <span className="absolute right-2 top-2 text-[10px] text-gray-400 dark:text-gray-500">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Quick Note</label>
                      <textarea className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary resize-none text-gray-900 dark:text-white" placeholder="e.g. Patient anxious..." rows={2}></textarea>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400 transition">Post-exercise</button>
                      <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400 transition">Sitting</button>
                      <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400 transition">Lying</button>
                    </div>
                    <div className="mt-auto pt-4">
                      <button className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">save</span>
                        Save Vitals
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Detailed History</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2 top-1.5 text-gray-400 dark:text-gray-500 text-lg">filter_list</span>
                    <select className="pl-8 pr-8 py-1.5 rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400 focus:ring-0 focus:border-gray-300 dark:focus:border-gray-500">
                      <option>All Vitals</option>
                      <option>Abnormal Only</option>
                      <option>Clinician Only</option>
                    </select>
                  </div>
                  <button className="p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="material-symbols-outlined text-lg">print</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                      <th className="px-6 py-3">Date & Time</th>
                      <th className="px-6 py-3">BP (mmHg)</th>
                      <th className="px-6 py-3">HR (bpm)</th>
                      <th className="px-6 py-3">RR (rpm)</th>
                      <th className="px-6 py-3">Temp (°C)</th>
                      <th className="px-6 py-3">SpO₂ (%)</th>
                      <th className="px-6 py-3">Source</th>
                      <th className="px-6 py-3">Recorded By</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm text-gray-700 dark:text-gray-300">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">May 12, 2024</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">09:42 AM</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900 dark:text-white">120/80</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 block">Sitting, L-Arm</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-amber-600 dark:text-amber-400">92</span>
                          <span className="size-2 rounded-full bg-amber-500"></span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">16</td>
                      <td className="px-6 py-4 whitespace-nowrap">36.6</td>
                      <td className="px-6 py-4 whitespace-nowrap">98</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 w-fit">
                          <span className="material-symbols-outlined text-sm text-gray-500 dark:text-gray-400">medical_services</span>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Clinical</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 text-primary rounded-full size-6 flex items-center justify-center text-[10px] font-bold">JD</div>
                          <span className="text-xs font-medium">Dr. J. Doe</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-gray-400 dark:text-gray-500 hover:text-primary transition">
                          <span className="material-symbols-outlined text-[18px]">edit_note</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Showing 3 of 124 records</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 disabled:opacity-50">Previous</button>
                  <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}