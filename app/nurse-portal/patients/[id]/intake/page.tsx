'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { useNurse } from '@/contexts/NurseContext'

type IntakeState = {
  firstName: string
  lastName: string
  dob: string
  sexAtBirth: string
  genderIdentity: string
  address: string
  phone: string
  email: string
  language: string
  commSms: boolean
  commPortal: boolean
  commEmail: boolean
  emergencyName: string
  emergencyRelationship: string
  emergencyPhone: string
  vitalsHeightFt: string
  vitalsHeightIn: string
  vitalsWeight: string
  vitalsBpSys: string
  vitalsBpDia: string
  vitalsHr: string
  vitalsTemp: string
  vitalsO2: string
  vitalsPain: string
  clinicalNotes: string
}

const defaultIntakeState: IntakeState = {
  firstName: '',
  lastName: '',
  dob: '',
  sexAtBirth: 'F',
  genderIdentity: 'F',
  address: '',
  phone: '',
  email: '',
  language: 'English',
  commSms: true,
  commPortal: true,
  commEmail: false,
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  vitalsHeightFt: '',
  vitalsHeightIn: '',
  vitalsWeight: '',
  vitalsBpSys: '',
  vitalsBpDia: '',
  vitalsHr: '',
  vitalsTemp: '',
  vitalsO2: '',
  vitalsPain: '0',
  clinicalNotes: ''
}

