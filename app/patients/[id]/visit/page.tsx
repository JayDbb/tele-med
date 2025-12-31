"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createVisit, getPatient, transcribeVisitAudio, updateVisit, upsertVisitNote } from "../../../../lib/api";
import type { Patient, Visit } from "../../../../lib/types";
import { useAuthGuard } from "../../../../lib/useAuthGuard";
import { supabaseBrowser } from "../../../../lib/supabaseBrowser";
import { uploadToPrivateBucket } from "../../../../lib/storage";
import { useAudioRecorder } from "../../../../lib/useAudioRecorder";
import { convertToMP3 } from "../../../../lib/audioConverter";
import { Header } from "../../../../components/Header";

export default function PatientVisitPage() {
  const { ready } = useAuthGuard();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("record");
  const [transcription, setTranscription] = useState<any>(null);

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

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const supabase = supabaseBrowser();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        const patientData = await getPatient(params.id);
        setPatient(patientData.patient);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, params.id]);

  const getUserDisplayName = () => {
    if (!user) return 'Loading...';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
    // Create visit first
    const newVisit = await createVisit({ patient_id: params.id, status: "draft" });
    setVisit(newVisit);

    // Upload MP3 file
    const upload = await uploadToPrivateBucket(mp3File);
    await updateVisit(newVisit.id, { audio_url: upload.path });

    // Transcribe the audio
    setTranscribing(true);
    try {
      const transcriptionResult = await transcribeVisitAudio(upload.path, newVisit.id);
      setTranscription(transcriptionResult);

      // Auto-populate SOAP fields from transcription
      if (transcriptionResult.structured) {
        const structured = transcriptionResult.structured;

        // Handle current symptoms - extract symptom names only
        if (structured.current_symptoms && Array.isArray(structured.current_symptoms)) {
          const symptomsText = structured.current_symptoms
            .map((s: any) => s.symptom)
            .filter((symptom: string) => symptom && symptom !== 'undefined')
            .join(', ');
          setChiefComplaint(symptomsText);
        }

        if (structured.physical_exam_findings) {
          const examFindings = Object.entries(structured.physical_exam_findings)
            .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
            .join('\n');
          setPhysicalExam(examFindings);
        }

        if (structured.past_medical_history && Array.isArray(structured.past_medical_history)) {
          setHpi(structured.past_medical_history.join('\n'));
        }

        if (structured.diagnosis) {
          const diagnosis = Array.isArray(structured.diagnosis)
            ? structured.diagnosis.join(', ')
            : structured.diagnosis;
          setAssessment(diagnosis);
        }

        if (structured.treatment_plan && Array.isArray(structured.treatment_plan)) {
          setTreatmentPlan(structured.treatment_plan.join('\n'));
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
    if (!visit) return;

    setSaving(true);
    try {
      const noteData = {
        subjective: {
          chief_complaint: chiefComplaint,
          hpi: hpi
        },
        objective: {
          vitals: { bp, hr, temp, weight },
          physical_exam: physicalExam
        },
        assessment: assessment,
        plan: treatmentPlan
      };

      await upsertVisitNote(visit.id, noteData, "draft");
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
      <div className="bg-[#f6f7f8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#137fec] border-t-transparent rounded-full mx-auto mb-4"></div>
          Loading patient...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F3F6FD] min-h-screen">
      <Header />
      {/* Main Content */}
      <main className="p-4 md:p-8 overflow-y-auto">

        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 gap-4">
          <div className="w-full lg:w-auto">
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-blue-100 text-[#5BB5E8] text-xs font-semibold px-2 py-0.5 rounded-md">Phase 1</span>
              <h2 className="text-sm text-[#718096] font-medium">Intellibus</h2>
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
                          disabled={saving || transcribing}
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
                            disabled={saving || transcribing}
                          >
                            <span className="text-[20px]">⏹</span>
                            <span>{saving || transcribing ? "Processing..." : "Stop Recording"}</span>
                          </button>
                          <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">
                            {recorder.formatTime(recorder.recordingTime)}
                          </span>
                        </div>
                      )}
                      {transcription && !recording && (
                        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                          Recording saved and transcribed
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
                  {saving ? "Saving..." : transcribing ? "Transcribing..." : "Ready to save"}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveDraft}
                    className="text-[#0d141b] hover:bg-white px-3 py-1.5 rounded-lg text-sm font-medium border border-transparent hover:border-[#e7edf3] transition-all"
                    disabled={saving || transcribing}
                  >
                    Save Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}