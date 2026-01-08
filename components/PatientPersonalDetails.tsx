'use client'

import { useEffect, useState } from 'react'
import { PatientDataManager } from '@/utils/PatientDataManager'

interface PatientPersonalDetailsProps {
  patientId: string
}

const PatientPersonalDetails = ({ patientId }: PatientPersonalDetailsProps) => {
  const patient = PatientDataManager.getPatient(patientId)
  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState({
    name: patient?.name || '',
    dob: patient?.dob || '',
    phone: patient?.phone || '',
    address: patient?.address || '',
    email: patient?.email || '',
    physician: patient?.physician || '',
    lastConsultation: patient?.lastConsultation || '',
    appointment: patient?.appointment || ''
  })

  useEffect(() => {
    if (!patient) return
    setDraft({
      name: patient.name || '',
      dob: patient.dob || '',
      phone: patient.phone || '',
      address: patient.address || '',
      email: patient.email || '',
      physician: patient.physician || '',
      lastConsultation: patient.lastConsultation || '',
      appointment: patient.appointment || ''
    })
  }, [patientId, patient?.name, patient?.dob, patient?.phone, patient?.address, patient?.email, patient?.physician, patient?.lastConsultation, patient?.appointment])

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
    PatientDataManager.savePatient(
      {
        ...patient,
        name: draft.name,
        dob: draft.dob,
        phone: draft.phone,
        address: draft.address,
        email: draft.email,
        physician: draft.physician,
        lastConsultation: draft.lastConsultation,
        appointment: draft.appointment
      },
      'update',
      patient.doctorId || patient.nurseId || 'current-user'
    )
    setEditMode(false)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Details</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage demographic and medical context fields.</p>
        </div>
        <div className="flex items-center gap-3">
          {editMode ? (
            <>
              <button
                onClick={handleSaveProfile}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                Save
              </button>
              <button
                onClick={() => {
                  setDraft({
                    name: patient.name || '',
                    dob: patient.dob || '',
                    phone: patient.phone || '',
                    address: patient.address || '',
                    email: patient.email || '',
                    physician: patient.physician || '',
                    lastConsultation: patient.lastConsultation || '',
                    appointment: patient.appointment || ''
                  })
                  setEditMode(false)
                }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Last name</label>
              {editMode ? (
                <input
                  value={getNameParts().lastName}
                  onChange={(e) => updateNamePart('last', e.target.value)}
                  className="w-full text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
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
                  className="w-full text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
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
                  className="w-full text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
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
                  className="w-full text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                />
              ) : (
                <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.phone || 'Not provided'}</div>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Address</label>
              {editMode ? (
                <input
                  value={draft.address}
                  onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                  className="w-full text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
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
                  className="w-full text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                />
              ) : (
                <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.email || 'Not provided'}</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Medical Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Physician</label>
              {editMode ? (
                <input
                  value={draft.physician}
                  onChange={(e) => setDraft({ ...draft, physician: e.target.value })}
                  className="w-full text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
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
                  className="w-full text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
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
                  className="w-full text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                />
              ) : (
                <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.appointment || 'Not scheduled'}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientPersonalDetails
