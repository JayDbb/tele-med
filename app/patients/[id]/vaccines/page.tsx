'use client'

import { useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default function PatientVaccinesPage() {
  const params = useParams()

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
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
                  <span className="text-primary text-sm font-medium">Not recorded (DOB: Not provided)</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Immunization Management</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  Print Record
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Import History
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Status</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Action Needed</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Partially Up to Date</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                  <span>2 Recommended Today</span>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Contraindication</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-lg font-bold text-red-700 dark:text-red-300 leading-tight">Egg Allergy</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
                  <span>Use Egg-Free Flu Vax</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
                  </div>
                  <span className="size-2 rounded-full bg-red-500 animate-pulse"></span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Tdap</span>
                </div>
                <div className="flex items-center gap-1 text-red-500 dark:text-red-400 text-[11px] font-medium">
                  <span>Due since Feb 2024</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">event</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Next Due</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Influenza</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-primary font-medium">
                  <span>Seasonal (Oct 1)</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">history</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Last Vax</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">COVID-19</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                  <span>Nov 12, 2023</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Docs</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-sm">open_in_new</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Certificate</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                  <span>Generate PDF</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 relative">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm text-primary shrink-0">
                    <span className="material-symbols-outlined text-xl">medical_information</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Decision Support: Recommended Today</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      Based on age (39y) and risk factors, <strong>Tdap Booster</strong> and <strong>Influenza (Egg-free)</strong> are recommended. Patient has no record of Hep B series; consider screening.
                    </p>
                  </div>
                  <button className="ml-auto text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col min-h-[400px]">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">Vaccine Schedule</h3>
                      <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">Adult Guidelines (19+)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-gray-400"><span className="size-2 rounded-full bg-green-500"></span>Given</span>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-gray-400"><span className="size-2 rounded-full bg-amber-500"></span>Due</span>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-gray-400"><span className="size-2 rounded-full bg-red-500"></span>Overdue</span>
                    </div>
                  </div>
                  <div className="p-0">
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                      <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3 w-1/3">
                          <span className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg material-symbols-outlined text-sm">coronavirus</span>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">COVID-19</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Annual Updated Formula</p>
                          </div>
                        </div>
                        <div className="flex-1 px-4">
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                          </div>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">Last: Nov 2023</p>
                        </div>
                        <div className="w-24 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">Up to date</span>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l-4 border-l-amber-400 bg-amber-50/10 dark:bg-amber-900/10">
                        <div className="flex items-center gap-3 w-1/3">
                          <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg material-symbols-outlined text-sm">ac_unit</span>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Influenza</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Seasonal</p>
                          </div>
                        </div>
                        <div className="flex-1 px-4">
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 relative">
                            <div className="absolute -top-1 right-0 text-amber-500 material-symbols-outlined text-sm bg-white dark:bg-gray-800 rounded-full shadow-sm">warning</div>
                          </div>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-semibold text-right">Due Now</p>
                        </div>
                        <div className="w-24 text-right">
                          <button className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50">Administer</button>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l-4 border-l-red-400 bg-red-50/10 dark:bg-red-900/10">
                        <div className="flex items-center gap-3 w-1/3">
                          <span className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg material-symbols-outlined text-sm">vaccines</span>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Tdap / Td</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Every 10 years</p>
                          </div>
                        </div>
                        <div className="flex-1 px-4">
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2"></div>
                          <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold text-right">Overdue (+4mo)</p>
                        </div>
                        <div className="w-24 text-right">
                          <button className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50">Administer</button>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3 w-1/3">
                          <span className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg material-symbols-outlined text-sm">bloodtype</span>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Hepatitis B</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">3-dose series</p>
                          </div>
                        </div>
                        <div className="flex-1 px-4">
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full" style={{width: '0%'}}></div>
                          </div>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">No Record</p>
                        </div>
                        <div className="w-24 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700">Missing</span>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3 w-1/3">
                          <span className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg material-symbols-outlined text-sm">child_care</span>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">MMR</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Measles, Mumps, Rubella</p>
                          </div>
                        </div>
                        <div className="flex-1 px-4">
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                          </div>
                        </div>
                        <div className="w-24 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl shadow-blue-900/5 overflow-hidden flex flex-col h-full ring-1 ring-gray-900/5 dark:ring-gray-100/5">
                  <div className="bg-primary p-4 text-white">
                    <h3 className="font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined">syringe</span>
                      Administer Vaccine
                    </h3>
                    <p className="text-xs text-blue-100 mt-1">Record a new administration now</p>
                  </div>
                  <div className="p-5 flex flex-col gap-5 flex-1 bg-white dark:bg-gray-900">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Vaccine</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 text-[18px]">search</span>
                        <input className="w-full pl-9 rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary py-2.5 font-medium text-gray-900 dark:text-white" placeholder="Search vaccine (e.g. Tdap)" type="text"/>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button className="px-2 py-1 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/50 transition">Tdap</button>
                        <button className="px-2 py-1 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition">Flu (Egg-Free)</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Date</label>
                        <input className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary py-2 text-gray-900 dark:text-white" type="date"/>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Dose #</label>
                        <select className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary py-2 text-gray-900 dark:text-white">
                          <option>Booster</option>
                          <option>Dose 1</option>
                          <option>Dose 2</option>
                          <option>Dose 3</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Site</label>
                        <select className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary py-2 text-gray-900 dark:text-white">
                          <option>Left Deltoid</option>
                          <option>Right Deltoid</option>
                          <option>Left Vastus Lateralis</option>
                          <option>Right Vastus Lateralis</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Route</label>
                        <select className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary py-2 text-gray-900 dark:text-white">
                          <option>Intramuscular (IM)</option>
                          <option>Subcutaneous (SC)</option>
                          <option>Intranasal</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex justify-between">
                        Lot Number
                        <span className="text-primary cursor-pointer flex items-center gap-1 text-[10px] font-normal"><span className="material-symbols-outlined text-[12px]">qr_code_scanner</span> Scan</span>
                      </label>
                      <input className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary py-2 text-gray-900 dark:text-white" placeholder="Lot #" type="text"/>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Manufacturer</label>
                      <select className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary py-2 text-gray-900 dark:text-white">
                        <option disabled selected>Select Manufacturer</option>
                        <option>GSK</option>
                        <option>Sanofi Pasteur</option>
                        <option>Merck</option>
                        <option>Pfizer</option>
                        <option>Moderna</option>
                      </select>
                    </div>
                    <div className="mt-auto pt-4">
                      <button className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">save</span>
                        Save & Update Schedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">Immunization History</h3>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">All (24)</span>
                    <span className="px-2 py-1 rounded text-xs font-medium text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">Refusals (0)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2 top-1.5 text-gray-400 dark:text-gray-500 text-lg">filter_list</span>
                    <select className="pl-8 pr-8 py-1.5 rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400 focus:ring-0 focus:border-gray-300 dark:focus:border-gray-500">
                      <option>Filter by Vaccine</option>
                      <option>Filter by Date</option>
                    </select>
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium">
                    <span className="material-symbols-outlined text-sm">download</span> Export PDF
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                      <th className="px-6 py-3">Vaccine Name</th>
                      <th className="px-6 py-3">Date Given</th>
                      <th className="px-6 py-3">Dose #</th>
                      <th className="px-6 py-3">Site / Route</th>
                      <th className="px-6 py-3">Lot # / Mfr</th>
                      <th className="px-6 py-3">Source</th>
                      <th className="px-6 py-3">Given By</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm text-gray-700 dark:text-gray-300">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900 dark:text-white">COVID-19 (Pfizer)</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">Comirnaty 2023-2024 Formula</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 dark:text-white">Nov 12, 2023</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Booster</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900 dark:text-white">Left Deltoid</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">Intramuscular (IM)</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-xs text-gray-600 dark:text-gray-400">GH12345</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">Pfizer</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-primary">medical_services</span>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">MedCore Clinic</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 text-primary rounded-full size-6 flex items-center justify-center text-[10px] font-bold">JD</div>
                          <span className="text-xs font-medium">Not recorded</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-gray-400 dark:text-gray-500 hover:text-primary transition p-1">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Showing 3 of 24 records</span>
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
