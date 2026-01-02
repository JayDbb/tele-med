'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { getPatient, getVitals } from '@/lib/api'

type VitalsRecord = {
  visit_id: string
  recordedAt: string
  bp: string | null
  hr: number | null
  temp: number | null
  weight: number | null
}

export default function PatientVitalsPage() {
  const params = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [vitalsHistory, setVitalsHistory] = useState<VitalsRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        const patientId = params.id as string

        // Load patient data
        const { patient: patientData } = await getPatient(patientId)
        setPatient(patientData)

        // Load vitals data
        const vitals = await getVitals(patientId)
        setVitalsHistory(vitals || [])
      } catch (err: any) {
        console.error('Failed to load data:', err)
        setError(err?.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadData()
    }
  }, [params.id])

  // Get latest vitals
  const latestVitals = vitalsHistory.length > 0
    ? vitalsHistory.reduce((latest, current) => {
      if (!latest?.recordedAt) return current
      if (!current?.recordedAt) return latest
      return new Date(current.recordedAt).getTime() > new Date(latest.recordedAt).getTime() ? current : latest
    }, vitalsHistory[0])
    : null

  // Calculate trend for a vital
  const calculateTrend = (vitalKey: 'bp' | 'hr' | 'temp' | 'weight') => {
    if (vitalsHistory.length < 2) return { trend: null, change: null }

    const filtered = vitalsHistory
      .filter((v) => v[vitalKey] !== null && v[vitalKey] !== undefined)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())

    if (filtered.length < 2) return { trend: null, change: null }

    const latest = filtered[filtered.length - 1]
    const previous = filtered[filtered.length - 2]

    let latestValue: number
    let previousValue: number

    if (vitalKey === 'bp') {
      const latestMatch = latest.bp?.match(/(\d+)/)
      const prevMatch = previous.bp?.match(/(\d+)/)
      if (!latestMatch || !prevMatch) return { trend: null, change: null }
      latestValue = parseFloat(latestMatch[1])
      previousValue = parseFloat(prevMatch[1])
    } else {
      latestValue = (latest[vitalKey] as number) || 0
      previousValue = (previous[vitalKey] as number) || 0
    }

    const diff = latestValue - previousValue

    if (vitalKey === 'bp') {
      return {
        trend: diff > 0 ? 'up' : diff < 0 ? 'down' : null,
        change: diff !== 0 ? `${diff > 0 ? '+' : ''}${diff.toFixed(0)}` : null
      }
    } else if (vitalKey === 'hr') {
      return {
        trend: diff > 0 ? 'up' : diff < 0 ? 'down' : null,
        change: diff !== 0 ? `${diff > 0 ? '+' : ''}${diff.toFixed(0)}` : null
      }
    }

    return { trend: null, change: null }
  }

  // Determine status for BP
  const getBPStatus = (bp: string | null) => {
    if (!bp) return { status: 'Unknown', color: 'gray' }
    const match = bp.match(/(\d+)\/(\d+)/)
    if (!match) return { status: 'Unknown', color: 'gray' }
    const systolic = parseInt(match[1])
    const diastolic = parseInt(match[2])

    if (systolic < 120 && diastolic < 80) return { status: 'Normal', color: 'green' }
    if (systolic < 130 && diastolic < 80) return { status: 'Elevated', color: 'amber' }
    if (systolic < 140 || diastolic < 90) return { status: 'High Stage 1', color: 'orange' }
    if (systolic < 180 || diastolic < 120) return { status: 'High Stage 2', color: 'red' }
    return { status: 'Crisis', color: 'red' }
  }

  // Determine status for HR
  const getHRStatus = (hr: number | null) => {
    if (!hr) return { status: 'Unknown', color: 'gray' }
    if (hr >= 60 && hr <= 100) return { status: 'Normal', color: 'green' }
    if (hr > 100) return { status: 'Elevated', color: 'amber' }
    return { status: 'Low', color: 'amber' }
  }

  // Determine status for Temp (assuming Fahrenheit input, converting to Celsius)
  const getTempStatus = (temp: number | null) => {
    if (!temp) return { status: 'Unknown', color: 'gray' }
    // Convert Fahrenheit to Celsius
    const tempC = (temp - 32) * 5 / 9
    if (tempC >= 36.1 && tempC <= 37.2) return { status: 'Normal', color: 'green' }
    if (tempC > 37.2) return { status: 'Elevated', color: 'amber' }
    return { status: 'Low', color: 'amber' }
  }

  // Convert Fahrenheit to Celsius
  const fahrenheitToCelsius = (f: number | null) => {
    if (!f) return null
    return ((f - 32) * 5 / 9).toFixed(1)
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return { date: 'N/A', time: '' }
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return { date: 'N/A', time: '' }
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }
  }

  const hrTrend = calculateTrend('hr')
  const bpStatus = getBPStatus(latestVitals?.bp || null)
  const hrStatus = getHRStatus(latestVitals?.hr || null)
  const tempStatus = getTempStatus(latestVitals?.temp || null)

  return (
    <div className="flex h-screen w-full overflow-hidden">
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
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading vitals...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl text-red-400 mb-2 block">error</span>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">Patients</span>
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm">chevron_right</span>
                    <span className="text-primary text-sm font-medium">{patient?.full_name || 'Unknown Patient'}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Vitals Management</h2>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Export Report
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all text-sm">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Vitals
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Blood Pressure */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <span className="material-symbols-outlined text-[18px]">favorite</span>
                      <span className="text-xs font-semibold uppercase tracking-wider">BP</span>
                    </div>
                    {latestVitals?.bp ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${bpStatus.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        bpStatus.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                          bpStatus.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>{bpStatus.status}</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">N/A</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{latestVitals?.bp || '--'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">mmHg</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                    {latestVitals?.bp ? 'Latest reading' : 'No data'}
                  </div>
                </div>

                {/* Heart Rate */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <span className="material-symbols-outlined text-[18px]">ecg_heart</span>
                      <span className="text-xs font-semibold uppercase tracking-wider">HR</span>
                    </div>
                    {latestVitals?.hr ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${hrStatus.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        }`}>{hrStatus.status}</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">N/A</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{latestVitals?.hr || '--'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">bpm</span>
                  </div>
                  {hrTrend.change && (
                    <div className={`flex items-center gap-1 text-[11px] font-medium ${hrTrend.trend === 'up' ? 'text-red-500 dark:text-red-400' :
                      hrTrend.trend === 'down' ? 'text-green-500 dark:text-green-400' :
                        'text-gray-400 dark:text-gray-500'
                      }`}>
                      <span className="material-symbols-outlined text-[12px]">{hrTrend.trend === 'up' ? 'trending_up' : hrTrend.trend === 'down' ? 'trending_down' : 'remove'}</span>
                      <span>{hrTrend.change} vs last visit</span>
                    </div>
                  )}
                </div>

                {/* Respiratory Rate - Not available in API, showing placeholder */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <span className="material-symbols-outlined text-[18px]">pulmonology</span>
                      <span className="text-xs font-semibold uppercase tracking-wider">Resp</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">N/A</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">--</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">rpm</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                    <span>Not recorded</span>
                  </div>
                </div>

                {/* SpO₂ - Not available in API, showing placeholder */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <span className="material-symbols-outlined text-[18px]">spo2</span>
                      <span className="text-xs font-semibold uppercase tracking-wider">SpO₂</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">N/A</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">--</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">%</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                    <span>Not recorded</span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <span className="material-symbols-outlined text-[18px]">thermometer</span>
                      <span className="text-xs font-semibold uppercase tracking-wider">Temp</span>
                    </div>
                    {latestVitals?.temp ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${tempStatus.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        }`}>{tempStatus.status}</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">N/A</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{latestVitals?.temp ? fahrenheitToCelsius(latestVitals.temp) : '--'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">°C</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                    <span>Latest reading</span>
                  </div>
                </div>

                {/* BMI - Calculate if weight is available */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <span className="material-symbols-outlined text-[18px]">monitor_weight</span>
                      <span className="text-xs font-semibold uppercase tracking-wider">BMI</span>
                    </div>
                    {latestVitals?.weight ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Calc</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">N/A</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">--</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">kg/m²</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                    <span>{latestVitals?.weight ? `${latestVitals.weight}lbs` : 'Height required'}</span>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-4">
                  {vitalsHistory.length >= 3 && (() => {
                    const bpTrend = calculateTrend('bp')
                    const hasBPTrend = bpTrend.trend && bpTrend.change

                    if (hasBPTrend && bpTrend.trend === 'up') {
                      return (
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                          <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm text-primary shrink-0">
                            <span className="material-symbols-outlined text-xl">auto_awesome</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Clinical Insight Detected</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                              Patient's systolic BP has shown an upward trend ({bpTrend.change} mmHg) over recent visits. Consider evaluating for white coat hypertension or medication adjustment.
                            </p>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}

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
                          <input className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary text-gray-900 dark:text-white" placeholder="120" type="number" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Diastolic</label>
                          <input className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary text-gray-900 dark:text-white" placeholder="80" type="number" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Heart Rate</label>
                          <div className="relative">
                            <input className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary pr-8 text-gray-900 dark:text-white" placeholder="72" type="number" />
                            <span className="absolute right-2 top-2 text-[10px] text-gray-400 dark:text-gray-500">bpm</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">SpO₂</label>
                          <div className="relative">
                            <input className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary pr-6 text-gray-900 dark:text-white" placeholder="98" type="number" />
                            <span className="absolute right-2 top-2 text-[10px] text-gray-400 dark:text-gray-500">%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Quick Note</label>
                        <textarea className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary resize-none text-gray-900 dark:text-white" placeholder="e.g. Patient anxious..." rows={2}></textarea>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400 transition">Post-exercise</button>
                        <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400 transition">Sitting</button>
                        <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400 transition">Lying</button>
                      </div>
                      <div className="mt-auto pt-4">
                        <button className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-sm">save</span>
                          Save Vitals
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
                {vitalsHistory.length === 0 ? (
                  <div className="p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500 mb-2 block">monitor_heart</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">No vitals recorded yet</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Vitals will appear here after visits are recorded</p>
                  </div>
                ) : (
                  <>
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
                          {vitalsHistory.map((vital) => {
                            const dateTime = formatDate(vital.recordedAt)
                            const vitalBPStatus = getBPStatus(vital.bp)
                            const vitalHRStatus = getHRStatus(vital.hr)
                            const vitalTempStatus = getTempStatus(vital.temp)

                            return (
                              <tr key={vital.visit_id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900 dark:text-white">{dateTime.date}</div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500">{dateTime.time}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {vital.bp ? (
                                    <>
                                      <span className="font-bold text-gray-900 dark:text-white">{vital.bp}</span>
                                      <span className="text-xs text-gray-400 dark:text-gray-500 block">mmHg</span>
                                    </>
                                  ) : (
                                    <span className="text-gray-400 dark:text-gray-500">--</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {vital.hr ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className={`font-bold ${vitalHRStatus.color === 'green' ? 'text-gray-900 dark:text-white' :
                                        'text-amber-600 dark:text-amber-400'
                                        }`}>{vital.hr}</span>
                                      {vitalHRStatus.color !== 'green' && (
                                        <span className="size-2 rounded-full bg-amber-500"></span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 dark:text-gray-500">--</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-gray-400 dark:text-gray-500">--</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {vital.temp ? (
                                    <span className="text-gray-900 dark:text-white">{fahrenheitToCelsius(vital.temp)}</span>
                                  ) : (
                                    <span className="text-gray-400 dark:text-gray-500">--</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-gray-400 dark:text-gray-500">--</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 w-fit">
                                    <span className="material-symbols-outlined text-sm text-gray-500 dark:text-gray-400">medical_services</span>
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Clinical</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 text-primary rounded-full size-6 flex items-center justify-center text-[10px] font-bold">
                                      {patient?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <span className="text-xs font-medium">Visit Record</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => router.push(`/patients/${params.id}/visit/${vital.visit_id}`)}
                                    className="text-gray-400 dark:text-gray-500 hover:text-primary transition"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Showing {vitalsHistory.length} record{vitalsHistory.length !== 1 ? 's' : ''}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}