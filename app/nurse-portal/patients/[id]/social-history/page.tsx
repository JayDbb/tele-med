'use client'

import { useParams } from 'next/navigation'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default function PatientSocialHistoryPage() {
  const params = useParams()

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
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
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Social History</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  View Trends
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  Update History
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">flag</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Risk Flags</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">3 Active</span>
                </div>
                <div className="flex flex-col gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-red-500"></span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Tobacco Use</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-500"></span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">High Stress</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">smoking_rooms</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Tobacco</span>
                  </div>
                  <span className="material-symbols-outlined text-red-500 text-sm">warning</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Current</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                  <span>10 cigs / day</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">local_bar</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Alcohol</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Social</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                  <span>2-3 drinks / week</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Housing</span>
                  </div>
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Stable</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                  <span>Lives w/ spouse</span>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Confidence</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-lg font-bold text-blue-900 dark:text-blue-300">High</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-blue-700 dark:text-blue-300">
                  <span>Verified Oct 24 by Dr. Doe</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                  <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">science</span>
                      <h3 className="font-bold text-gray-900 dark:text-white">Substance Use</h3>
                    </div>
                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Clinician Verified</span>
                  </div>
                  <div className="p-6 grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Tobacco / Nicotine</h4>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">Current User</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm border-b border-gray-50 dark:border-gray-800 pb-1">
                          <span className="text-gray-500 dark:text-gray-400">Type</span>
                          <span className="font-medium text-gray-900 dark:text-white">Cigarettes</span>
                        </div>
                        <div className="flex justify-between text-sm border-b border-gray-50 dark:border-gray-800 pb-1">
                          <span className="text-gray-500 dark:text-gray-400">Amount</span>
                          <span className="font-medium text-gray-900 dark:text-white">0.5 Pack / Day</span>
                        </div>
                        <div className="flex justify-between text-sm border-b border-gray-50 dark:border-gray-800 pb-1">
                          <span className="text-gray-500 dark:text-gray-400">Duration</span>
                          <span className="font-medium text-gray-900 dark:text-white">15 Years</span>
                        </div>
                        <div className="flex justify-between text-sm pb-1">
                          <span className="text-gray-500 dark:text-gray-400">Pack Years</span>
                          <span className="font-medium text-gray-900 dark:text-white">7.5</span>
                        </div>
                      </div>
                      <div className="mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs text-gray-600 dark:text-gray-400 italic">
                        <span className="font-semibold not-italic">Note:</span> Patient not ready to quit. Discussed reduced usage.
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Alcohol</h4>
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Low Risk</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Frequency</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">2-3x / Month</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">AUDIT-C Score</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">2 (Negative)</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Other Substances</h4>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-start gap-3">
                          <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm mt-0.5">cannabis</span>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Marijuana</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Occasional</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Edibles only for sleep aid. Last use: 2 weeks ago.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">work_history</span>
                        Living & Occupation
                      </h3>
                    </div>
                    <div className="p-4 flex flex-col gap-4 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-primary">
                          <span className="material-symbols-outlined text-lg">engineering</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Occupation</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Logistics Manager</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Shift work (rotating). Occasional heavy lifting. High noise exposure reported.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 pt-4 border-t border-gray-50 dark:border-gray-800">
                        <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                          <span className="material-symbols-outlined text-lg">house</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Living Situation</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Apartment (Stable)</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Spouse + 1 Child</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">No Guns</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Smoke Detectors ✅</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">directions_run</span>
                        Lifestyle Factors
                      </h3>
                    </div>
                    <div className="p-4 space-y-4 flex-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Activity Level</p>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-amber-500 text-sm">chair</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Sedentary</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Diet Quality</p>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm">fastfood</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Fair / Poor</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Exercise Habits</p>
                        <p className="text-sm text-gray-900 dark:text-white">Gym 1x/week. Walks dog occasionally.</p>
                      </div>
                      <div className="pt-2 border-t border-gray-50 dark:border-gray-800 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sleep</p>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">6h (Broken)</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stress</p>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">High</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">diversity_3</span>
                    Psychosocial & Support
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Social Support</p>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400">group</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Strong</span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Reliable family nearby.</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Financial Strain</p>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">attach_money</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Stable</span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Employment secure.</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Transportation</p>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400">directions_car</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Accessible</span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Owns personal vehicle.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[18px]">assignment</span>
                      Screening Tools
                    </h3>
                    <button className="text-primary text-xs font-bold hover:underline">History</button>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="p-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">PHQ-9</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Depression • Oct 24</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-sm font-bold text-amber-600 dark:text-amber-400">8</span>
                        <span className="block text-[10px] text-amber-700 dark:text-amber-300 font-medium">Mild</span>
                      </div>
                    </div>
                    <div className="p-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">GAD-7</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Anxiety • Oct 24</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-sm font-bold text-red-600 dark:text-red-400">12</span>
                        <span className="block text-[10px] text-red-700 dark:text-red-300 font-medium">Moderate</span>
                      </div>
                    </div>
                    <div className="p-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">AUDIT-C</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Alcohol • Jan 12</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-sm font-bold text-green-600 dark:text-green-400">2</span>
                        <span className="block text-[10px] text-green-700 dark:text-green-300 font-medium">Low Risk</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <button className="w-full text-center text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors py-1">
                      + Add New Screening
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-pink-100 dark:border-pink-800 shadow-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-sm">visibility_off</span>
                  </div>
                  <div className="bg-pink-50/30 dark:bg-pink-900/20 p-3 border-b border-pink-100 dark:border-pink-800">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-pink-400 text-[18px]">favorite</span>
                      Sexual Health
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Confidential • Provider View Only</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Status</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Partners</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Male (1 steady)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Contraception</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">IUD (Mirena)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">STI History</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Negative</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col flex-1 min-h-[200px]">
                  <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[18px]">notes</span>
                      Clinician Notes
                    </h3>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Last: Oct 24</span>
                  </div>
                  <div className="p-4 flex-1">
                    <textarea className="w-full h-full min-h-[120px] resize-none text-sm text-gray-700 dark:text-gray-300 border-0 focus:ring-0 p-0 bg-transparent placeholder-gray-300 dark:placeholder-gray-600 leading-relaxed" placeholder="Add social history notes here..."></textarea>
                  </div>
                  <div className="p-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded shadow hover:bg-blue-600 transition">Save Note</button>
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
