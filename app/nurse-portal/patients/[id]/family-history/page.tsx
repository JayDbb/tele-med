'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { PatientDataManager } from '@/utils/PatientDataManager'

export default function PatientFamilyHistoryPage() {
  const params = useParams()
  const patientId = params.id as string
  const patient = PatientDataManager.getPatient(patientId)
  const [familyMembers, setFamilyMembers] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const draftKey = 'family-history-form'
  const [formData, setFormData] = useState({
    relationship: '',
    status: 'Living',
    conditions: '',
    notes: '',
    unsure: false
  })

  useEffect(() => {
    const saved = PatientDataManager.getPatientSectionList(patientId, 'family-history')
    setFamilyMembers(saved)
  }, [patientId])

  useEffect(() => {
    const draft = PatientDataManager.getDraft(patientId, draftKey)
    if (draft?.data) {
      if (draft.data.formData) {
        setFormData((prev) => ({ ...prev, ...draft.data.formData }))
      }
      if (draft.data.editingId) {
        setEditingId(draft.data.editingId)
      }
    }
  }, [patientId])

  useEffect(() => {
    const timeout = setTimeout(() => {
      PatientDataManager.saveDraft(patientId, draftKey, {
        formData,
        editingId
      })
    }, 400)
    return () => clearTimeout(timeout)
  }, [patientId, formData, editingId])

  const handleSaveMember = () => {
    if (!formData.relationship.trim()) return
    const newEntry = {
      id: editingId || Date.now().toString(),
      relationship: formData.relationship,
      status: formData.status,
      conditions: formData.conditions,
      notes: formData.notes,
      unsure: formData.unsure,
      recordedAt: new Date().toISOString()
    }
    const nextMembers = editingId
      ? familyMembers.map((member) => (member.id === editingId ? newEntry : member))
      : [newEntry, ...familyMembers]
    setFamilyMembers(nextMembers)
    PatientDataManager.savePatientSectionList(patientId, 'family-history', nextMembers)
    setEditingId(null)
    setFormData({
      relationship: '',
      status: 'Living',
      conditions: '',
      notes: '',
      unsure: false
    })
    PatientDataManager.clearDraft(patientId, draftKey)
  }

  const handleEditMember = (member: any) => {
    setEditingId(member.id)
    setFormData({
      relationship: member.relationship || '',
      status: member.status || 'Living',
      conditions: member.conditions || '',
      notes: member.notes || '',
      unsure: Boolean(member.unsure)
    })
  }

  const handleRemoveMember = (id: string) => {
    const nextMembers = familyMembers.filter((member) => member.id !== id)
    setFamilyMembers(nextMembers)
    PatientDataManager.savePatientSectionList(patientId, 'family-history', nextMembers)
  }

  const latestUpdated = familyMembers[0]?.recordedAt
    ? new Date(familyMembers[0].recordedAt).toLocaleDateString()
    : 'Not recorded'

  const appendCondition = (condition: string) => {
    const existing = formData.conditions
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    if (!existing.includes(condition)) {
      setFormData({ ...formData, conditions: [...existing, condition].join(', ') })
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
      <NurseSidebar />
      <PatientDetailSidebar patientId={params.id as string} />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Family History</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track family conditions for care planning.</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Family Members</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{familyMembers.length} Added • Updated {latestUpdated}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {familyMembers.length === 0 ? (
                    <div className="col-span-full rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      No family history recorded yet.
                    </div>
                  ) : (
                    familyMembers.map((member) => (
                      <div key={member.id} className="flex flex-col gap-3 rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors group">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-primary text-lg font-bold">
                              {(member.relationship || 'F').slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">{member.relationship || 'Family Member'}</h3>
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                  {member.status || 'Unknown'}
                                </span>
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 text-xs">{member.status || 'Status not recorded'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditMember(member)}
                              className="text-gray-500 opacity-0 group-hover:opacity-100 hover:text-primary transition-all"
                            >
                              <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                            >
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                          </div>
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
                          <div className="flex flex-wrap gap-2">
                            {member.conditions
                              ? member.conditions.split(',').map((condition: string) => (
                                  <span
                                    key={condition.trim()}
                                    className="inline-flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                                  >
                                    {condition.trim()}
                                  </span>
                                ))
                              : (
                                <span className="text-xs text-gray-500 dark:text-gray-400">No conditions recorded</span>
                              )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
                <div className="flex flex-col rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-bold leading-tight text-gray-900 dark:text-white">Add Family Member</h2>
                    <span className="rounded-full bg-blue-100 dark:bg-blue-900 text-primary dark:text-blue-300 px-2.5 py-1 text-xs font-bold">Step 1</span>
                  </div>
                  <div className="p-5 flex flex-col">
                    <div className="flex flex-col gap-6 flex-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                          <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Relationship</label>
                          <div className="relative">
                            <select
                              value={formData.relationship}
                              onChange={(event) => setFormData({ ...formData, relationship: event.target.value })}
                              className="w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-2.5 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-900 dark:text-white"
                            >
                              <option>Select...</option>
                              <option>Mother</option>
                              <option>Father</option>
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
                          <div className="relative">
                            <select
                              value={formData.status}
                              onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                              className="w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-2.5 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-900 dark:text-white"
                            >
                              <option>Living</option>
                              <option>Deceased</option>
                              <option>Unknown</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-gray-500 text-lg pointer-events-none">expand_more</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Conditions / Diagnoses</label>
                        <textarea
                          rows={4}
                          value={formData.conditions}
                          onChange={(event) => setFormData({ ...formData, conditions: event.target.value })}
                          placeholder="List conditions (diabetes, cancer, hypertension, etc.)"
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-900 dark:text-white resize-none"
                        />
                        <div className="flex flex-wrap gap-2">
                          {['Diabetes', 'Heart Disease', 'Cancer', 'Stroke', 'Hypertension', 'Asthma'].map((condition) => (
                            <button
                              type="button"
                              key={condition}
                              onClick={() => appendCondition(condition)}
                              className="rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-semibold text-gray-500 hover:border-primary hover:text-primary transition-colors"
                            >
                              {condition}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Notes</label>
                        <textarea
                          rows={3}
                          value={formData.notes}
                          onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                          placeholder="Add any helpful context"
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-900 dark:text-white resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          checked={formData.unsure}
                          onChange={(event) => setFormData({ ...formData, unsure: event.target.checked })}
                          id="unsure-family"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="unsure-family" className="text-sm text-gray-500">Patient unsure about family details</label>
                      </div>
                      <button
                        onClick={handleSaveMember}
                        className="w-full rounded-lg bg-primary text-white py-2.5 font-semibold shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all"
                      >
                        {editingId ? 'Update Family Member' : 'Save Family Member'}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null)
                            setFormData({
                              relationship: '',
                              status: 'Living',
                              conditions: '',
                              notes: '',
                              unsure: false
                            })
                            PatientDataManager.clearDraft(patientId, draftKey)
                          }}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">Care team tips</h3>
                  <ul className="space-y-2 text-xs text-blue-800 dark:text-blue-300">
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-base">verified_user</span>
                      Ask about chronic conditions or genetic risks (heart disease, diabetes, cancer).
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-base">support_agent</span>
                      Encourage the patient to share unknowns, then verify later.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-base">event</span>
                      Update this list at annual visits or after new diagnoses.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
