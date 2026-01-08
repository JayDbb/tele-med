"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from '@/components/Sidebar'
import PatientDetailSidebar from '@/components/PatientDetailSidebar'
import GlobalSearchBar from '@/components/GlobalSearchBar'
import { createVisit, getPatient, transcribeVisitAudio, updateVisit, appendVisitNote } from "../../../../lib/api";
import type { Patient, Visit } from "../../../../lib/types";
import { uploadToPrivateBucket } from "../../../../lib/storage";
import { useAudioRecorder } from "../../../../lib/useAudioRecorder";
import { convertToMP3 } from "../../../../lib/audioConverter";
import { useAutosave } from "@/hooks/useAutosave";
import AssignPatientModal from "@/components/AssignPatientModal";

export default function PatientVisitPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("record");
  const [transcription, setTranscription] = useState<any>(null);
  const [showAssignPrompt, setShowAssignPrompt] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // SOAP Note fields
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [hpi, setHpi] = useState("");
  const [bp, setBp] = useState("");
  const [hr, setHr] = useState("");
  const [temp, setTemp] = useState("");
  const [weight, setWeight] = useState("");
  const [physicalExam, setPhysicalExam] = useState("");
  const [assessment, setAssessment] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");

  const recorder = useAudioRecorder();

  // Autosave form data
  const { clearDraft } = useAutosave(
    'visit-form',
    {
      chiefComplaint,
      hpi,
      bp,
      hr,
      temp,
      weight,
      physicalExam,
      assessment,
      treatmentPlan,
      activeTab
    },
    params.id,
    {
      enabled: true,
      onRestore: (data) => {
        if (data.chiefComplaint) setChiefComplaint(data.chiefComplaint);
        if (data.hpi) setHpi(data.hpi);
        if (data.bp) setBp(data.bp);
        if (data.hr) setHr(data.hr);
        if (data.temp) setTemp(data.temp);
        if (data.weight) setWeight(data.weight);
        if (data.physicalExam) setPhysicalExam(data.physicalExam);
        if (data.assessment) setAssessment(data.assessment);
        if (data.treatmentPlan) setTreatmentPlan(data.treatmentPlan);
        if (data.activeTab) setActiveTab(data.activeTab);
      }
    }
  );

  useEffect(() => {
    (async () => {
      try {
        const patientData = await getPatient(params.id);
        setPatient(patientData.patient);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const handleStartRecording = async () => {
    setError(null);
    setTranscription(null);
    try {
      await recorder.startRecording();
      setRecording(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleStopRecording = async () => {
    try {
      const blob = await recorder.stopRecording();
      setRecording(false);
      setSaving(true);
      setError(null);

      const mp3Blob = await convertToMP3(blob);
      const mp3File = new File([mp3Blob], `recording-${Date.now()}.mp3`, {
        type: "audio/mp3"
      });

      await processAudioFile(mp3File);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  const processAudioFile = async (mp3File: File) => {
    setError(null);

    // Create visit first
    const newVisit = await createVisit({ patient_id: params.id, status: "draft" });
    setVisit(newVisit);

    // Upload MP3 file
    setUploading(true);
    let upload;
    try {
      upload = await uploadToPrivateBucket(mp3File);
      await updateVisit(newVisit.id, { audio_url: upload.path });
    } finally {
      setUploading(false);
    }

    // Transcribe the audio
    setTranscribing(true);
    try {
      const transcriptionResult = await transcribeVisitAudio(upload.path, newVisit.id);
      setTranscription(transcriptionResult);

      // Save the full transcript to visit notes as subjective (dictation source)
      if (transcriptionResult.transcript) {
        try {
          await appendVisitNote(
            newVisit.id,
            transcriptionResult.transcript,
            "subjective",
            "dictation"
          );
        } catch (noteError) {
          console.warn("Failed to save transcript to notes:", noteError);
        }
      }

      // Save the AI-generated summary to visit notes as assessment
      if (transcriptionResult.summary) {
        try {
          await appendVisitNote(
            newVisit.id,
            transcriptionResult.summary,
            "assessment",
            "dictation"
          );
        } catch (noteError) {
          console.warn("Failed to save summary to notes:", noteError);
        }
      }

      // Auto-populate SOAP fields from structured transcription data
      if (transcriptionResult.structured) {
        const structured = transcriptionResult.structured;

        // Handle current symptoms - extract symptom names only
        if (structured.current_symptoms && Array.isArray(structured.current_symptoms)) {
          const symptomsText = structured.current_symptoms
            .map((s: any) => s.symptom)
            .filter((symptom: string) => symptom && symptom !== 'undefined')
            .join(', ');
          setChiefComplaint(symptomsText);

          // Save symptoms to notes as subjective
          if (symptomsText) {
            try {
              await appendVisitNote(
                newVisit.id,
                `Chief Complaint: ${symptomsText}`,
                "subjective",
                "dictation"
              );
            } catch (noteError) {
              console.warn("Failed to save symptoms to notes:", noteError);
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

          // Set the vital sign values
          if (bpValue) setBp(bpValue);
          if (hrValue) setHr(hrValue);
          if (tempValue) setTemp(tempValue);
          if (weightValue) setWeight(weightValue);

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
          setPhysicalExam(examFindings);

          // Save physical exam findings to notes as objective (excluding vitals)
          if (examFindings) {
            try {
              await appendVisitNote(
                newVisit.id,
                `Physical Examination: ${examFindings}`,
                "objective",
                "dictation"
              );
            } catch (noteError) {
              console.warn("Failed to save physical exam to notes:", noteError);
            }
          }

          // Save vitals separately to notes
          const vitalsText = [
            bp && `Blood Pressure: ${bp}`,
            hr && `Heart Rate: ${hr} bpm`,
            temp && `Temperature: ${temp}°F`,
            weight && `Weight: ${weight} lbs`
          ].filter(Boolean).join('\n');

          if (vitalsText) {
            try {
              await appendVisitNote(
                newVisit.id,
                `Vital Signs:\n${vitalsText}`,
                "objective",
                "dictation"
              );
            } catch (noteError) {
              console.warn("Failed to save vitals to notes:", noteError);
            }
          }
        }

        if (structured.past_medical_history && Array.isArray(structured.past_medical_history) && structured.past_medical_history.length > 0) {
          const historyText = structured.past_medical_history.join('\n');
          setHpi(historyText);

          // Save past medical history to notes as subjective
          try {
            await appendVisitNote(
              newVisit.id,
              `Past Medical History: ${historyText}`,
              "subjective",
              "dictation"
            );
          } catch (noteError) {
            console.warn("Failed to save medical history to notes:", noteError);
          }
        }

        if (structured.diagnosis) {
          const diagnosis = Array.isArray(structured.diagnosis)
            ? structured.diagnosis.join(', ')
            : structured.diagnosis;
          setAssessment(diagnosis);

          // Save diagnosis to notes as assessment
          if (diagnosis) {
            try {
              await appendVisitNote(
                newVisit.id,
                `Diagnosis: ${diagnosis}`,
                "assessment",
                "dictation"
              );
            } catch (noteError) {
              console.warn("Failed to save diagnosis to notes:", noteError);
            }
          }
        }

        if (structured.treatment_plan && Array.isArray(structured.treatment_plan) && structured.treatment_plan.length > 0) {
          const planText = structured.treatment_plan.join('\n');
          setTreatmentPlan(planText);

          // Save treatment plan to notes as plan
          try {
            await appendVisitNote(
              newVisit.id,
              `Treatment Plan: ${planText}`,
              "plan",
              "dictation"
            );
          } catch (noteError) {
            console.warn("Failed to save treatment plan to notes:", noteError);
          }
        }

        // Save prescriptions if available
        if (structured.prescriptions && Array.isArray(structured.prescriptions) && structured.prescriptions.length > 0) {
          const prescriptionsText = structured.prescriptions
            .map((p: any) => {
              const parts = [];
              if (p.medication) parts.push(p.medication);
              if (p.dosage) parts.push(`Dosage: ${p.dosage}`);
              if (p.frequency) parts.push(`Frequency: ${p.frequency}`);
              if (p.duration) parts.push(`Duration: ${p.duration}`);
              return parts.join(', ');
            })
            .join('\n');

          if (prescriptionsText) {
            try {
              await appendVisitNote(
                newVisit.id,
                `Prescriptions: ${prescriptionsText}`,
                "plan",
                "dictation"
              );
            } catch (noteError) {
              console.warn("Failed to save prescriptions to notes:", noteError);
            }
          }
        }
      }
    } catch (transcribeError) {
      setError((transcribeError as Error).message);
    } finally {
      setTranscribing(false);
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    // Create visit first if it doesn't exist
    let currentVisit = visit;
    if (!currentVisit) {
      try {
        currentVisit = await createVisit({ patient_id: params.id, status: "draft" });
        setVisit(currentVisit);
      } catch (err) {
        setError((err as Error).message);
        return;
      }
    }

    if (!currentVisit) {
      setError("Failed to create visit");
      return;
    }

    setSaving(true);
    try {
      // Save each section separately
      if (chiefComplaint.trim()) {
        await appendVisitNote(currentVisit.id, chiefComplaint, "subjective", "manual");
      }

      if (hpi.trim()) {
        await appendVisitNote(currentVisit.id, hpi, "subjective", "manual");
      }

      // Combine objective data
      const objectiveText = [
        bp && `BP: ${bp}`,
        hr && `HR: ${hr}`,
        temp && `Temp: ${temp}`,
        weight && `Weight: ${weight}`,
        physicalExam
      ].filter(Boolean).join('\n');

      if (objectiveText.trim()) {
        await appendVisitNote(currentVisit.id, objectiveText, "objective", "manual");
      }

      if (assessment.trim()) {
        await appendVisitNote(currentVisit.id, assessment, "assessment", "manual");
      }

      if (treatmentPlan.trim()) {
        await appendVisitNote(currentVisit.id, treatmentPlan, "plan", "manual");
      }

      // Clear autosave draft after successful save
      clearDraft();
      
      // Show prompt to assign patient
      setShowAssignPrompt(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleContinueToVisit = async () => {
    if (!visit) {
      // Create visit without recording
      const newVisit = await createVisit({ patient_id: params.id, status: "draft" });
      setVisit(newVisit);
    }
    // Continue with current form data
  };

  if (loading) {
    return (
      <div className="relative flex flex-col lg:flex-row min-h-screen w-full">
        <Sidebar />
        <PatientDetailSidebar patientId={params.id} />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <GlobalSearchBar />
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading patient...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen w-full">
      <Sidebar />
      <PatientDetailSidebar patientId={params.id} />

      <main className="flex-1 p-8">
        <div className="mb-6">
          <GlobalSearchBar />
        </div>

        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 gap-4">
          <div className="w-full lg:w-auto">
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-blue-100 text-[#5BB5E8] text-xs font-semibold px-2 py-0.5 rounded-md">Phase 1</span>
              <h2 className="text-sm text-[#718096] font-medium">Intellibus Tele-Medicine</h2>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2D3748] mt-4">Ready to help your patients today?</h1>
            <p className="text-sm text-[#718096] mt-1">Recording visit for {patient?.full_name} - manage consultation and track health progress</p>
          </div>
          <div className="flex justify-end w-full lg:w-auto">
            <div className="relative w-full sm:w-auto max-w-sm">
              <Link href={`/patients/${params.id}`} className="pl-10 pr-4 py-2 rounded-xl border-none bg-white shadow-sm text-sm focus:ring-2 focus:ring-[#5BB5E8] w-full block text-center hover:bg-gray-50 transition">
                Back to Patient
              </Link>
              <span className="absolute left-3 top-2 text-gray-400 text-lg">←</span>
            </div>
          </div>
        </header>



        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            {/* Patient Info Card */}
            <div className="bg-[#5BB5E8] rounded-2xl p-6 md:p-8 relative overflow-hidden text-white shadow-lg shadow-blue-200 min-h-[180px] flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300 opacity-20 rounded-full -ml-10 -mb-10 blur-xl"></div>
              <div className="relative z-10 w-full">
                <p className="text-blue-100 mb-1">Recording visit for</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{patient?.full_name}</h2>
                <div className="flex flex-wrap gap-3 text-blue-50 text-sm">
                  {patient?.sex_at_birth && <span>👤 {patient.sex_at_birth === 'M' ? 'Male' : 'Female'}</span>}
                  <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">Draft</span>
                </div>
              </div>
            </div>

            {/* Recording Tools */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Tabs Panel */}
              <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm overflow-hidden flex flex-col">
                <div className="border-b border-[#e7edf3] px-4 bg-[#f6f7f8]/50">
                  <div className="flex gap-6">
                    <button
                      onClick={() => setActiveTab("record")}
                      className={`flex flex-col items-center justify-center border-b-[3px] gap-1 pb-3 pt-4 px-2 transition-colors ${activeTab === "record"
                        ? "border-b-[#137fec] text-[#137fec]"
                        : "border-b-transparent text-[#4c739a] hover:text-[#0d141b]"
                        }`}
                    >
                      <span className="text-2xl">🎤</span>
                      <span className="text-sm font-bold">Record</span>
                    </button>
                  </div>
                </div>

                {/* Recording Area */}
                <div className="p-6 flex flex-col items-center justify-center min-h-[300px] bg-white">
                  {activeTab === "record" && (
                    <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-[#e7edf3] rounded-xl bg-[#f6f7f8]/30 p-8 text-center gap-6 group hover:border-[#137fec]/40 transition-colors cursor-pointer">
                      <div className="size-20 rounded-full bg-[#137fec]/10 flex items-center justify-center text-[#137fec] mb-2 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-[40px]">🎤</span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-[#0d141b]">Ready to Capture</h3>
                        <p className="text-sm text-[#4c739a] max-w-[280px] mx-auto">
                          Start recording the consultation to automatically generate clinical notes.
                        </p>
                      </div>
                      {!recording && !recorder.isRecording && !transcription && (
                        <button
                          onClick={handleStartRecording}
                          className="mt-2 flex items-center justify-center rounded-lg h-11 px-6 bg-[#137fec] hover:bg-[#0b5ec2] text-white text-sm font-bold shadow-lg shadow-[#137fec]/25 transition-all w-full max-w-[200px] gap-2"
                          disabled={saving || uploading || transcribing}
                        >
                          <span className="text-[20px]">⏺</span>
                          <span>Start Recording</span>
                        </button>
                      )}
                      {recording && recorder.isRecording && (
                        <div className="flex flex-col items-center gap-4">
                          <button
                            onClick={handleStopRecording}
                            className="flex items-center justify-center rounded-lg h-11 px-6 bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all gap-2"
                            disabled={saving || uploading || transcribing}
                          >
                            <span className="text-[20px]">⏹</span>
                            <span>{saving || uploading || transcribing ? "Processing..." : "Stop Recording"}</span>
                          </button>
                          <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">
                            {recorder.formatTime(recorder.recordingTime)}
                          </span>
                        </div>
                      )}
                      {uploading && !recording && !transcribing && (
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
                      {transcription && !recording && !uploading && !transcribing && (
                        <div className="w-full px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">check_circle</span>
                          <span className="text-green-700 dark:text-green-300 text-sm font-medium">Recording saved and transcribed successfully</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Previous Visit Info */}
              <div className="bg-white rounded-xl border border-[#e7edf3] shadow-sm p-5 space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#4c739a]">Previous Visit</h3>
                  <Link className="text-[#137fec] text-xs font-semibold hover:underline" href={`/patients/${params.id}`}>View All</Link>
                </div>
                <div className="p-3 rounded-lg bg-[#f6f7f8] border border-[#e7edf3]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-[#4c739a]">No previous visits</span>
                  </div>
                  <p className="text-sm text-[#0d141b]">
                    This is the first visit for this patient.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* SOAP Note Form */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
              <div className="border-b border-[#e7edf3] px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-[#137fec]/10 text-[#137fec] p-2 rounded-lg">
                    <span className="text-[20px]">📋</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#0d141b]">Visit Note</h2>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mx-6 mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                  <div className="flex items-center">
                    <span className="mr-2">⚠️</span>
                    {error}
                  </div>
                </div>
              )}

              {/* Scrollable Form Area */}
              <div className="p-6 space-y-8 overflow-y-auto flex-1">
                {/* Subjective Section */}
                <section className="space-y-3 relative pl-4 border-l-2 border-[#137fec]/20">
                  <div className="absolute -left-[9px] top-0 size-4 rounded-full bg-[#137fec] border-[3px] border-white"></div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#0d141b] flex items-center gap-2">
                      Structured Medical Data
                      <span className="text-xs font-normal text-[#4c739a] px-2 py-0.5 bg-[#f6f7f8] rounded-full">Current Symptoms & History</span>
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4c739a] uppercase tracking-wide mb-1.5">Current Symptoms</label>
                      <textarea
                        className="w-full bg-[#f6f7f8] border-[#e7edf3] rounded-lg text-sm text-[#0d141b] focus:ring-[#137fec] focus:border-[#137fec] placeholder:text-[#4c739a]/50 resize-none"
                        placeholder="e.g., Persistent cough, fever"
                        rows={3}
                        value={chiefComplaint}
                        onChange={(e) => setChiefComplaint(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4c739a] uppercase tracking-wide mb-1.5">Past Medical History</label>
                      <textarea
                        className="w-full bg-[#f6f7f8] border-[#e7edf3] rounded-lg text-sm text-[#0d141b] focus:ring-[#137fec] focus:border-[#137fec] placeholder:text-[#4c739a]/50 resize-none"
                        placeholder="Past medical history..."
                        rows={4}
                        value={hpi}
                        onChange={(e) => setHpi(e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                {/* Physical Exam Section */}
                <section className="space-y-3 relative pl-4 border-l-2 border-[#137fec]/20">
                  <div className="absolute -left-[9px] top-0 size-4 rounded-full bg-[#137fec] border-[3px] border-white"></div>
                  <h3 className="text-base font-bold text-[#0d141b] flex items-center gap-2">
                    Physical Exam
                    <span className="text-xs font-normal text-[#4c739a] px-2 py-0.5 bg-[#f6f7f8] rounded-full">Examination Findings</span>
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-[#4c739a] uppercase tracking-wide mb-1.5">Physical Exam Findings</label>
                    <textarea
                      className="w-full bg-[#f6f7f8] border-[#e7edf3] rounded-lg text-sm text-[#0d141b] focus:ring-[#137fec] focus:border-[#137fec] placeholder:text-[#4c739a]/50 resize-none"
                      placeholder="General appearance, HEENT, Lungs, Heart..."
                      rows={4}
                      value={physicalExam}
                      onChange={(e) => setPhysicalExam(e.target.value)}
                    />
                  </div>
                </section>

                {/* Assessment & Plan */}
                <section className="space-y-3 relative pl-4 border-l-2 border-[#137fec]/20">
                  <div className="absolute -left-[9px] top-0 size-4 rounded-full bg-[#137fec] border-[3px] border-white"></div>
                  <h3 className="text-base font-bold text-[#0d141b]">Assessment & Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-[#4c739a] uppercase tracking-wide mb-1.5">Assessment / Diagnosis</label>
                      <div className="relative">
                        <span className="absolute top-2.5 left-3 text-[#4c739a]">
                          <span className="text-[18px]">🏥</span>
                        </span>
                        <textarea
                          className="w-full bg-[#f6f7f8] border-[#e7edf3] rounded-lg text-sm text-[#0d141b] focus:ring-[#137fec] focus:border-[#137fec] placeholder:text-[#4c739a]/50 pl-10 resize-none"
                          placeholder="Primary diagnosis..."
                          rows={5}
                          value={assessment}
                          onChange={(e) => setAssessment(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4c739a] uppercase tracking-wide mb-1.5">Treatment Plan</label>
                      <div className="relative">
                        <span className="absolute top-2.5 left-3 text-[#4c739a]">
                          <span className="text-[18px]">💊</span>
                        </span>
                        <textarea
                          className="w-full bg-[#f6f7f8] border-[#e7edf3] rounded-lg text-sm text-[#0d141b] focus:ring-[#137fec] focus:border-[#137fec] placeholder:text-[#4c739a]/50 pl-10 resize-none"
                          placeholder="Medications, referrals, follow-up..."
                          rows={5}
                          value={treatmentPlan}
                          onChange={(e) => setTreatmentPlan(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Transcription Results Display */}
                {transcription && (
                  <section className="space-y-6 bg-[#f6f7f8]/50 p-6 rounded-xl border border-[#e7edf3]">
                    <h3 className="text-lg font-bold text-[#0d141b] mb-4">Transcription Results</h3>

                    {/* Summary */}
                    {transcription.summary && (
                      <div className="bg-white p-4 rounded-lg border border-[#e7edf3]">
                        <h4 className="font-semibold text-[#0d141b] mb-2">Summary</h4>
                        <textarea
                          className="w-full bg-transparent border-none text-sm text-[#4c739a] resize-none focus:outline-none focus:ring-0"
                          rows={6}
                          value={transcription.summary}
                          onChange={(e) => setTranscription({ ...transcription, summary: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Structured Data */}
                    {transcription.structured && (
                      <div className="space-y-4">
                        {transcription.structured.current_symptoms && Array.isArray(transcription.structured.current_symptoms) && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-2">Current Symptoms</h4>
                            <div className="space-y-2">
                              {transcription.structured.current_symptoms.map((symptom: any, idx: number) => (
                                <div key={idx} className="bg-white p-2 rounded border">
                                  <span className="font-semibold text-blue-800">{symptom.symptom}</span>
                                  {symptom.characteristics && symptom.characteristics !== 'unspecified' && (
                                    <p className="text-sm text-blue-700">Characteristics: {symptom.characteristics}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {transcription.structured.physical_exam_findings && Object.keys(transcription.structured.physical_exam_findings).length > 0 && (
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-800 mb-2">Physical Exam Findings</h4>
                            <div className="space-y-1">
                              {Object.entries(transcription.structured.physical_exam_findings).map(([key, value]) => (
                                <p key={key} className="text-sm text-green-700">
                                  <strong>{key.replace(/_/g, ' ')}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {transcription.structured.diagnosis && (
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-purple-800 mb-2">Diagnosis</h4>
                            <p className="text-sm text-purple-700">
                              {Array.isArray(transcription.structured.diagnosis)
                                ? transcription.structured.diagnosis.join(', ')
                                : transcription.structured.diagnosis}
                            </p>
                          </div>
                        )}

                        {transcription.structured.treatment_plan && transcription.structured.treatment_plan.length > 0 && (
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <h4 className="font-semibold text-orange-800 mb-2">Treatment Plan</h4>
                            <div className="space-y-2">
                              {transcription.structured.treatment_plan.map((item: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <span className="text-orange-700 mt-1">•</span>
                                  <input
                                    className="flex-1 text-sm text-orange-700 bg-transparent border-none focus:outline-none"
                                    value={item}
                                    onChange={(e) => {
                                      const newPlan = [...transcription.structured.treatment_plan];
                                      newPlan[idx] = e.target.value;
                                      setTranscription({
                                        ...transcription,
                                        structured: {
                                          ...transcription.structured,
                                          treatment_plan: newPlan
                                        }
                                      });
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {transcription.structured.past_medical_history && transcription.structured.past_medical_history.length > 0 && (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-2">Past Medical History</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {transcription.structured.past_medical_history.map((item: string, idx: number) => (
                                <li key={idx}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Full Transcript */}
                    <details className="bg-white p-4 rounded-lg border border-[#e7edf3]">
                      <summary className="cursor-pointer font-semibold text-[#0d141b] mb-2">Full Transcript</summary>
                      <p className="text-sm text-[#4c739a] whitespace-pre-wrap mt-2">{transcription.transcript}</p>
                    </details>
                  </section>
                )}
              </div>

              {/* Form Footer */}
              <div className="p-4 border-t border-[#e7edf3] bg-[#f6f7f8]/30 flex justify-between items-center">
                <span className="text-xs text-[#4c739a] italic">
                  {uploading ? "Uploading..." : saving ? "Saving..." : transcribing ? "Transcribing..." : "Ready to save"}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveDraft}
                    className="text-[#0d141b] hover:bg-white px-3 py-1.5 rounded-lg text-sm font-medium border border-transparent hover:border-[#e7edf3] transition-all"
                    disabled={saving || uploading || transcribing}
                  >
                    Save Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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
                  setShowAssignPrompt(false);
                }}
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Not Now
              </button>
              <button
                onClick={() => {
                  setShowAssignPrompt(false);
                  setAssignModalOpen(true);
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
          setAssignModalOpen(false);
        }}
        patientId={params.id}
        onSuccess={() => {
          // Optionally refresh or navigate
        }}
      />
    </div>
  );
}
