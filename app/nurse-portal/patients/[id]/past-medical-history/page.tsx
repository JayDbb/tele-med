'use client'

import { useParams } from 'next/navigation'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { useEffect, useMemo, useState } from 'react'
import { PatientDataManager } from '@/utils/PatientDataManager'

export default function PastMedicalHistoryPage() {
  const params = useParams()
  const patientId = params.id as string
  const [expandedRow, setExpandedRow] = useState<number | null>(0)
  const [activeFilter, setActiveFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingCondition, setEditingCondition] = useState<any | null>(null)
  const [conditions, setConditions] = useState<any[]>([])
  const [metaNotes, setMetaNotes] = useState({
    riskNote: '',
    careNote: ''
  })
  const [noSignificant, setNoSignificant] = useState(false)

  useEffect(() => {
    const section = PatientDataManager.getPatientSection(patientId, 'past-medical-history')
    const items = Array.isArray(section?.items) ? section.items : []
    setConditions(items)
    setMetaNotes({
      riskNote: section?.meta?.riskNote || '',
      careNote: section?.meta?.careNote || ''
    })
    setNoSignificant(Boolean(section?.meta?.noSignificant))
  }, [patientId])

  const handleSaveCondition = (data: any) => {
    const now = new Date().toISOString()
    let nextConditions = []
    if (editingCondition) {
      nextConditions = conditions.map((condition) =>
        condition.id === editingCondition.id
          ? { ...editingCondition, ...data, updatedAt: now }
          : condition
      )
    } else {
      nextConditions = [
        {
          id: Date.now().toString(),
          icon: data.icon || 'medical_information',
          iconBg: data.iconBg || 'bg-blue-50 text-blue-600',
          createdAt: now,
          updatedAt: now,
          ...data
        },
        ...conditions
      ]
    }
    setConditions(nextConditions)
    PatientDataManager.updatePatientSection(patientId, 'past-medical-history', {
      items: nextConditions,
      meta: { ...metaNotes, noSignificant }
    })
    setEditingCondition(null)
  }

  const handleRemoveCondition = (id: string) => {
    const nextConditions = conditions.filter((condition) => condition.id !== id)
    setConditions(nextConditions)
    PatientDataManager.updatePatientSection(patientId, 'past-medical-history', {
      items: nextConditions,
      meta: { ...metaNotes, noSignificant }
    })
  }

  const handleSaveMeta = () => {
    PatientDataManager.updatePatientSection(patientId, 'past-medical-history', {
      items: conditions,
      meta: { ...metaNotes, noSignificant }
    })
  }

  const handleToggleNoSignificant = () => {
    const nextValue = !noSignificant
    setNoSignificant(nextValue)
    PatientDataManager.updatePatientSection(patientId, 'past-medical-history', {
      items: conditions,
      meta: { ...metaNotes, noSignificant: nextValue }
    })
  }

  const filteredConditions = useMemo(() => {
    if (activeFilter === 'All') return conditions
    return conditions.filter((condition) => `${condition.status}`.toLowerCase() === activeFilter.toLowerCase())
  }, [activeFilter, conditions])

  const totalCount = conditions.length
  const activeCount = conditions.filter((condition) => `${condition.status}`.toLowerCase() === 'active').length
  const resolvedCount = conditions.filter((condition) => `${condition.status}`.toLowerCase() === 'resolved').length
  const activeChronicCount = conditions.filter(
    (condition) =>
      `${condition.status}`.toLowerCase() === 'active'
      && `${condition.category}`.toLowerCase() === 'chronic'
  ).length
  const highImpactCount = conditions.filter((condition) => `${condition.impact}`.toLowerCase() === 'high').length
  const latestUpdated = conditions
    .map((condition) => condition.updatedAt || condition.createdAt)
    .filter(Boolean)
    .sort()
    .pop()

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
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Past Medical History</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleToggleNoSignificant}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 font-semibold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-700 dark:hover:text-gray-300 transition-all text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {noSignificant ? 'Significant PMH Present' : 'No Significant PMH'}
                </button>
                <button
                  onClick={() => {
                    setEditingCondition(null)
                    setShowModal(true)
                  }}
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
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</p>
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
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeChronicCount}</p>
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
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{highImpactCount}</p>
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
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {latestUpdated ? new Date(latestUpdated).toLocaleDateString() : '—'}
                    </p>
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
                    <button
                      onClick={() => setActiveFilter('All')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                        activeFilter === 'All'
                          ? 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300'
                          : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      All ({totalCount})
                    </button>
                    <button
                      onClick={() => setActiveFilter('Active')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                        activeFilter === 'Active'
                          ? 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300'
                          : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Active ({activeCount})
                    </button>
                    <button
                      onClick={() => setActiveFilter('Resolved')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                        activeFilter === 'Resolved'
                          ? 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300'
                          : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Resolved ({resolvedCount})
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
                    {filteredConditions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 px-6 text-sm text-slate-500 dark:text-gray-400">
                          No conditions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      filteredConditions.map((condition, index) => (
                        <>
                          <tr 
                            key={condition.id} 
                            className="hover:bg-slate-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                            onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${condition.iconBg || 'bg-blue-50 text-blue-600'}`}>
                                  <span className="material-symbols-outlined text-sm">{condition.icon}</span>
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-white">{condition.condition || 'Untitled Condition'}</div>
                                  <div className="text-sm text-slate-500 dark:text-gray-400">{condition.code || 'Not provided'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                condition.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                condition.status === 'Resolved' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              }`}>
                                {condition.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-600 dark:text-gray-300">{condition.date || 'Not provided'}</td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                condition.impact === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                condition.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              }`}>
                                {condition.impact}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-600 dark:text-gray-300">{condition.source || 'Not provided'}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    setEditingCondition(condition)
                                    setShowModal(true)
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700"
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    handleRemoveCondition(condition.id)
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
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
                                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-3">
                                      {condition.description || 'No clinical details recorded.'}
                                    </p>
                                    
                                    <div className="mb-3">
                                      <h5 className="font-medium text-slate-700 dark:text-gray-300 mb-1">Current Treatment</h5>
                                      <ul className="text-sm text-slate-600 dark:text-gray-300 space-y-1">
                                        {(condition.treatment || []).length === 0 ? (
                                          <li className="text-slate-500 dark:text-gray-400">No treatments recorded.</li>
                                        ) : condition.treatment?.map((tx: string, i: number) => (
                                          <li key={i} className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                            {tx}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    
                                    <div>
                                      <h5 className="font-medium text-slate-700 dark:text-gray-300 mb-1">Complications</h5>
                                      <p className="text-sm text-slate-600 dark:text-gray-300">
                                        {condition.complications || 'No complications recorded.'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Care Gaps & Alerts</h4>
                                    <div className="space-y-2">
                                      {(condition.careGaps || []).length === 0 ? (
                                        <div className="text-sm text-slate-500 dark:text-gray-400">
                                          No care gaps recorded.
                                        </div>
                                      ) : condition.careGaps?.map((gap: { label?: string; icon?: string } | string, i: number) => {
                                        const gapLabel = typeof gap === 'string' ? gap : gap.label || 'Care Gap'
                                        const gapIcon = typeof gap === 'string' ? 'info' : gap.icon || 'info'
                                        return (
                                          <div key={i} className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-sm">{gapIcon}</span>
                                            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{gapLabel}</span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                    
                                    <div className="mt-4">
                                      <h5 className="font-medium text-slate-700 dark:text-gray-300 mb-2">Clinical Relevance</h5>
                                      <p className="text-sm text-slate-600 dark:text-gray-300">
                                        {condition.relevance || 'No relevance notes recorded.'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))
                    )}
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
                  <textarea
                    value={metaNotes.riskNote}
                    onChange={(event) => setMetaNotes((prev) => ({ ...prev, riskNote: event.target.value }))}
                    className="w-full min-h-[80px] resize-none text-sm text-blue-800 dark:text-blue-300 bg-transparent border border-blue-100 dark:border-blue-800 rounded-lg p-2 focus:ring-0"
                    placeholder="Add risk stratification notes..."
                  />
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">Care Coordination</h4>
                  <textarea
                    value={metaNotes.careNote}
                    onChange={(event) => setMetaNotes((prev) => ({ ...prev, careNote: event.target.value }))}
                    className="w-full min-h-[80px] resize-none text-sm text-green-800 dark:text-green-300 bg-transparent border border-green-100 dark:border-green-800 rounded-lg p-2 focus:ring-0"
                    placeholder="Add care coordination notes..."
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSaveMeta}
                  className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm"
                >
                  Save Notes
                </button>
              </div>
            </div>

            {/* Verification Workflow */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">verified</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verification Status</h3>
                </div>
                <button
                  onClick={() => {
                    const nextConditions = conditions.map((condition) => ({
                      ...condition,
                      verificationStatus: 'Verified',
                      updatedAt: new Date().toISOString()
                    }))
                    setConditions(nextConditions)
                    PatientDataManager.updatePatientSection(patientId, 'past-medical-history', {
                      items: nextConditions,
                      meta: { ...metaNotes, noSignificant }
                    })
                  }}
                  className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm"
                >
                  Verify All Conditions
                </button>
              </div>
              
              <div className="space-y-3">
                {conditions.length === 0 ? (
                  <div className="text-sm text-slate-500 dark:text-gray-400">
                    No verification data recorded yet.
                  </div>
                ) : (
                  conditions.map((condition) => {
                    const status = condition.verificationStatus || 'Needs Verification'
                    const isVerified = status.toLowerCase() === 'verified'
                    return (
                      <div
                        key={condition.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isVerified
                            ? 'bg-slate-50 dark:bg-gray-700/50'
                            : 'bg-yellow-50 dark:bg-yellow-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`material-symbols-outlined text-sm ${
                              isVerified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                            }`}
                          >
                            {isVerified ? 'check_circle' : 'schedule'}
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {condition.condition || 'Condition'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const nextConditions = conditions.map((item) =>
                              item.id === condition.id
                                ? { ...item, verificationStatus: isVerified ? 'Needs Verification' : 'Verified' }
                                : item
                            )
                            setConditions(nextConditions)
                            PatientDataManager.updatePatientSection(patientId, 'past-medical-history', {
                              items: nextConditions,
                              meta: { ...metaNotes, noSignificant }
                            })
                          }}
                          className={`text-xs font-medium ${
                            isVerified
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-yellow-600 dark:text-yellow-400'
                          } hover:underline`}
                        >
                          {isVerified ? 'Verified' : 'Needs Verification'}
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <ConditionModal
          initialData={editingCondition}
          patientId={patientId}
          onClose={() => {
            setEditingCondition(null)
            setShowModal(false)
          }}
          onSave={(data) => {
            handleSaveCondition(data)
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}

function ConditionModal({
  initialData,
  patientId,
  onClose,
  onSave
}: {
  initialData: any | null
  patientId: string
  onClose: () => void
  onSave: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    condition: initialData?.condition || '',
    code: initialData?.code || '',
    category: initialData?.category || 'Chronic',
    status: initialData?.status || 'Active',
    date: initialData?.date || '',
    impact: initialData?.impact || 'Medium',
    source: initialData?.source || 'Clinician',
    description: initialData?.description || '',
    relevance: initialData?.relevance || '',
    treatment: (initialData?.treatment || []).join(', '),
    complications: initialData?.complications || '',
    careGaps: (initialData?.careGaps || []).map((gap: any) => gap.label || gap).join(', '),
    verificationStatus: initialData?.verificationStatus || 'Needs Verification'
  })
  const draftKey = 'pmh-form'

  useEffect(() => {
    const draft = PatientDataManager.getDraft(patientId, draftKey)
    if (draft?.data) {
      setFormData((prev) => ({ ...prev, ...draft.data }))
    }
  }, [patientId])

  useEffect(() => {
    const timeout = setTimeout(() => {
      PatientDataManager.saveDraft(patientId, draftKey, formData)
    }, 400)
    return () => clearTimeout(timeout)
  }, [patientId, formData])

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    PatientDataManager.clearDraft(patientId, draftKey)
    onSave({
      condition: formData.condition,
      code: formData.code,
      category: formData.category,
      status: formData.status,
      date: formData.date,
      impact: formData.impact,
      source: formData.source,
      description: formData.description,
      relevance: formData.relevance,
      treatment: formData.treatment
        ? formData.treatment.split(',').map((item: string) => item.trim()).filter(Boolean)
        : [],
      complications: formData.complications,
      careGaps: formData.careGaps
        ? formData.careGaps.split(',').map((item: string) => item.trim()).filter(Boolean)
        : [],
      verificationStatus: formData.verificationStatus
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {initialData ? 'Edit Condition' : 'Add Condition'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Condition</label>
              <input
                value={formData.condition}
                onChange={(event) => handleChange('condition', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                placeholder="Condition name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Code</label>
              <input
                value={formData.code}
                onChange={(event) => handleChange('code', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                placeholder="ICD-10 code"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(event) => handleChange('category', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              >
                <option>Chronic</option>
                <option>Acute</option>
                <option>Allergic</option>
                <option>Surgical</option>
                <option>Nutritional</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(event) => handleChange('status', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              >
                <option>Active</option>
                <option>Resolved</option>
                <option>Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Impact</label>
              <select
                value={formData.impact}
                onChange={(event) => handleChange('impact', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Date</label>
              <input
                value={formData.date}
                onChange={(event) => handleChange('date', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                placeholder="Year or date"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Source</label>
              <select
                value={formData.source}
                onChange={(event) => handleChange('source', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              >
                <option>Clinician</option>
                <option>Patient</option>
                <option>Lab</option>
                <option>Imaging</option>
                <option>External</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Verification</label>
              <select
                value={formData.verificationStatus}
                onChange={(event) => handleChange('verificationStatus', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              >
                <option>Needs Verification</option>
                <option>Verified</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Clinical Details</label>
            <textarea
              value={formData.description}
              onChange={(event) => handleChange('description', event.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              placeholder="Add clinical details..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Treatment (comma-separated)</label>
            <input
              value={formData.treatment}
              onChange={(event) => handleChange('treatment', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              placeholder="Medication or therapies"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Complications</label>
            <input
              value={formData.complications}
              onChange={(event) => handleChange('complications', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              placeholder="Complication notes"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Care Gaps (comma-separated)</label>
            <input
              value={formData.careGaps}
              onChange={(event) => handleChange('careGaps', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              placeholder="Follow-ups or reminders"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Clinical Relevance</label>
            <textarea
              value={formData.relevance}
              onChange={(event) => handleChange('relevance', event.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              placeholder="Why this matters clinically"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
          >
            Save Condition
          </button>
        </div>
      </div>
    </div>
  )
}
