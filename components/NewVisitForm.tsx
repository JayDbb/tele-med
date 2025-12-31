'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { useDoctor } from '@/contexts/DoctorContext'

interface NewVisitFormProps {
  patientId: string
}

const NewVisitForm = ({ patientId }: NewVisitFormProps) => {
  const router = useRouter()
  const { doctor } = useDoctor()
  // Check if this is a new patient (generated timestamp ID) vs existing patient
  const isNewPatient = patientId.length > 10 // Generated IDs are timestamps, existing are short
  const [patientData, setPatientData] = useState({
    name: '',
    dob: '',
    mrn: `MRN-${Date.now().toString().slice(-6)}`, // Generate MRN
    allergies: '',
    email: '',
    phone: '',
    gender: '',
    address: ''
  })

  const handleSavePatient = () => {
    if (!doctor) return
    
    // Generate new patient ID
    const newPatientId = Math.floor(Math.random() * 1000).toString()
    
    // Create patient data object
    const newPatient = {
      id: newPatientId,
      name: patientData.name,
      email: patientData.email,
      dob: patientData.dob,
      phone: patientData.phone,
      mrn: patientData.mrn,
      gender: patientData.gender,
      allergies: patientData.allergies,
      image: 'https://via.placeholder.com/150',
      physician: doctor.name,
      lastConsultation: new Date().toLocaleDateString(),
      appointment: 'To be scheduled',
      status: 'New Patient',
      statusColor: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300',
      doctorId: doctor.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Save using PatientDataManager for proper isolation and audit logging
    PatientDataManager.savePatient(newPatient, 'create', doctor.id)
    
    // Navigate to new patient profile
    router.push(`/patients/${newPatientId}`)
  }

  const patient = {
    name: patientData.name || 'New Patient',
    dob: patientData.dob || 'Not provided',
    mrn: patientData.mrn,
    allergies: patientData.allergies || 'None'
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      {!isNewPatient && <PatientDetailSidebar patientId={patientId} />}
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full flex flex-col gap-6">
            {/* Patient Registration Form (for new patients) */}
            {isNewPatient && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-sm">person_add</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Patient Registration</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={patientData.name}
                      onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter patient's full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      value={patientData.dob}
                      onChange={(e) => setPatientData({...patientData, dob: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">MRN</label>
                    <input
                      type="text"
                      value={patientData.mrn}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                    <select
                      value={patientData.gender}
                      onChange={(e) => setPatientData({...patientData, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={patientData.email}
                      onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="patient@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={patientData.phone}
                      onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Known Allergies</label>
                    <input
                      type="text"
                      value={patientData.allergies}
                      onChange={(e) => setPatientData({...patientData, allergies: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="e.g., Penicillin, Shellfish (or 'None')"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Patient Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold border border-yellow-200 dark:border-yellow-800">Draft</span>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">calendar_today</span> 
                    DOB: {patient.dob}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">id_card</span> 
                    MRN: {patient.mrn}
                  </span>
                  <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                    <span className="material-symbols-outlined text-sm">warning</span> 
                    Allergies: {patient.allergies}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href={`/patients/${patientId}`} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </Link>
                <button 
                  onClick={isNewPatient ? handleSavePatient : undefined}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
                >
                  <span>{isNewPatient ? 'Save Patient & Visit' : 'Continue to Visit'}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Recording Tools */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Recording Panel */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex gap-6">
                      <button className="flex flex-col items-center justify-center border-b-2 border-primary text-primary gap-1 pb-3 pt-4 px-2">
                        <span className="material-symbols-outlined">mic</span>
                        <span className="text-sm font-medium">Record</span>
                      </button>
                      <button className="flex flex-col items-center justify-center border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white gap-1 pb-3 pt-4 px-2">
                        <span className="material-symbols-outlined">cloud_upload</span>
                        <span className="text-sm font-medium">Upload</span>
                      </button>
                      <button className="flex flex-col items-center justify-center border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white gap-1 pb-3 pt-4 px-2">
                        <span className="material-symbols-outlined">keyboard</span>
                        <span className="text-sm font-medium">Type</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/30 dark:bg-gray-800/30 p-8 text-center gap-6 hover:border-primary/40 transition-colors cursor-pointer">
                      <div className="size-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-2">
                        <span className="material-symbols-outlined text-4xl">mic</span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ready to Capture</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-[280px] mx-auto">
                          Start recording the consultation to automatically generate clinical notes.
                        </p>
                      </div>
                      <button className="flex items-center justify-center rounded-lg px-6 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-sm transition-colors w-full max-w-[200px] gap-2">
                        <span className="material-symbols-outlined text-sm">fiber_manual_record</span>
                        <span>Start Recording</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Previous Visit Info */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Previous Visit</h3>
                    <a href="#" className="text-primary text-xs font-semibold hover:underline">View All</a>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Oct 24, 2023</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Follow-up</span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      Patient reported improvement in lower back pain. Continued physical therapy regimen. Prescribed NSAIDs as needed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: SOAP Note Form */}
              <div className="lg:col-span-8 flex flex-col">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <span className="material-symbols-outlined text-sm">description</span>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Visit Note</h2>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-sm">open_in_full</span>
                      </button>
                      <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-sm">settings</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="p-6 space-y-8 overflow-y-auto flex-1">
                    {/* Subjective Section */}
                    <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                      <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Subjective
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Chief Complaint & HPI</span>
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Chief Complaint</label>
                          <input 
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2" 
                            placeholder="e.g., Persistent cough, fever" 
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">History of Present Illness</label>
                          <textarea 
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 resize-none" 
                            placeholder="Describe the HPI..." 
                            rows={4}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Objective Section */}
                    <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                      <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Objective
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Vitals & Exam</span>
                      </h3>
                      
                      {/* Vitals Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">BP (mmHg)</label>
                          <input className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="120/80" type="text" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">HR (bpm)</label>
                          <input className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="72" type="text" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Temp (°F)</label>
                          <input className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="98.6" type="text" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Weight (lbs)</label>
                          <input className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="165" type="text" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Physical Exam Findings</label>
                        <textarea 
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 resize-none" 
                          placeholder="General appearance, HEENT, Lungs, Heart..." 
                          rows={3}
                        />
                      </div>
                    </section>

                    {/* Assessment & Plan */}
                    <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                      <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">Assessment & Plan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Assessment / Diagnosis</label>
                          <div className="relative">
                            <span className="absolute top-2.5 left-3 text-gray-500 dark:text-gray-400">
                              <span className="material-symbols-outlined text-sm">medical_services</span>
                            </span>
                            <textarea 
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 pl-10 py-2 resize-none" 
                              placeholder="Primary diagnosis..." 
                              rows={5}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Treatment Plan</label>
                          <div className="relative">
                            <span className="absolute top-2.5 left-3 text-gray-500 dark:text-gray-400">
                              <span className="material-symbols-outlined text-sm">healing</span>
                            </span>
                            <textarea 
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 pl-10 py-2 resize-none" 
                              placeholder="Medications, referrals, follow-up..." 
                              rows={5}
                            />
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Form Footer */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 italic">Last saved: 2 mins ago</span>
                    <div className="flex gap-3">
                      <button className="text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                        Save Draft
                      </button>
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

export default NewVisitForm