'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import VitalsChart from './VitalsChart'
import VisitHistory from './VisitHistory'
import { PatientDataManager } from '@/utils/PatientDataManager'

interface PatientDetailProps {
  patientId: string
}

const PatientDetail = ({ patientId }: PatientDetailProps) => {
  const pathname = usePathname()
  const patient = PatientDataManager.getPatient(patientId)
  const basePath = pathname.startsWith('/nurse-portal')
    ? '/nurse-portal/patients'
    : pathname.startsWith('/doctor')
      ? '/doctor/patients'
      : '/patients'
  const patientBasePath = `${basePath}/${patientId}`
  
  if (!patient) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Patient Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The requested patient could not be found.</p>
        </div>
      </div>
    )
  }
  
  const vitals = PatientDataManager.getPatientSectionList(patientId, 'vitals')
  const allergies = PatientDataManager.getPatientSectionList(patientId, 'allergies')
  const medications = PatientDataManager.getPatientSectionList(patientId, 'medications')
  const history = PatientDataManager.getPatientSectionList(patientId, 'past-medical-history')
  const isNewPatient = vitals.length === 0 && allergies.length === 0 && medications.length === 0 && history.length === 0

  const getAge = (dob?: string) => {
    if (!dob) return 'Not provided'
    const birthDate = new Date(dob)
    if (Number.isNaN(birthDate.getTime())) return 'Not provided'
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1
    }
    return `${age}`
  }

  const tags = Array.isArray(patient.tags) ? patient.tags : []
  const patientAge = patient.dob ? Number(getAge(patient.dob)) : undefined
  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState({
    name: patient.name || '',
    dob: patient.dob || '',
    phone: patient.phone || '',
    address: patient.address || '',
    email: patient.email || '',
    gender: patient.gender || '',
    language: patient.language || '',
    height: patient.height || '',
    physician: patient.physician || '',
    lastConsultation: patient.lastConsultation || '',
    appointment: patient.appointment || '',
    notes: patient.notes || '',
    tags: tags.join(', ')
  })

  useEffect(() => {
    setDraft({
      name: patient.name || '',
      dob: patient.dob || '',
      phone: patient.phone || '',
      address: patient.address || '',
      email: patient.email || '',
      gender: patient.gender || '',
      language: patient.language || '',
      height: patient.height || '',
      physician: patient.physician || '',
      lastConsultation: patient.lastConsultation || '',
      appointment: patient.appointment || '',
      notes: patient.notes || '',
      tags: tags.join(', ')
    })
  }, [patientId, patient.name, patient.dob, patient.phone, patient.address, patient.email, patient.gender, patient.language, patient.height, patient.physician, patient.lastConsultation, patient.appointment, patient.notes, tags.join(', ')])

  const getNameParts = () => {
    const parts = draft.name.trim().split(' ')
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ')
    }
  }

  const updateNamePart = (part: 'first' | 'last', value: string) => {
    const { firstName, lastName } = getNameParts()
    const nextFirst = part === 'first' ? value : firstName
    const nextLast = part === 'last' ? value : lastName
    setDraft({ ...draft, name: [nextFirst.trim(), nextLast.trim()].filter(Boolean).join(' ') })
  }

  const formatPhysician = (name?: string) => {
    if (!name) return 'Not assigned'
    if (name.toLowerCase().startsWith('dr.')) return name
    if (name.toLowerCase().startsWith('dr ')) return name
    return `Dr. ${name}`
  }

  const handleSaveProfile = () => {
    const nextTags = draft.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
    PatientDataManager.savePatient(
      {
        ...patient,
        name: draft.name,
        dob: draft.dob,
        phone: draft.phone,
        address: draft.address,
        email: draft.email,
        gender: draft.gender,
        language: draft.language,
        height: draft.height,
        physician: draft.physician,
        lastConsultation: draft.lastConsultation,
        appointment: draft.appointment,
        notes: draft.notes,
        tags: nextTags
      },
      'update',
      patient.doctorId || patient.nurseId || 'current-user'
    )
    setEditMode(false)
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Overview</h1>
        <div className="flex items-center gap-3">
          {editMode ? (
            <>
              <button
                onClick={handleSaveProfile}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                Save Profile
              </button>
              <button
                onClick={() => {
                  setDraft({
                    name: patient.name || '',
                    dob: patient.dob || '',
                    phone: patient.phone || '',
                    address: patient.address || '',
                    email: patient.email || '',
                    gender: patient.gender || '',
                    language: patient.language || '',
                    height: patient.height || '',
                    physician: patient.physician || '',
                    lastConsultation: patient.lastConsultation || '',
                    appointment: patient.appointment || '',
                    notes: patient.notes || '',
                    tags: tags.join(', ')
                  })
                  setEditMode(false)
                }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile
              </button>
              <Link href={`${patientBasePath}/new-visit`} className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
                <span className="material-symbols-outlined text-sm">edit_calendar</span>
                Log New Visit
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="w-full xl:w-1/4 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <div className="mb-4">
              {patient.image ? (
                <img 
                  alt={patient.name} 
                  className="w-24 h-24 rounded-xl object-cover mx-auto" 
                  src={patient.image}
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xl font-semibold mx-auto">
                  {(patient.name || 'P').slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{patient.name}</h2>
            <p className="text-green-500 text-sm font-medium mb-4">{patient.status}</p>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Gender</span>
              {editMode ? (
                <input
                  value={draft.gender}
                  onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
                  className="w-full text-right text-sm font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                />
              ) : (
                <span className="font-medium text-right text-gray-900 dark:text-white">{patient.gender || 'Not provided'}</span>
              )}
              <span className="text-gray-500 dark:text-gray-400">Age</span>
              <span className="font-medium text-right text-gray-900 dark:text-white">{getAge(patient.dob)}</span>
              <span className="text-gray-500 dark:text-gray-400">Language</span>
              {editMode ? (
                <input
                  value={draft.language}
                  onChange={(e) => setDraft({ ...draft, language: e.target.value })}
                  className="w-full text-right text-sm font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                />
              ) : (
                <span className="font-medium text-right text-gray-900 dark:text-white">{patient.language || 'Not provided'}</span>
              )}
              <span className="text-gray-500 dark:text-gray-400">Height</span>
              {editMode ? (
                <input
                  value={draft.height}
                  onChange={(e) => setDraft({ ...draft, height: e.target.value })}
                  className="w-full text-right text-sm font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                />
              ) : (
                <span className="font-medium text-right text-gray-900 dark:text-white">{patient.height || 'Not provided'}</span>
              )}
            </div>

            <div className="mt-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">Tags</p>
              {editMode ? (
                <input
                  value={draft.tags}
                  onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
                  className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                  placeholder="tag1, tag2"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.length > 0 ? (
                    tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded-md">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md">No tags</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Allergies</h3>
            <div className="space-y-3">
              {allergies.length > 0 ? (
                allergies.slice(0, 3).map((allergy: any) => (
                  <div key={allergy.id || allergy.name} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">{allergy.name || 'Unnamed allergy'}</span>
                    <span className="text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded text-xs font-medium">
                      {allergy.severity || 'Unknown'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No known allergies</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Notes</h3>
            {editMode ? (
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-2 text-gray-900 dark:text-white resize-none"
                rows={3}
              />
            ) : patient.notes ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  {patient.notes}
                </p>
                <Link 
                  href={`${patientBasePath}/notes`}
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors flex items-center gap-1"
                >
                  View all notes
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">No notes yet.</p>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {isNewPatient && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">info</span>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Complete Patient Profile</h3>
              </div>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">This is a new patient profile. Complete the following sections to provide comprehensive care:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href={`${patientBasePath}/vitals`} className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors">
                  <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-sm">monitor_heart</span>
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Add Vitals</span>
                </Link>
                <Link href={`${patientBasePath}/allergies`} className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors">
                  <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-sm">warning</span>
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Add Allergies</span>
                </Link>
                <Link href={`${patientBasePath}/medications`} className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors">
                  <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-sm">medication</span>
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Add Medications</span>
                </Link>
                <Link href={`${patientBasePath}/past-medical-history`} className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors">
                  <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-sm">history</span>
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Add History</span>
                </Link>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Personal Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Last name</label>
                  {editMode ? (
                    <input
                      value={getNameParts().lastName}
                      onChange={(e) => updateNamePart('last', e.target.value)}
                      className="w-full text-sm font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.name.split(' ')[1] || 'N/A'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">First name</label>
                  {editMode ? (
                    <input
                      value={getNameParts().firstName}
                      onChange={(e) => updateNamePart('first', e.target.value)}
                      className="w-full text-sm font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.name.split(' ')[0]}</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Birthdate</label>
                  {editMode ? (
                    <input
                      type="date"
                      value={draft.dob}
                      onChange={(e) => setDraft({ ...draft, dob: e.target.value })}
                      className="w-full text-sm font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {patient.dob || 'Not provided'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                  {editMode ? (
                    <input
                      value={draft.phone}
                      onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                      className="w-full text-sm font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.phone || 'Not provided'}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Address</label>
                  {editMode ? (
                    <input
                      value={draft.address}
                      onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                      className="w-full text-sm font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.address || 'Not provided'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email</label>
                  {editMode ? (
                    <input
                      type="email"
                      value={draft.email}
                      onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                      className="w-full text-sm font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.email || 'Not provided'}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

            <div>
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Medical Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Physician</label>
                  {editMode ? (
                    <input
                      value={draft.physician}
                      onChange={(e) => setDraft({ ...draft, physician: e.target.value })}
                      className="w-full text-sm font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatPhysician(patient.physician)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Last Consultation</label>
                  {editMode ? (
                    <input
                      value={draft.lastConsultation}
                      onChange={(e) => setDraft({ ...draft, lastConsultation: e.target.value })}
                      className="w-full text-sm font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.lastConsultation || 'Not recorded'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Next Appointment</label>
                  {editMode ? (
                    <input
                      value={draft.appointment}
                      onChange={(e) => setDraft({ ...draft, appointment: e.target.value })}
                      className="w-full text-sm font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.appointment || 'Not scheduled'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <VisitHistory patientId={patientId} />

          <VitalsChart patientId={patientId} patientAge={Number.isFinite(patientAge) ? patientAge : undefined} />

          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Health Trends & Analysis</h3>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">Insights</span>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Latest: No trend data yet</p>
            
            <div className="grid grid-cols-4 gap-3 mb-3">
              <Link href={`${patientBasePath}/trends/blood-pressure`} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <p className="text-xs text-gray-500 dark:text-gray-400">BP</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">--</p>
                <span className="text-xs text-gray-500">—</span>
              </Link>
              <Link href={`${patientBasePath}/trends/pulse`} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <p className="text-xs text-gray-500 dark:text-gray-400">Pulse</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">--</p>
                <span className="text-xs text-gray-500">—</span>
              </Link>
              <Link href={`${patientBasePath}/trends/weight`} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">--</p>
                <span className="text-xs text-gray-500">—</span>
              </Link>
              <Link href={`${patientBasePath}/trends/temperature`} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <p className="text-xs text-gray-500 dark:text-gray-400">Temp</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">--</p>
                <span className="text-xs text-gray-500">—</span>
              </Link>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
              <p className="text-xs text-blue-800 dark:text-blue-200">No automated insights yet.</p>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Meds: </span>
                <span className="text-gray-900 dark:text-white">None recorded</span>
              </div>
              <Link href="/medications" className="text-primary hover:text-primary/80 font-medium">View →</Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Medication History</h3>
              <Link href="/medications" className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium">
                <span className="material-symbols-outlined text-sm">add</span>
                Add
              </Link>
            </div>
            
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="font-medium pb-2 pr-3 text-left">Brand Name</th>
                  <th className="font-medium pb-2 pr-3 text-left">Generic</th>
                  <th className="font-medium pb-2 pr-3 text-left">Strength</th>
                  <th className="font-medium pb-2 pr-3 text-left">Form</th>
                  <th className="font-medium pb-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-900 dark:text-white">
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">medication</span>
                    <p>No medications recorded</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default PatientDetail
