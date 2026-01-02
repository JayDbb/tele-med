'use client'

import { useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { useState, useEffect } from 'react'
import { getPastMedicalHistory, getPatient, createMedicalCondition } from '@/lib/api'
import { useAutosave } from '@/hooks/useAutosave'

type MedicalCondition = {
  id: string;
  condition: string;
  code?: string;
  category?: string;
  status: string;
  date?: string;
  impact?: string;
  source?: string;
  icon?: string;
  iconBg?: string;
  description?: string;
  relevance?: string;
  treatment?: string[];
  complications?: string;
  careGaps?: Array<{ label: string; icon: string }>;
  created_at?: string;
  updated_at?: string;
  verified?: boolean;
  verified_at?: string;
  verified_by?: string;
}

export default function PastMedicalHistoryPage() {
  const params = useParams()
  const patientId = params.id as string
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [conditions, setConditions] = useState<MedicalCondition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patient, setPatient] = useState<{ full_name?: string } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newCondition, setNewCondition] = useState({
    condition: '',
    code: '',
    category: 'Chronic',
    status: 'Active',
    date: '',
    impact: 'Medium',
    source: 'Clinician',
    description: '',
    relevance: '',
    treatment: [] as string[],
    complications: '',
    careGaps: [] as Array<{ label: string; icon: string }>
  })

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        const [patientData, conditionsData] = await Promise.all([
          getPatient(patientId),
          getPastMedicalHistory(patientId)
        ])
        setPatient(patientData.patient)
        setConditions(conditionsData)
      } catch (err: any) {
        setError(err?.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [patientId])

  // Calculate stats from conditions
  const totalConditions = conditions.length
  const activeChronic = conditions.filter(c =>
    c.status === 'Active' && (c.category === 'Chronic' || !c.category)
  ).length
  const highImpact = conditions.filter(c => c.impact === 'High').length
  const lastUpdated = conditions.length > 0
    ? conditions.reduce((latest, c) => {
      const updated = c.updated_at || c.created_at || ''
      return updated > latest ? updated : latest
    }, '')
    : null

  const getDaysAgo = (dateString: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1d'
    return `${diffDays}d`
  }

  const activeConditions = conditions.filter(c => c.status === 'Active')
  const resolvedConditions = conditions.filter(c => c.status === 'Resolved')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCondition.condition || !newCondition.status) {
      setError('Condition name and status are required')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const result = await createMedicalCondition(patientId, {
        condition: newCondition.condition,
        code: newCondition.code || undefined,
        category: newCondition.category,
        status: newCondition.status,
        date: newCondition.date || undefined,
        impact: newCondition.impact,
        source: newCondition.source,
        description: newCondition.description || undefined,
        relevance: newCondition.relevance || undefined,
        treatment: newCondition.treatment.length > 0 ? newCondition.treatment : undefined,
        complications: newCondition.complications || undefined,
        careGaps: newCondition.careGaps.length > 0 ? newCondition.careGaps : undefined,
      })

      // Refresh conditions list
      const updatedConditions = await getPastMedicalHistory(patientId)
      setConditions(updatedConditions)

      // Clear autosave draft after successful submit
      clearDraft()

      // Reset form
      setNewCondition({
        condition: '',
        code: '',
        category: 'Chronic',
        status: 'Active',
        date: '',
        impact: 'Medium',
        source: 'Clinician',
        description: '',
        relevance: '',
        treatment: [],
        complications: '',
        careGaps: []
      })
      setTreatmentInput('')
      setShowForm(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error creating condition:', err)
      const errorMessage = err?.message || err?.toString() || 'Failed to add condition. Please try again.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const [treatmentInput, setTreatmentInput] = useState('')

  // Autosave form data
  const { clearDraft } = useAutosave(
    'past-medical-history-form',
    { newCondition, treatmentInput, showForm },
    patientId,
    {
      enabled: showForm, // Only autosave when form is open
      onRestore: (data) => {
        if (data.newCondition) {
          setNewCondition(data.newCondition)
        }
        if (data.treatmentInput) {
          setTreatmentInput(data.treatmentInput)
        }
        if (data.showForm) {
          setShowForm(true)
        }
      }
    }
  )

  const addTreatment = () => {
    if (treatmentInput.trim()) {
      setNewCondition({
        ...newCondition,
        treatment: [...newCondition.treatment, treatmentInput.trim()]
      })
      setTreatmentInput('')
    }
  }

  const removeTreatment = (index: number) => {
    setNewCondition({
      ...newCondition,
      treatment: newCondition.treatment.filter((_, i) => i !== index)
    })
  }

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
          <div className="w-full flex flex-col gap-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
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
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>Medical condition added successfully to medical record</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Past Medical History</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 font-semibold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-700 dark:hover:text-gray-300 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  No Significant PMH
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Condition
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Total Conditions</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalConditions}</p>
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">medical_information</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Active Chronic</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeChronic}</p>
                  </div>
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">chronic</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">High Impact</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{highImpact}</p>
                  </div>
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400">priority_high</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Last Updated</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{lastUpdated ? getDaysAgo(lastUpdated) : 'Never'}</p>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">update</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conditions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Medical Conditions</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600">
                      All ({totalConditions})
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-gray-400 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700">
                      Active ({activeConditions.length})
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-gray-400 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700">
                      Resolved ({resolvedConditions.length})
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Condition</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Impact</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Source</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                    {conditions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 px-6 text-center text-slate-500 dark:text-gray-400">
                          <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">medical_information</span>
                          <p>No medical conditions recorded</p>
                        </td>
                      </tr>
                    ) : (
                      conditions.map((condition, index) => (
                        <>
                          <tr
                            key={condition.id}
                            className="hover:bg-slate-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                            onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${condition.iconBg || 'bg-blue-50 text-blue-600'}`}>
                                  <span className="material-symbols-outlined text-sm">{condition.icon || 'medical_information'}</span>
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-white">{condition.condition}</div>
                                  <div className="text-sm text-slate-500 dark:text-gray-400">{condition.code}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${condition.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                condition.status === 'Resolved' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                }`}>
                                {condition.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-600 dark:text-gray-300">{condition.date}</td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${condition.impact === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                condition.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                  'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                }`}>
                                {condition.impact}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-600 dark:text-gray-300">{condition.source}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700">
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                                <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700">
                                  <span className="material-symbols-outlined text-sm">
                                    {expandedRow === index ? 'expand_less' : 'expand_more'}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRow === index && (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 bg-slate-50 dark:bg-gray-700/30">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Clinical Details</h4>
                                    {condition.description && (
                                      <p className="text-sm text-slate-600 dark:text-gray-300 mb-3">{condition.description}</p>
                                    )}

                                    {condition.treatment && condition.treatment.length > 0 && (
                                      <div className="mb-3">
                                        <h5 className="font-medium text-slate-700 dark:text-gray-300 mb-1">Current Treatment</h5>
                                        <ul className="text-sm text-slate-600 dark:text-gray-300 space-y-1">
                                          {condition.treatment.map((tx, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                              {tx}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {condition.complications && (
                                      <div className="mt-3">
                                        <h5 className="font-medium text-slate-700 dark:text-gray-300 mb-1">Complications</h5>
                                        <p className="text-sm text-slate-600 dark:text-gray-300">{condition.complications}</p>
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Care Gaps & Alerts</h4>
                                    {condition.careGaps && condition.careGaps.length > 0 ? (
                                      <div className="space-y-2">
                                        {condition.careGaps.map((gap, i) => (
                                          <div key={i} className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-sm">{gap.icon || 'warning'}</span>
                                            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{gap.label}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-slate-500 dark:text-gray-400">No care gaps identified</p>
                                    )}

                                    {condition.relevance && (
                                      <div className="mt-4">
                                        <h5 className="font-medium text-slate-700 dark:text-gray-300 mb-2">Clinical Relevance</h5>
                                        <p className="text-sm text-slate-600 dark:text-gray-300">{condition.relevance}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clinical Intelligence Panel */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">psychology</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clinical Intelligence</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Risk Stratification</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                    Patient has multiple cardiovascular risk factors. Consider comprehensive risk assessment.
                  </p>
                  <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    View Risk Calculator →
                  </button>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">Care Coordination</h4>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-3">
                    Diabetes management appears well-coordinated with endocrinology. Last consultation 3 months ago.
                  </p>
                  <button className="text-xs font-medium text-green-600 dark:text-green-400 hover:underline">
                    View Care Team →
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Workflow */}
            {conditions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">verified</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verification Status</h3>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm">
                    Verify All Conditions
                  </button>
                </div>

                <div className="space-y-3">
                  {conditions.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 dark:text-gray-400 text-sm">
                      No conditions to verify
                    </div>
                  ) : (
                    conditions.map((condition) => {
                      const isVerified = condition.verified === true
                      const verifiedDate = condition.verified_at ? new Date(condition.verified_at) : null
                      const getVerifiedText = () => {
                        if (!isVerified) return null
                        if (!verifiedDate) return 'Verified'
                        const now = new Date()
                        const diffTime = Math.abs(now.getTime() - verifiedDate.getTime())
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
                        if (diffDays === 0) return 'Verified Today'
                        if (diffDays === 1) return 'Verified Yesterday'
                        return `Verified ${diffDays} days ago`
                      }

                      return (
                        <div
                          key={condition.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${isVerified
                            ? 'bg-slate-50 dark:bg-gray-700/50'
                            : 'bg-yellow-50 dark:bg-yellow-900/20'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`material-symbols-outlined ${isVerified
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-yellow-600 dark:text-yellow-400'
                                }`}
                            >
                              {isVerified ? 'check_circle' : 'schedule'}
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">{condition.condition}</span>
                          </div>
                          {isVerified ? (
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              {getVerifiedText()}
                            </span>
                          ) : (
                            <button className="text-xs text-yellow-600 dark:text-yellow-400 font-medium hover:underline">
                              Needs Verification
                            </button>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* Add Condition Form */}
            {showForm && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-700 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-5 border-b border-primary/10 dark:border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xl flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-2xl">add_circle</span>
                        Add New Medical Condition
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">Document a new medical condition for this patient</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setNewCondition({
                          condition: '',
                          code: '',
                          category: 'Chronic',
                          status: 'Active',
                          date: '',
                          impact: 'Medium',
                          source: 'Clinician',
                          description: '',
                          relevance: '',
                          treatment: [],
                          complications: '',
                          careGaps: []
                        })
                        setTreatmentInput('')
                        setError(null)
                      }}
                      className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-slate-500 dark:text-gray-400">close</span>
                    </button>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                  {/* Condition Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-primary">medical_information</span>
                      Condition Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                      placeholder="e.g., Type 2 Diabetes Mellitus, Hypertension..."
                      type="text"
                      value={newCondition.condition}
                      onChange={(e) => setNewCondition({ ...newCondition, condition: e.target.value })}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Code and Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-primary">code</span>
                        ICD-10 Code
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                        placeholder="e.g., E11.9, I10..."
                        type="text"
                        value={newCondition.code}
                        onChange={(e) => setNewCondition({ ...newCondition, code: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-primary">category</span>
                        Category
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                        value={newCondition.category}
                        onChange={(e) => setNewCondition({ ...newCondition, category: e.target.value })}
                      >
                        <option value="Chronic">Chronic</option>
                        <option value="Acute">Acute</option>
                        <option value="Surgical">Surgical</option>
                        <option value="Allergic">Allergic</option>
                        <option value="Nutritional">Nutritional</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Status and Impact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-primary">flag</span>
                        Status <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Active', 'Resolved'].map((status) => (
                          <label key={status} className="cursor-pointer">
                            <input
                              className="peer sr-only"
                              type="radio"
                              name="status"
                              value={status}
                              checked={newCondition.status === status}
                              onChange={(e) => setNewCondition({ ...newCondition, status: e.target.value })}
                              required
                            />
                            <div className={`rounded-lg border-2 p-3 text-center transition-all ${status === 'Active'
                              ? 'border-slate-200 dark:border-gray-700 peer-checked:border-green-500 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20'
                              : 'border-slate-200 dark:border-gray-700 peer-checked:border-gray-500 peer-checked:bg-gray-50 dark:peer-checked:bg-gray-800'
                              }`}>
                              <div className={`text-sm font-semibold ${status === 'Active' ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                                }`}>{status}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-primary">priority_high</span>
                        Impact
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                        value={newCondition.impact}
                        onChange={(e) => setNewCondition({ ...newCondition, impact: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  {/* Date and Source */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-primary">calendar_today</span>
                        Date Diagnosed/Onset
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                        type="text"
                        placeholder="e.g., 2015, 2018..."
                        value={newCondition.date}
                        onChange={(e) => setNewCondition({ ...newCondition, date: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-primary">source</span>
                        Source
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                        value={newCondition.source}
                        onChange={(e) => setNewCondition({ ...newCondition, source: e.target.value })}
                      >
                        <option value="Clinician">Clinician</option>
                        <option value="Patient">Patient</option>
                        <option value="Lab">Lab</option>
                        <option value="Imaging">Imaging</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-primary">description</span>
                      Description
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
                      placeholder="Clinical details, recent status, lab values..."
                      rows={3}
                      value={newCondition.description}
                      onChange={(e) => setNewCondition({ ...newCondition, description: e.target.value })}
                    />
                  </div>

                  {/* Treatment */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-primary">medication</span>
                      Current Treatment
                    </label>
                    <div className="flex flex-col gap-2">
                      {newCondition.treatment.map((tx, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="flex-1 px-4 py-2 bg-slate-50 dark:bg-gray-800 rounded-lg text-sm text-slate-700 dark:text-gray-300">{tx}</span>
                          <button
                            type="button"
                            onClick={() => removeTreatment(i)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                          placeholder="Enter treatment (e.g., Metformin 1000mg BID)..."
                          value={treatmentInput}
                          onChange={(e) => setTreatmentInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addTreatment()
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={addTreatment}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Complications and Relevance */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-primary">warning</span>
                        Complications
                      </label>
                      <textarea
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
                        placeholder="Any complications or sequelae..."
                        rows={2}
                        value={newCondition.complications}
                        onChange={(e) => setNewCondition({ ...newCondition, complications: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-primary">psychology</span>
                        Clinical Relevance
                      </label>
                      <textarea
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
                        placeholder="Why this condition matters for care..."
                        rows={2}
                        value={newCondition.relevance}
                        onChange={(e) => setNewCondition({ ...newCondition, relevance: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Info Banner */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex gap-3">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl shrink-0">info</span>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Medical Record Notice</p>
                      <p className="text-xs text-blue-800 dark:text-blue-300">
                        This condition will be immediately added to the patient's official medical record and will be visible to all authorized healthcare providers.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setNewCondition({
                          condition: '',
                          code: '',
                          category: 'Chronic',
                          status: 'Active',
                          date: '',
                          impact: 'Medium',
                          source: 'Clinician',
                          description: '',
                          relevance: '',
                          treatment: [],
                          complications: '',
                          careGaps: []
                        })
                        setTreatmentInput('')
                        setError(null)
                      }}
                      className="flex-1 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !newCondition.condition || !newCondition.status}
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
          </div>
        </div>
      </main>
    </div>
  )
}