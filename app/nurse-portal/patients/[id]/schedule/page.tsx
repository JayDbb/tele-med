'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PatientDataManager } from '@/utils/PatientDataManager'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'

interface SchedulePageProps {
  params: {
    id: string
  }
}

export default function SchedulePage({ params }: SchedulePageProps) {
  const router = useRouter()
  const patientId = params.id
  const patient = PatientDataManager.getPatient(patientId)
  const [selectedDoctor, setSelectedDoctor] = useState('dr-sarah-johnson')
  const [appointmentType, setAppointmentType] = useState('immediate')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [appointmentLocation, setAppointmentLocation] = useState('')
  const [appointmentNotes, setAppointmentNotes] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'text'>('email')
  const [deliveryEmail, setDeliveryEmail] = useState(patient?.email || '')
  const [deliveryPhone, setDeliveryPhone] = useState(patient?.phone || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const doctors = [
    { id: 'dr-sarah-johnson', name: 'Dr. Sarah Johnson', portalName: 'Sarah Johnson', email: 'sarah.johnson@telemedclinic.com', portalId: 'user-sarah-johnson-telemedclinic-com', specialty: 'Cardiologist', status: 'available', next: null },
    { id: 'dr-michael-chen', name: 'Dr. Michael Chen', portalName: 'Michael Chen', email: 'michael.chen@telemedclinic.com', portalId: 'user-michael-chen-telemedclinic-com', specialty: 'General Practitioner', status: 'busy', next: '10:30 AM' },
    { id: 'dr-emily-rodriguez', name: 'Dr. Emily Rodriguez', portalName: 'Emily Rodriguez', email: 'emily.rodriguez@telemedclinic.com', portalId: 'user-emily-rodriguez-telemedclinic-com', specialty: 'Neurologist', status: 'unavailable', next: null }
  ]

  const selectedDoctorInfo = doctors.find((doctor) => doctor.id === selectedDoctor)

  const isScheduled = appointmentType === 'scheduled'
  const canConfirm = appointmentType === 'immediate' || (appointmentDate && appointmentTime)

  const formatScheduledLabel = (dateValue: string, timeValue: string) => {
    if (!dateValue || !timeValue) return 'Scheduled'
    const scheduledDate = new Date(`${dateValue}T${timeValue}`)
    if (Number.isNaN(scheduledDate.getTime())) return 'Scheduled'
    return scheduledDate.toLocaleString()
  }

  const handleConfirmAppointment = async () => {
    if (!patient || !canConfirm) return

    setIsSaving(true)
    setSaveError(null)

    const nowIso = new Date().toISOString()
    const scheduledFor = isScheduled
      ? new Date(`${appointmentDate}T${appointmentTime}`).toISOString()
      : nowIso

    const appointmentRecord = {
      id: `appt-${Date.now()}`,
      patientId,
      patientName: patient.name,
      doctorId: selectedDoctorInfo?.portalId || selectedDoctor,
      doctorName: selectedDoctorInfo?.portalName || selectedDoctorInfo?.name || 'Assigned Doctor',
      doctorDisplayName: selectedDoctorInfo?.name || 'Assigned Doctor',
      doctorEmail: selectedDoctorInfo?.email || '',
      type: appointmentType,
      status: appointmentType === 'immediate' ? 'in-progress' : 'scheduled',
      scheduledFor,
      location: appointmentLocation || 'Virtual visit',
      notes: appointmentNotes,
      deliveryMethod,
      contactEmail: deliveryEmail,
      contactPhone: deliveryPhone,
      createdAt: nowIso,
      updatedAt: nowIso
    }

    const appointmentLabel = appointmentType === 'immediate'
      ? 'Active Now'
      : formatScheduledLabel(appointmentDate, appointmentTime)

    const updatedPatient = {
      ...patient,
      physician: selectedDoctorInfo?.name || 'Assigned Doctor',
      doctorId: selectedDoctorInfo?.portalId || selectedDoctor,
      appointment: appointmentLabel,
      status: appointmentType === 'immediate' ? 'In Progress' : 'Scheduled',
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
    router.push(`/patients/${patientId}`)
  }

  if (!patient) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <NurseSidebar />
        <PatientDetailSidebar patientId={params.id} />

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
      <PatientDetailSidebar patientId={params.id} />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">Patients</span>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm">chevron_right</span>
                  <span className="text-primary text-sm font-medium">{patient?.name || 'Patient'}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Schedule Appointment</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/patients/${params.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back to Patient
                </button>
              </div>
            </div>

            {/* Patient Info Banner */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-full text-primary shrink-0">
                <span className="material-symbols-outlined text-xl">person</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Scheduling For</h4>
                <div className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                  {patient.name || 'Unnamed Patient'}
                  <span className="text-gray-400 font-normal">|</span>
                  <span className="text-gray-600 dark:text-gray-300 font-normal text-sm">
                    DOB: {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Select Doctor */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Select Doctor</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Choose an available physician for the appointment</p>
                  </div>
                  <div className="p-4 space-y-3">
                    {doctors.map((doctor) => (
                      <label key={doctor.id} className="cursor-pointer group">
                        <input
                          className="hidden"
                          name="doctor"
                          type="radio"
                          value={doctor.id}
                          checked={selectedDoctor === doctor.id}
                          onChange={(e) => setSelectedDoctor(e.target.value)}
                        />
                        <div className={`border rounded-lg p-4 flex items-center gap-4 transition-all ${selectedDoctor === doctor.id
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50'
                          }`}>
                          <div className="size-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                            {doctor.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{doctor.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{doctor.specialty}</p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${doctor.status === 'available' ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' :
                              doctor.status === 'busy' ? 'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' :
                                'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
                            }`}>
                            {doctor.status === 'available' ? 'Available' :
                              doctor.status === 'busy' ? `Next: ${doctor.next}` :
                                'Unavailable'}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Appointment Type */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Appointment Type</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Choose when to schedule the appointment</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <label className={`cursor-pointer rounded-lg border p-4 block ${appointmentType === 'immediate'
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700'
                      }`}>
                      <input
                        className="sr-only"
                        name="app-type"
                        type="radio"
                        value="immediate"
                        checked={appointmentType === 'immediate'}
                        onChange={(e) => setAppointmentType(e.target.value)}
                      />
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">Assign Instantly</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Generate a meeting link immediately.</span>
                    </label>

                    <label className={`cursor-pointer rounded-lg border p-4 block ${appointmentType === 'scheduled'
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700'
                      }`}>
                      <input
                        className="sr-only"
                        name="app-type"
                        type="radio"
                        value="scheduled"
                        checked={appointmentType === 'scheduled'}
                        onChange={(e) => setAppointmentType(e.target.value)}
                      />
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">Schedule for Later</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Select a specific date and time.</span>
                    </label>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Appointment Details</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Capture details for backend scheduling</p>
                  </div>
                  <div className="p-4 grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Date</label>
                      <input
                        type="date"
                        value={appointmentDate}
                        onChange={(event) => setAppointmentDate(event.target.value)}
                        disabled={!isScheduled}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Time</label>
                      <input
                        type="time"
                        value={appointmentTime}
                        onChange={(event) => setAppointmentTime(event.target.value)}
                        disabled={!isScheduled}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white disabled:opacity-50"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Location</label>
                      <input
                        type="text"
                        value={appointmentLocation}
                        onChange={(event) => setAppointmentLocation(event.target.value)}
                        placeholder="Virtual visit link or clinic location"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Notes</label>
                      <textarea
                        value={appointmentNotes}
                        onChange={(event) => setAppointmentNotes(event.target.value)}
                        rows={3}
                        placeholder="Add visit details or context for the care team"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Video Link Delivery</h4>
                      <div className="flex flex-wrap gap-3 mb-3">
                        <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer ${deliveryMethod === 'email'
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
                        <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer ${deliveryMethod === 'text'
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
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className={`rounded-lg border px-3 py-2 ${deliveryMethod === 'email'
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
                        <div className={`rounded-lg border px-3 py-2 ${deliveryMethod === 'text'
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
              </div>

              {/* Summary Panel */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Appointment Summary</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Review details before confirming</p>
                  </div>
                  <div className="p-4 flex flex-col gap-4 flex-1">
                    <div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-1">Patient</span>
                      <p className="font-medium text-gray-900 dark:text-white">{patient.name || 'Unnamed Patient'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-1">Doctor</span>
                      <p className="font-medium text-primary">
                        {selectedDoctorInfo?.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-1">Time</span>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {appointmentType === 'immediate'
                          ? 'Immediate'
                          : formatScheduledLabel(appointmentDate, appointmentTime)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-1">Location</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {appointmentLocation || 'Virtual visit'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-1">Delivery</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {deliveryMethod === 'email'
                          ? `Email • ${deliveryEmail || 'Not set'}`
                          : `Text • ${deliveryPhone || 'Not set'}`}
                      </p>
                    </div>
                    {saveError && (
                      <div className="rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-900/30 px-3 py-2 text-xs text-amber-700 dark:text-amber-200">
                        {saveError}
                      </div>
                    )}
                    <div className="mt-auto pt-4">
                      <button
                        onClick={handleConfirmAppointment}
                        disabled={!canConfirm || isSaving}
                        className="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        {isSaving ? 'Saving...' : 'Confirm Appointment'}
                      </button>
                      {!canConfirm && isScheduled && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                          Select a date and time to continue.
                        </p>
                      )}
                    </div>
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
