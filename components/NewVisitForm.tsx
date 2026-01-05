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
      additionalNotes: ''
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
7. summary: A concise, readable summary (2-3 paragraphs) of the entire medical consultation session written in continuous prose. The summary should include the chief complaint and current symptoms, key findings from physical examination, diagnosis, and treatment plan with any prescriptions. Keep it professional and easy to read for medical review. Write in continuous text format without bullet points.

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

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no additional text):
{
  "past_medical_history": [],
  "current_symptoms": [{ "symptom": "string", "characteristics": "mild | moderate | severe | unspecified" }],
  "physical_exam_findings": {},
  "diagnosis": "",
  "treatment_plan": [],
  "prescriptions": [],
  "summary": ""
}

If any field is not mentioned in the transcript, use an empty array [] or empty object {} or empty string "" as appropriate.

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
