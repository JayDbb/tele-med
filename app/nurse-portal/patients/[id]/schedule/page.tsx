'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PatientDataManager } from '@/utils/PatientDataManager'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

export default function SchedulePage() {
  const params = useParams()
  const router = useRouter()
  const rawPatientId = params.id
  const patientId = Array.isArray(rawPatientId) ? rawPatientId[0] : rawPatientId || ''
  const [patient, setPatient] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'virtual'>('in-person')
  const [appointmentLocation, setAppointmentLocation] = useState('')
  const [appointmentNotes, setAppointmentNotes] = useState('')
  const [triageLevel, setTriageLevel] = useState<'mild' | 'urgent' | 'critical'>('mild')
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'text'>('email')
  const [deliveryEmail, setDeliveryEmail] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const waitingPoolLabel = 'Waiting Pool'

  useEffect(() => {
    if (!patientId) {
      setPatient(null)
      setLoading(false)
      return
    }
    const loaded = PatientDataManager.getPatient(patientId)
    setPatient(loaded)
    setDeliveryEmail(loaded?.email || '')
    setDeliveryPhone(loaded?.phone || '')
    setLoading(false)
  }, [patientId])

  const canConfirm = true

  const handleConfirmAppointment = async () => {
    if (!patient || !canConfirm) return

    setIsSaving(true)
    setSaveError(null)

    const nowIso = new Date().toISOString()
    const scheduledFor = nowIso

    const isVirtual = appointmentType === 'virtual'
    const waitingStatus = `Waiting - ${isVirtual ? 'Virtual' : 'In Person'}`
    const visitMode = isVirtual ? 'Virtual' : 'In Person'

    const appointmentRecord = {
      id: `appt-${Date.now()}`,
      patientId,
      patientName: patient.name,
      doctorId: '',
      doctorName: waitingPoolLabel,
      doctorDisplayName: waitingPoolLabel,
      doctorEmail: '',
      type: appointmentType,
      visitMode,
      status: waitingStatus,
      waitingStatus,
      priority: triageLevel,
      scheduledFor,
      location: appointmentLocation || (isVirtual ? 'Virtual visit' : 'In-person visit'),
      notes: appointmentNotes,
      deliveryMethod,
      contactEmail: deliveryEmail,
      contactPhone: deliveryPhone,
      createdAt: nowIso,
      updatedAt: nowIso
    }

    const appointmentLabel = waitingStatus

    const updatedPatient = {
      ...patient,
      physician: waitingPoolLabel,
      doctorId: '',
      appointment: appointmentLabel,
      status: waitingStatus,
      visitMode,
      priority: triageLevel,
      updatedAt: nowIso
    }

    PatientDataManager.savePatient(updatedPatient, 'update', 'system')
    const existingAppointments = PatientDataManager.getPatientSectionList(patientId, 'appointments')
    PatientDataManager.savePatientSectionList(patientId, 'appointments', [appointmentRecord, ...existingAppointments], 'system')

    if (process.env.NEXT_PUBLIC_API_ENABLED === 'true') {
      try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentRecord)
        })
        if (!response.ok) {
          throw new Error('Failed to sync appointment')
        }
      } catch (error) {
        console.error('Appointment sync failed:', error)
        setSaveError('Saved locally. Sync to backend is pending.')
      }
    }

    setIsSaving(false)
    router.push(`/nurse-portal/patients/${patientId}`)
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <NurseSidebar />
        <PatientDetailSidebar patientId={patientId} />
        
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
          <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
            <GlobalSearchBar />
          </header>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">Loading patient...</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <NurseSidebar />
        <PatientDetailSidebar patientId={patientId} />
        
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
          <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
            <GlobalSearchBar />
          </header>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">person_off</span>
                <p className="text-gray-500">Patient not found</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NurseSidebar />
      <PatientDetailSidebar patientId={patientId} />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-6xl mx-auto w-full flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Schedule Appointment</h2>
              </div>
              <div className="flex flex-wrap gap-3 items-center justify-end">
                <button 
                  onClick={() => router.push(`/nurse-portal/patients/${patientId}`)}
                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back to Patient
                </button>
                <button 
                  onClick={handleConfirmAppointment}
                  disabled={!canConfirm || isSaving}
                  className="bg-primary hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-600 text-white font-bold py-2.5 px-5 rounded-lg shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {isSaving ? 'Saving...' : 'Add to Waiting Pool'}
                </button>
              </div>
            </div>

            {/* Patient Info Banner */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-full text-primary shrink-0">
                <span className="material-symbols-outlined text-lg">person</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Scheduling For</h4>
                <div className="text-gray-900 dark:text-white font-semibold flex items-center gap-2 text-sm">
                  {patient.name || 'Unnamed Patient'}
                  <span className="text-gray-400 font-normal">|</span>
                  <span className="text-gray-600 dark:text-gray-300 font-normal text-xs">
                    DOB: {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 items-start">
              <div className="flex flex-col gap-4">
                {/* Waiting Pool */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Shared Waiting Pool</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Any eligible doctor can claim the visit.</p>
                  </div>
                  <div className="p-3">
                    <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 p-3 text-xs text-primary">
                      Patient will appear in the doctor waiting pool immediately after confirmation.
                    </div>
                  </div>
                </div>

                {/* Triage Level */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Triage Level</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Set the urgency for the waiting pool.</p>
                  </div>
                  <div className="p-3 flex flex-wrap gap-2">
                    {[
                      { id: 'mild', label: 'Mild', style: 'border-emerald-200 text-emerald-700 bg-emerald-50' },
                      { id: 'urgent', label: 'Urgent', style: 'border-amber-200 text-amber-700 bg-amber-50' },
                      { id: 'critical', label: 'Critical', style: 'border-rose-200 text-rose-700 bg-rose-50' }
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setTriageLevel(option.id as typeof triageLevel)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                          triageLevel === option.id
                            ? `${option.style} border-2`
                            : 'border-gray-200 text-gray-600 dark:text-gray-300 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Appointment Type */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Appointment Type</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Choose how the patient will be seen immediately</p>
                  </div>
                  <div className="p-3 space-y-2">
                    <label className={`cursor-pointer rounded-lg border p-3 block ${
                      appointmentType === 'in-person' 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}>
                      <input 
                        className="sr-only" 
                        name="app-type" 
                        type="radio"
                        value="in-person"
                        checked={appointmentType === 'in-person'}
                        onChange={(e) => setAppointmentType(e.target.value)}
                      />
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">Immediately – In-Person</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">Patient is placed in the in-person waiting area and will be seen on site.</span>
                    </label>

                    <label className={`cursor-pointer rounded-lg border p-3 block ${
                      appointmentType === 'virtual' 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}>
                      <input 
                        className="sr-only" 
                        name="app-type" 
                        type="radio"
                        value="virtual"
                        checked={appointmentType === 'virtual'}
                        onChange={(e) => setAppointmentType(e.target.value)}
                      />
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">Immediately – Virtual</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">Patient is placed in the virtual waiting queue and can be seen via video.</span>
                    </label>
                  </div>
                </div>
              </div>

              {appointmentType === 'virtual' && (
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-3">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Appointment Details</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Capture details for the care team</p>
                  </div>
                  <div className="p-3 grid sm:grid-cols-2 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Location</label>
                      <input
                        type="text"
                        value={appointmentLocation}
                        onChange={(event) => setAppointmentLocation(event.target.value)}
                        placeholder="Virtual visit link or room"
                        className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Notes</label>
                      <textarea
                        value={appointmentNotes}
                        onChange={(event) => setAppointmentNotes(event.target.value)}
                        rows={1}
                        placeholder="Add visit details or context for the care team"
                        className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-2.5">
                      <h4 className="text-[11px] font-bold text-gray-900 dark:text-white mb-2">Video Link Delivery</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <label className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                          deliveryMethod === 'email'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          <input
                            type="radio"
                            name="delivery-method"
                            value="email"
                            checked={deliveryMethod === 'email'}
                            onChange={() => setDeliveryMethod('email')}
                            className="sr-only"
                          />
                          <span className="material-symbols-outlined text-[16px]">mail</span>
                          Email
                        </label>
                        <label className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                          deliveryMethod === 'text'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          <input
                            type="radio"
                            name="delivery-method"
                            value="text"
                            checked={deliveryMethod === 'text'}
                            onChange={() => setDeliveryMethod('text')}
                            className="sr-only"
                          />
                          <span className="material-symbols-outlined text-[16px]">sms</span>
                          Text Message
                        </label>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        <div className={`rounded-lg border px-2.5 py-1.5 ${
                          deliveryMethod === 'email'
                            ? 'border-primary/60 bg-primary/5'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}>
                          <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Email</label>
                          <input
                            type="email"
                            value={deliveryEmail}
                            onChange={(event) => setDeliveryEmail(event.target.value)}
                            placeholder="patient@email.com"
                            className="w-full bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div className={`rounded-lg border px-2.5 py-1.5 ${
                          deliveryMethod === 'text'
                            ? 'border-primary/60 bg-primary/5'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}>
                          <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Phone</label>
                          <input
                            type="tel"
                            value={deliveryPhone}
                            onChange={(event) => setDeliveryPhone(event.target.value)}
                            placeholder="(555) 123-4567"
                            className="w-full bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {saveError && (
              <div className="w-full max-w-md rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-900/30 px-3 py-2 text-xs text-amber-700 dark:text-amber-200">
                {saveError}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
