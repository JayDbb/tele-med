"use client";


import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createVisit, getPatients, transcribeAudio, updateVisit } from "../../../lib/api";
import type { Patient } from "../../../lib/types";
import { useAuthGuard } from "../../../lib/useAuthGuard";
import { uploadToPrivateBucket } from "../../../lib/storage";
import { useAudioRecorder } from "../../../lib/useAudioRecorder";
import { convertToMP3 } from "../../../lib/audioConverter";

function NewVisitPageContent() {
  const { ready } = useAuthGuard();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<{
    transcript: string;
    structured: any;
    summary: string;
  } | null>(null);
  const recorder = useAudioRecorder();

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const data = await getPatients();
        setPatients(data);
        if (data.length > 0) setPatientId(data[0].id);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [ready]);

  const handleStartRecording = async () => {
    setError(null);
    setTranscription(null); // Clear previous transcription when starting new recording
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

      // Convert WebM to MP3
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setError(null);
    setTranscription(null);
    setSaving(true);

    try {
      // Convert uploaded file to MP3 if it's not already MP3
      let mp3File: File;

      if (file.type === "audio/mp3" || file.name.endsWith(".mp3")) {
        mp3File = file;
      } else {
        // Convert to MP3
        const blob = new Blob([file], { type: file.type });
        const mp3Blob = await convertToMP3(blob);
        mp3File = new File([mp3Blob], `upload-${Date.now()}.mp3`, {
          type: "audio/mp3"
        });
      }

      await processAudioFile(mp3File);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  const processAudioFile = async (mp3File: File) => {
    // Create visit first to get the visit_id
    const visit = await createVisit({ patient_id: patientId, status });
    const visitId = visit.id;

    // Upload MP3 file to Supabase storage
    const upload = await uploadToPrivateBucket(mp3File);

    // Update visit with audio URL
    await updateVisit(visitId, { audio_url: upload.path });

    // Transcribe the audio with visit_id so it gets saved to database
    setTranscribing(true);
    try {
      const transcriptionResult = await transcribeAudio(upload.path, visitId);
      setTranscription(transcriptionResult);
      console.log("Transcription completed:", transcriptionResult);
    } catch (transcribeError) {
      console.error("Transcription error:", transcribeError);
      setError((transcribeError as Error).message);
      // Don't fail the visit creation if transcription fails
    } finally {
      setTranscribing(false);
      setSaving(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready || !patientId) return;

    // If there's a transcription, navigate to patient page
    if (transcription) {
      router.push(`/patients/${patientId}`);
    } else {
      setError("Please record audio before creating the visit.");
    }
  };

  return (
    <main className="shell">
      <div className="card stack">
        <div className="pill">Visit</div>
        <h1 style={{ margin: "4px 0 0" }}>Start a visit</h1>
        {loading && <div>Loading patients...</div>}
        {error && (
          <div className="pill" style={{ background: "#fef2f2", color: "#b91c1c" }}>
            {error}
          </div>
        )}
        {!loading && patients.length === 0 && <div>Add a patient first.</div>}
        {!loading && patients.length > 0 && (
          <form className="grid two" onSubmit={onSubmit}>
            <label className="stack">
              <span className="label">Patient</span>
              <select
                className="input"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                disabled={recording || saving || transcribing}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="stack">
              <span className="label">Status</span>
              <select
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={recording || saving || transcribing}
              >
                <option value="draft">Draft</option>
                <option value="pending_review">Pending review</option>
                <option value="finalized">Finalized</option>
              </select>
            </label>
            <label className="stack" style={{ gridColumn: "1 / span 2" }}>
              <span className="label">Record audio</span>
              {!recording && !recorder.isRecording && !transcription && (
                <button
                  type="button"
                  className="button"
                  onClick={handleStartRecording}
                  disabled={saving || transcribing}
                >
                  Start Recording
                </button>
              )}
              {recording && recorder.isRecording && (
                <div className="stack" style={{ gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                      type="button"
                      className="button"
                      style={{ background: "#dc2626" }}
                      onClick={handleStopRecording}
                      disabled={saving || transcribing}
                    >
                      {saving || transcribing ? "Processing..." : "Stop Recording"}
                    </button>
                    <span className="pill" style={{ background: "#fef2f2", color: "#dc2626" }}>
                      {recorder.formatTime(recorder.recordingTime)}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "#475569", fontSize: "14px" }}>
                    Recording in progress... Click Stop when finished.
                  </p>
                </div>
              )}
              {transcription && !recording && !recorder.isRecording && (
                <div className="pill" style={{ background: "#f0f9ff", color: "#0369a1" }}>
                  Recording saved and transcribed
                </div>
              )}
            </label>

            {/* TESTING: File Upload - Comment out later */}
            <label className="stack" style={{ gridColumn: "1 / span 2" }}>
              <span className="label">TESTING: Upload audio/video file</span>
              <input
                className="input"
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileUpload}
                disabled={saving || transcribing || recording}
              />
              {uploadedFile && (
                <p style={{ margin: "4px 0 0 0", color: "#475569", fontSize: "14px" }}>
                  Selected: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </label>

            {/* Transcription Results */}
            {transcription && (
              <div className="stack" style={{ gridColumn: "1 / span 2", marginTop: "16px" }}>
                <div className="pill" style={{ background: "#f0f9ff", color: "#0369a1" }}>
                  Transcription Complete
                </div>

                {/* Summary */}
                <div className="stack" style={{ background: "#f9fafb", padding: "16px", borderRadius: "8px" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600" }}>Summary</h3>
                  <p style={{ margin: 0, lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {transcription.summary}
                  </p>
                </div>

                {/* Structured Data */}
                <details className="stack" style={{ background: "#f9fafb", padding: "16px", borderRadius: "8px" }}>
                  <summary style={{ cursor: "pointer", fontWeight: "600", marginBottom: "8px" }}>
                    Structured Medical Data
                  </summary>
                  <div className="stack" style={{ marginTop: "12px", gap: "12px" }}>
                    {transcription.structured.past_medical_history?.length > 0 && (
                      <div>
                        <strong>Past Medical History:</strong>
                        <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                          {transcription.structured.past_medical_history.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {transcription.structured.current_symptoms && Object.keys(transcription.structured.current_symptoms).length > 0 && (
                      <div>
                        <strong>Current Symptoms:</strong>
                        <pre style={{ margin: "4px 0 0 0", padding: "8px", background: "#fff", borderRadius: "4px", fontSize: "14px", overflow: "auto" }}>
                          {JSON.stringify(transcription.structured.current_symptoms, null, 2)}
                        </pre>
                      </div>
                    )}

                    {transcription.structured.physical_exam_findings && Object.keys(transcription.structured.physical_exam_findings).length > 0 && (
                      <div>
                        <strong>Physical Exam Findings:</strong>
                        <pre style={{ margin: "4px 0 0 0", padding: "8px", background: "#fff", borderRadius: "4px", fontSize: "14px", overflow: "auto" }}>
                          {JSON.stringify(transcription.structured.physical_exam_findings, null, 2)}
                        </pre>
                      </div>
                    )}

                    {transcription.structured.diagnosis && (
                      <div>
                        <strong>Diagnosis:</strong>
                        <p style={{ margin: "4px 0 0 0" }}>
                          {Array.isArray(transcription.structured.diagnosis)
                            ? transcription.structured.diagnosis.join(", ")
                            : transcription.structured.diagnosis}
                        </p>
                      </div>
                    )}

                    {transcription.structured.treatment_plan?.length > 0 && (
                      <div>
                        <strong>Treatment Plan:</strong>
                        <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                          {transcription.structured.treatment_plan.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {transcription.structured.prescriptions?.length > 0 && (
                      <div>
                        <strong>Prescriptions:</strong>
                        <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                          {transcription.structured.prescriptions.map((prescription: any, idx: number) => (
                            <li key={idx}>
                              {prescription.medication || "Medication"}
                              {prescription.dosage && ` - ${prescription.dosage}`}
                              {prescription.frequency && ` (${prescription.frequency})`}
                              {prescription.duration && ` for ${prescription.duration}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </details>

                {/* Full Transcript */}
                <details className="stack" style={{ background: "#f9fafb", padding: "16px", borderRadius: "8px" }}>
                  <summary style={{ cursor: "pointer", fontWeight: "600", marginBottom: "8px" }}>
                    Full Transcript
                  </summary>
                  <p style={{ margin: "12px 0 0 0", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {transcription.transcript}
                  </p>
                </details>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, gridColumn: "1 / span 2" }}>
              <button className="button" type="submit" disabled={saving || transcribing || !transcription}>
                {transcribing
                  ? "Transcribing..."
                  : saving
                    ? "Processing..."
                    : "Continue to visit"}
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => router.back()}
                disabled={saving || transcribing || recording}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default function NewVisitPage() {
  return (
    <Suspense fallback={
      <main className="shell fade-in">
        <div className="card stack" style={{ textAlign: "center", padding: "48px" }}>
          <div>Loading...</div>
        </div>
      </main>
    }>
      <NewVisitPageContent />
    </Suspense>
  );
}

