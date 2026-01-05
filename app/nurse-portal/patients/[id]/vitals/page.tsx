'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { getPatient, getVitals, createVitals } from '@/lib/api'

export default function PatientVitalsPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  const [patient, setPatient] = useState<any>(null)
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const latestVitals = vitalsHistory[0]
  const bpValue = latestVitals?.bp || '--'
  const hrValue = latestVitals?.hr || '--'
  const tempValue = latestVitals?.temp ? `${latestVitals.temp}` : '--'
  const weightValue = latestVitals?.weight ? `${latestVitals.weight}` : '--'
  const [vitals, setVitals] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    spo2: '',
    notes: ''
  })
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportMethod, setExportMethod] = useState<'email' | 'text'>('email')
  const [exportEmail, setExportEmail] = useState('')
  const [exportPhone, setExportPhone] = useState('')
  const [exportStatus, setExportStatus] = useState('')

  useEffect(() => {
    loadData()
  }, [patientId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [patientData, vitalsData] = await Promise.all([
        getPatient(patientId).then(res => res.patient),
        getVitals(patientId)
      ])
      setPatient(patientData)
      setVitalsHistory(vitalsData || [])
      setExportEmail(patientData?.email || '')
      setExportPhone(patientData?.phone || '')
    } catch (err: any) {
      console.error('Error loading data:', err)
      setError(err?.message || 'Failed to load patient data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveVitals = async () => {
    if (!vitals.systolic || !vitals.diastolic || !vitals.heartRate) {
      setError('Please fill in at least BP (systolic and diastolic) and heart rate')
      return
    }

    try {
      setSaving(true)
      setError(null)
      const bp = `${vitals.systolic}/${vitals.diastolic}`
      await createVitals(patientId, {
        bp,
        hr: vitals.heartRate,
        temp: vitals.spo2 ? undefined : undefined, // SpO2 is not a standard vital in our API
        weight: undefined,
      })
      // Reload vitals after saving
      const updatedVitals = await getVitals(patientId)
      setVitalsHistory(updatedVitals || [])
      setVitals({ systolic: '', diastolic: '', heartRate: '', spo2: '', notes: '' })
    } catch (err: any) {
      console.error('Error saving vitals:', err)
      setError(err?.message || 'Failed to save vitals')
    } finally {
      setSaving(false)
    }
  }

  const downloadVitalsReport = () => {
    const rows = [
      ['Recorded At', 'Blood Pressure', 'Heart Rate', 'Temperature', 'Weight'],
      ...vitalsHistory.map((item) => [
        item.recordedAt ? new Date(item.recordedAt).toLocaleString() : '',
        item.bp || '',
        item.hr || '',
        item.temp ? `${item.temp}°F` : '',
        item.weight ? `${item.weight} lbs` : ''
      ])
    ]
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${patient?.full_name || 'patient'}-vitals-report.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleSendExport = async () => {
    const destination = exportMethod === 'email' ? exportEmail : exportPhone
    if (!destination) {
      setExportStatus('Add a destination before sending.')
      return
    }
    // For now, just show a success message
    // In the future, this could call an API endpoint to send the export
    setExportStatus(`Export would be sent via ${exportMethod === 'email' ? 'email' : 'text'} to ${destination}.`)
    setTimeout(() => {
      setExportStatus('')
      setShowExportModal(false)
    }, 2500)
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
          <div className="w-full flex flex-col gap-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Vitals Management</h2>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Export Report
                    </button>
                    <button
                      onClick={() => router.push(`/patients/${patientId}/vitals/new`)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Add Vitals
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                        <span className="text-xs font-semibold uppercase tracking-wider">BP</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {latestVitals?.bp ? 'Recorded' : 'Not recorded'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{bpValue}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">mmHg</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                      <span className="material-symbols-outlined text-[12px]">airline_seat_recline_normal</span>
                      <span>Not recorded</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-[18px]">ecg_heart</span>
                        <span className="text-xs font-semibold uppercase tracking-wider">HR</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {latestVitals?.hr ? 'Recorded' : 'Not recorded'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{hrValue}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">bpm</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-[11px] font-medium">
                      <span className="material-symbols-outlined text-[12px]">trending_flat</span>
                      <span>No trend data</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-[18px]">pulmonology</span>
                        <span className="text-xs font-semibold uppercase tracking-wider">Resp</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        Not recorded
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">--</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">rpm</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                      <span>Not recorded</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-[18px]">spo2</span>
                        <span className="text-xs font-semibold uppercase tracking-wider">SpO₂</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        Not recorded
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">--</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">%</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                      <span>Not recorded</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-[18px]">thermometer</span>
                        <span className="text-xs font-semibold uppercase tracking-wider">Temp</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {latestVitals?.temp ? 'Recorded' : 'Not recorded'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{tempValue}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">°F</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                      <span>Not recorded</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-[18px]">monitor_weight</span>
                        <span className="text-xs font-semibold uppercase tracking-wider">BMI</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        Not recorded
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">--</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">kg/m²</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                      <span>{weightValue !== '--' ? `${weightValue} lbs` : 'Not recorded'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm text-primary shrink-0">
                        <span className="material-symbols-outlined text-xl">auto_awesome</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Clinical Insights</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          No automated insights available yet. Add more vitals to enable trend analysis.
                        </p>
                      </div>
                      <button className="ml-auto text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-[400px]">
                      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-white">Blood Pressure Trends</h3>
                          <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">Systolic & Diastolic</span>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex items-center">
                          <button className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md">Today</button>
                          <button className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md">7D</button>
                          <button className="px-3 py-1 text-xs font-semibold bg-white dark:bg-gray-700 text-primary shadow-sm rounded-md">30D</button>
                          <button className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md">6M</button>
                        </div>
                      </div>
                      <div className="flex-1 p-6 flex items-center justify-center">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <span className="material-symbols-outlined text-4xl mb-2 block">show_chart</span>
                          <p className="text-sm">Chart visualization would be rendered here</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full">
                      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white">Fast Record</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Enter current vitals quickly</p>
                      </div>
                      <div className="p-4 flex flex-col gap-4 flex-1">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Systolic</label>
                            <input
                              value={vitals.systolic}
                              onChange={(e) => setVitals({ ...vitals, systolic: e.target.value })}
                              className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                              placeholder="120"
                              type="number"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Diastolic</label>
                            <input
                              value={vitals.diastolic}
                              onChange={(e) => setVitals({ ...vitals, diastolic: e.target.value })}
                              className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                              placeholder="80"
                              type="number"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Heart Rate</label>
                            <div className="relative">
                              <input
                                value={vitals.heartRate}
                                onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                                className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary pr-8 text-gray-900 dark:text-white"
                                placeholder="72"
                                type="number"
                              />
                              <span className="absolute right-2 top-2 text-[10px] text-gray-400 dark:text-gray-500">bpm</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">SpO₂</label>
                            <div className="relative">
                              <input
                                value={vitals.spo2}
                                onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                                className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary pr-6 text-gray-900 dark:text-white"
                                placeholder="98"
                                type="number"
                              />
                              <span className="absolute right-2 top-2 text-[10px] text-gray-400 dark:text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Quick Note</label>
                          <textarea
                            value={vitals.notes}
                            onChange={(e) => setVitals({ ...vitals, notes: e.target.value })}
                            className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary resize-none text-gray-900 dark:text-white"
                            placeholder="e.g. Patient anxious..."
                            rows={2}
                          ></textarea>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400 transition">Post-exercise</button>
                          <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400 transition">Sitting</button>
                          <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400 transition">Lying</button>
                        </div>
                        <div className="mt-auto pt-4">
                          <button
                            onClick={handleSaveVitals}
                            disabled={saving}
                            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-sm">save</span>
                                Save Vitals
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Detailed History</h3>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-2 top-1.5 text-gray-400 dark:text-gray-500 text-lg">filter_list</span>
                        <select className="pl-8 pr-8 py-1.5 rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400 focus:ring-0 focus:border-gray-300 dark:focus:border-gray-500">
                          <option>All Vitals</option>
                          <option>Abnormal Only</option>
                          <option>Clinician Only</option>
                        </select>
                      </div>
                      <button className="p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="material-symbols-outlined text-lg">print</span>
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                          <th className="px-6 py-3">Date & Time</th>
                          <th className="px-6 py-3">BP (mmHg)</th>
                          <th className="px-6 py-3">HR (bpm)</th>
                          <th className="px-6 py-3">RR (rpm)</th>
                          <th className="px-6 py-3">Temp (°C)</th>
                          <th className="px-6 py-3">SpO₂ (%)</th>
                          <th className="px-6 py-3">Source</th>
                          <th className="px-6 py-3">Recorded By</th>
                          <th className="px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm text-gray-700 dark:text-gray-300">
                        {vitalsHistory.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                              No vitals records found. Add vitals to see them here.
                            </td>
                          </tr>
                        ) : (
                          vitalsHistory.map((record) => {
                            const date = new Date(record.recordedAt)
                            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                            return (
                              <tr key={record.visit_id || record.recordedAt} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900 dark:text-white">{formattedDate}</div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500">{formattedTime}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="font-bold text-gray-900 dark:text-white">{record.bp || '--'}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-gray-900 dark:text-white">{record.hr || '--'}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">--</td>
                                <td className="px-6 py-4 whitespace-nowrap">{record.temp ? `${record.temp}°F` : '--'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">--</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 w-fit">
                                    <span className="material-symbols-outlined text-sm text-gray-500 dark:text-gray-400">medical_services</span>
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Clinical</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Visit</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button className="text-gray-400 dark:text-gray-500 hover:text-primary transition">
                                    <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                  </button>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Showing {vitalsHistory.length} record{vitalsHistory.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Export Vitals Report</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Download or send to the patient.</p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={downloadVitalsReport}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90"
                >
                  Download CSV
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                  Includes latest vitals history
                </span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Send to Patient</p>
                <div className="flex gap-3 mb-3">
                  <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer ${exportMethod === 'email'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                    <input
                      type="radio"
                      name="export-method"
                      value="email"
                      checked={exportMethod === 'email'}
                      onChange={() => setExportMethod('email')}
                      className="sr-only"
                    />
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                    Email
                  </label>
                  <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer ${exportMethod === 'text'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                    <input
                      type="radio"
                      name="export-method"
                      value="text"
                      checked={exportMethod === 'text'}
                      onChange={() => setExportMethod('text')}
                      className="sr-only"
                    />
                    <span className="material-symbols-outlined text-[16px]">sms</span>
                    Text
                  </label>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className={`rounded-lg border px-3 py-2 ${exportMethod === 'email'
                    ? 'border-primary/60 bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700'
                    }`}>
                    <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      value={exportEmail}
                      onChange={(event) => setExportEmail(event.target.value)}
                      placeholder="patient@email.com"
                      className="w-full bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className={`rounded-lg border px-3 py-2 ${exportMethod === 'text'
                    ? 'border-primary/60 bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700'
                    }`}>
                    <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Phone</label>
                    <input
                      type="tel"
                      value={exportPhone}
                      onChange={(event) => setExportPhone(event.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
                {exportStatus && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">{exportStatus}</p>
                )}
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSendExport}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90"
                  >
                    Send Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
