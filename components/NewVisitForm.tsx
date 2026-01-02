'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { getPatient, createVisit, appendVisitNote, transcribeVisitAudio, updateVisit } from '@/lib/api'
import { useAudioRecorder } from '@/lib/useAudioRecorder'
import { convertToMP3 } from '@/lib/audioConverter'
import { uploadToPrivateBucket } from '@/lib/storage'
import { useDoctor } from '@/contexts/DoctorContext'
import { useNurse } from '@/contexts/NurseContext'
import { usePatientRoutes } from '@/lib/usePatientRoutes'

interface NewVisitFormProps {
  patientId: string
}

const NewVisitForm = ({ patientId }: NewVisitFormProps) => {
  const router = useRouter()
  const { doctor } = useDoctor()
  const { nurse } = useNurse()
  const { getPatientUrl, getBaseUrl } = usePatientRoutes()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [patient, setPatient] = useState<any>(null)
  const [visit, setVisit] = useState<any>(null)
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [transcription, setTranscription] = useState<any>(null)

  const recorder = useAudioRecorder()

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
    }
  })

  useEffect(() => {
    loadPatient()
  }, [patientId])

  const loadPatient = async () => {
    try {
      setLoading(true)
      const { patient: apiPatient } = await getPatient(patientId)
      setPatient({
        id: apiPatient.id,
        name: apiPatient.full_name || 'Unknown',
        dob: apiPatient.dob || '',
        email: apiPatient.email || '',
        phone: apiPatient.phone || '',
        allergies: apiPatient.allergies || 'None',
      })
    } catch (err: any) {
      console.error('Error loading patient:', err)
      setError(err?.message || 'Failed to load patient')
    } finally {
      setLoading(false)
    }
  }

  // Sync recording state with recorder
  useEffect(() => {
    setRecording(recorder.isRecording)
  }, [recorder.isRecording])

  const handleStartRecording = async () => {
    setError(null)
    setTranscription(null)
    try {
      await recorder.startRecording()
    } catch (err: any) {
      setError(err?.message || 'Failed to start recording')
    }
  }

  const handleStopRecording = async () => {
    try {
      const blob = await recorder.stopRecording()
      setSaving(true)
      setError(null)

      const mp3Blob = await convertToMP3(blob)
      const mp3File = new File([mp3Blob], `recording-${Date.now()}.mp3`, {
        type: "audio/mp3"
      })

      await processAudioFile(mp3File)
    } catch (err: any) {
      setError(err?.message || 'Failed to process recording')
      setSaving(false)
    }
  }

  const processAudioFile = async (mp3File: File) => {
    try {
      // Create visit first if it doesn't exist
      let currentVisit = visit
      if (!currentVisit) {
        currentVisit = await createVisit({
          patient_id: patientId,
          status: 'draft'
        })
        setVisit(currentVisit)
      }

      const visitId = currentVisit.id

      // Upload MP3 file
      setUploading(true)
      let upload;
      try {
        upload = await uploadToPrivateBucket(mp3File)
        await updateVisit(visitId, { audio_url: upload.path })
      } finally {
        setUploading(false)
      }

      // Transcribe the audio
      setTranscribing(true)
      try {
        const transcriptionResult = await transcribeVisitAudio(upload.path, visitId)
        setTranscription(transcriptionResult)

        // Save the full transcript to visit notes as subjective (dictation source)
        if (transcriptionResult.transcript) {
          try {
            await appendVisitNote(
              visitId,
              transcriptionResult.transcript,
              "subjective",
              "dictation"
            )
          } catch (noteError) {
            console.warn("Failed to save transcript to notes:", noteError)
          }
        }

        // Save the AI-generated summary to visit notes as assessment
        if (transcriptionResult.summary) {
          try {
            await appendVisitNote(
              visitId,
              transcriptionResult.summary,
              "assessment",
              "dictation"
            )
          } catch (noteError) {
            console.warn("Failed to save summary to notes:", noteError)
          }
        }

        // Auto-populate SOAP fields from transcription
        if (transcriptionResult.structured) {
          const structured = transcriptionResult.structured

          // Handle current symptoms - extract symptom names only
          if (structured.current_symptoms && Array.isArray(structured.current_symptoms)) {
            const symptomsText = structured.current_symptoms
              .map((s: any) => s.symptom)
              .filter((symptom: string) => symptom && symptom !== 'undefined')
              .join(', ')
            setVisitData(prev => ({
              ...prev,
              subjective: { ...prev.subjective, chiefComplaint: symptomsText || prev.subjective.chiefComplaint }
            }))

            // Save symptoms to notes as subjective
            if (symptomsText) {
              try {
                await appendVisitNote(
                  visitId,
                  `Chief Complaint: ${symptomsText}`,
                  "subjective",
                  "dictation"
                )
              } catch (noteError) {
                console.warn("Failed to save symptoms to notes:", noteError)
              }
            }
          }

          // Extract and parse vitals from physical_exam_findings
          if (structured.physical_exam_findings) {
            const findings = structured.physical_exam_findings;

            // Helper function to extract numeric value from string
            const extractNumber = (value: any): string | null => {
              if (!value) return null;
              if (typeof value === 'number') return String(value);
              if (typeof value === 'string') {
                const match = value.match(/(\d+\.?\d*)/);
                return match ? match[1] : null;
              }
              return null;
            };

            // Helper function to extract blood pressure (handles "120/80", "120 over 80", etc.)
            const extractBloodPressure = (value: any): string | null => {
              if (!value) return null;
              if (typeof value === 'string') {
                // Match patterns like "120/80", "120 over 80", "120-80", or just "200" (systolic only)
                const bpMatch = value.match(/(\d+)\s*[\/\-\s]+\s*(\d+)/);
                if (bpMatch) {
                  return `${bpMatch[1]}/${bpMatch[2]}`;
                }
                // If it's already in the right format, return as is
                if (value.includes('/')) return value;
                // If just a number, assume it's systolic (we'll use it as is)
                const singleMatch = value.match(/(\d+)/);
                if (singleMatch) return singleMatch[1];
              }
              return String(value);
            };

            // Helper function to parse JSON-like strings from text
            const parseVitalsFromText = (text: string) => {
              const vitals: any = {};

              // Try to find JSON-like patterns: {"blood_pressure":"200","weight":"100 pounds"}
              // Look for any JSON object that might contain vital signs
              const jsonPattern = /\{[\s\S]*?(?:blood[_\s]?pressure|heart[_\s]?rate|temperature|temp|weight|bp|hr)[\s\S]*?\}/i;
              const jsonMatch = text.match(jsonPattern);

              if (jsonMatch) {
                try {
                  // Try to find and parse the entire JSON object
                  // Match the first complete JSON object in the text
                  let braceCount = 0;
                  let jsonStart = -1;
                  let jsonEnd = -1;

                  for (let i = 0; i < text.length; i++) {
                    if (text[i] === '{') {
                      if (jsonStart === -1) jsonStart = i;
                      braceCount++;
                    } else if (text[i] === '}') {
                      braceCount--;
                      if (braceCount === 0 && jsonStart !== -1) {
                        jsonEnd = i;
                        break;
                      }
                    }
                  }

                  if (jsonStart !== -1 && jsonEnd !== -1) {
                    const jsonStr = text.substring(jsonStart, jsonEnd + 1);
                    try {
                      const parsed = JSON.parse(jsonStr);
                      if (parsed.blood_pressure || parsed.bp) {
                        vitals.blood_pressure = parsed.blood_pressure || parsed.bp;
                      }
                      if (parsed.heart_rate || parsed.hr) {
                        vitals.heart_rate = parsed.heart_rate || parsed.hr;
                      }
                      if (parsed.temperature || parsed.temp) {
                        vitals.temperature = parsed.temperature || parsed.temp;
                      }
                      if (parsed.weight) {
                        vitals.weight = parsed.weight;
                      }
                    } catch (parseError) {
                      // If JSON parsing fails, try regex extraction
                      const bpMatch = jsonStr.match(/["']blood[_\s]?pressure["']\s*:\s*["']?([^"',}]+)/i);
                      if (bpMatch) vitals.blood_pressure = bpMatch[1].trim();

                      const hrMatch = jsonStr.match(/["']heart[_\s]?rate["']\s*:\s*["']?([^"',}]+)/i);
                      if (hrMatch) vitals.heart_rate = hrMatch[1].trim();

                      const tempMatch = jsonStr.match(/["']temperature["']\s*:\s*["']?([^"',}]+)/i);
                      if (tempMatch) vitals.temperature = tempMatch[1].trim();

                      const weightMatch = jsonStr.match(/["']weight["']\s*:\s*["']?([^"',}]+)/i);
                      if (weightMatch) vitals.weight = weightMatch[1].trim();
                    }
                  }
                } catch (e) {
                  // Fallback to regex extraction if JSON structure is too complex
                  const bpMatch = text.match(/["']blood[_\s]?pressure["']\s*:\s*["']?([^"',}]+)/i);
                  if (bpMatch) vitals.blood_pressure = bpMatch[1].trim();

                  const hrMatch = text.match(/["']heart[_\s]?rate["']\s*:\s*["']?([^"',}]+)/i);
                  if (hrMatch) vitals.heart_rate = hrMatch[1].trim();

                  const tempMatch = text.match(/["']temperature["']\s*:\s*["']?([^"',}]+)/i);
                  if (tempMatch) vitals.temperature = tempMatch[1].trim();

                  const weightMatch = text.match(/["']weight["']\s*:\s*["']?([^"',}]+)/i);
                  if (weightMatch) vitals.weight = weightMatch[1].trim();
                }
              }

              return vitals;
            };

            // First, try to extract from structured vital_signs object
            const vitalSigns = findings.vital_signs || {};

            // Parse blood pressure
            let bpValue = vitalSigns.blood_pressure
              ? extractBloodPressure(vitalSigns.blood_pressure)
              : vitalSigns.bp
                ? extractBloodPressure(vitalSigns.bp)
                : null;

            // Parse heart rate
            let hrValue = vitalSigns.heart_rate
              ? extractNumber(vitalSigns.heart_rate)
              : vitalSigns.hr
                ? extractNumber(vitalSigns.hr)
                : null;

            // Parse temperature
            let tempValue = vitalSigns.temperature
              ? extractNumber(vitalSigns.temperature)
              : vitalSigns.temp
                ? extractNumber(vitalSigns.temp)
                : null;

            // Parse weight
            let weightValue = vitalSigns.weight
              ? extractNumber(vitalSigns.weight)
              : null;

            // If vitals weren't found in structured format, search all findings for text patterns
            if (!bpValue || !hrValue || !tempValue || !weightValue) {
              const findingsString = JSON.stringify(findings);
              const textVitals = parseVitalsFromText(findingsString);

              // Check ALL string values in findings for vital signs patterns
              Object.values(findings).forEach((value) => {
                if (typeof value === 'string') {
                  // Check if this string contains any vital signs indicators
                  const hasVitalsPattern = /(?:blood[_\s]?pressure|heart[_\s]?rate|temperature|temp|weight|bp|hr|vital[_\s]?signs?)/i.test(value);
                  if (hasVitalsPattern) {
                    const parsed = parseVitalsFromText(value);
                    if (parsed.blood_pressure && !bpValue) bpValue = extractBloodPressure(parsed.blood_pressure);
                    if (parsed.heart_rate && !hrValue) hrValue = extractNumber(parsed.heart_rate);
                    if (parsed.temperature && !tempValue) tempValue = extractNumber(parsed.temperature);
                    if (parsed.weight && !weightValue) weightValue = extractNumber(parsed.weight);
                  }
                }
              });

              // Use text-extracted vitals if structured ones weren't found
              if (!bpValue && textVitals.blood_pressure) {
                bpValue = extractBloodPressure(textVitals.blood_pressure);
              }
              if (!hrValue && textVitals.heart_rate) {
                hrValue = extractNumber(textVitals.heart_rate);
              }
              if (!tempValue && textVitals.temperature) {
                tempValue = extractNumber(textVitals.temperature);
              }
              if (!weightValue && textVitals.weight) {
                weightValue = extractNumber(textVitals.weight);
              }
            }

            // Update vital signs in state
            if (bpValue || hrValue || tempValue || weightValue) {
              setVisitData(prev => ({
                ...prev,
                objective: {
                  ...prev.objective,
                  bp: bpValue || prev.objective.bp,
                  hr: hrValue || prev.objective.hr,
                  temp: tempValue || prev.objective.temp,
                  weight: weightValue || prev.objective.weight
                }
              }));

              // Save vitals separately to notes
              const vitalsText = [
                bpValue && `Blood Pressure: ${bpValue}`,
                hrValue && `Heart Rate: ${hrValue} bpm`,
                tempValue && `Temperature: ${tempValue}°F`,
                weightValue && `Weight: ${weightValue} lbs`
              ].filter(Boolean).join('\n');

              if (vitalsText) {
                try {
                  await appendVisitNote(
                    visitId,
                    `Vital Signs:\n${vitalsText}`,
                    "objective",
                    "dictation"
                  )
                } catch (noteError) {
                  console.warn("Failed to save vitals to notes:", noteError)
                }
              }
            }

            // Build physical exam text excluding vitals (already in separate fields)
            const examFindingsWithoutVitals: string[] = [];
            Object.entries(findings).forEach(([key, value]) => {
              // Skip vital_signs and individual vital fields
              if (key !== 'vital_signs' &&
                key !== 'blood_pressure' && key !== 'bp' &&
                key !== 'heart_rate' && key !== 'hr' &&
                key !== 'temperature' && key !== 'temp' &&
                key !== 'weight') {

                // Check if this field value is ONLY vital signs (JSON string or object)
                let isOnlyVitals = false;

                if (typeof value === 'string') {
                  // Try to parse as JSON and check if it's only vitals
                  try {
                    const parsed = JSON.parse(value);
                    if (typeof parsed === 'object' && parsed !== null) {
                      const keys = Object.keys(parsed);
                      const vitalKeys = ['blood_pressure', 'bp', 'heart_rate', 'hr', 'temperature', 'temp', 'weight'];
                      isOnlyVitals = keys.length > 0 && keys.every(key =>
                        vitalKeys.some(vk => key.toLowerCase().includes(vk.toLowerCase()))
                      );
                    }
                  } catch (e) {
                    // Not valid JSON, check if it's a vital signs pattern
                    const vitalPattern = /^(?:vital[_\s]?signs?\s*:\s*)?\{[\s\S]*(?:blood[_\s]?pressure|bp|heart[_\s]?rate|hr|temperature|temp|weight)[\s\S]*\}$/i;
                    isOnlyVitals = vitalPattern.test(value.trim());
                  }
                } else if (typeof value === 'object' && value !== null) {
                  // For object values, check if they contain only vital signs
                  const keys = Object.keys(value);
                  const vitalKeys = ['blood_pressure', 'bp', 'heart_rate', 'hr', 'temperature', 'temp', 'weight', 'vital_signs'];
                  isOnlyVitals = keys.length > 0 && keys.every(key =>
                    vitalKeys.some(vk => key.toLowerCase().includes(vk.toLowerCase()))
                  );
                }

                // If this field contains only vital signs, skip it entirely
                if (isOnlyVitals) {
                  return; // Skip this entry
                }

                const formattedKey = key.replace(/_/g, ' ');
                let formattedValue = typeof value === 'object' && value !== null
                  ? JSON.stringify(value, null, 2)
                  : String(value);

                // Remove vital signs text from string values
                if (typeof value === 'string') {
                  // First, try to remove complete JSON objects containing vital signs
                  // This handles cases like: {"blood_pressure":"200","weight":"100 pounds"}
                  // or: vital signs: {"blood_pressure":"200","weight":"100 pounds"}

                  // Remove "vital signs: {...}" or "vital_signs: {...}" patterns
                  formattedValue = formattedValue.replace(/vital[_\s]?signs?\s*:\s*\{[^}]*\}/gi, '');

                  // Remove standalone JSON objects that might contain vital signs
                  // Match JSON objects (handles simple objects without nesting)
                  // For more complex nested objects, we'll handle them separately
                  let jsonStart = -1;
                  let braceCount = 0;
                  let jsonObjects: { start: number; end: number }[] = [];

                  // Find all JSON objects in the string
                  for (let i = 0; i < formattedValue.length; i++) {
                    if (formattedValue[i] === '{') {
                      if (jsonStart === -1) jsonStart = i;
                      braceCount++;
                    } else if (formattedValue[i] === '}') {
                      braceCount--;
                      if (braceCount === 0 && jsonStart !== -1) {
                        jsonObjects.push({ start: jsonStart, end: i });
                        jsonStart = -1;
                      }
                    }
                  }

                  // Process JSON objects in reverse order to maintain indices
                  for (let i = jsonObjects.length - 1; i >= 0; i--) {
                    const { start, end } = jsonObjects[i];
                    const jsonStr = formattedValue.substring(start, end + 1);

                    // Check if this JSON object contains ONLY vital signs
                    try {
                      const parsed = JSON.parse(jsonStr);
                      if (typeof parsed === 'object' && parsed !== null) {
                        const keys = Object.keys(parsed);
                        const vitalKeys = ['blood_pressure', 'bp', 'heart_rate', 'hr', 'temperature', 'temp', 'weight'];
                        const hasOnlyVitals = keys.length > 0 && keys.every(key =>
                          vitalKeys.some(vk => key.toLowerCase().includes(vk.toLowerCase()))
                        );
                        if (hasOnlyVitals) {
                          // Remove this JSON object
                          formattedValue = formattedValue.substring(0, start) + formattedValue.substring(end + 1);
                        }
                      }
                    } catch (e) {
                      // If parsing fails, check if it looks like a vital signs object
                      const vitalPattern = /(?:blood[_\s]?pressure|bp|heart[_\s]?rate|hr|temperature|temp|weight)/i;
                      if (vitalPattern.test(jsonStr) && jsonStr.split(',').length <= 5) {
                        // Likely a vital signs object, remove it
                        formattedValue = formattedValue.substring(0, start) + formattedValue.substring(end + 1);
                      }
                    }
                  }

                  // Remove individual vital sign key-value pairs that might be left
                  formattedValue = formattedValue
                    .replace(/["']blood[_\s]?pressure["']\s*:\s*["']?[^"',}]+["']?/gi, '')
                    .replace(/["']bp["']\s*:\s*["']?[^"',}]+["']?/gi, '')
                    .replace(/["']heart[_\s]?rate["']\s*:\s*["']?[^"',}]+["']?/gi, '')
                    .replace(/["']hr["']\s*:\s*["']?[^"',}]+["']?/gi, '')
                    .replace(/["']temperature["']\s*:\s*["']?[^"',}]+["']?/gi, '')
                    .replace(/["']temp["']\s*:\s*["']?[^"',}]+["']?/gi, '')
                    .replace(/["']weight["']\s*:\s*["']?[^"',}]+["']?/gi, '')
                    // Clean up leftover commas, colons, and whitespace
                    .replace(/,\s*,/g, ',')
                    .replace(/,\s*}/g, '}')
                    .replace(/\{\s*,/g, '{')
                    .replace(/:\s*:/g, ':')
                    .replace(/^\s*[,:\s]+|\s*[,:\s]+$/g, '')
                    .trim();
                }

                // Only add if there's actual content left after removing vitals
                if (formattedValue && formattedValue.length > 0 && formattedValue !== '{}' && formattedValue !== 'null') {
                  examFindingsWithoutVitals.push(`${formattedKey}: ${formattedValue}`);
                }
              }
            });

            const examFindings = examFindingsWithoutVitals.join('\n');

            // Update physical exam findings (excluding vitals)
            setVisitData(prev => ({
              ...prev,
              objective: { ...prev.objective, examFindings: examFindings || prev.objective.examFindings }
            }))

            // Save physical exam findings to notes as objective (excluding vitals)
            if (examFindings) {
              try {
                await appendVisitNote(
                  visitId,
                  `Physical Examination: ${examFindings}`,
                  "objective",
                  "dictation"
                )
              } catch (noteError) {
                console.warn("Failed to save physical exam to notes:", noteError)
              }
            }
          }

          if (structured.past_medical_history && Array.isArray(structured.past_medical_history) && structured.past_medical_history.length > 0) {
            const historyText = structured.past_medical_history.join('\n')
            setVisitData(prev => ({
              ...prev,
              subjective: { ...prev.subjective, hpi: historyText || prev.subjective.hpi }
            }))

            // Save past medical history to notes as subjective
            try {
              await appendVisitNote(
                visitId,
                `Past Medical History: ${historyText}`,
                "subjective",
                "dictation"
              )
            } catch (noteError) {
              console.warn("Failed to save medical history to notes:", noteError)
            }
          }

          if (structured.diagnosis) {
            const diagnosis = Array.isArray(structured.diagnosis)
              ? structured.diagnosis.join(', ')
              : structured.diagnosis
            setVisitData(prev => ({
              ...prev,
              assessmentPlan: { ...prev.assessmentPlan, assessment: diagnosis || prev.assessmentPlan.assessment }
            }))

            // Save diagnosis to notes as assessment
            if (diagnosis) {
              try {
                await appendVisitNote(
                  visitId,
                  `Diagnosis: ${diagnosis}`,
                  "assessment",
                  "dictation"
                )
              } catch (noteError) {
                console.warn("Failed to save diagnosis to notes:", noteError)
              }
            }
          }

          if (structured.treatment_plan && Array.isArray(structured.treatment_plan) && structured.treatment_plan.length > 0) {
            const planText = structured.treatment_plan.join('\n')
            setVisitData(prev => ({
              ...prev,
              assessmentPlan: { ...prev.assessmentPlan, plan: planText || prev.assessmentPlan.plan }
            }))

            // Save treatment plan to notes as plan
            try {
              await appendVisitNote(
                visitId,
                `Treatment Plan: ${planText}`,
                "plan",
                "dictation"
              )
            } catch (noteError) {
              console.warn("Failed to save treatment plan to notes:", noteError)
            }
          }

          // Save prescriptions if available
          if (structured.prescriptions && Array.isArray(structured.prescriptions) && structured.prescriptions.length > 0) {
            const prescriptionsText = structured.prescriptions
              .map((p: any) => {
                const parts = []
                if (p.medication) parts.push(p.medication)
                if (p.dosage) parts.push(`Dosage: ${p.dosage}`)
                if (p.frequency) parts.push(`Frequency: ${p.frequency}`)
                if (p.duration) parts.push(`Duration: ${p.duration}`)
                return parts.join(', ')
              })
              .join('\n')

            if (prescriptionsText) {
              try {
                await appendVisitNote(
                  visitId,
                  `Prescriptions: ${prescriptionsText}`,
                  "plan",
                  "dictation"
                )
              } catch (noteError) {
                console.warn("Failed to save prescriptions to notes:", noteError)
              }
            }
          }
        }
      } catch (transcribeError: any) {
        console.error('Transcription error:', transcribeError)
        setError(transcribeError?.message || 'Transcription failed, but visit was created')
      } finally {
        setTranscribing(false)
        setSaving(false)
      }
    } catch (err: any) {
      console.error('Error processing audio:', err)
      setError(err?.message || 'Failed to process audio')
      setSaving(false)
      setTranscribing(false)
    }
  }

  const handleSaveVisit = async () => {
    try {
      setSaving(true)
      setError(null)

      // Create the visit first if it doesn't exist
      let currentVisit = visit
      if (!currentVisit) {
        currentVisit = await createVisit({
          patient_id: patientId,
          status: 'draft'
        })
        setVisit(currentVisit)
      }

      const visitId = currentVisit.id

      // Save SOAP note entries
      if (visitData.subjective.chiefComplaint.trim()) {
        await appendVisitNote(
          visitId,
          visitData.subjective.chiefComplaint,
          'subjective',
          'manual'
        )
      }

      if (visitData.subjective.hpi.trim()) {
        await appendVisitNote(
          visitId,
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
          visitId,
          objectiveText,
          'objective',
          'manual'
        )
      }

      if (visitData.assessmentPlan.assessment.trim()) {
        await appendVisitNote(
          visitId,
          visitData.assessmentPlan.assessment,
          'assessment',
          'manual'
        )
      }

      if (visitData.assessmentPlan.plan.trim()) {
        await appendVisitNote(
          visitId,
          visitData.assessmentPlan.plan,
          'plan',
          'manual'
        )
      }

      // Navigate back to patient page
      router.push(getPatientUrl(patientId))
    } catch (err: any) {
      console.error('Error saving visit:', err)
      setError(err?.message || 'Failed to save visit')
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
          <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
            <GlobalSearchBar />
          </header>
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error && !patient) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
          <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-10">
            <GlobalSearchBar />
          </header>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Patient</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Link href={getBaseUrl()} className="text-primary hover:text-primary/80">
                Go Back
              </Link>
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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{patient?.name || 'Patient'}</h1>
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
                      Allergies: {typeof patient.allergies === 'string' ? patient.allergies : JSON.stringify(patient.allergies)}
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
                        ? `Recording: ${recorder.formatTime(recorder.recordingTime)}`
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default NewVisitForm
