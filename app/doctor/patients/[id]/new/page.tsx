'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { PatientDataManager, type PatientData } from '@/utils/PatientDataManager'
import { useDoctor } from '@/contexts/DoctorContext'

type FormState = {
  firstName: string
  lastName: string
  preferredName: string
  dob: string
  sexAtBirth: string
  phone: string
  email: string
  street: string
  city: string
  state: string
  zip: string
  language: string
  notificationSms: boolean
  notificationEmail: boolean
  emergencyName: string
  emergencyRelationship: string
  emergencyPhone: string
  primaryCare: string
  insurance: string
  allergies: string
  intakeNotes: string
}

const defaultFormState: FormState = {
  firstName: '',
  lastName: '',
  preferredName: '',
  dob: '',
  sexAtBirth: '',
  phone: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  language: 'English',
  notificationSms: false,
  notificationEmail: true,
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  primaryCare: '',
  insurance: '',
  allergies: '',
  intakeNotes: ''
}

const getGenderLabel = (value: string) => {
  if (value === 'F') return 'Female'
  if (value === 'M') return 'Male'
  if (value === 'I') return 'Intersex'
  return value
}

export default function NewPatientPage() {
  const params = useParams()
  const patientId = params.id as string
  const router = useRouter()
  const { doctor } = useDoctor()
  const [form, setForm] = useState<FormState>(defaultFormState)
  const [patients, setPatients] = useState<PatientData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fullName = useMemo(() => {
    return [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(' ')
  }, [form.firstName, form.lastName])

  const normalizedPhone = useMemo(() => form.phone.replace(/\D/g, ''), [form.phone])
  const normalizedEmail = useMemo(() => form.email.trim().toLowerCase(), [form.email])
  const normalizedName = useMemo(() => fullName.trim().toLowerCase(), [fullName])
  const dobError = useMemo(() => {
    if (!form.dob) return ''
    const parsed = new Date(form.dob)
    if (Number.isNaN(parsed.getTime())) return 'Enter a valid date of birth.'
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (parsed > today) return 'Date of birth cannot be in the future.'
    return ''
  }, [form.dob])
  const phoneError = useMemo(() => {
    if (!form.phone.trim()) return ''
    return normalizedPhone.length === 10 ? '' : 'Phone number must be 10 digits.'
  }, [form.phone, normalizedPhone])
  const emailError = useMemo(() => {
    if (!normalizedEmail) return ''
    return /^[^\s@]+@[^\s@]+\.com$/i.test(normalizedEmail)
      ? ''
      : 'Email must end with .com.'
  }, [normalizedEmail])

  const duplicateMatches = useMemo(() => {
    if (!patients.length) return []
    return patients.filter((patient) => {
      if (patient.id === patientId) return false
      const patientName = `${patient.name || ''}`.trim().toLowerCase()
      const patientDob = `${patient.dob || ''}`.trim()
      const patientEmail = `${patient.email || ''}`.trim().toLowerCase()
      const patientPhone = `${patient.phone || ''}`.replace(/\D/g, '')

      const nameDobMatch = normalizedName && form.dob && patientName === normalizedName && patientDob === form.dob
      const emailMatch = normalizedEmail && patientEmail && patientEmail === normalizedEmail
      const phoneMatch = normalizedPhone && patientPhone && patientPhone === normalizedPhone
      return nameDobMatch || emailMatch || phoneMatch
    })
  }, [patients, patientId, normalizedName, normalizedEmail, normalizedPhone, form.dob])

  const requiredMissing = useMemo(() => {
    return !form.firstName.trim() || !form.lastName.trim() || !form.dob || !form.sexAtBirth || !form.phone.trim()
  }, [form.firstName, form.lastName, form.dob, form.sexAtBirth, form.phone])
  const hasValidationErrors = Boolean(dobError || phoneError || emailError)

  useEffect(() => {
    setPatients(PatientDataManager.getAllPatients())
  }, [])

  useEffect(() => {
    const savedDraft = PatientDataManager.getDraft(patientId, 'new-patient')
    if (savedDraft?.data) {
      setForm({ ...defaultFormState, ...savedDraft.data })
    }
  }, [patientId])

  useEffect(() => {
    const timeout = setTimeout(() => {
      PatientDataManager.saveDraft(patientId, 'new-patient', form)
    }, 400)
    return () => clearTimeout(timeout)
  }, [form, patientId])

  const updateForm = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const handleCreate = (destination: 'chart' | 'schedule') => {
    setError(null)

    if (requiredMissing) {
      setError('Please complete all required fields before creating the patient.')
      return
    }

    if (hasValidationErrors) {
      setError('Please resolve the highlighted fields before creating the patient.')
      return
    }

    if (duplicateMatches.length > 0) {
      setError('A matching patient already exists. Open their chart to avoid duplicate records.')
      return
    }

    const existingPatient = PatientDataManager.getPatient(patientId)
    if (existingPatient) {
      setError('This patient record already exists. Open the chart to continue.')
      return
    }

    setSaving(true)
    const nowIso = new Date().toISOString()
    const addressParts = [form.street, form.city, form.state, form.zip].map((value) => value.trim()).filter(Boolean)
    const address = addressParts.join(', ')

    const patientRecord: PatientData = {
      id: patientId,
      name: fullName,
      dob: form.dob,
      gender: getGenderLabel(form.sexAtBirth),
      sexAtBirth: form.sexAtBirth,
      preferredName: form.preferredName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address,
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zip: form.zip.trim(),
      language: form.language,
      notificationPreferences: {
        sms: form.notificationSms,
        email: form.notificationEmail
      },
      emergencyContact: {
        name: form.emergencyName.trim(),
        relationship: form.emergencyRelationship.trim(),
        phone: form.emergencyPhone.trim()
      },
      primaryCare: form.primaryCare.trim(),
      insurance: form.insurance.trim(),
      allergies: form.allergies.trim(),
      notes: form.intakeNotes.trim(),
      mrn: `MRN-${patientId.slice(-6)}`,
      physician: 'To be assigned',
      appointment: 'New Patient',
      lastConsultation: '',
      status: 'Waiting',
      statusColor: 'text-slate-600 bg-slate-100 dark:bg-gray-800 dark:text-gray-200',
      doctorId: doctor?.id || 'current-user',
      nurseId: '',
      createdAt: nowIso,
      updatedAt: nowIso,
      arrivalTime: nowIso,
      visitType: 'Doctor Intake',
      image: ''
    }

    PatientDataManager.savePatient(patientRecord, 'create', doctor?.id || 'current-user')
    PatientDataManager.logAction(
      patientId,
      'create',
      'patient-profile',
      doctor?.id || 'current-user',
      doctor?.name || 'Doctor',
      { notes: 'Created patient profile.' }
    )

    if (form.allergies.trim()) {
      const allergies = form.allergies
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .map((name, index) => ({
          id: `${Date.now()}-${index}`,
          name,
          severity: 'Moderate',
          type: 'Unknown',
          reactions: '',
          status: 'Active',
          recordedAt: nowIso
        }))
      if (allergies.length > 0) {
        PatientDataManager.savePatientSectionList(patientId, 'allergies', allergies)
      }
    }

    PatientDataManager.clearDraft(patientId, 'new-patient')
    setSaving(false)
    if (destination === 'schedule') {
      router.push(`/doctor/patients/${patientId}`)
    } else {
      router.push(`/doctor/patients/${patientId}`)
    }
  }

  const canSubmit = !requiredMissing && !hasValidationErrors && duplicateMatches.length === 0 && !saving

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-primary/10 text-primary rounded-lg">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </span>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Create New Patient</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Enter details below</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => router.push('/doctor/patients')}
                  className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCreate('schedule')}
                  disabled={!canSubmit}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[16px]">event</span>
                  Create &amp; Schedule
                </button>
                <button
                  onClick={() => handleCreate('chart')}
                  disabled={!canSubmit}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-primary text-white font-semibold hover:bg-blue-600 shadow-sm shadow-blue-500/20 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Create Patient
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-xs text-rose-700 dark:text-rose-200">
                {error}
              </div>
            )}

            {duplicateMatches.length > 0 && (
              <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-xs text-blue-700 dark:text-blue-200">
                <div className="font-semibold mb-2">Potential duplicate matches</div>
                <div className="flex flex-col gap-2">
                  {duplicateMatches.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => router.push(`/doctor/patients/${patient.id}`)}
                      className="flex items-center justify-between rounded-lg border border-blue-200 dark:border-blue-800 bg-white/70 dark:bg-blue-950/20 px-3 py-2 text-left text-xs hover:bg-white dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{patient.name || 'Unnamed Patient'}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          DOB: {patient.dob || 'Unknown'} · MRN {patient.mrn || 'Not assigned'}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-primary">arrow_forward</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      Patient Identity
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded ml-2">Required</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-3 sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">First Name <span className="text-red-500">*</span></label>
                      <input
                        className="w-full h-8 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-xs"
                        placeholder="e.g. Jane"
                        type="text"
                        value={form.firstName}
                        onChange={(e) => updateForm({ firstName: e.target.value })}
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Last Name <span className="text-red-500">*</span></label>
                      <input
                        className="w-full h-8 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-xs"
                        placeholder="e.g. Doe"
                        type="text"
                        value={form.lastName}
                        onChange={(e) => updateForm({ lastName: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-2 hidden sm:block">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Preferred Name</label>
                      <input
                        className="w-full h-8 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-xs"
                        placeholder="e.g. Janie"
                        type="text"
                        value={form.preferredName}
                        onChange={(e) => updateForm({ preferredName: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                      <input
                        className="w-full h-8 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-xs"
                        type="date"
                        value={form.dob}
                        onChange={(e) => updateForm({ dob: e.target.value })}
                      />
                      {dobError && <p className="mt-1 text-[10px] text-rose-600">{dobError}</p>}
                    </div>
                    <div className="col-span-2 sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Gender <span className="text-red-500">*</span></label>
                      <select
                        className="w-full h-8 px-2 py-0 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-xs"
                        value={form.sexAtBirth}
                        onChange={(e) => updateForm({ sexAtBirth: e.target.value })}
                      >
                        <option value="">Select</option>
                        <option value="F">Female</option>
                        <option value="M">Male</option>
                        <option value="I">Intersex</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex-1">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Contact Information</h2>
                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-3">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Mobile Phone <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          className="w-full h-8 pl-7 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-xs"
                          placeholder="(555) 000-0000"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updateForm({ phone: e.target.value })}
                        />
                        <span className="material-symbols-outlined absolute left-2 top-2 text-slate-400 pointer-events-none text-[14px]">phone</span>
                      </div>
                      {phoneError && <p className="mt-1 text-[10px] text-rose-600">{phoneError}</p>}
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
                      <div className="relative">
                        <input
                          className="w-full h-8 pl-7 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-xs"
                          placeholder="mailto:jane@example.com"
                          type="email"
                          value={form.email}
                          onChange={(e) => updateForm({ email: e.target.value })}
                        />
                        <span className="material-symbols-outlined absolute left-2 top-2 text-slate-400 pointer-events-none text-[14px]">mail</span>
                      </div>
                      {emailError && <p className="mt-1 text-[10px] text-rose-600">{emailError}</p>}
                    </div>
                    <div className="col-span-6">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Street Address</label>
                      <input
                        className="w-full h-8 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-xs"
                        placeholder="123 Main St"
                        type="text"
                        value={form.street}
                        onChange={(e) => updateForm({ street: e.target.value })}
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">City</label>
                      <input
                        className="w-full h-8 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-xs"
                        type="text"
                        value={form.city}
                        onChange={(e) => updateForm({ city: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">State</label>
                      <input
                        className="w-full h-8 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-xs"
                        type="text"
                        value={form.state}
                        onChange={(e) => updateForm({ state: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">ZIP</label>
                      <input
                        className="w-full h-8 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-xs"
                        type="text"
                        value={form.zip}
                        onChange={(e) => updateForm({ zip: e.target.value })}
                      />
                    </div>
                    <div className="col-span-3 pt-1">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Language</label>
                      <select
                        className="w-full h-8 px-2 py-0 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-xs"
                        value={form.language}
                        onChange={(e) => updateForm({ language: e.target.value })}
                      >
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                    <div className="col-span-3 pt-1">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Notifications</label>
                      <div className="flex items-center gap-3 mt-1.5 h-6">
                        <label className="inline-flex items-center cursor-pointer group">
                          <input
                            className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5"
                            type="checkbox"
                            checked={form.notificationSms}
                            onChange={(e) => updateForm({ notificationSms: e.target.checked })}
                          />
                          <span className="ml-1.5 text-xs text-slate-600 dark:text-slate-400">SMS</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer group">
                          <input
                            className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5"
                            type="checkbox"
                            checked={form.notificationEmail}
                            onChange={(e) => updateForm({ notificationEmail: e.target.checked })}
                          />
                          <span className="ml-1.5 text-xs text-slate-600 dark:text-slate-400">Email</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[320px] flex flex-col gap-3 h-full overflow-hidden">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Additional Details</div>
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm flex flex-col gap-2">
                  <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 text-xs mb-1">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">emergency</span>
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      className="w-full h-7 px-2 rounded border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                      placeholder="Full Name"
                      type="text"
                      value={form.emergencyName}
                      onChange={(e) => updateForm({ emergencyName: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="w-full h-7 px-2 rounded border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                        placeholder="Relationship"
                        type="text"
                        value={form.emergencyRelationship}
                        onChange={(e) => updateForm({ emergencyRelationship: e.target.value })}
                      />
                      <input
                        className="w-full h-7 px-2 rounded border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                        placeholder="Phone"
                        type="tel"
                        value={form.emergencyPhone}
                        onChange={(e) => updateForm({ emergencyPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm flex flex-col gap-2 flex-1 overflow-y-auto min-h-0">
                  <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 text-xs mb-1 sticky top-0 bg-white dark:bg-surface-dark z-10">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">medical_services</span>
                    Provider &amp; Insurance
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Primary Care</label>
                      <select
                        className="w-full h-7 px-2 py-0 rounded border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                        value={form.primaryCare}
                        onChange={(e) => updateForm({ primaryCare: e.target.value })}
                      >
                        <option value="">Select Provider</option>
                        <option value="Dr. Smith">Dr. Smith</option>
                        <option value="Dr. Jones">Dr. Jones</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Insurance</label>
                      <input
                        className="w-full h-7 px-2 rounded border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                        placeholder="Plan or carrier"
                        type="text"
                        value={form.insurance}
                        onChange={(e) => updateForm({ insurance: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="w-full h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                  <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 text-xs mb-1 sticky top-0 bg-white dark:bg-surface-dark z-10">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">flag</span>
                    Clinical Notes
                  </h3>
                  <div className="space-y-2 h-full flex flex-col">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Allergies</label>
                      <input
                        className="w-full h-7 px-2 rounded border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                        placeholder="e.g. Penicillin, Latex"
                        type="text"
                        value={form.allergies}
                        onChange={(e) => updateForm({ allergies: e.target.value })}
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Intake Notes</label>
                      <textarea
                        className="w-full flex-1 p-2 rounded border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs resize-none"
                        placeholder="Add notes..."
                        value={form.intakeNotes}
                        onChange={(e) => updateForm({ intakeNotes: e.target.value })}
                      />
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
