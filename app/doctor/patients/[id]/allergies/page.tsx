'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { PatientDataManager } from '@/utils/PatientDataManager'

export default function PatientAllergiesPage() {
  const params = useParams()
  const patientId = params.id as string
  const patient = PatientDataManager.getPatient(patientId)
  const [newAllergy, setNewAllergy] = useState({
    name: '',
    severity: '',
    reactions: [] as string[],
    date: '',
    notes: ''
  })
  const [allergies, setAllergies] = useState<any[]>([])

  useEffect(() => {
    const savedAllergies = PatientDataManager.getPatientSectionList(patientId, 'allergies')
    setAllergies(savedAllergies)
  }, [patientId])

  const handleAddAllergy = () => {
    if (newAllergy.name && newAllergy.severity) {
      const allergy = {
        id: Date.now(),
        name: newAllergy.name,
        type: 'Unknown',
        severity: newAllergy.severity,
        reactions: newAllergy.reactions.join(', '),
        status: 'Active'
      }
      const nextAllergies = [...allergies, allergy]
      setAllergies(nextAllergies)
      PatientDataManager.savePatientSectionList(patientId, 'allergies', nextAllergies)
      setNewAllergy({ name: '', severity: '', reactions: [], date: '', notes: '' })
    }
  }

  const handleReactionChange = (reaction: string, checked: boolean) => {
    if (checked) {
      setNewAllergy({ ...newAllergy, reactions: [...newAllergy.reactions, reaction] })
    } else {
      setNewAllergy({ ...newAllergy, reactions: newAllergy.reactions.filter(r => r !== reaction) })
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <PatientDetailSidebar patientId={params.id as string} />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">Patients</span>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm">chevron_right</span>
                  <span className="text-primary text-sm font-medium">{patient?.name || 'Patient'}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Allergy Management</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  Print Card
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">add_alert</span>
                  Add Allergy
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <span className="material-symbols-outlined text-9xl text-gray-900 dark:text-white">medical_services</span>
                </div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Patient Allergy Status</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Summary of patient's known sensitivities</p>
                    </div>
                    <div className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold border border-green-100 dark:border-green-800 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">verified_user</span>
                      Up to Date
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 flex-1 w-full">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{allergies.length}</div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Allergies Recorded</div>
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex gap-3 items-start p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 mt-0.5">warning</span>
                        <div>
                          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">Important Warning</h4>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                            Always inform new doctors, dentists, and pharmacists about these allergies before starting any new medication.
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        Last reviewed not recorded
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900 p-6 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm flex flex-col justify-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-primary">
                    <span className="material-symbols-outlined">lock_person</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Secure & Private</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  This information is used solely to keep the patient safe during treatment. Only the dedicated care team can approve changes to the official medical record.
                </p>
                <div className="mt-auto pt-4 border-t border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-sm text-green-600">check_circle</span>
                    <span>HIPAA Compliant</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Patient Allergies</h3>
                    <div className="flex gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Severe
                      </span>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Moderate
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {allergies.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">medical_services</span>
                        <p>No allergies recorded</p>
                      </div>
                    ) : (
                      allergies.map((allergy) => (
                        <div key={allergy.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-full text-red-600 dark:text-red-400 shrink-0">
                              <span className="material-symbols-outlined">nutrition</span>
                            </div>
                            <div className="flex-1 w-full">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-base font-bold text-gray-900 dark:text-white">{allergy.name}</h4>
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded tracking-wide ${
                                  allergy.severity === 'Severe' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                  allergy.severity === 'Moderate' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                  'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}>{allergy.severity}</span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 mt-2">
                                <div>
                                  <span className="text-xs text-gray-400 dark:text-gray-500 block mb-0.5">Type</span>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{allergy.type}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-400 dark:text-gray-500 block mb-0.5">Reaction</span>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{allergy.reactions}</span>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                  <span className="text-xs text-gray-400 dark:text-gray-500 block mb-0.5">Status</span>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm text-green-600">check</span> {allergy.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[18px]">pending</span>
                      Pending Review
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start gap-4 p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50">
                      <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined">science</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">No pending reviews</h4>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">New allergy submissions will appear here.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 p-5 flex flex-col md:flex-row gap-5 items-start">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-full text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-2xl">health_and_safety</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Patient Safety Tips</h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex gap-2 items-start">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px] mt-0.5">check_circle</span>
                        <span>Always check food labels for "processed in a facility with nuts" warnings.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px] mt-0.5">check_circle</span>
                        <span>Keep your Epinephrine auto-injector accessible at all times for severe reactions.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px] mt-0.5">check_circle</span>
                        <span>Seek medical help immediately if you have trouble breathing or swelling of the throat.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg shadow-blue-900/5 overflow-hidden ring-1 ring-gray-900/5 dark:ring-gray-100/5">
                  <div className="bg-primary/5 dark:bg-primary/10 p-4 border-b border-primary/10 dark:border-primary/20">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">add_circle</span>
                      Add New Allergy
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Document a new patient sensitivity.</p>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Allergen Name</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 material-symbols-outlined text-sm">search</span>
                        <input 
                          value={newAllergy.name}
                          onChange={(e) => setNewAllergy({...newAllergy, name: e.target.value})}
                          className="w-full pl-9 rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary transition-shadow text-gray-900 dark:text-white" 
                          placeholder="Search (e.g., Shellfish, Aspirin)..." 
                          type="text"
                        />
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button className="text-[10px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400 transition">Codeine</button>
                        <button className="text-[10px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400 transition">Latex</button>
                        <button className="text-[10px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400 transition">Eggs</button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">How bad is it?</label>
                      <div className="grid grid-cols-3 gap-2">
                        <label className="cursor-pointer">
                          <input 
                            className="peer sr-only" 
                            name="severity" 
                            type="radio"
                            checked={newAllergy.severity === 'Mild'}
                            onChange={() => setNewAllergy({...newAllergy, severity: 'Mild'})}
                          />
                          <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-2 text-center hover:bg-gray-50 dark:hover:bg-gray-800 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/30 peer-checked:border-green-200 dark:peer-checked:border-green-800 peer-checked:text-green-700 dark:peer-checked:text-green-300 transition-all">
                            <div className="text-xs font-bold">Mild</div>
                          </div>
                        </label>
                        <label className="cursor-pointer">
                          <input 
                            className="peer sr-only" 
                            name="severity" 
                            type="radio"
                            checked={newAllergy.severity === 'Moderate'}
                            onChange={() => setNewAllergy({...newAllergy, severity: 'Moderate'})}
                          />
                          <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-2 text-center hover:bg-gray-50 dark:hover:bg-gray-800 peer-checked:bg-amber-50 dark:peer-checked:bg-amber-900/30 peer-checked:border-amber-200 dark:peer-checked:border-amber-800 peer-checked:text-amber-700 dark:peer-checked:text-amber-300 transition-all">
                            <div className="text-xs font-bold">Moderate</div>
                          </div>
                        </label>
                        <label className="cursor-pointer">
                          <input 
                            className="peer sr-only" 
                            name="severity" 
                            type="radio"
                            checked={newAllergy.severity === 'Severe'}
                            onChange={() => setNewAllergy({...newAllergy, severity: 'Severe'})}
                          />
                          <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-2 text-center hover:bg-gray-50 dark:hover:bg-gray-800 peer-checked:bg-red-50 dark:peer-checked:bg-red-900/30 peer-checked:border-red-200 dark:peer-checked:border-red-800 peer-checked:text-red-700 dark:peer-checked:text-red-300 transition-all">
                            <div className="text-xs font-bold">Severe</div>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">What happens?</label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" 
                            type="checkbox"
                            checked={newAllergy.reactions.includes('Skin Rash / Hives')}
                            onChange={(e) => handleReactionChange('Skin Rash / Hives', e.target.checked)}
                          />
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Skin Rash / Hives</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" 
                            type="checkbox"
                            checked={newAllergy.reactions.includes('Swelling')}
                            onChange={(e) => handleReactionChange('Swelling', e.target.checked)}
                          />
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Swelling</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" 
                            type="checkbox"
                            checked={newAllergy.reactions.includes('Trouble Breathing')}
                            onChange={(e) => handleReactionChange('Trouble Breathing', e.target.checked)}
                          />
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Trouble Breathing</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" 
                            type="checkbox"
                            checked={newAllergy.reactions.includes('Nausea / Vomiting')}
                            onChange={(e) => handleReactionChange('Nausea / Vomiting', e.target.checked)}
                          />
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Nausea / Vomiting</span>
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">When did this happen?</label>
                        <input 
                          value={newAllergy.date}
                          onChange={(e) => setNewAllergy({...newAllergy, date: e.target.value})}
                          className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary text-gray-600 dark:text-gray-400" 
                          type="date"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Additional Notes</label>
                        <textarea 
                          value={newAllergy.notes}
                          onChange={(e) => setNewAllergy({...newAllergy, notes: e.target.value})}
                          className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary resize-none text-gray-900 dark:text-white" 
                          placeholder="e.g. Happened when I was a child..." 
                          rows={2}
                        ></textarea>
                      </div>
                    </div>
                    <div className="mt-2 bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                      <p className="text-[11px] text-blue-800 dark:text-blue-300 flex gap-2">
                        <span className="material-symbols-outlined text-[16px] shrink-0">info</span>
                        This will be added to the patient's official medical record immediately.
                      </p>
                    </div>
                    <button 
                      onClick={handleAddAllergy}
                      className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                      Add to Medical Record
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">History & Changes</h3>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Last 6 months</span>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    <div className="p-4 flex gap-3">
                      <div className="text-gray-300 dark:text-gray-600">
                        <span className="material-symbols-outlined text-sm">history</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-semibold text-gray-900 dark:text-white">Strawberries</span> allergy removed.
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">Jan 10, 2024</span>
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">Dr. Smith</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex gap-3">
                      <div className="text-gray-300 dark:text-gray-600">
                        <span className="material-symbols-outlined text-sm">history</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-semibold text-gray-900 dark:text-white">Peanuts</span> severity updated to <span className="text-red-600 dark:text-red-400 font-medium">Severe</span>.
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">Dec 15, 2023</span>
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">Clinic</span>
                        </div>
                      </div>
                    </div>
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
