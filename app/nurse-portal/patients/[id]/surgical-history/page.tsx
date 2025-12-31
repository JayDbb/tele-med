'use client'

import { useParams } from 'next/navigation'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { useEffect, useMemo, useState } from 'react'
import { PatientDataManager } from '@/utils/PatientDataManager'

export default function SurgicalHistoryPage() {
  const params = useParams()
  const patientId = params.id as string
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [surgeries, setSurgeries] = useState<any[]>([])
  const [notes, setNotes] = useState('')
  const [noKnownSurgeries, setNoKnownSurgeries] = useState(false)
  const draftKey = 'surgical-history-form'
  const [formData, setFormData] = useState({
    procedure: '',
    code: '',
    site: '',
    date: '',
    surgeon: '',
    facility: '',
    outcome: 'No Issues',
    status: 'Completed',
    indication: '',
    approach: '',
    implants: '',
    complications: '',
    summary: '',
    laterality: 'N/A',
    source: 'Patient Reported'
  })

  useEffect(() => {
    const section = PatientDataManager.getPatientSection(patientId, 'surgical-history')
    setSurgeries(Array.isArray(section?.items) ? section.items : [])
    setNotes(section?.notes || '')
    setNoKnownSurgeries(Boolean(section?.noKnownSurgeries))
  }, [patientId])

  useEffect(() => {
    const draft = PatientDataManager.getDraft(patientId, draftKey)
    if (draft?.data) {
      if (draft.data.formData) {
        setFormData((prev) => ({ ...prev, ...draft.data.formData }))
      }
      if (typeof draft.data.notes === 'string') {
        setNotes(draft.data.notes)
      }
    }
  }, [patientId])

  useEffect(() => {
    const timeout = setTimeout(() => {
      PatientDataManager.saveDraft(patientId, draftKey, {
        formData,
        notes
      })
    }, 400)
    return () => clearTimeout(timeout)
  }, [patientId, formData, notes])

  const saveSection = (nextItems: any[], nextNotes = notes, nextNoKnown = noKnownSurgeries) => {
    PatientDataManager.updatePatientSection(patientId, 'surgical-history', {
      items: nextItems,
      notes: nextNotes,
      noKnownSurgeries: nextNoKnown
    })
  }

  const handleAddSurgery = () => {
    if (!formData.procedure) return
    const now = new Date().toISOString()
    const entry = {
      id: Date.now().toString(),
      procedure: formData.procedure,
      code: formData.code,
      site: formData.site || formData.laterality,
      date: formData.date,
      surgeon: formData.surgeon || 'Not provided',
      facility: formData.facility || formData.source,
      outcome: formData.outcome,
      status: formData.status,
      icon: 'medical_services',
      iconBg: 'bg-blue-100 text-blue-600',
      indication: formData.indication,
      approach: formData.approach,
      implants: formData.implants,
      complications: formData.complications,
      summary: formData.summary,
      createdAt: now,
      updatedAt: now
    }
    const nextSurgeries = [entry, ...surgeries]
    setSurgeries(nextSurgeries)
    saveSection(nextSurgeries)
    setFormData((prev) => ({
      ...prev,
      procedure: '',
      code: '',
      site: '',
      date: '',
      surgeon: '',
      facility: '',
      indication: '',
      approach: '',
      implants: '',
      complications: '',
      summary: ''
    }))
  }

  const handleRemoveSurgery = (id: string) => {
    const nextSurgeries = surgeries.filter((surgery) => surgery.id !== id)
    setSurgeries(nextSurgeries)
    saveSection(nextSurgeries)
  }

  const handleToggleNoKnown = () => {
    const nextValue = !noKnownSurgeries
    setNoKnownSurgeries(nextValue)
    saveSection(surgeries, notes, nextValue)
  }

  const latestSurgery = surgeries[0]
  const latestUpdated = useMemo(() => {
    return surgeries
      .map((surgery) => surgery.updatedAt || surgery.createdAt)
      .filter(Boolean)
      .sort()
      .pop()
  }, [surgeries])

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
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Surgical History</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleToggleNoKnown}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 font-semibold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-700 dark:hover:text-gray-300 transition-all text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">block</span>
                  {noKnownSurgeries ? 'Surgeries Recorded' : 'No Known Surgeries'}
                </button>
                <button
                  onClick={() => {
                    const quickChart = document.getElementById('quick-chart-surgery')
                    quickChart?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Procedure
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">medical_services</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Surgeries</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{surgeries.length}</span>
                  <span className="text-xs text-slate-400 font-medium">Lifetime Procedures</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">event</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Most Recent</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {latestSurgery?.date || '—'}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-bold text-slate-900 dark:text-white truncate">
                    {latestSurgery?.procedure || 'No procedures yet'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-gray-400">
                    {latestSurgery?.site ? `${latestSurgery.site} • ` : ''}{latestSurgery?.surgeon || 'Not recorded'}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">flag</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Risk Flags</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300">
                    None
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-gray-400">No risk flags recorded.</div>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">Last Reviewed</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-lg font-bold text-blue-900 dark:text-blue-300">
                    {latestUpdated ? new Date(latestUpdated).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-blue-700 dark:text-blue-400">
                  <span>Updated from saved entries</span>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Surgical Procedures Table */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col">
                  <div className="p-5 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">format_list_bulleted</span>
                      <h3 className="font-bold text-slate-900 dark:text-white">Surgical Procedures</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-2 top-1.5 text-slate-400 text-[18px]">search</span>
                        <input 
                          className="pl-8 pr-3 py-1 text-xs border border-slate-200 dark:border-gray-600 rounded-md focus:border-primary focus:ring-0 text-slate-700 dark:text-gray-300 dark:bg-gray-700 w-48" 
                          placeholder="Filter procedures..." 
                          type="text"
                        />
                      </div>
                      <select className="text-xs border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md text-slate-600 font-medium focus:ring-primary focus:border-primary py-1">
                        <option>Sort: Newest First</option>
                        <option>Sort: Oldest First</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-slate-50 dark:bg-gray-700 border-b border-slate-200 dark:border-gray-600 px-4 py-2 grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1fr_1fr_50px] gap-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      <div>Procedure</div>
                      <div>Site</div>
                      <div>Date</div>
                      <div>Surgeon / Facility</div>
                      <div>Outcome</div>
                      <div>Status</div>
                      <div></div>
                    </div>

                    {/* Table Rows */}
                    {surgeries.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-slate-500 dark:text-gray-400">
                        No surgical procedures recorded yet.
                      </div>
                    ) : (
                      surgeries.map((surgery, index) => (
                        <div key={surgery.id} className={`group border-b border-slate-100 dark:border-gray-700 ${index === 0 ? 'bg-blue-50/30 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-gray-700'} transition-colors`}>
                          <div 
                            className="px-4 py-3 grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1fr_1fr_50px] gap-4 cursor-pointer"
                            onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`${surgery.iconBg || 'bg-blue-100 text-blue-600'} p-1.5 rounded`}>
                                <span className="material-symbols-outlined text-[18px]">{surgery.icon || 'medical_services'}</span>
                              </div>
                              <div>
                                <span className="block text-sm font-bold text-slate-900 dark:text-white">{surgery.procedure}</span>
                                <span className="block text-[10px] text-slate-500 dark:text-gray-400">{surgery.code || 'Not provided'}</span>
                              </div>
                            </div>
                            <div className="text-sm text-slate-700 dark:text-gray-300 font-medium">{surgery.site || 'Not provided'}</div>
                            <div className="text-sm text-slate-700 dark:text-gray-300">{surgery.date || 'Not provided'}</div>
                            <div className="text-xs text-slate-500 dark:text-gray-400">
                              <span className="block font-medium text-slate-700 dark:text-gray-300">{surgery.surgeon || 'Not provided'}</span>
                              {surgery.facility || 'Not provided'}
                            </div>
                            <div>
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                                surgery.outcome === 'No Issues' 
                                  ? 'text-green-700 bg-green-50 dark:bg-green-900/40 dark:text-green-300' 
                                  : 'text-amber-700 bg-amber-50 dark:bg-amber-900/40 dark:text-amber-300'
                              }`}>
                                <span className="material-symbols-outlined text-[14px]">
                                  {surgery.outcome === 'No Issues' ? 'check' : 'info'}
                                </span>
                                {surgery.outcome || 'Not provided'}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-600 dark:text-gray-400">{surgery.status || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleRemoveSurgery(surgery.id)
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                              <span className="material-symbols-outlined text-slate-400">
                                {expandedRow === index ? 'expand_less' : 'expand_more'}
                              </span>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {expandedRow === index && (surgery.indication || surgery.approach || surgery.implants || surgery.complications || surgery.summary) && (
                            <div className="border-t border-slate-200/60 dark:border-gray-600 px-4 py-4 bg-white dark:bg-gray-800 mx-4 mb-4 mt-0 rounded-b-lg shadow-sm">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Indication</span>
                                    <p className="text-sm text-slate-800 dark:text-gray-200 font-medium">{surgery.indication || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Approach</span>
                                    <p className="text-sm text-slate-800 dark:text-gray-200">{surgery.approach || 'Not provided'}</p>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Implants Placed</span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="material-symbols-outlined text-slate-400 text-sm">hardware</span>
                                      <span className="text-sm text-primary font-bold hover:underline cursor-pointer">{surgery.implants || 'None recorded'}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Complications</span>
                                    <p className="text-sm text-slate-500 dark:text-gray-400 italic">{surgery.complications || 'None recorded'}</p>
                                  </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-gray-700 p-3 rounded border border-slate-100 dark:border-gray-600">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Post-Op Summary</span>
                                  <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">{surgery.summary || 'No summary recorded.'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* External Records */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-500 text-[18px]">cloud_sync</span>
                      External & Patient-Reported Records
                    </h3>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-gray-700 text-xs text-slate-600 dark:text-gray-400 rounded font-medium">No records</span>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-gray-400">
                    No external records uploaded yet.
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Implants & Devices */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/20 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">pacemaker</span>
                      Implants & Devices
                    </h3>
                    <span className="material-symbols-outlined text-blue-300 text-lg">radiology</span>
                  </div>
                  <div className="p-4 text-sm text-slate-500 dark:text-gray-400">No implants recorded.</div>
                </div>

                {/* Clinical Impact & Alerts */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                  <div className="p-4 border-b border-slate-100 dark:border-gray-700">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">psychology</span>
                      Clinical Impact & Alerts
                    </h3>
                  </div>
                  <div className="p-4 text-sm text-slate-500 dark:text-gray-400">
                    No clinical alerts recorded.
                  </div>
                </div>

                {/* Quick Chart Surgery */}
                <div id="quick-chart-surgery" className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
                  <div className="p-4 border-b border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-700">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">edit_square</span>
                      Quick Chart Surgery
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Procedure</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-2 top-2 text-slate-400 text-sm">search</span>
                        <input 
                          value={formData.procedure}
                          onChange={(event) => setFormData((prev) => ({ ...prev, procedure: event.target.value }))}
                          className="w-full pl-8 py-1.5 text-sm border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded focus:border-primary focus:ring-primary placeholder:text-slate-300 dark:placeholder:text-gray-500" 
                          placeholder="e.g. Appendectomy" 
                          type="text"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Date / Year</label>
                        <input 
                          value={formData.date}
                          onChange={(event) => setFormData((prev) => ({ ...prev, date: event.target.value }))}
                          className="w-full py-1.5 text-sm border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded focus:border-primary focus:ring-primary" 
                          placeholder="YYYY" 
                          type="text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Laterality</label>
                        <select
                          value={formData.laterality}
                          onChange={(event) => setFormData((prev) => ({ ...prev, laterality: event.target.value }))}
                          className="w-full py-1.5 text-sm border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded focus:border-primary focus:ring-primary text-slate-600"
                        >
                          <option>N/A</option>
                          <option>Left</option>
                          <option>Right</option>
                          <option>Bilateral</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">Source</label>
                      <select
                        value={formData.source}
                        onChange={(event) => setFormData((prev) => ({ ...prev, source: event.target.value }))}
                        className="w-full py-1.5 text-sm border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded focus:border-primary focus:ring-primary text-slate-600"
                      >
                        <option>Patient Reported</option>
                        <option>External Records</option>
                        <option>Clinician Confirmed</option>
                      </select>
                    </div>
                    <button
                      onClick={handleAddSurgery}
                      className="w-full py-2 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-xs font-bold rounded border border-slate-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-600 hover:text-primary hover:border-primary transition-all mt-2"
                    >
                      Save Entry
                    </button>
                  </div>
                </div>

                {/* Surgical Timeline Notes */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col flex-1 min-h-[150px]">
                  <div className="p-3 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-500 text-[18px]">notes</span>
                      Surgical Timeline Notes
                    </h3>
                    <span className="text-[10px] text-slate-400">Last: {latestUpdated ? new Date(latestUpdated).toLocaleDateString() : '—'}</span>
                  </div>
                  <div className="p-4 flex-1">
                    <textarea 
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="w-full h-full min-h-[80px] resize-none text-sm text-slate-700 dark:text-gray-300 border-0 focus:ring-0 p-0 bg-transparent placeholder-slate-300 dark:placeholder-gray-500 leading-relaxed" 
                      placeholder="Add surgical history context..."
                    />
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-gray-700 flex justify-end">
                    <button
                      onClick={() => saveSection(surgeries, notes, noKnownSurgeries)}
                      className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 text-xs font-bold rounded shadow hover:bg-slate-50 dark:hover:bg-gray-600 transition"
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
    </div>
  )
}
