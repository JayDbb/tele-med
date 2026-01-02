"use client";


import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createVisit, getPatients, transcribeVisitAudio, updateVisit } from "../../lib/api";
import type { Patient } from "../../lib/types";
import { useAuthGuard } from "../../lib/useAuthGuard";
import { uploadToPrivateBucket } from "../../lib/storage";

function NewVisitPageContent() {
  const { ready } = useAuthGuard();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState("");
  const [status, setStatus] = useState("draft");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<{
    transcript: string;
    structured: any;
    summary: string;
  } | null>(null);

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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready || !patientId) return;
    setSaving(true);
    setError(null);
    try {
      let audio_url: string | undefined;

      // Create visit first to get the visit_id
      const visit = await createVisit({ patient_id: patientId, status, audio_url });
      const visitId = visit.id;

      if (file) {
        // Upload audio file to Supabase storage
        const upload = await uploadToPrivateBucket(file);
        audio_url = upload.path;

        // Update visit with audio URL
        await updateVisit(visitId, { audio_url: upload.path });

        // Transcribe the audio with visit_id so it gets saved to database
        setTranscribing(true);
        try {
          const transcriptionResult = await transcribeVisitAudio(upload.path, visitId);
          setTranscription(transcriptionResult);
          
          // Import appendVisitNote for saving transcription to notes
          const { appendVisitNote } = await import("../../lib/api");
          
          // Save the full transcript to visit notes as subjective (dictation source)
          if (transcriptionResult.transcript) {
            try {
              await appendVisitNote(
                visitId,
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
                visitId,
                transcriptionResult.summary,
                "assessment",
                "dictation"
              );
            } catch (noteError) {
              console.warn("Failed to save summary to notes:", noteError);
            }
          }

          // Save structured data to notes if available
          if (transcriptionResult.structured) {
            const structured = transcriptionResult.structured;
            
            // Save diagnosis
            if (structured.diagnosis) {
              const diagnosis = Array.isArray(structured.diagnosis)
                ? structured.diagnosis.join(', ')
                : structured.diagnosis;
              try {
                await appendVisitNote(
                  visitId,
                  `Diagnosis: ${diagnosis}`,
                  "assessment",
                  "dictation"
                );
              } catch (noteError) {
                console.warn("Failed to save diagnosis to notes:", noteError);
              }
            }

            // Save treatment plan
            if (structured.treatment_plan && Array.isArray(structured.treatment_plan) && structured.treatment_plan.length > 0) {
              try {
                await appendVisitNote(
                  visitId,
                  `Treatment Plan: ${structured.treatment_plan.join('\n')}`,
                  "plan",
                  "dictation"
                );
              } catch (noteError) {
                console.warn("Failed to save treatment plan to notes:", noteError);
              }
            }
          }
        } catch (transcribeError) {
          console.error("Transcription error:", transcribeError);
          setError((transcribeError as Error).message);
          // Don't fail the visit creation if transcription fails
        } finally {
          setTranscribing(false);
        }
      }
      router.push(`/patients/${visit.patient_id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
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
              >
                <option value="draft">Draft</option>
                <option value="pending_review">Pending review</option>
                <option value="finalized">Finalized</option>
              </select>
            </label>
            <label className="stack">
              <span className="label">Attach audio (optional)</span>
              <input
                className="input"
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setTranscription(null); // Clear previous transcription when new file is selected
                }}
              />
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
              <button className="button" type="submit" disabled={saving || transcribing}>
                {transcribing
                  ? "Transcribing..."
                  : saving
                    ? "Creating..."
                    : "Create visit"}
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => router.back()}
                disabled={saving}
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

