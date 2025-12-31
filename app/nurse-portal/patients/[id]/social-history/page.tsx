'use client'

import { useParams } from 'next/navigation'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { useEffect, useState } from 'react'
import { PatientDataManager } from '@/utils/PatientDataManager'

const emptySocialHistory = {
  riskFlags: [] as string[],
  tobaccoStatus: '',
  tobaccoAmount: '',
  tobaccoType: '',
  tobaccoDuration: '',
  tobaccoPackYears: '',
  tobaccoNote: '',
  alcoholStatus: '',
  alcoholFrequency: '',
  alcoholAuditScore: '',
  housingStatus: '',
  housingDetail: '',
  confidenceLevel: '',
  confidenceNote: '',
  occupationTitle: '',
  occupationNotes: '',
  livingSituation: '',
  livingTags: '' as string | string[],
  activityLevel: '',
  dietQuality: '',
  exerciseHabits: '',
  sleep: '',
  stress: '',
  supportStatus: '',
  supportNotes: '',
  financialStatus: '',
  financialNotes: '',
  transportationStatus: '',
  transportationNotes: '',
  otherSubstanceName: '',
  otherSubstanceFrequency: '',
  otherSubstanceNotes: '',
  screenings: [] as Array<{ name: string; category: string; date: string; score: string; severity: string }>,
  sexualStatus: '',
  sexualPartners: '',
  sexualContraception: '',
  sexualStiHistory: '',
  clinicianNotes: ''
}

