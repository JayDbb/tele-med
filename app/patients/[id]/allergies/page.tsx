'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { getPatient, getAllergies, createAllergy } from '@/lib/api'
import { useAutosave } from '@/hooks/useAutosave'

type Allergy = {
  id: string;
  name: string;
  severity: string;
  type?: string;
  reactions?: string;
  status?: string;
  date?: string;
  notes?: string;
  created_at?: string;
}

export default function PatientAllergiesPage() {
  const params = useParams()
  const patientId = params.id as string
  const [patient, setPatient] = useState<{ full_name?: string } | null>(null)
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newAllergy, setNewAllergy] = useState({
    name: '',
    severity: '',
    reactions: [] as string[],
    date: '',
    notes: '',
    type: ''
  })
  const [showSuccess, setShowSuccess] = useState(false)

  // Autosave form data
  const { clearDraft } = useAutosave(
    'allergies-form',
    { newAllergy, showForm },
    patientId,
    {
      enabled: showForm, // Only autosave when form is open
      onRestore: (data) => {
        if (data.newAllergy) {
          setNewAllergy(data.newAllergy)
        }
        if (data.showForm) {
          setShowForm(true)
        }
      }
    }
  )

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        const [patientData, allergiesData] = await Promise.all([
          getPatient(patientId),
          getAllergies(patientId)
        ])
        setPatient(patientData.patient)
        setAllergies(allergiesData)
      } catch (err: any) {
        setError(err?.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [patientId])

  const handleReactionChange = (reaction: string, checked: boolean) => {
    if (checked) {
      setNewAllergy({ ...newAllergy, reactions: [...newAllergy.reactions, reaction] })
    } else {
      setNewAllergy({ ...newAllergy, reactions: newAllergy.reactions.filter(r => r !== reaction) })
    }
  }

  const handleQuickAdd = (name: string) => {
    setNewAllergy({ ...newAllergy, name })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted', newAllergy)

    if (!newAllergy.name || !newAllergy.severity) {
      setError('Name and severity are required')
      return
    }

    try {
      setSaving(true)
      setError(null)
      console.log('Creating allergy...', { patientId, allergy: newAllergy })

      const result = await createAllergy(patientId, {
        name: newAllergy.name,
        severity: newAllergy.severity,
        type: newAllergy.type || 'Unknown',
        reactions: newAllergy.reactions,
        date: newAllergy.date || undefined,
        notes: newAllergy.notes || undefined,
        status: 'Active'
      })

      console.log('Allergy created successfully', result)

      // Refresh allergies list
      const updatedAllergies = await getAllergies(patientId)
      setAllergies(updatedAllergies)

      // Clear autosave draft after successful submit
      clearDraft()

      // Reset form
      setNewAllergy({ name: '', severity: '', reactions: [], date: '', notes: '', type: '' })
      setShowForm(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error creating allergy:', err)
      const errorMessage = err?.message || err?.toString() || 'Failed to add allergy. Please try again.'
      setError(errorMessage)
      // Keep form open so user can fix and retry
    } finally {
      setSaving(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      case 'moderate':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
      case 'mild':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
    }
  }

  const getIconForType = (type?: string) => {
    const typeLower = type?.toLowerCase() || ''
    if (typeLower.includes('food') || typeLower.includes('nutrition')) {
      return 'nutrition'
    } else if (typeLower.includes('medication') || typeLower.includes('drug')) {
      return 'medication'
    } else if (typeLower.includes('environment') || typeLower.includes('pollen')) {
      return 'grass'
    }
    return 'science'
  }

  const activeAllergies = allergies.filter(a => (a.status || 'Active').toLowerCase() === 'active')
  const pendingAllergies = allergies.filter(a => (a.status || '').toLowerCase() === 'pending')

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <PatientDetailSidebar patientId={patientId} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <PatientDetailSidebar patientId={patientId} />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top">
                <span className="material-symbols-outlined text-lg">error</span>
                <span className="font-medium">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}
            {showSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>Allergy added successfully to medical record</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">Patients</span>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm">chevron_right</span>
                  <span className="text-primary text-sm font-medium">{patient?.full_name || 'Patient'}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Allergy Management</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  Print Card
                </button>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all text-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_alert</span>
                    Add Allergy
                  </button>
                )}
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
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{activeAllergies.length}</div>
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
                      {activeAllergies.length > 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          Last updated {new Date(Math.max(...activeAllergies.map(a => new Date(a.created_at || 0).getTime()))).toLocaleDateString()}
                        </p>
                      )}
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
                    {activeAllergies.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">medical_services</span>
                        <p>No allergies recorded</p>
                      </div>
                    ) : (
                      activeAllergies.map((allergy) => {
                        const severityLower = allergy.severity?.toLowerCase() || ''
                        const iconBgClass = severityLower === 'severe'
                          ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : severityLower === 'moderate'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-primary'
                            : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'

                        return (
                          <div key={allergy.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                              <div className={`${iconBgClass} p-3 rounded-full shrink-0`}>
                                <span className="material-symbols-outlined">{getIconForType(allergy.type)}</span>
                              </div>
                              <div className="flex-1 w-full">
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="text-base font-bold text-gray-900 dark:text-white">{allergy.name}</h4>
                                  <span className={`px-2 py-0.5 ${getSeverityColor(allergy.severity)} text-[10px] font-bold uppercase rounded tracking-wide`}>
                                    {allergy.severity}
                                  </span>
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
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                                <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                  <span className="material-symbols-outlined">edit</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {pendingAllergies.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500 text-[18px]">pending</span>
                        Pending Review
                      </h3>
                    </div>
                    <div className="p-5">
                      {pendingAllergies.map((allergy) => (
                        <div key={allergy.id} className="flex items-start gap-4 p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 mb-2 last:mb-0">
                          <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-gray-500 dark:text-gray-400">
                            <span className="material-symbols-outlined">{getIconForType(allergy.type)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">{allergy.name}</h4>
                              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded">Pending Doctor Review</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Reported on {allergy.date ? new Date(allergy.date).toLocaleDateString() : allergy.created_at ? new Date(allergy.created_at).toLocaleDateString() : 'Unknown date'}.
                              {allergy.reactions && ` Reaction: ${allergy.reactions}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                {showForm && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg shadow-blue-900/5 overflow-hidden ring-1 ring-gray-900/5 dark:ring-gray-100/5">
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-5 border-b border-primary/10 dark:border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-xl flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-2xl">add_alert</span>
                            Add New Allergy
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Document a new patient sensitivity</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false)
                            setNewAllergy({ name: '', severity: '', reactions: [], date: '', notes: '', type: '' })
                          }}
                          className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">close</span>
                        </button>
                      </div>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                      {/* Allergen Name */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg text-primary">science</span>
                          Allergen Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 material-symbols-outlined text-lg">search</span>
                          <input
                            className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                            placeholder="Enter allergen name (e.g., Peanuts, Penicillin, Latex)..."
                            type="text"
                            value={newAllergy.name}
                            onChange={(e) => setNewAllergy({ ...newAllergy, name: e.target.value })}
                            required
                            autoFocus
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Quick add:</span>
                          {['Peanuts', 'Penicillin', 'Latex', 'Shellfish', 'Eggs', 'Codeine', 'Aspirin', 'Iodine'].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => handleQuickAdd(item)}
                              className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary px-3 py-1.5 rounded-full text-gray-700 dark:text-gray-300 transition-all font-medium"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Allergy Type */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg text-primary">category</span>
                          Allergy Type
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { value: 'Food', icon: 'nutrition', colorClass: 'text-orange-500' },
                            { value: 'Medication', icon: 'medication', colorClass: 'text-blue-500' },
                            { value: 'Environmental', icon: 'grass', colorClass: 'text-green-500' },
                            { value: 'Other', icon: 'help', colorClass: 'text-gray-500' }
                          ].map((type) => (
                            <label key={type.value} className="cursor-pointer group">
                              <input
                                className="peer sr-only"
                                name="type"
                                type="radio"
                                value={type.value}
                                checked={newAllergy.type === type.value}
                                onChange={(e) => setNewAllergy({ ...newAllergy, type: e.target.value })}
                              />
                              <div className="rounded-lg border-2 border-gray-200 dark:border-gray-700 p-3 text-center hover:border-primary/50 dark:hover:border-primary/50 transition-all peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 group-hover:bg-gray-50 dark:group-hover:bg-gray-800">
                                <span className={`material-symbols-outlined text-2xl mb-1 block ${type.colorClass}`}>{type.icon}</span>
                                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 peer-checked:text-primary">{type.value}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Severity */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg text-primary">warning</span>
                          Severity <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'Mild', icon: 'check_circle', desc: 'Minor reaction' },
                            { value: 'Moderate', icon: 'info', desc: 'Moderate reaction' },
                            { value: 'Severe', icon: 'error', desc: 'Severe reaction' }
                          ].map((severity) => (
                            <label key={severity.value} className="cursor-pointer">
                              <input
                                className="peer sr-only"
                                name="severity"
                                type="radio"
                                value={severity.value}
                                checked={newAllergy.severity === severity.value}
                                onChange={(e) => setNewAllergy({ ...newAllergy, severity: e.target.value })}
                                required
                              />
                              <div className={`rounded-xl border-2 p-4 text-center transition-all hover:scale-105 ${severity.value === 'Mild'
                                ? 'border-gray-200 dark:border-gray-700 peer-checked:border-green-500 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20 peer-checked:shadow-lg peer-checked:shadow-green-500/20'
                                : severity.value === 'Moderate'
                                  ? 'border-gray-200 dark:border-gray-700 peer-checked:border-amber-500 peer-checked:bg-amber-50 dark:peer-checked:bg-amber-900/20 peer-checked:shadow-lg peer-checked:shadow-amber-500/20'
                                  : 'border-gray-200 dark:border-gray-700 peer-checked:border-red-500 peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20 peer-checked:shadow-lg peer-checked:shadow-red-500/20'
                                }`}>
                                <span className={`material-symbols-outlined text-3xl mb-2 block ${severity.value === 'Mild' ? 'text-green-600 dark:text-green-400' :
                                  severity.value === 'Moderate' ? 'text-amber-600 dark:text-amber-400' :
                                    'text-red-600 dark:text-red-400'
                                  }`}>{severity.icon}</span>
                                <div className={`text-sm font-bold mb-1 ${severity.value === 'Mild' ? 'text-green-700 dark:text-green-300' :
                                  severity.value === 'Moderate' ? 'text-amber-700 dark:text-amber-300' :
                                    'text-red-700 dark:text-red-300'
                                  }`}>{severity.value}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{severity.desc}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Reactions */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg text-primary">sick</span>
                          Reactions
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {[
                            'Skin Rash / Hives',
                            'Swelling',
                            'Trouble Breathing',
                            'Nausea / Vomiting',
                            'Anaphylaxis',
                            'Itching',
                            'Dizziness',
                            'Other'
                          ].map((reaction) => (
                            <label key={reaction} className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary/50 transition-all">
                              <input
                                className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary w-4 h-4"
                                type="checkbox"
                                checked={newAllergy.reactions.includes(reaction)}
                                onChange={(e) => handleReactionChange(reaction, e.target.checked)}
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{reaction}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Date and Notes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-primary">calendar_today</span>
                            When did this happen?
                          </label>
                          <input
                            className="rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white px-4 py-3"
                            type="date"
                            value={newAllergy.date}
                            onChange={(e) => setNewAllergy({ ...newAllergy, date: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-primary">note</span>
                            Additional Notes
                          </label>
                          <textarea
                            className="rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none text-gray-900 dark:text-white px-4 py-3"
                            placeholder="e.g. First occurred in childhood, requires epinephrine..."
                            rows={3}
                            value={newAllergy.notes}
                            onChange={(e) => setNewAllergy({ ...newAllergy, notes: e.target.value })}
                          ></textarea>
                        </div>
                      </div>

                      {/* Info Banner */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex gap-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl shrink-0">info</span>
                        <div>
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Medical Record Notice</p>
                          <p className="text-xs text-blue-800 dark:text-blue-300">
                            This allergy will be immediately added to the patient's official medical record and will be visible to all authorized healthcare providers.
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false)
                            setNewAllergy({ name: '', severity: '', reactions: [], date: '', notes: '', type: '' })
                            setError(null)
                          }}
                          className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving || !newAllergy.name || !newAllergy.severity}
                          onClick={(e) => {
                            console.log('Submit button clicked', {
                              saving,
                              name: newAllergy.name,
                              severity: newAllergy.severity,
                              disabled: saving || !newAllergy.name || !newAllergy.severity
                            })
                            if (!newAllergy.name || !newAllergy.severity) {
                              e.preventDefault()
                              setError('Please fill in the allergen name and select a severity level')
                            }
                          }}
                          className="flex-1 bg-primary hover:bg-blue-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <>
                              <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                              Adding...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-lg">save</span>
                              Add to Medical Record
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {!showForm && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg shadow-blue-900/5 overflow-hidden ring-1 ring-gray-900/5 dark:ring-gray-100/5">
                    <div className="bg-primary/5 dark:bg-primary/10 p-4 border-b border-primary/10 dark:border-primary/20">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">add_circle</span>
                        Add New Allergy
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Document a new patient sensitivity.</p>
                    </div>
                    <div className="p-5">
                      <button
                        onClick={() => setShowForm(true)}
                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined">add_alert</span>
                        Add Allergy
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">History & Changes</h3>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Last 6 months</span>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {allergies.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No history available
                      </div>
                    ) : (
                      allergies.slice(0, 5).map((allergy) => (
                        <div key={allergy.id} className="p-4 flex gap-3">
                          <div className="text-gray-300 dark:text-gray-600">
                            <span className="material-symbols-outlined text-sm">history</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold text-gray-900 dark:text-white">{allergy.name}</span> allergy {allergy.status === 'Active' ? 'added' : 'updated'}.
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                {allergy.created_at ? new Date(allergy.created_at).toLocaleDateString() : 'Unknown date'}
                              </span>
                              <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">
                                {allergy.severity}
                              </span>
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
    </div>
  )
}
