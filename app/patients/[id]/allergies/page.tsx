'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { getAllergies, createAllergy, deleteAllergy } from '@/lib/api'

export default function PatientAllergiesPage() {
  const params = useParams()
  const patientId = params.id as string
  const [allergies, setAllergies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAllergy, setNewAllergy] = useState({
    name: '',
    severity: 'Moderate',
    type: '',
    reactions: '',
    status: 'Active'
  })
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadAllergies()
  }, [patientId])

  const loadAllergies = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllergies(patientId)
      setAllergies(data || [])
    } catch (err: any) {
      console.error('Error loading allergies:', err)
      setError(err?.message || 'Failed to load allergies')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAllergy = async (id: number | string) => {
    try {
      setIsDeleting(id.toString())
      await deleteAllergy(patientId, id.toString())
      // Reload allergies from API
      await loadAllergies()
    } catch (err: any) {
      console.error('Error deleting allergy:', err)
      setError(err?.message || 'Failed to delete allergy')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleAddAllergy = async () => {
    if (!newAllergy.name.trim()) {
      setFormError('Allergy name is required.')
      return
    }

    try {
      setIsSaving(true)
      setFormError('')

      await createAllergy(patientId, {
        name: newAllergy.name,
        severity: newAllergy.severity,
        type: newAllergy.type || undefined,
        reactions: newAllergy.reactions ? [newAllergy.reactions] : undefined,
        status: newAllergy.status || 'Active',
      })

      // Reload allergies from API
      await loadAllergies()

      setNewAllergy({
        name: '',
        severity: 'Moderate',
        type: '',
        reactions: '',
        status: 'Active'
      })
      setFormError('')
      setShowAddModal(false)
    } catch (err: any) {
      console.error('Error adding allergy:', err)
      setFormError(err?.message || 'Failed to add allergy')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrintCard = () => {
    window.print()
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NurseSidebar />
      <PatientDetailSidebar patientId={params.id as string} />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Allergy Management</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePrintCard}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  Print Card
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all text-sm"
                >
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
                    {loading ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Loading allergies...</p>
                      </div>
                    ) : allergies.length === 0 ? (
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
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded tracking-wide ${allergy.severity === 'Severe' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                    allergy.severity === 'Moderate' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    }`}>{allergy.severity}</span>
                                  <button
                                    onClick={() => handleRemoveAllergy(allergy.id)}
                                    disabled={isDeleting === allergy.id.toString()}
                                    className="p-1 rounded-md text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Remove allergy"
                                  >
                                    {isDeleting === allergy.id.toString() ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                    ) : (
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 mt-2">
                                <div>
                                  <span className="text-xs text-gray-400 dark:text-gray-500 block mb-0.5">Type</span>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{allergy.type || 'Unknown'}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-400 dark:text-gray-500 block mb-0.5">Reaction</span>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{allergy.reactions || 'Not specified'}</span>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                  <span className="text-xs text-gray-400 dark:text-gray-500 block mb-0.5">Status</span>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm text-green-600">check</span> {allergy.status || 'Active'}
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
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Allergy</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Record a new allergy for this patient.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Allergy Name *</label>
                <input
                  value={newAllergy.name}
                  onChange={(event) => setNewAllergy({ ...newAllergy, name: event.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Penicillin"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Severity</label>
                  <select
                    value={newAllergy.severity}
                    onChange={(event) => setNewAllergy({ ...newAllergy, severity: event.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option>Severe</option>
                    <option>Moderate</option>
                    <option>Mild</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Type</label>
                  <input
                    value={newAllergy.type}
                    onChange={(event) => setNewAllergy({ ...newAllergy, type: event.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Food, Medication, etc."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Reactions</label>
                <input
                  value={newAllergy.reactions}
                  onChange={(event) => setNewAllergy({ ...newAllergy, reactions: event.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Rash, swelling, etc."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Status</label>
                <select
                  value={newAllergy.status}
                  onChange={(event) => setNewAllergy({ ...newAllergy, status: event.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option>Active</option>
                  <option>Resolved</option>
                </select>
              </div>
              {formError && (
                <p className="text-xs text-red-600 dark:text-red-400">{formError}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAllergy}
                disabled={isSaving}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Allergy'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
