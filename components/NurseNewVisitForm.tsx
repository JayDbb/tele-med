'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import NurseSidebar from '@/components/NurseSidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { PatientDataManager } from '@/utils/PatientDataManager'
import { useNurse } from '@/contexts/NurseContext'
import { usePatientRoutes } from '@/lib/usePatientRoutes'

interface NurseNewVisitFormProps {
  patientId: string
}

const NurseNewVisitForm = ({ patientId }: NurseNewVisitFormProps) => {
  const router = useRouter()
  const { nurse } = useNurse()
  const { getPatientUrl } = usePatientRoutes()
  const isNewPatient = patientId.length > 10
  const [activeTab, setActiveTab] = useState('record')
  const profilePhotoInputRef = useRef<HTMLInputElement | null>(null)
  const documentsInputRef = useRef<HTMLInputElement | null>(null)
  const [expandedSections, setExpandedSections] = useState({
    subjective: true,
    objective: true,
    assessmentPlan: true,
    vaccines: false,
    familyHistory: false,
    riskFlags: false,
    surgicalHistory: false,
    pastMedicalHistory: false,
    orders: false
  })
  const [patientData, setPatientData] = useState({
    name: '',
    dob: '',
    mrn: `MRN-${Date.now().toString().slice(-6)}`,
    allergies: '',
    email: '',
    phone: '',
    gender: '',
    address: '',
    image: ''
  })
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  const [visitData, setVisitData] = useState({
    subjective: {
      chiefComplaint: '',
      hpi: ''
    },
    objective: {
      bp: '',
      hr: '',
      temp: '',
      weight: '',
      examFindings: ''
    },
    assessmentPlan: {
      assessment: '',
      plan: ''
    },
    vaccines: {
      name: '',
      date: '',
      dose: '',
      site: '',
      route: '',
      lotNumber: '',
      manufacturer: ''
    },
    familyHistory: {
      relationship: '',
      status: '',
      conditions: ''
    },
    riskFlags: {
      tobaccoUse: '',
      tobaccoAmount: '',
      alcoholUse: '',
      alcoholFrequency: '',
      housingStatus: '',
      occupation: ''
    },
    surgicalHistory: {
      procedure: '',
      date: '',
      site: '',
      surgeon: '',
      outcome: '',
      source: ''
    },
    pastMedicalHistory: {
      condition: '',
      status: '',
      diagnosedDate: '',
      impact: '',
      icd10: '',
      source: ''
    },
    orders: {
      type: '',
      priority: '',
      details: '',
      status: '',
      dateOrdered: ''
    }
  })
  const draftKey = 'new-visit-nurse'

  useEffect(() => {
    const draft = PatientDataManager.getDraft(patientId, draftKey)
    if (!draft?.data) return
    if (draft.data.patientData) {
      setPatientData((prev) => ({ ...prev, ...draft.data.patientData }))
    }
    if (draft.data.visitData) {
      setVisitData((prev) => ({ ...prev, ...draft.data.visitData }))
    }
    if (draft.data.uploadedDocuments) {
      setUploadedDocuments(draft.data.uploadedDocuments)
    }
  }, [patientId])

  useEffect(() => {
    const timeout = setTimeout(() => {
      PatientDataManager.saveDraft(patientId, draftKey, {
        patientData,
        visitData,
        uploadedDocuments
      })
    }, 500)
    return () => clearTimeout(timeout)
  }, [patientId, patientData, visitData, uploadedDocuments])

  const savePatientData = () => {
    if (!nurse) return

    const newPatientId = patientId
    const hasValues = (section: Record<string, string>) =>
      Object.values(section).some((value) => value && value.trim().length > 0)

    const newPatient = {
      id: newPatientId,
      name: patientData.name,
      email: patientData.email,
      dob: patientData.dob,
      phone: patientData.phone,
      mrn: patientData.mrn,
      gender: patientData.gender,
      allergies: patientData.allergies,
      address: patientData.address,
      image: patientData.image,
      physician: 'To be assigned',
      lastConsultation: new Date().toLocaleDateString(),
      appointment: 'To be scheduled',
      status: 'New Patient',
      statusColor: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300',
      doctorId: '',
      nurseId: nurse.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    PatientDataManager.savePatient(newPatient, isNewPatient ? 'create' : 'update', nurse.id)
    
    // Clear draft after successful save
    PatientDataManager.clearDraft(patientId, draftKey)

    const visits = PatientDataManager.getPatientSectionList(newPatientId, 'visits')
    const visitId = Date.now().toString()
    const visitRecord = {
      id: visitId,
      recordedAt: new Date().toISOString(),
      providerId: nurse.id,
      providerName: nurse.name,
      subjective: visitData.subjective,
      objective: visitData.objective,
      assessmentPlan: visitData.assessmentPlan
    }
    PatientDataManager.savePatientSectionList(newPatientId, 'visits', [visitRecord, ...visits], nurse.id)

    if (hasValues(visitData.objective)) {
      const vitals = PatientDataManager.getPatientSectionList(newPatientId, 'vitals')
      PatientDataManager.savePatientSectionList(newPatientId, 'vitals', [
        {
          id: visitId,
          recordedAt: new Date().toISOString(),
          ...visitData.objective
        },
        ...vitals
      ], nurse.id)
    }

    if (patientData.allergies.trim()) {
      const allergies = PatientDataManager.getPatientSectionList(newPatientId, 'allergies')
      const allergyItems = patientData.allergies
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({
          id: `${visitId}-${name}`,
          name,
          severity: '',
          reactions: '',
          status: 'Active',
          recordedAt: new Date().toISOString()
        }))
      PatientDataManager.savePatientSectionList(newPatientId, 'allergies', [...allergyItems, ...allergies], nurse.id)
    }

    if (hasValues(visitData.vaccines)) {
      const vaccines = PatientDataManager.getPatientSectionList(newPatientId, 'vaccines')
      PatientDataManager.savePatientSectionList(newPatientId, 'vaccines', [
        { id: visitId, ...visitData.vaccines, recordedAt: new Date().toISOString() },
        ...vaccines
      ], nurse.id)
    }

    if (hasValues(visitData.familyHistory)) {
      const familyHistory = PatientDataManager.getPatientSectionList(newPatientId, 'family-history')
      PatientDataManager.savePatientSectionList(newPatientId, 'family-history', [
        { id: visitId, ...visitData.familyHistory, recordedAt: new Date().toISOString() },
        ...familyHistory
      ], nurse.id)
    }

    if (hasValues(visitData.riskFlags)) {
      const socialHistory = PatientDataManager.getPatientSectionList(newPatientId, 'social-history')
      PatientDataManager.savePatientSectionList(newPatientId, 'social-history', [
        { id: visitId, ...visitData.riskFlags, recordedAt: new Date().toISOString() },
        ...socialHistory
      ], nurse.id)
    }

    if (hasValues(visitData.surgicalHistory)) {
      const surgicalHistory = PatientDataManager.getPatientSectionList(newPatientId, 'surgical-history')
      PatientDataManager.savePatientSectionList(newPatientId, 'surgical-history', [
        { id: visitId, ...visitData.surgicalHistory, recordedAt: new Date().toISOString() },
        ...surgicalHistory
      ], nurse.id)
    }

    if (hasValues(visitData.pastMedicalHistory)) {
      const pastMedicalHistory = PatientDataManager.getPatientSectionList(newPatientId, 'past-medical-history')
      PatientDataManager.savePatientSectionList(newPatientId, 'past-medical-history', [
        { id: visitId, ...visitData.pastMedicalHistory, recordedAt: new Date().toISOString() },
        ...pastMedicalHistory
      ], nurse.id)
    }

    if (hasValues(visitData.orders)) {
      const orders = PatientDataManager.getPatientSectionList(newPatientId, 'orders')
      PatientDataManager.savePatientSectionList(newPatientId, 'orders', [
        { id: visitId, ...visitData.orders, recordedAt: new Date().toISOString() },
        ...orders
      ], nurse.id)
    }

    if (uploadedDocuments.length > 0) {
      const documents = PatientDataManager.getPatientSectionList(newPatientId, 'documents')
      PatientDataManager.savePatientSectionList(newPatientId, 'documents', [
        ...uploadedDocuments,
        ...documents
      ], nurse.id)
    }

    PatientDataManager.clearDraft(patientId, draftKey)

    return newPatientId
  }

  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setPatientData({ ...patientData, image: result })
    }
    reader.readAsDataURL(file)
  }

  const handleDocumentsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : ''
        setUploadedDocuments((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${file.name}`,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            dataUrl: result
          }
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSavePatientAndSchedule = () => {
    const newPatientId = savePatientData()
    if (!newPatientId) return
    // TODO: Navigate to scheduling page
    console.log('Navigate to scheduling for patient:', newPatientId)
  }

  const handleSavePatientAndClose = () => {
    const newPatientId = savePatientData()
    if (!newPatientId) return
    router.push('/nurse-portal')
  }

  const handleSavePatient = () => {
    const newPatientId = savePatientData()
    if (!newPatientId) return
    router.push(getPatientUrl(newPatientId))
  }

  const patient = isNewPatient ? {
    name: patientData.name || 'New Patient',
    dob: patientData.dob ? new Date(patientData.dob).toLocaleDateString() : 'Not provided',
    mrn: patientData.mrn,
    allergies: patientData.allergies || 'None'
  } : {
    name: 'Patient',
    dob: 'Not provided',
    mrn: 'Not assigned',
    allergies: 'None'
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NurseSidebar />
      {!isNewPatient && <PatientDetailSidebar patientId={patientId} />}
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full flex flex-col gap-6">
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
              <div className="flex flex-wrap gap-3">
                <Link href="/nurse-portal" className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </Link>
                {isNewPatient ? (
                  <>
                    <button 
                      onClick={handleSavePatientAndSchedule}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
                    >
                      <span>Save Patient & Schedule Doctor</span>
                      <span className="material-symbols-outlined text-sm">event</span>
                    </button>
                    <button 
                      onClick={handleSavePatientAndClose}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
                    >
                      <span>Save Patient & Close</span>
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                    <button 
                      onClick={handleSavePatient}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
                    >
                      <span>Save Patient & Visit</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </>
                ) : (
                  <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
                    <span>Continue to Visit</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 flex flex-col gap-6">
                {isNewPatient && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-sm">person_add</span>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Patient Registration</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={patientData.name}
                          onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Enter patient's full name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth *</label>
                          <input
                            type="date"
                            value={patientData.dob}
                            onChange={(e) => setPatientData({...patientData, dob: e.target.value})}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">MRN</label>
                          <input
                            type="text"
                            value={patientData.mrn}
                            readOnly
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                          <select
                            value={patientData.gender}
                            onChange={(e) => setPatientData({...patientData, gender: e.target.value})}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                          >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={patientData.phone}
                            onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                          type="email"
                          value={patientData.email}
                          onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="patient@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Known Allergies</label>
                        <input
                          type="text"
                          value={patientData.allergies}
                          onChange={(e) => setPatientData({...patientData, allergies: e.target.value})}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="e.g., Penicillin, Shellfish (or 'None')"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex gap-6">
                      <button 
                        onClick={() => setActiveTab('record')}
                        className={`flex flex-col items-center justify-center border-b-2 gap-1 pb-3 pt-4 px-2 ${
                          activeTab === 'record' 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined">mic</span>
                        <span className="text-sm font-medium">Record</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('upload')}
                        className={`flex flex-col items-center justify-center border-b-2 gap-1 pb-3 pt-4 px-2 ${
                          activeTab === 'upload' 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined">cloud_upload</span>
                        <span className="text-sm font-medium">Upload</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('type')}
                        className={`flex flex-col items-center justify-center border-b-2 gap-1 pb-3 pt-4 px-2 ${
                          activeTab === 'type' 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined">keyboard</span>
                        <span className="text-sm font-medium">Profile Photo</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                    {activeTab === 'record' ? (
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
                    ) : activeTab === 'upload' ? (
                      <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/30 dark:bg-gray-800/30 p-8 text-center gap-6 hover:border-primary/40 transition-colors cursor-pointer">
                        <div className="size-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-2">
                          <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ready to Capture</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-[280px] mx-auto">
                            Upload documents, insurance cards, or medical records.
                          </p>
                        </div>
                        <button
                          onClick={() => documentsInputRef.current?.click()}
                          className="flex items-center justify-center rounded-lg px-6 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-sm transition-colors w-full max-w-[200px] gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">upload</span>
                          <span>Upload Document</span>
                        </button>
                        <input
                          ref={documentsInputRef}
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          multiple
                          className="hidden"
                          onChange={handleDocumentsUpload}
                        />
                        {uploadedDocuments.length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {uploadedDocuments.length} document{uploadedDocuments.length > 1 ? 's' : ''} ready to save
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/30 dark:bg-gray-800/30 p-8 text-center gap-6 hover:border-primary/40 transition-colors cursor-pointer">
                        <div className="size-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-2">
                          <span className="material-symbols-outlined text-4xl">photo_camera</span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ready to Capture</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-[280px] mx-auto">
                            Capture a profile photo using the device camera.
                          </p>
                        </div>
                        <button
                          onClick={() => profilePhotoInputRef.current?.click()}
                          className="flex items-center justify-center rounded-lg px-6 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-sm transition-colors w-full max-w-[200px] gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">photo_camera</span>
                          <span>Take Profile Photo</span>
                        </button>
                        <input
                          ref={profilePhotoInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={handleProfilePhotoChange}
                        />
                        {patientData.image && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Profile photo ready
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <span className="material-symbols-outlined text-sm">description</span>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Visit Note</h2>
                    </div>
                  </div>

                  <div className="p-6 space-y-8 overflow-y-auto flex-1">
                    <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                      <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                      <button 
                        onClick={() => setExpandedSections({...expandedSections, subjective: !expandedSections.subjective})}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Subjective
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Chief Complaint & HPI</span>
                        </h3>
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                          {expandedSections.subjective ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedSections.subjective && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Chief Complaint</label>
                            <input 
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2" 
                              placeholder="e.g., Persistent cough, fever" 
                              value={visitData.subjective.chiefComplaint}
                              onChange={(e) => setVisitData({
                                ...visitData,
                                subjective: { ...visitData.subjective, chiefComplaint: e.target.value }
                              })}
                              type="text"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">History of Present Illness</label>
                            <textarea 
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 resize-none" 
                              placeholder="Describe the HPI..." 
                              value={visitData.subjective.hpi}
                              onChange={(e) => setVisitData({
                                ...visitData,
                                subjective: { ...visitData.subjective, hpi: e.target.value }
                              })}
                              rows={4}
                            />
                          </div>
                        </div>
                      )}
                    </section>

                    <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                      <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                      <button 
                        onClick={() => setExpandedSections({...expandedSections, objective: !expandedSections.objective})}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Objective
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Vitals & Exam</span>
                        </h3>
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                          {expandedSections.objective ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedSections.objective && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">BP (mmHg)</label>
                              <input
                                className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="120/80"
                                type="text"
                                value={visitData.objective.bp}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  objective: { ...visitData.objective, bp: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">HR (bpm)</label>
                              <input
                                className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="72"
                                type="text"
                                value={visitData.objective.hr}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  objective: { ...visitData.objective, hr: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Temp (°F)</label>
                              <input
                                className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="98.6"
                                type="text"
                                value={visitData.objective.temp}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  objective: { ...visitData.objective, temp: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Weight (lbs)</label>
                              <input
                                className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="165"
                                type="text"
                                value={visitData.objective.weight}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  objective: { ...visitData.objective, weight: e.target.value }
                                })}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Physical Exam Findings</label>
                            <textarea 
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 resize-none" 
                              placeholder="General appearance, HEENT, Lungs, Heart..." 
                              value={visitData.objective.examFindings}
                              onChange={(e) => setVisitData({
                                ...visitData,
                                objective: { ...visitData.objective, examFindings: e.target.value }
                              })}
                              rows={3}
                            />
                          </div>
                        </div>
                      )}
                    </section>

                    <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                      <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                      <button 
                        onClick={() => setExpandedSections({...expandedSections, assessmentPlan: !expandedSections.assessmentPlan})}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Assessment & Plan</h3>
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                          {expandedSections.assessmentPlan ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedSections.assessmentPlan && (
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
                                value={visitData.assessmentPlan.assessment}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  assessmentPlan: { ...visitData.assessmentPlan, assessment: e.target.value }
                                })}
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
                                value={visitData.assessmentPlan.plan}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  assessmentPlan: { ...visitData.assessmentPlan, plan: e.target.value }
                                })}
                                rows={5}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                      <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                      <button 
                        onClick={() => setExpandedSections({...expandedSections, vaccines: !expandedSections.vaccines})}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Vaccines
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Immunizations</span>
                        </h3>
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                          {expandedSections.vaccines ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedSections.vaccines && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Vaccine</label>
                            <input 
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2" 
                              placeholder="Search vaccine (e.g. Tdap)" 
                              value={visitData.vaccines.name}
                              onChange={(e) => setVisitData({
                                ...visitData,
                                vaccines: { ...visitData.vaccines, name: e.target.value }
                              })}
                              type="text"
                            />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Date</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                type="date"
                                value={visitData.vaccines.date}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  vaccines: { ...visitData.vaccines, date: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Dose #</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.vaccines.dose}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  vaccines: { ...visitData.vaccines, dose: e.target.value }
                                })}
                              >
                                <option>Booster</option>
                                <option>1st</option>
                                <option>2nd</option>
                                <option>3rd</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Site</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.vaccines.site}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  vaccines: { ...visitData.vaccines, site: e.target.value }
                                })}
                              >
                                <option>Left Deltoid</option>
                                <option>Right Deltoid</option>
                                <option>Left Thigh</option>
                                <option>Right Thigh</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Route</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.vaccines.route}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  vaccines: { ...visitData.vaccines, route: e.target.value }
                                })}
                              >
                                <option>Intramuscular (IM)</option>
                                <option>Subcutaneous (SC)</option>
                                <option>Oral</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Lot Number</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="Lot #"
                                type="text"
                                value={visitData.vaccines.lotNumber}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  vaccines: { ...visitData.vaccines, lotNumber: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Manufacturer</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.vaccines.manufacturer}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  vaccines: { ...visitData.vaccines, manufacturer: e.target.value }
                                })}
                              >
                                <option>Select Manufacturer</option>
                                <option>Pfizer</option>
                                <option>Moderna</option>
                                <option>Johnson & Johnson</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                      <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                      <button 
                        onClick={() => setExpandedSections({...expandedSections, familyHistory: !expandedSections.familyHistory})}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Family Health History
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Genetic Risk Factors</span>
                        </h3>
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                          {expandedSections.familyHistory ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedSections.familyHistory && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Relationship</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.familyHistory.relationship}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  familyHistory: { ...visitData.familyHistory, relationship: e.target.value }
                                })}
                              >
                                <option>Select...</option>
                                <option>Mother</option>
                                <option>Father</option>
                                <option>Sibling</option>
                                <option>Grandparent</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Status</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.familyHistory.status}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  familyHistory: { ...visitData.familyHistory, status: e.target.value }
                                })}
                              >
                                <option>Living</option>
                                <option>Deceased</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Known Conditions</label>
                            <input 
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2" 
                              placeholder="Search other conditions..." 
                              value={visitData.familyHistory.conditions}
                              onChange={(e) => setVisitData({
                                ...visitData,
                                familyHistory: { ...visitData.familyHistory, conditions: e.target.value }
                              })}
                              type="text"
                            />
                          </div>
                        </div>
                      )}
                    </section>

                    <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                      <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                      <button 
                        onClick={() => setExpandedSections({...expandedSections, riskFlags: !expandedSections.riskFlags})}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Risk Flags
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Social & Lifestyle</span>
                        </h3>
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                          {expandedSections.riskFlags ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedSections.riskFlags && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Tobacco Use</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.riskFlags.tobaccoUse}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  riskFlags: { ...visitData.riskFlags, tobaccoUse: e.target.value }
                                })}
                              >
                                <option>Current</option>
                                <option>Former</option>
                                <option>Never</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Amount</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="10 cigs / day"
                                type="text"
                                value={visitData.riskFlags.tobaccoAmount}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  riskFlags: { ...visitData.riskFlags, tobaccoAmount: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Alcohol Use</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.riskFlags.alcoholUse}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  riskFlags: { ...visitData.riskFlags, alcoholUse: e.target.value }
                                })}
                              >
                                <option>Social</option>
                                <option>Heavy</option>
                                <option>None</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Frequency</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="2-3 drinks / week"
                                type="text"
                                value={visitData.riskFlags.alcoholFrequency}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  riskFlags: { ...visitData.riskFlags, alcoholFrequency: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Housing Status</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.riskFlags.housingStatus}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  riskFlags: { ...visitData.riskFlags, housingStatus: e.target.value }
                                })}
                              >
                                <option>Stable</option>
                                <option>Unstable</option>
                                <option>Homeless</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Occupation</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="Logistics Manager"
                                type="text"
                                value={visitData.riskFlags.occupation}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  riskFlags: { ...visitData.riskFlags, occupation: e.target.value }
                                })}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                      <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                      <button 
                        onClick={() => setExpandedSections({...expandedSections, surgicalHistory: !expandedSections.surgicalHistory})}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Surgical History
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Procedures & Operations</span>
                        </h3>
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                          {expandedSections.surgicalHistory ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedSections.surgicalHistory && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Procedure</label>
                              <input 
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2" 
                                placeholder="e.g. Appendectomy" 
                                value={visitData.surgicalHistory.procedure}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  surgicalHistory: { ...visitData.surgicalHistory, procedure: e.target.value }
                                })}
                                type="text"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Date / Year</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="YYYY"
                                type="text"
                                value={visitData.surgicalHistory.date}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  surgicalHistory: { ...visitData.surgicalHistory, date: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Site</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="Left Knee"
                                type="text"
                                value={visitData.surgicalHistory.site}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  surgicalHistory: { ...visitData.surgicalHistory, site: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Surgeon</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="Dr. R. Miller"
                                type="text"
                                value={visitData.surgicalHistory.surgeon}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  surgicalHistory: { ...visitData.surgicalHistory, surgeon: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Outcome</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.surgicalHistory.outcome}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  surgicalHistory: { ...visitData.surgicalHistory, outcome: e.target.value }
                                })}
                              >
                                <option>No Issues</option>
                                <option>Complications</option>
                                <option>Unknown</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Source</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.surgicalHistory.source}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  surgicalHistory: { ...visitData.surgicalHistory, source: e.target.value }
                                })}
                              >
                                <option>Patient Reported</option>
                                <option>Medical Records</option>
                                <option>External Record</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                      <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                      <button 
                        onClick={() => setExpandedSections({...expandedSections, pastMedicalHistory: !expandedSections.pastMedicalHistory})}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Past Medical History
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Chronic Conditions</span>
                        </h3>
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                          {expandedSections.pastMedicalHistory ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedSections.pastMedicalHistory && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Condition</label>
                              <input 
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2" 
                                placeholder="Type 2 Diabetes Mellitus" 
                                value={visitData.pastMedicalHistory.condition}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  pastMedicalHistory: { ...visitData.pastMedicalHistory, condition: e.target.value }
                                })}
                                type="text"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Status</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.pastMedicalHistory.status}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  pastMedicalHistory: { ...visitData.pastMedicalHistory, status: e.target.value }
                                })}
                              >
                                <option>Active</option>
                                <option>Resolved</option>
                                <option>Inactive</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Date Diagnosed</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                type="date"
                                value={visitData.pastMedicalHistory.diagnosedDate}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  pastMedicalHistory: { ...visitData.pastMedicalHistory, diagnosedDate: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Impact</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.pastMedicalHistory.impact}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  pastMedicalHistory: { ...visitData.pastMedicalHistory, impact: e.target.value }
                                })}
                              >
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">ICD-10 Code</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                placeholder="E11.9"
                                type="text"
                                value={visitData.pastMedicalHistory.icd10}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  pastMedicalHistory: { ...visitData.pastMedicalHistory, icd10: e.target.value }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Source</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.pastMedicalHistory.source}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  pastMedicalHistory: { ...visitData.pastMedicalHistory, source: e.target.value }
                                })}
                              >
                                <option>Clinician</option>
                                <option>Patient</option>
                                <option>Lab</option>
                                <option>Imaging</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                      <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                      <button 
                        onClick={() => setExpandedSections({...expandedSections, orders: !expandedSections.orders})}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Orders
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Labs, Imaging & Medications</span>
                        </h3>
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                          {expandedSections.orders ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedSections.orders && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Order Type</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.orders.type}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  orders: { ...visitData.orders, type: e.target.value }
                                })}
                              >
                                <option>Medication</option>
                                <option>Lab</option>
                                <option>Imaging</option>
                                <option>Referral</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Priority</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.orders.priority}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  orders: { ...visitData.orders, priority: e.target.value }
                                })}
                              >
                                <option>Routine</option>
                                <option>Urgent</option>
                                <option>STAT</option>
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Order Details</label>
                              <input 
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2" 
                                placeholder="CBC with Differential" 
                                value={visitData.orders.details}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  orders: { ...visitData.orders, details: e.target.value }
                                })}
                                type="text"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Status</label>
                              <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                value={visitData.orders.status}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  orders: { ...visitData.orders, status: e.target.value }
                                })}
                              >
                                <option>Pending</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                                <option>Cancelled</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Date Ordered</label>
                              <input
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                                type="date"
                                value={visitData.orders.dateOrdered}
                                onChange={(e) => setVisitData({
                                  ...visitData,
                                  orders: { ...visitData.orders, dateOrdered: e.target.value }
                                })}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </section>
                  </div>

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

export default NurseNewVisitForm
