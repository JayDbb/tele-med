'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { PatientDataManager } from '@/utils/PatientDataManager'

export default function PatientVitalsEntryPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  const patient = PatientDataManager.getPatient(patientId)
  const [form, setForm] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    spo2: '',
    respiration: '',
    temperature: '',
    weight: '',
    notes: ''
  })
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!form.systolic || !form.diastolic || !form.heartRate) {
      setError('Systolic, diastolic, and heart rate are required.')
      return
    }
    const entry = {
      id: Date.now().toString(),
      recordedAt: new Date().toISOString(),
      bp: `${form.systolic}/${form.diastolic}`,
      hr: form.heartRate,
      spo2: form.spo2,
      resp: form.respiration,
      temp: form.temperature,
      weight: form.weight,
      notes: form.notes
    }
    const vitalsHistory = PatientDataManager.getPatientSectionList(patientId, 'vitals')
    PatientDataManager.savePatientSectionList(patientId, 'vitals', [entry, ...vitalsHistory])
    PatientDataManager.logActionAuto(patientId, 'update', 'vitals', {
      notes: 'Added vitals entry.'
    })
    router.push(`/nurse-portal/patients/${patientId}/vitals`)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NurseSidebar />
      <PatientDetailSidebar patientId={patientId} />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">Patients</span>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm">chevron_right</span>
                  <span className="text-primary text-sm font-medium">{patient?.name || 'Patient'}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Add Vitals</h2>
              </div>
              <button
                onClick={() => router.push(`/nurse-portal/patients/${patientId}/vitals`)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Vitals
              </button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Systolic *</label>
                  <input
                    type="number"
                    value={form.systolic}
                    onChange={(event) => setForm({ ...form, systolic: event.target.value })}
                    className="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Diastolic *</label>
                  <input
                    type="number"
                    value={form.diastolic}
                    onChange={(event) => setForm({ ...form, diastolic: event.target.value })}
                    className="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                    placeholder="80"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Heart Rate *</label>
                  <input
                    type="number"
                    value={form.heartRate}
                    onChange={(event) => setForm({ ...form, heartRate: event.target.value })}
                    className="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                    placeholder="72"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">SpO₂</label>
                  <input
                    type="number"
                    value={form.spo2}
                    onChange={(event) => setForm({ ...form, spo2: event.target.value })}
                    className="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                    placeholder="98"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Respiration</label>
                  <input
                    type="number"
                    value={form.respiration}
                    onChange={(event) => setForm({ ...form, respiration: event.target.value })}
                    className="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                    placeholder="16"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Temperature (°C)</label>
                  <input
                    type="number"
                    value={form.temperature}
                    onChange={(event) => setForm({ ...form, temperature: event.target.value })}
                    className="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                    placeholder="36.7"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Weight (lbs)</label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(event) => setForm({ ...form, weight: event.target.value })}
                    className="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                    placeholder="150"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(event) => setForm({ ...form, notes: event.target.value })}
                    rows={4}
                    className="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                    placeholder="Add any notes or context."
                  />
                </div>
              </div>
              {error && (
                <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => router.push(`/nurse-portal/patients/${patientId}/vitals`)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90"
                >
                  Save Vitals
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