const getAge = (dob?: string) => {
  if (!dob) return null
  const date = new Date(dob)
  if (Number.isNaN(date.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - date.getFullYear()
  const monthDiff = today.getMonth() - date.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1
  }
  return age
}

export default function NursePatientIntakePage() {
  const params = useParams()
  const router = useRouter()
  const { nurse } = useNurse()
  const patientId = params.id as string
  const [intake, setIntake] = useState<IntakeState>(defaultIntakeState)
  const [patientName, setPatientName] = useState('Patient')
  const [mrn, setMrn] = useState('MRN-000000')

  useEffect(() => {
    const patient = PatientDataManager.getPatient(patientId)
    if (patient) {
      const nameParts = `${patient.name || ''}`.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ')
      setPatientName(patient.name || 'Patient')
      setMrn(patient.mrn || `MRN-${patientId.slice(-6)}`)
      setIntake((prev) => ({
        ...prev,
        firstName: firstName || prev.firstName,
        lastName: lastName || prev.lastName,
        dob: patient.dob || prev.dob,
        address: patient.address || prev.address,
        phone: patient.phone || prev.phone,
        email: patient.email || prev.email,
        genderIdentity: patient.gender || prev.genderIdentity
      }))
    }

    const intakeSection = PatientDataManager.getPatientSection(patientId, 'intake')
    if (intakeSection?.data) {
      setIntake((prev) => ({ ...prev, ...intakeSection.data }))
    }
  }, [patientId])

  const initials = useMemo(() => {
    return [intake.firstName, intake.lastName]
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'PT'
  }, [intake.firstName, intake.lastName])

  const age = getAge(intake.dob)
  const bmi = useMemo(() => {
    const ft = Number(intake.vitalsHeightFt)
    const inches = Number(intake.vitalsHeightIn)
    const weight = Number(intake.vitalsWeight)
    if (!ft && !inches) return ''
    if (!weight) return ''
    const totalInches = ft * 12 + inches
    if (!totalInches) return ''
    const bmiValue = (weight / (totalInches * totalInches)) * 703
    return bmiValue ? bmiValue.toFixed(1) : ''
  }, [intake.vitalsHeightFt, intake.vitalsHeightIn, intake.vitalsWeight])

  const allergies = PatientDataManager.getPatientSectionList(patientId, 'allergies')
  const medications = PatientDataManager.getPatientSectionList(patientId, 'medications')

  const handleSaveDraft = () => {
    const name = [intake.firstName.trim(), intake.lastName.trim()].filter(Boolean).join(' ')
    const updatedPatient = PatientDataManager.getPatient(patientId)
    if (updatedPatient) {
      PatientDataManager.savePatient(
        {
          ...updatedPatient,
          name: name || updatedPatient.name,
          dob: intake.dob || updatedPatient.dob,
          gender: intake.genderIdentity || updatedPatient.gender,
          phone: intake.phone || updatedPatient.phone,
          email: intake.email || updatedPatient.email,
          address: intake.address || updatedPatient.address,
          mrn: updatedPatient.mrn || mrn
        },
        'update',
        nurse?.id || 'current-user'
      )
    }

    PatientDataManager.updatePatientSection(patientId, 'intake', {
      data: intake,
      status: 'draft',
      updatedAt: new Date().toISOString()
    })
  }

  const handleCancel = () => {
    router.push(`/nurse-portal/patients/${patientId}`)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      <NurseSidebar />
      <PatientDetailSidebar patientId={patientId} />

      <main className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-hidden p-4 lg:p-6 bg-background-light dark:bg-black/20 min-w-0">
          <div className="max-w-[1600px] mx-auto h-full flex flex-col xl:flex-row gap-6 min-w-0">
            <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-2 pb-10 min-w-0">
              <div className="bg-surface-light dark:bg-[#101922] border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-lg font-bold">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-3">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{patientName}</h1>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          DOB: {intake.dob || 'Not provided'}{age !== null ? ` (${age}y)` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <span className="material-symbols-outlined text-[14px]">apartment</span>
                          Office Visit
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 border-l border-slate-300 dark:border-slate-700 pl-3">
                          <span className="material-symbols-outlined text-[14px]">stethoscope</span>
                          Dr. Sarah Smith
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 ml-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Intake in progress
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCancel}
                      className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDraft}
                      className="flex items-center gap-2 px-4 py-2 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-all text-sm shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Save Draft
                    </button>
                    <button
                      onClick={() => {
                        handleSaveDraft()
                        router.push(`/nurse-portal/patients/${patientId}/schedule`)
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-all text-sm shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">event</span>
                      Save &amp; Schedule
                    </button>
                    <button
                      onClick={() => {
                        handleSaveDraft()
                        router.push(`/nurse-portal/patients/${patientId}/new-visit`)
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-blue-600 transition-all text-sm shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                      Start Visit
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="p-1 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </span>
                    Personal &amp; Contact Info
                  </h2>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                    Chart Sync Active
                  </span>
                </div>
                <div className="p-5 grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-4">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">First Name <span className="text-red-500">*</span></label>
                    <input
                      className="w-full h-9 px-3 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      type="text"
                      value={intake.firstName}
                      onChange={(e) => setIntake({ ...intake, firstName: e.target.value })}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Last Name <span className="text-red-500">*</span></label>
                    <input
                      className="w-full h-9 px-3 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      type="text"
                      value={intake.lastName}
                      onChange={(e) => setIntake({ ...intake, lastName: e.target.value })}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-4">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                    <input
                      className="w-full h-9 px-3 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      type="date"
                      value={intake.dob}
                      onChange={(e) => setIntake({ ...intake, dob: e.target.value })}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Sex at Birth</label>
                    <select
                      className="w-full h-9 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      value={intake.sexAtBirth}
                      onChange={(e) => setIntake({ ...intake, sexAtBirth: e.target.value })}
                    >
                      <option value="F">Female</option>
                      <option value="M">Male</option>
                      <option value="I">Intersex</option>
                    </select>
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Gender Identity</label>
                    <select
                      className="w-full h-9 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      value={intake.genderIdentity}
                      onChange={(e) => setIntake({ ...intake, genderIdentity: e.target.value })}
                    >
                      <option value="F">Female</option>
                      <option value="M">Male</option>
                      <option value="NB">Non-binary</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Address</label>
                    <input
                      className="w-full h-9 px-3 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      type="text"
                      value={intake.address}
                      onChange={(e) => setIntake({ ...intake, address: e.target.value })}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Mobile Phone</label>
                    <input
                      className="w-full h-9 px-3 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      type="tel"
                      value={intake.phone}
                      onChange={(e) => setIntake({ ...intake, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
                    <input
                      className="w-full h-9 px-3 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      type="email"
                      value={intake.email}
                      onChange={(e) => setIntake({ ...intake, email: e.target.value })}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Preferred Language</label>
                    <select
                      className="w-full h-9 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      value={intake.language}
                      onChange={(e) => setIntake({ ...intake, language: e.target.value })}
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">Comm. Preferences</label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          checked={intake.commSms}
                          onChange={(e) => setIntake({ ...intake, commSms: e.target.checked })}
                          className="rounded border-slate-300 text-primary h-3.5 w-3.5"
                          type="checkbox"
                        />
                        <span className="ml-1.5 text-xs text-slate-700 dark:text-slate-300">SMS</span>
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          checked={intake.commPortal}
                          onChange={(e) => setIntake({ ...intake, commPortal: e.target.checked })}
                          className="rounded border-slate-300 text-primary h-3.5 w-3.5"
                          type="checkbox"
                        />
                        <span className="ml-1.5 text-xs text-slate-700 dark:text-slate-300">Portal</span>
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          checked={intake.commEmail}
                          onChange={(e) => setIntake({ ...intake, commEmail: e.target.checked })}
                          className="rounded border-slate-300 text-primary h-3.5 w-3.5"
                          type="checkbox"
                        />
                        <span className="ml-1.5 text-xs text-slate-700 dark:text-slate-300">Email</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <button className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                  <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 group-hover:text-slate-900 dark:group-hover:text-white">
                    <span className="p-1 rounded bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      <span className="material-symbols-outlined text-[18px]">contact_emergency</span>
                    </span>
                    Emergency Contact
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-normal">0 Contacts</span>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 transition-transform">expand_more</span>
                  </div>
                </button>
                <div className="border-t border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-surface-dark">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 sm:col-span-5">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Name</label>
                      <input
                        className="w-full h-9 px-3 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                        type="text"
                        value={intake.emergencyName}
                        onChange={(e) => setIntake({ ...intake, emergencyName: e.target.value })}
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Relationship</label>
                      <input
                        className="w-full h-9 px-3 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                        type="text"
                        value={intake.emergencyRelationship}
                        onChange={(e) => setIntake({ ...intake, emergencyRelationship: e.target.value })}
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Phone</label>
                      <input
                        className="w-full h-9 px-3 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                        type="tel"
                        value={intake.emergencyPhone}
                        onChange={(e) => setIntake({ ...intake, emergencyPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="p-1 rounded bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                      <span className="material-symbols-outlined text-[18px]">vital_signs</span>
                    </span>
                    Vitals
                  </h2>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Unsaved</span>
                </div>
                <div className="p-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  <div className="col-span-2 md:col-span-2 lg:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Height</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          className="w-full h-9 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-center"
                          type="number"
                          placeholder="5"
                          value={intake.vitalsHeightFt}
                          onChange={(e) => setIntake({ ...intake, vitalsHeightFt: e.target.value })}
                        />
                        <span className="absolute right-2 top-2 text-xs text-slate-400 pointer-events-none">ft</span>
                      </div>
                      <div className="relative flex-1">
                        <input
                          className="w-full h-9 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-center"
                          type="number"
                          placeholder="6"
                          value={intake.vitalsHeightIn}
                          onChange={(e) => setIntake({ ...intake, vitalsHeightIn: e.target.value })}
                        />
                        <span className="absolute right-2 top-2 text-xs text-slate-400 pointer-events-none">in</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-1 lg:col-span-1">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Weight</label>
                    <div className="relative">
                      <input
                        className="w-full h-9 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-center"
                        type="number"
                        placeholder="140"
                        value={intake.vitalsWeight}
                        onChange={(e) => setIntake({ ...intake, vitalsWeight: e.target.value })}
                      />
                      <span className="absolute right-2 top-2 text-xs text-slate-400 pointer-events-none">lb</span>
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-1 lg:col-span-1">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">BMI</label>
                    <input
                      className="w-full h-9 px-2 rounded border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 text-sm text-center cursor-not-allowed"
                      disabled
                      placeholder="-"
                      type="text"
                      value={bmi}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-2 lg:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">BP (Sys/Dia)</label>
                    <div className="flex items-center gap-1">
                      <input
                        className="w-full h-9 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-center"
                        type="number"
                        placeholder="120"
                        value={intake.vitalsBpSys}
                        onChange={(e) => setIntake({ ...intake, vitalsBpSys: e.target.value })}
                      />
                      <span className="text-slate-400">/</span>
                      <input
                        className="w-full h-9 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-center"
                        type="number"
                        placeholder="80"
                        value={intake.vitalsBpDia}
                        onChange={(e) => setIntake({ ...intake, vitalsBpDia: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-1 lg:col-span-1">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">HR</label>
                    <div className="relative">
                      <input
                        className="w-full h-9 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-center"
                        type="number"
                        placeholder="72"
                        value={intake.vitalsHr}
                        onChange={(e) => setIntake({ ...intake, vitalsHr: e.target.value })}
                      />
                      <span className="absolute right-1 top-2.5 text-[10px] text-slate-400 pointer-events-none">bpm</span>
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-1 lg:col-span-1">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Temp</label>
                    <div className="relative">
                      <input
                        className="w-full h-9 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-center"
                        type="number"
                        placeholder="98.6"
                        value={intake.vitalsTemp}
                        onChange={(e) => setIntake({ ...intake, vitalsTemp: e.target.value })}
                      />
                      <span className="absolute right-2 top-2 text-xs text-slate-400 pointer-events-none">°F</span>
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-1 lg:col-span-1">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">O2 Sat</label>
                    <div className="relative">
                      <input
                        className="w-full h-9 px-2 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-center"
                        type="number"
                        placeholder="98"
                        value={intake.vitalsO2}
                        onChange={(e) => setIntake({ ...intake, vitalsO2: e.target.value })}
                      />
                      <span className="absolute right-2 top-2 text-xs text-slate-400 pointer-events-none">%</span>
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-1 lg:col-span-1">
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Pain</label>
                    <select
                      className="w-full h-9 px-1 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-center"
                      value={intake.vitalsPain}
                      onChange={(e) => setIntake({ ...intake, vitalsPain: e.target.value })}
                    >
                      {Array.from({ length: 11 }).map((_, index) => (
                        <option key={index} value={index}>{index}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full xl:w-[400px] flex flex-col gap-5 h-full overflow-y-auto pb-10 min-w-0">
              <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-[20px]">warning</span>
                    Allergies
                  </h2>
                  <button className="text-xs font-semibold text-primary hover:text-blue-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">add</span> Add
                  </button>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  {allergies.length === 0 ? (
                    <div className="text-xs text-slate-500 dark:text-slate-400">No allergies recorded</div>
                  ) : (
                    allergies.slice(0, 3).map((allergy: any) => (
                      <div key={allergy.id || allergy.name} className="flex items-start gap-3 p-3 rounded-lg border border-red-100 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30">
                        <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5">block</span>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{allergy.name || 'Allergy'}</span>
                            <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded">{allergy.severity || 'Active'}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reaction: {allergy.reactions || 'Not specified'}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <label className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                    <input className="rounded border-slate-300 text-primary h-4 w-4" type="checkbox" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Mark as No Known Allergies (NKA)</span>
                  </label>
                </div>
              </div>

              <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-[20px]">pill</span>
                    Medications
                  </h2>
                  <button className="text-xs font-semibold text-primary hover:text-blue-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">add</span> Add
                  </button>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  {medications.length === 0 ? (
                    <div className="text-xs text-slate-500 dark:text-slate-400">No medications recorded</div>
                  ) : (
                    medications.slice(0, 3).map((medication: any) => (
                      <div key={medication.id || medication.name} className="p-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 flex items-center justify-between group hover:border-primary/50 transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{medication.name || medication.brand || 'Medication'}</p>
                          <p className="text-xs text-slate-500">{medication.dosage || 'Dose not recorded'}</p>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 flex flex-col min-h-[200px]">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 text-[20px]">sticky_note_2</span>
                    Clinical Notes
                  </h2>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <textarea
                    className="w-full flex-1 p-3 rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm resize-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Enter patient comments, flags, or special instructions here..."
                    value={intake.clinicalNotes}
                    onChange={(e) => setIntake({ ...intake, clinicalNotes: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
