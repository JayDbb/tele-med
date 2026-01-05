'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { useDoctor } from '@/contexts/DoctorContext'
import { usePatientRoutes } from '@/lib/usePatientRoutes'
import AssignPatientModal from '@/components/AssignPatientModal'
import { getPatient, createVisit, appendVisitNote, logAuditEvent } from '@/lib/api'
import { useAudioRecorder } from '@/lib/useAudioRecorder'

interface NewVisitFormProps {
  patientId: string
}

const NewVisitForm = ({ patientId }: NewVisitFormProps) => {
  const router = useRouter()
  const { doctor } = useDoctor()
  const { getPatientUrl } = usePatientRoutes()
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [showAssignPrompt, setShowAssignPrompt] = useState(false)
  const [recording, setRecording] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transcription, setTranscription] = useState<any>(null)
  const [visitId, setVisitId] = useState<string | null>(null)
  const [previousSummary, setPreviousSummary] = useState<string | null>(null)
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
  // Load visit data from localStorage on mount
  const getStorageKey = () => `visit-form-${patientId}`

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(getStorageKey())
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err)
    }
    return null
  }

  const [visitData, setVisitData] = useState(() => {
    const stored = loadFromStorage()
    return stored || {
      subjective: { chiefComplaint: '', hpi: '' },
      objective: { bp: '', hr: '', temp: '', weight: '', examFindings: '' },
      assessmentPlan: { assessment: '', plan: '' },
      additionalNotes: '',
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
    }
  })

  const recorder = useAudioRecorder()

  // Auto-save to localStorage whenever visitData changes
  useEffect(() => {
    const storageKey = getStorageKey()
    try {
      localStorage.setItem(storageKey, JSON.stringify(visitData))
    } catch (err) {
      console.error('Error saving to localStorage:', err)
    }
  }, [visitData, patientId])

  useEffect(() => {
    loadPatient()
  }, [patientId])

  const loadPatient = async () => {
    try {
      setLoading(true)
      const { patient: patientData } = await getPatient(patientId)
      setPatient(patientData)
    } catch (err: any) {
      console.error('Error loading patient:', err)
      setError(err?.message || 'Failed to load patient')
    } finally {
      setLoading(false)
    }
  }

  const formatAllergies = (allergies: string | any[] | null | undefined) => {
    if (!allergies) return 'None'
    if (allergies === 'None') return 'None'
    if (Array.isArray(allergies)) {
      if (allergies.length === 0) return 'None'
      return allergies.map((a: any) => typeof a === 'string' ? a : a.name || 'Unknown').join(', ')
    }
    if (typeof allergies === 'string') return allergies
    return 'None'
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartRecording = async () => {
    try {
      setError(null)
      setTranscription(null)
      await recorder.startRecording()
      setRecording(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to start recording')
      setRecording(false)
    }
  }

  const handleStopRecording = async () => {
    try {
      const blob = await recorder.stopRecording()
      setRecording(false)
      setUploading(true)
      setError(null)

      // Upload audio file using uploadToPrivateBucket
      const { uploadToPrivateBucket } = await import('@/lib/storage')
      const file = new File([blob], 'recording.webm', { type: 'audio/webm' })
      const upload = await uploadToPrivateBucket(file)
      const audioPath = upload.path

      setUploading(false)
      setTranscribing(true)

      // Transcribe audio
      const transcribeRes = await fetch('/api/transcribe/dictate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: audioPath }),
      })

      if (!transcribeRes.ok) {
        throw new Error('Failed to transcribe audio')
      }

      const transcriptionResult = await transcribeRes.json()

      // Parse transcription
      // Use default medical prompt for parsing, with previous summary as context if available
      const contextSection = previousSummary
        ? `\n\nIMPORTANT CONTEXT - Previous Visit Summary:\n${previousSummary}\n\nPlease use this context to better understand the patient's medical history and current condition. This is a follow-up visit, so reference the previous visit when relevant.\n\n`
        : ''

      const defaultMedicalPrompt = `You are a medical transcription assistant. Parse the following medical consultation transcript into structured JSON format and create a summary.${contextSection}
Extract the following information:
1. past_medical_history: Array of past medical conditions, surgeries, and relevant medical history
2. current_symptoms: Object or array describing current symptoms, including onset, duration, severity, and characteristics
3. physical_exam_findings: Object describing physical examination findings (vital signs, general appearance, system-specific findings)
4. diagnosis: String or array with the diagnosis or working diagnosis
5. treatment_plan: Array of treatment recommendations, procedures, and follow-up plans
6. prescriptions: Array of prescribed medications with dosage, frequency, and duration if mentioned
7. vaccines: Object with vaccine information if mentioned (name, date, dose, site, route, lot_number, manufacturer)
8. family_history: Object with family health history if mentioned (relationship, status: "Living" | "Deceased", conditions)
9. risk_flags: Object with social and lifestyle factors if mentioned (tobacco_use: "Current" | "Former" | "Never", tobacco_amount, alcohol_use: "Social" | "Heavy" | "None", alcohol_frequency, housing_status: "Stable" | "Unstable" | "Homeless", occupation)
10. surgical_history: Object with surgical procedures if mentioned (procedure, date, site, surgeon, outcome: "No Issues" | "Complications" | "Unknown", source: "Patient Reported" | "Medical Records" | "External Record")
11. past_medical_history_structured: Object with detailed past medical history if mentioned (condition, status: "Active" | "Resolved" | "Inactive", diagnosed_date, impact: "High" | "Medium" | "Low", icd10, source: "Clinician" | "Patient" | "Lab" | "Imaging")
12. orders: Object with medical orders if mentioned (type: "Medication" | "Lab" | "Imaging" | "Referral", priority: "Routine" | "Urgent" | "STAT", details, status: "Pending" | "In Progress" | "Completed" | "Cancelled", date_ordered)
13. summary: A concise, readable summary (2-3 paragraphs) of the entire medical consultation session written in continuous prose. The summary should include the chief complaint and current symptoms, key findings from physical examination, diagnosis, and treatment plan with any prescriptions. Keep it professional and easy to read for medical review. Write in continuous text format without bullet points.

IMPORTANT - Unit Assumptions and Conversions:
- Blood Pressure (BP): Assume mmHg if unit not specified. If given in other units, convert to mmHg (e.g., kPa to mmHg: multiply by 7.5).
- Heart Rate (HR): Assume bpm (beats per minute) if unit not specified. If given in other units, convert to bpm.
- Temperature: Assume °F (Fahrenheit) if unit not specified. If given in °C (Celsius), convert to °F: (°C × 9/5) + 32.
- Weight: Assume lbs (pounds) if unit not specified. If given in kg (kilograms), convert to lbs: kg × 2.20462. If given in other units, convert appropriately.

For vital signs in physical_exam_findings:
- Extract ONLY the numeric values in the assumed/converted units (remove units from the value itself)
- Blood pressure format: "120/80" (systolic/diastolic)
- Heart rate format: "72" (just the number)
- Temperature format: "98.6" (just the number)
- Weight format: "165" (just the number)

For dates:
- Use YYYY-MM-DD format for dates (e.g., "2024-01-15")
- For years only, use YYYY format (e.g., "2020")
- If only a year is mentioned, use that format

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no additional text):
{
  "past_medical_history": [],
  "current_symptoms": [{ "symptom": "string", "characteristics": "mild | moderate | severe | unspecified" }],
  "physical_exam_findings": {},
  "diagnosis": "",
  "treatment_plan": [],
  "prescriptions": [],
  "vaccines": { "name": "", "date": "", "dose": "", "site": "", "route": "", "lot_number": "", "manufacturer": "" },
  "family_history": { "relationship": "", "status": "", "conditions": "" },
  "risk_flags": { "tobacco_use": "", "tobacco_amount": "", "alcohol_use": "", "alcohol_frequency": "", "housing_status": "", "occupation": "" },
  "surgical_history": { "procedure": "", "date": "", "site": "", "surgeon": "", "outcome": "", "source": "" },
  "past_medical_history_structured": { "condition": "", "status": "", "diagnosed_date": "", "impact": "", "icd10": "", "source": "" },
  "orders": { "type": "", "priority": "", "details": "", "status": "", "date_ordered": "" },
  "summary": ""
}

If any field is not mentioned in the transcript, use an empty array [] or empty object {} or empty string "" as appropriate. Only populate fields that are explicitly mentioned or can be reasonably inferred from the transcript.

Transcript:
`

      const parseRes = await fetch('/api/transcribe/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptionResult.transcript,
          prompt: defaultMedicalPrompt
        }),
      })

      if (!parseRes.ok) {
        throw new Error('Failed to parse transcription')
      }

      const parsedResult = await parseRes.json()
      // parsedResult is { structured: {...}, summary: "..." }
      const { structured, summary } = parsedResult

      // Store the summary for context in future recordings
      if (summary) {
        setPreviousSummary(summary)
      }

      // Combine with transcript for full transcription object
      const fullTranscription = {
        transcript: transcriptionResult.transcript,
        structured,
        summary
      }
      setTranscription(fullTranscription)

      // Auto-fill form with parsed data
      // Extract chief complaint and HPI from current_symptoms or use structured fields
      const currentSymptoms = structured?.current_symptoms
      let chiefComplaint = ''
      let hpi = ''

      if (Array.isArray(currentSymptoms) && currentSymptoms.length > 0) {
        // If current_symptoms is an array of objects with symptom property
        const firstSymptom = currentSymptoms[0]
        if (typeof firstSymptom === 'string') {
          chiefComplaint = firstSymptom
        } else if (firstSymptom?.symptom) {
          chiefComplaint = firstSymptom.symptom
          hpi = firstSymptom.characteristics || ''
        }
      } else if (typeof currentSymptoms === 'string') {
        chiefComplaint = currentSymptoms
      }

      // Extract vital signs from physical_exam_findings
      const physicalFindings = structured?.physical_exam_findings || {}
      const vitalSigns = physicalFindings.vital_signs || {}

      // Extract diagnosis - can be string or array
      const diagnosis = Array.isArray(structured?.diagnosis)
        ? structured.diagnosis.join(', ')
        : structured?.diagnosis || ''

      // Extract treatment plan - should be array
      const treatmentPlan = Array.isArray(structured?.treatment_plan)
        ? structured.treatment_plan.join('\n')
        : structured?.treatment_plan || ''

      // Extract new structured fields
      const vaccines = structured?.vaccines || {}
      const familyHistory = structured?.family_history || {}
      const riskFlags = structured?.risk_flags || {}
      const surgicalHistory = structured?.surgical_history || {}
      const pastMedicalHistoryStructured = structured?.past_medical_history_structured || {}
      const orders = structured?.orders || {}

      setVisitData((prev: typeof visitData) => ({
        ...prev,
        subjective: {
          ...prev.subjective,
          chiefComplaint: chiefComplaint || prev.subjective.chiefComplaint,
          hpi: hpi || prev.subjective.hpi,
        },
        objective: {
          ...prev.objective,
          bp: vitalSigns.blood_pressure || vitalSigns.bp || physicalFindings.blood_pressure || physicalFindings.bp || prev.objective.bp,
          hr: vitalSigns.heart_rate || vitalSigns.hr || physicalFindings.heart_rate || physicalFindings.hr || prev.objective.hr,
          temp: vitalSigns.temperature || vitalSigns.temp || physicalFindings.temperature || physicalFindings.temp || prev.objective.temp,
          weight: vitalSigns.weight || physicalFindings.weight || prev.objective.weight,
          examFindings: JSON.stringify(physicalFindings, null, 2) || prev.objective.examFindings,
        },
        assessmentPlan: {
          ...prev.assessmentPlan,
          assessment: diagnosis || prev.assessmentPlan.assessment,
          plan: treatmentPlan || prev.assessmentPlan.plan,
        },
        additionalNotes: summary || prev.additionalNotes,
        vaccines: {
          name: vaccines.name || prev.vaccines.name,
          date: vaccines.date || prev.vaccines.date,
          dose: vaccines.dose || prev.vaccines.dose,
          site: vaccines.site || prev.vaccines.site,
          route: vaccines.route || prev.vaccines.route,
          lotNumber: vaccines.lot_number || vaccines.lotNumber || prev.vaccines.lotNumber,
          manufacturer: vaccines.manufacturer || prev.vaccines.manufacturer,
        },
        familyHistory: {
          relationship: familyHistory.relationship || prev.familyHistory.relationship,
          status: familyHistory.status || prev.familyHistory.status,
          conditions: familyHistory.conditions || prev.familyHistory.conditions,
        },
        riskFlags: {
          tobaccoUse: riskFlags.tobacco_use || riskFlags.tobaccoUse || prev.riskFlags.tobaccoUse,
          tobaccoAmount: riskFlags.tobacco_amount || riskFlags.tobaccoAmount || prev.riskFlags.tobaccoAmount,
          alcoholUse: riskFlags.alcohol_use || riskFlags.alcoholUse || prev.riskFlags.alcoholUse,
          alcoholFrequency: riskFlags.alcohol_frequency || riskFlags.alcoholFrequency || prev.riskFlags.alcoholFrequency,
          housingStatus: riskFlags.housing_status || riskFlags.housingStatus || prev.riskFlags.housingStatus,
          occupation: riskFlags.occupation || prev.riskFlags.occupation,
        },
        surgicalHistory: {
          procedure: surgicalHistory.procedure || prev.surgicalHistory.procedure,
          date: surgicalHistory.date || prev.surgicalHistory.date,
          site: surgicalHistory.site || prev.surgicalHistory.site,
          surgeon: surgicalHistory.surgeon || prev.surgicalHistory.surgeon,
          outcome: surgicalHistory.outcome || prev.surgicalHistory.outcome,
          source: surgicalHistory.source || prev.surgicalHistory.source,
        },
        pastMedicalHistory: {
          condition: pastMedicalHistoryStructured.condition || prev.pastMedicalHistory.condition,
          status: pastMedicalHistoryStructured.status || prev.pastMedicalHistory.status,
          diagnosedDate: pastMedicalHistoryStructured.diagnosed_date || pastMedicalHistoryStructured.diagnosedDate || prev.pastMedicalHistory.diagnosedDate,
          impact: pastMedicalHistoryStructured.impact || prev.pastMedicalHistory.impact,
          icd10: pastMedicalHistoryStructured.icd10 || prev.pastMedicalHistory.icd10,
          source: pastMedicalHistoryStructured.source || prev.pastMedicalHistory.source,
        },
        orders: {
          type: orders.type || prev.orders.type,
          priority: orders.priority || prev.orders.priority,
          details: orders.details || prev.orders.details,
          status: orders.status || prev.orders.status,
          dateOrdered: orders.date_ordered || orders.dateOrdered || prev.orders.dateOrdered,
        },
      }))
    } catch (err: any) {
      console.error('Error processing recording:', err)
      setError(err?.message || 'Failed to process recording')
    } finally {
      setUploading(false)
      setTranscribing(false)
    }
  }

  const handleSaveVisit = async () => {
    if (!doctor) {
      setError('Doctor not authenticated.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Create visit if it doesn't exist
      let currentVisitId = visitId
      if (!currentVisitId) {
        const newVisit = await createVisit({
          patient_id: patientId,
          clinician_id: doctor.id,
          status: 'draft',
        })
        currentVisitId = newVisit.id
        setVisitId(currentVisitId)
      }

      // Ensure we have a visit ID
      if (!currentVisitId) {
        throw new Error('Failed to create visit')
      }

      // Save notes using appendVisitNote
      if (visitData.subjective.chiefComplaint.trim()) {
        await appendVisitNote(
          currentVisitId,
          `Chief Complaint: ${visitData.subjective.chiefComplaint}`,
          'subjective',
          'manual'
        )
      }

      if (visitData.subjective.hpi.trim()) {
        await appendVisitNote(
          currentVisitId,
          visitData.subjective.hpi,
          'subjective',
          'manual'
        )
      }

      // Combine objective data
      const objectiveText = [
        visitData.objective.bp && `BP: ${visitData.objective.bp}`,
        visitData.objective.hr && `HR: ${visitData.objective.hr}`,
        visitData.objective.temp && `Temp: ${visitData.objective.temp}`,
        visitData.objective.weight && `Weight: ${visitData.objective.weight}`,
        visitData.objective.examFindings
      ].filter(Boolean).join('\n')

      if (objectiveText.trim()) {
        await appendVisitNote(
          currentVisitId,
          objectiveText,
          'objective',
          'manual'
        )
      }

      if (visitData.assessmentPlan.assessment.trim()) {
        await appendVisitNote(
          currentVisitId,
          visitData.assessmentPlan.assessment,
          'assessment',
          'manual'
        )
      }

      if (visitData.assessmentPlan.plan.trim()) {
        await appendVisitNote(
          currentVisitId,
          visitData.assessmentPlan.plan,
          'plan',
          'manual'
        )
      }

      if (visitData.additionalNotes.trim()) {
        await appendVisitNote(
          currentVisitId,
          visitData.additionalNotes,
          'subjective',
          'manual'
        )
      }

      // Save additional structured data sections
      const hasValues = (section: Record<string, any>) =>
        Object.values(section).some((value) => value && (typeof value === 'string' ? value.trim().length > 0 : true))

      // Save Vaccines
      if (hasValues(visitData.vaccines)) {
        await appendVisitNote(
          currentVisitId,
          JSON.stringify({ type: 'vaccines', data: visitData.vaccines }),
          'objective',
          'manual'
        )
      }

      // Save Family History
      if (hasValues(visitData.familyHistory)) {
        await appendVisitNote(
          currentVisitId,
          JSON.stringify({ type: 'family_history', data: visitData.familyHistory }),
          'subjective',
          'manual'
        )
      }

      // Save Risk Flags (Social History)
      if (hasValues(visitData.riskFlags)) {
        await appendVisitNote(
          currentVisitId,
          JSON.stringify({ type: 'risk_flags', data: visitData.riskFlags }),
          'subjective',
          'manual'
        )
      }

      // Save Surgical History
      if (hasValues(visitData.surgicalHistory)) {
        await appendVisitNote(
          currentVisitId,
          JSON.stringify({ type: 'surgical_history', data: visitData.surgicalHistory }),
          'subjective',
          'manual'
        )
      }

      // Save Past Medical History
      if (hasValues(visitData.pastMedicalHistory)) {
        await appendVisitNote(
          currentVisitId,
          JSON.stringify({ type: 'past_medical_history', data: visitData.pastMedicalHistory }),
          'subjective',
          'manual'
        )
      }

      // Save Orders
      if (hasValues(visitData.orders)) {
        await appendVisitNote(
          currentVisitId,
          JSON.stringify({ type: 'orders', data: visitData.orders }),
          'plan',
          'manual'
        )
      }

      // Log audit event
      await logAuditEvent(
        currentVisitId,
        'create',
        'visit',
        {
          patientId,
          visitId: currentVisitId,
          chiefComplaint: visitData.subjective.chiefComplaint,
        },
        'New visit created and notes saved.'
      )

      // Clear localStorage after successful save
      clearStorage()

      setShowAssignPrompt(true)
    } catch (err: any) {
      console.error('Error saving visit:', err)
      setError(err?.message || 'Failed to save visit')
    } finally {
      setSaving(false)
    }
  }

  // Clear localStorage when component unmounts or on successful submission
  const clearStorage = () => {
    try {
      localStorage.removeItem(getStorageKey())
    } catch (err) {
      console.error('Error clearing localStorage:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading patient...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <PatientDetailSidebar patientId={patientId} />
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
          <GlobalSearchBar />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
            {/* Patient Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{patient?.full_name || 'Patient'}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold border border-yellow-200 dark:border-yellow-800">New Visit</span>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300 text-sm">
                  {patient?.dob && (
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      DOB: {patient.dob}
                    </span>
                  )}
                  {patient?.allergies && (
                    <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      Allergies: {formatAllergies(patient.allergies)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href={getPatientUrl(patientId)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleSaveVisit}
                  disabled={saving}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Save Visit</span>
                      <span className="material-symbols-outlined text-sm">save</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Recording Panel */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/30 dark:bg-gray-800/30 p-8 text-center gap-6">
                  <div className={`size-20 rounded-full ${recording ? 'bg-red-100 dark:bg-red-900/20 animate-pulse' : 'bg-primary/10 dark:bg-primary/20'} flex items-center justify-center ${recording ? 'text-red-500' : 'text-primary'}`}>
                    <span className="material-symbols-outlined text-4xl">{recording ? 'fiber_manual_record' : 'mic'}</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {recording ? 'Recording in Progress' : 'Ready to Dictate'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 max-w-[280px] mx-auto">
                      {recording
                        ? `Recording: ${formatTime(recorder.recordingTime)}`
                        : 'Start recording the consultation to automatically generate clinical notes.'}
                    </p>
                  </div>
                  {!recording ? (
                    <button
                      onClick={handleStartRecording}
                      disabled={saving || uploading || transcribing}
                      className="flex items-center justify-center rounded-lg px-6 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-sm transition-colors gap-2 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">fiber_manual_record</span>
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopRecording}
                      className="flex items-center justify-center rounded-lg px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-medium shadow-sm transition-colors gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">stop</span>
                      <span>{saving || uploading || transcribing ? "Processing..." : "Stop Recording"}</span>
                    </button>
                  )}
                  {uploading && !recording && (
                    <div className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">Uploading audio file...</span>
                    </div>
                  )}
                  {transcribing && !uploading && !recording && (
                    <div className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                      <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">Transcribing audio and generating notes...</span>
                    </div>
                  )}
                  {transcription && (
                    <div className="w-full text-left bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">Transcription Complete</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{transcription.summary || transcription.transcript}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SOAP Note Form */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg">
                    <span className="material-symbols-outlined text-sm">description</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Visit Note</h2>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-8">
                {/* Subjective Section */}
                <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                  <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                  <button
                    onClick={() => setExpandedSections({ ...expandedSections, subjective: !expandedSections.subjective })}
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
                          value={visitData.subjective.chiefComplaint}
                          onChange={(e) => setVisitData({
                            ...visitData,
                            subjective: { ...visitData.subjective, chiefComplaint: e.target.value }
                          })}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2"
                          placeholder="e.g., Persistent cough, fever"
                          type="text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">History of Present Illness</label>
                        <textarea
                          value={visitData.subjective.hpi}
                          onChange={(e) => setVisitData({
                            ...visitData,
                            subjective: { ...visitData.subjective, hpi: e.target.value }
                          })}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 resize-none"
                          placeholder="Describe the HPI..."
                          rows={4}
                        />
                      </div>
                    </div>
                  )}
                </section>

                {/* Objective Section */}
                <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                  <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                  <button
                    onClick={() => setExpandedSections({ ...expandedSections, objective: !expandedSections.objective })}
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
                      {/* Vitals Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">BP (mmHg)</label>
                          <input
                            value={visitData.objective.bp}
                            onChange={(e) => setVisitData({
                              ...visitData,
                              objective: { ...visitData.objective, bp: e.target.value }
                            })}
                            className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="120/80"
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">HR (bpm)</label>
                          <input
                            value={visitData.objective.hr}
                            onChange={(e) => setVisitData({
                              ...visitData,
                              objective: { ...visitData.objective, hr: e.target.value }
                            })}
                            className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="72"
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Temp (°F)</label>
                          <input
                            value={visitData.objective.temp}
                            onChange={(e) => setVisitData({
                              ...visitData,
                              objective: { ...visitData.objective, temp: e.target.value }
                            })}
                            className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="98.6"
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Weight (lbs)</label>
                          <input
                            value={visitData.objective.weight}
                            onChange={(e) => setVisitData({
                              ...visitData,
                              objective: { ...visitData.objective, weight: e.target.value }
                            })}
                            className="w-full h-8 px-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="165"
                            type="text"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Physical Exam Findings</label>
                        <textarea
                          value={visitData.objective.examFindings}
                          onChange={(e) => setVisitData({
                            ...visitData,
                            objective: { ...visitData.objective, examFindings: e.target.value }
                          })}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 resize-none"
                          placeholder="General appearance, HEENT, Lungs, Heart..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </section>

                {/* Assessment & Plan */}
                <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                  <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                  <button
                    onClick={() => setExpandedSections({ ...expandedSections, assessmentPlan: !expandedSections.assessmentPlan })}
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
                            value={visitData.assessmentPlan.assessment}
                            onChange={(e) => setVisitData({
                              ...visitData,
                              assessmentPlan: { ...visitData.assessmentPlan, assessment: e.target.value }
                            })}
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
                            value={visitData.assessmentPlan.plan}
                            onChange={(e) => setVisitData({
                              ...visitData,
                              assessmentPlan: { ...visitData.assessmentPlan, plan: e.target.value }
                            })}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 pl-10 py-2 resize-none"
                            placeholder="Medications, referrals, follow-up..."
                            rows={5}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Additional Notes */}
                <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                  <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Additional Notes
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">Summary & Observations</span>
                  </h3>
                  <div>
                    <textarea
                      value={visitData.additionalNotes}
                      onChange={(e) => setVisitData({
                        ...visitData,
                        additionalNotes: e.target.value
                      })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 resize-none"
                      placeholder="Additional notes, observations, or summary will appear here after dictation..."
                      rows={6}
                    />
                  </div>
                </section>

                {/* Vaccines Section */}
                <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                  <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                  <button
                    onClick={() => setExpandedSections({ ...expandedSections, vaccines: !expandedSections.vaccines })}
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

                {/* Family Health History Section */}
                <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                  <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                  <button
                    onClick={() => setExpandedSections({ ...expandedSections, familyHistory: !expandedSections.familyHistory })}
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

                {/* Risk Flags Section */}
                <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                  <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                  <button
                    onClick={() => setExpandedSections({ ...expandedSections, riskFlags: !expandedSections.riskFlags })}
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

                {/* Surgical History Section */}
                <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                  <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                  <button
                    onClick={() => setExpandedSections({ ...expandedSections, surgicalHistory: !expandedSections.surgicalHistory })}
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

                {/* Past Medical History Section */}
                <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                  <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                  <button
                    onClick={() => setExpandedSections({ ...expandedSections, pastMedicalHistory: !expandedSections.pastMedicalHistory })}
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

                {/* Orders Section */}
                <section className="space-y-3 relative pl-4 border-l-2 border-primary/20">
                  <div className="absolute -left-2 top-0 size-4 rounded-full bg-primary border-2 border-white dark:border-gray-900"></div>
                  <button
                    onClick={() => setExpandedSections({ ...expandedSections, orders: !expandedSections.orders })}
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
            </div>

            {/* Assign Patient Prompt Modal */}
            {showAssignPrompt && (
              <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-2xl">check_circle</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Visit Saved Successfully!</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Would you like to assign this patient to another doctor or nurse?</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowAssignPrompt(false)
                        router.push(getPatientUrl(patientId))
                      }}
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Not Now
                    </button>
                    <button
                      onClick={() => {
                        setShowAssignPrompt(false)
                        setAssignModalOpen(true)
                      }}
                      className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      Assign Patient
                    </button>
                  </div>
                </div>
              </div>
            )}

            <AssignPatientModal
              isOpen={assignModalOpen}
              onClose={() => {
                setAssignModalOpen(false)
                router.push(getPatientUrl(patientId))
              }}
              patientId={patientId}
              patientName={patient?.full_name}
              onSuccess={() => {
                router.push(getPatientUrl(patientId))
              }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default NewVisitForm