export default function PatientSocialHistoryPage() {
  const params = useParams()
  const patientId = params.id as string
  const [socialHistory, setSocialHistory] = useState(emptySocialHistory)
  const [showEditModal, setShowEditModal] = useState(false)
  const draftKey = 'social-history'

  useEffect(() => {
    const section = PatientDataManager.getPatientSection(patientId, 'social-history')
    if (section) {
      setSocialHistory({ ...emptySocialHistory, ...section })
    }
  }, [patientId])

  useEffect(() => {
    const draft = PatientDataManager.getDraft(patientId, draftKey)
    if (draft?.data) {
      setSocialHistory({ ...emptySocialHistory, ...draft.data })
    }
  }, [patientId])

  useEffect(() => {
    const timeout = setTimeout(() => {
      PatientDataManager.saveDraft(patientId, draftKey, socialHistory)
    }, 400)
    return () => clearTimeout(timeout)
  }, [patientId, socialHistory])

  const handleSave = (nextData: typeof emptySocialHistory) => {
    setSocialHistory(nextData)
    PatientDataManager.updatePatientSection(patientId, 'social-history', nextData)
  }

  const riskFlags = socialHistory.riskFlags || []
  const livingTags = Array.isArray(socialHistory.livingTags)
    ? socialHistory.livingTags
    : `${socialHistory.livingTags || ''}`.split(',').map((tag) => tag.trim()).filter(Boolean)
  const screenings = socialHistory.screenings || []

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
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Social History</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  View Trends
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm"
                >
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
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    {riskFlags.length ? `${riskFlags.length} Active` : 'None'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mb-1">
                  {riskFlags.length === 0 ? (
                    <span className="text-sm text-gray-500 dark:text-gray-400">No active flags</span>
                  ) : (
                    riskFlags.slice(0, 2).map((flag) => (
                      <div key={flag} className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-red-500"></span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{flag}</span>
                      </div>
                    ))
                  )}
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
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{socialHistory.tobaccoStatus || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                  <span>{socialHistory.tobaccoAmount || 'No amount recorded'}</span>
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
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{socialHistory.alcoholStatus || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                  <span>{socialHistory.alcoholFrequency || 'No frequency recorded'}</span>
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
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{socialHistory.housingStatus || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                  <span>{socialHistory.housingDetail || 'No details recorded'}</span>
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
                  <span className="text-lg font-bold text-blue-900 dark:text-blue-300">{socialHistory.confidenceLevel || 'Not verified'}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-blue-700 dark:text-blue-300">
                  <span>{socialHistory.confidenceNote || 'No verification notes.'}</span>
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
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                          {socialHistory.tobaccoStatus || 'Not provided'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm border-b border-gray-50 dark:border-gray-800 pb-1">
                          <span className="text-gray-500 dark:text-gray-400">Type</span>
                          <span className="font-medium text-gray-900 dark:text-white">{socialHistory.tobaccoType || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between text-sm border-b border-gray-50 dark:border-gray-800 pb-1">
                          <span className="text-gray-500 dark:text-gray-400">Amount</span>
                          <span className="font-medium text-gray-900 dark:text-white">{socialHistory.tobaccoAmount || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between text-sm border-b border-gray-50 dark:border-gray-800 pb-1">
                          <span className="text-gray-500 dark:text-gray-400">Duration</span>
                          <span className="font-medium text-gray-900 dark:text-white">{socialHistory.tobaccoDuration || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between text-sm pb-1">
                          <span className="text-gray-500 dark:text-gray-400">Pack Years</span>
                          <span className="font-medium text-gray-900 dark:text-white">{socialHistory.tobaccoPackYears || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs text-gray-600 dark:text-gray-400 italic">
                        <span className="font-semibold not-italic">Note:</span> {socialHistory.tobaccoNote || 'No tobacco notes recorded.'}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Alcohol</h4>
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            {socialHistory.alcoholStatus || 'Not provided'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Frequency</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{socialHistory.alcoholFrequency || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">AUDIT-C Score</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{socialHistory.alcoholAuditScore || 'Not provided'}</p>
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
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{socialHistory.otherSubstanceName || 'None recorded'}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{socialHistory.otherSubstanceFrequency || ''}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{socialHistory.otherSubstanceNotes || 'No notes recorded.'}</p>
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
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{socialHistory.occupationTitle || 'Not provided'}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{socialHistory.occupationNotes || 'No occupation notes recorded.'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 pt-4 border-t border-gray-50 dark:border-gray-800">
                        <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                          <span className="material-symbols-outlined text-lg">house</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Living Situation</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{socialHistory.livingSituation || 'Not provided'}</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {livingTags.length === 0 ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">No tags</span>
                            ) : (
                              livingTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                >
                                  {tag}
                                </span>
                              ))
                            )}
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
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{socialHistory.activityLevel || 'Not provided'}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Diet Quality</p>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm">fastfood</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{socialHistory.dietQuality || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Exercise Habits</p>
                        <p className="text-sm text-gray-900 dark:text-white">{socialHistory.exerciseHabits || 'No exercise habits recorded.'}</p>
                      </div>
                      <div className="pt-2 border-t border-gray-50 dark:border-gray-800 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sleep</p>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                            {socialHistory.sleep || 'Not provided'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stress</p>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                            {socialHistory.stress || 'Not provided'}
                          </span>
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
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{socialHistory.supportStatus || 'Not provided'}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{socialHistory.supportNotes || 'No support notes.'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Financial Strain</p>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">attach_money</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{socialHistory.financialStatus || 'Not provided'}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{socialHistory.financialNotes || 'No financial notes.'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Transportation</p>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400">directions_car</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{socialHistory.transportationStatus || 'Not provided'}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{socialHistory.transportationNotes || 'No transportation notes.'}</p>
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
                    {screenings.length === 0 ? (
                      <div className="p-3 text-xs text-gray-500 dark:text-gray-400">No screenings recorded.</div>
                    ) : (
                      screenings.map((screening) => (
                        <div key={`${screening.name}-${screening.date}`} className="p-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{screening.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{screening.category} • {screening.date}</p>
                          </div>
                          <div className="text-right">
                            <span className="block text-sm font-bold text-amber-600 dark:text-amber-400">{screening.score}</span>
                            <span className="block text-[10px] text-amber-700 dark:text-amber-300 font-medium">{screening.severity}</span>
                          </div>
                        </div>
                      ))
                    )}
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
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{socialHistory.sexualStatus || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Partners</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{socialHistory.sexualPartners || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Contraception</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{socialHistory.sexualContraception || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">STI History</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{socialHistory.sexualStiHistory || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col flex-1 min-h-[200px]">
                  <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[18px]">notes</span>
                      Clinician Notes
                    </h3>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Last: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="p-4 flex-1">
                    <textarea
                      value={socialHistory.clinicianNotes}
                      onChange={(event) => setSocialHistory((prev) => ({ ...prev, clinicianNotes: event.target.value }))}
                      className="w-full h-full min-h-[120px] resize-none text-sm text-gray-700 dark:text-gray-300 border-0 focus:ring-0 p-0 bg-transparent placeholder-gray-300 dark:placeholder-gray-600 leading-relaxed"
                      placeholder="Add social history notes here..."
                    ></textarea>
                  </div>
                  <div className="p-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button
                      onClick={() => handleSave(socialHistory)}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded shadow hover:bg-blue-600 transition"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showEditModal && (
        <SocialHistoryModal
          initialData={socialHistory}
          patientId={patientId}
          onClose={() => setShowEditModal(false)}
          onSave={(nextData) => {
            handleSave(nextData)
            setShowEditModal(false)
          }}
        />
      )}
    </div>
  )
}

function SocialHistoryModal({
  initialData,
  patientId,
  onClose,
  onSave
}: {
  initialData: typeof emptySocialHistory
  patientId: string
  onClose: () => void
  onSave: (data: typeof emptySocialHistory) => void
}) {
  const [formData, setFormData] = useState({
    ...emptySocialHistory,
    ...initialData,
    screenings: initialData.screenings?.length ? initialData.screenings : []
  })
  const draftKey = 'social-history-form'
  const livingTags = Array.isArray(formData.livingTags)
    ? formData.livingTags
    : `${formData.livingTags || ''}`.split(',').map((tag) => tag.trim()).filter(Boolean)

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

  const updateField = (key: keyof typeof emptySocialHistory, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleScreeningChange = (index: number, key: string, value: string) => {
    const next = [...(formData.screenings || [])]
    next[index] = { ...next[index], [key]: value }
    updateField('screenings', next)
  }

  const addScreening = () => {
    updateField('screenings', [
      ...(formData.screenings || []),
      { name: '', category: '', date: '', score: '', severity: '' }
    ])
  }

  const removeScreening = (index: number) => {
    const next = [...(formData.screenings || [])]
    next.splice(index, 1)
    updateField('screenings', next)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Update Social History</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Risk Flags (comma-separated)</label>
              <input
                value={(formData.riskFlags || []).join(', ')}
                onChange={(event) => updateField('riskFlags', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                placeholder="e.g. Tobacco Use, High Stress"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Confidence</label>
              <input
                value={formData.confidenceLevel}
                onChange={(event) => updateField('confidenceLevel', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                placeholder="High, Medium, Low"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Tobacco Status</label>
              <input
                value={formData.tobaccoStatus}
                onChange={(event) => updateField('tobaccoStatus', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Tobacco Amount</label>
              <input
                value={formData.tobaccoAmount}
                onChange={(event) => updateField('tobaccoAmount', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Alcohol Status</label>
              <input
                value={formData.alcoholStatus}
                onChange={(event) => updateField('alcoholStatus', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Alcohol Frequency</label>
              <input
                value={formData.alcoholFrequency}
                onChange={(event) => updateField('alcoholFrequency', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Housing Status</label>
              <input
                value={formData.housingStatus}
                onChange={(event) => updateField('housingStatus', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Housing Detail</label>
              <input
                value={formData.housingDetail}
                onChange={(event) => updateField('housingDetail', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Occupation</label>
              <input
                value={formData.occupationTitle}
                onChange={(event) => updateField('occupationTitle', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Living Situation</label>
              <input
                value={formData.livingSituation}
                onChange={(event) => updateField('livingSituation', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Living Tags (comma-separated)</label>
            <input
              value={livingTags.join(', ')}
              onChange={(event) => updateField('livingTags', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Activity Level</label>
              <input
                value={formData.activityLevel}
                onChange={(event) => updateField('activityLevel', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Diet Quality</label>
              <input
                value={formData.dietQuality}
                onChange={(event) => updateField('dietQuality', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Exercise Habits</label>
            <input
              value={formData.exerciseHabits}
              onChange={(event) => updateField('exerciseHabits', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Sleep</label>
              <input
                value={formData.sleep}
                onChange={(event) => updateField('sleep', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Stress</label>
              <input
                value={formData.stress}
                onChange={(event) => updateField('stress', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Support Status</label>
              <input
                value={formData.supportStatus}
                onChange={(event) => updateField('supportStatus', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Financial Status</label>
              <input
                value={formData.financialStatus}
                onChange={(event) => updateField('financialStatus', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Transportation Status</label>
              <input
                value={formData.transportationStatus}
                onChange={(event) => updateField('transportationStatus', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Other Substance Name</label>
            <input
              value={formData.otherSubstanceName}
              onChange={(event) => updateField('otherSubstanceName', event.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Other Substance Frequency</label>
              <input
                value={formData.otherSubstanceFrequency}
                onChange={(event) => updateField('otherSubstanceFrequency', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Other Substance Notes</label>
              <input
                value={formData.otherSubstanceNotes}
                onChange={(event) => updateField('otherSubstanceNotes', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Screenings</label>
              <button
                type="button"
                onClick={addScreening}
                className="text-xs font-semibold text-primary hover:underline"
              >
                + Add Screening
              </button>
            </div>
            <div className="space-y-3">
              {(formData.screenings || []).map((screening, index) => (
                <div key={`screening-${index}`} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <input
                    value={screening.name}
                    onChange={(event) => handleScreeningChange(index, 'name', event.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                    placeholder="Name"
                  />
                  <input
                    value={screening.category}
                    onChange={(event) => handleScreeningChange(index, 'category', event.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                    placeholder="Category"
                  />
                  <input
                    value={screening.date}
                    onChange={(event) => handleScreeningChange(index, 'date', event.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                    placeholder="Date"
                  />
                  <input
                    value={screening.score}
                    onChange={(event) => handleScreeningChange(index, 'score', event.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                    placeholder="Score"
                  />
                  <div className="flex gap-2">
                    <input
                      value={screening.severity}
                      onChange={(event) => handleScreeningChange(index, 'severity', event.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                      placeholder="Severity"
                    />
                    <button
                      type="button"
                      onClick={() => removeScreening(index)}
                      className="px-2 py-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}
              {(formData.screenings || []).length === 0 && (
                <div className="text-xs text-slate-500 dark:text-gray-400">No screenings added.</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Sexual Health Status</label>
              <input
                value={formData.sexualStatus}
                onChange={(event) => updateField('sexualStatus', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Partners</label>
              <input
                value={formData.sexualPartners}
                onChange={(event) => updateField('sexualPartners', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Contraception</label>
              <input
                value={formData.sexualContraception}
                onChange={(event) => updateField('sexualContraception', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">STI History</label>
              <input
                value={formData.sexualStiHistory}
                onChange={(event) => updateField('sexualStiHistory', event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Clinician Notes</label>
            <textarea
              value={formData.clinicianNotes}
              onChange={(event) => updateField('clinicianNotes', event.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
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
            onClick={() => {
              PatientDataManager.clearDraft(patientId, draftKey)
              onSave(formData)
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
          >
            Save Social History
          </button>
        </div>
      </div>
    </div>
  )
}
