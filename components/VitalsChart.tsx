'use client'

import { useState, useEffect } from 'react'
import { getVitals } from '@/lib/api'

interface VitalsChartProps {
  patientId: string
  patientAge?: number
}

type VitalsRecord = {
  visit_id: string
  recordedAt: string
  bp: string | null
  hr: number | null
  temp: number | null
  weight: number | null
}

const VitalsChart = ({ patientId, patientAge = 25 }: VitalsChartProps) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('3m')
  const [selectedVital, setSelectedVital] = useState('bp')
  const [vitalsHistory, setVitalsHistory] = useState<VitalsRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadVitals() {
      try {
        setLoading(true)
        setError(null)
        const vitals = await getVitals(patientId)
        console.log('Loaded vitals:', vitals)
        setVitalsHistory(vitals || [])
      } catch (err: any) {
        console.error('Failed to load vitals:', err)
        setError(err?.message || 'Failed to load vitals')
        setVitalsHistory([])
      } finally {
        setLoading(false)
      }
    }
    if (patientId) {
      loadVitals()
    }
  }, [patientId])

  const latestVitals = vitalsHistory.reduce((latest: VitalsRecord | null, current: VitalsRecord) => {
    if (!latest?.recordedAt) return current
    if (!current?.recordedAt) return latest
    return new Date(current.recordedAt).getTime() > new Date(latest.recordedAt).getTime() ? current : latest
  }, vitalsHistory[0] || null)
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Not recorded'
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return 'Not recorded'
    return date.toLocaleDateString()
  }

  // Calculate trend for a vital
  const calculateTrend = (vitalKey: 'bp' | 'hr' | 'temp' | 'weight') => {
    if (vitalsHistory.length < 2) return { trend: 'stable', change: '—' }

    const filtered = vitalsHistory
      .filter((v) => v[vitalKey] !== null && v[vitalKey] !== undefined)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())

    if (filtered.length < 2) return { trend: 'stable', change: '—' }

    const latest = filtered[filtered.length - 1]
    const previous = filtered[filtered.length - 2]

    let latestValue: number
    let previousValue: number

    if (vitalKey === 'bp') {
      // For BP, extract systolic (first number)
      const latestMatch = latest.bp?.match(/(\d+)/)
      const prevMatch = previous.bp?.match(/(\d+)/)
      if (!latestMatch || !prevMatch) return { trend: 'stable', change: '—' }
      latestValue = parseFloat(latestMatch[1])
      previousValue = parseFloat(prevMatch[1])
    } else {
      latestValue = (latest[vitalKey] as number) || 0
      previousValue = (previous[vitalKey] as number) || 0
    }

    const diff = latestValue - previousValue
    const percentChange = previousValue !== 0 ? (diff / previousValue) * 100 : 0

    if (Math.abs(percentChange) < 2) {
      return { trend: 'stable', change: '—' }
    }

    const isIncrease = diff > 0
    // For weight and BP, increase is bad (red), decrease is good (green)
    // For HR and temp, depends on context, but generally increase can be concerning
    if (vitalKey === 'weight' || vitalKey === 'bp') {
      return {
        trend: isIncrease ? 'up' : 'down',
        change: `${isIncrease ? '+' : ''}${diff.toFixed(1)}${vitalKey === 'bp' ? '' : ' lbs'}`,
      }
    } else {
      return {
        trend: isIncrease ? 'up' : 'down',
        change: `${isIncrease ? '+' : ''}${diff.toFixed(0)}${vitalKey === 'hr' ? ' bpm' : '°F'}`,
      }
    }
  }

  const timeRanges = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '1y', label: '1 Year' }
  ]

  const bpTrend = calculateTrend('bp')
  const hrTrend = calculateTrend('hr')
  const weightTrend = calculateTrend('weight')
  const tempTrend = calculateTrend('temp')

  const vitals = [
    {
      key: 'bp',
      label: 'Blood Pressure',
      value: latestVitals?.bp || '--',
      unit: 'mmHg',
      lastMeasured: formatTimestamp(latestVitals?.recordedAt),
      trend: bpTrend.trend,
      change: bpTrend.change
    },
    {
      key: 'hr',
      label: 'Heart Rate',
      value: latestVitals?.hr ? `${latestVitals.hr}` : '--',
      unit: 'bpm',
      lastMeasured: formatTimestamp(latestVitals?.recordedAt),
      trend: hrTrend.trend,
      change: hrTrend.change
    },
    {
      key: 'weight',
      label: 'Weight',
      value: latestVitals?.weight ? `${latestVitals.weight}` : '--',
      unit: 'lbs',
      lastMeasured: formatTimestamp(latestVitals?.recordedAt),
      trend: weightTrend.trend,
      change: weightTrend.change
    },
    {
      key: 'temp',
      label: 'Temperature',
      value: latestVitals?.temp ? `${latestVitals.temp}` : '--',
      unit: '°F',
      lastMeasured: formatTimestamp(latestVitals?.recordedAt),
      trend: tempTrend.trend,
      change: tempTrend.change
    }
  ]

  const isPediatric = patientAge < 18

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading vitals...</div>
        </div>
      </div>
    )
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isPediatric ? 'Pediatric Growth & Vitals' : 'Vitals Trending'}
          </h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-red-400 mb-2 block">error</span>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Show message if no vitals found
  if (!loading && vitalsHistory.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isPediatric ? 'Pediatric Growth & Vitals' : 'Vitals Trending'}
          </h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-gray-400 mb-2 block">monitor_heart</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">No vitals recorded yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Vitals will appear here after visits are recorded</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isPediatric ? 'Pediatric Growth & Vitals' : 'Vitals Trending'}
        </h3>
        <div className="flex items-center gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedTimeRange(range.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${selectedTimeRange === range.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {vitals.map((vital) => (
          <button
            key={vital.key}
            onClick={() => setSelectedVital(vital.key)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${selectedVital === vital.key
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">{vital.label}</p>
              <span className={`text-xs ${vital.trend === 'down' ? 'text-green-600 dark:text-green-400' :
                vital.trend === 'up' ? 'text-red-600 dark:text-red-400' :
                  'text-gray-500'
                }`}>
                {vital.change}
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {vital.value} <span className="text-xs font-normal text-gray-500">{vital.unit}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last: {vital.lastMeasured}
            </p>
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
        {isPediatric && selectedVital === 'weight' ? (
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">trending_up</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pediatric Growth Chart</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Weight-for-age percentiles</p>
          </div>
        ) : (
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">show_chart</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {vitals.find(v => v.key === selectedVital)?.label} Trend
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {selectedTimeRange === '1m' ? 'Last 30 days' :
                selectedTimeRange === '3m' ? 'Last 3 months' :
                  'Last 12 months'}
            </p>
          </div>
        )}
      </div>

      {isPediatric && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">child_care</span>
            <p className="text-xs font-medium text-blue-800 dark:text-blue-200">Pediatric Growth Tracking</p>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Growth charts show percentiles for age-appropriate development milestones.
          </p>
        </div>
      )}
    </div>
  )
}

export default VitalsChart
