"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getVisit, updateVisit } from "../../../lib/api";
import { uploadToPrivateBucket } from "../../../lib/storage";
import { useAudioRecorder } from "../../../lib/useAudioRecorder";
import { useAuthGuard } from "../../../lib/useAuthGuard";
import type { Patient, Visit } from "../../../lib/types";

export default function VisitDetailPage() {
  const { ready } = useAuthGuard();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const recorder = useAudioRecorder();

  useEffect(() => {
    if (!ready) return;
    loadVisit();
  }, [params.id, ready]);

  const loadVisit = async () => {
    try {
      const data = await getVisit(params.id);
      setVisit(data.visit);
      setPatient(data.patient);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const handleStartRecording = async () => {
    setError(null);
    try {
      await recorder.startRecording();
      setRecording(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleStopRecording = async () => {
    recorder.setIsUploading(true);
    setError(null);
    try {
      const blob = await recorder.stopRecording();
      const file = new File([blob], `recording-${params.id}-${Date.now()}.webm`, {
        type: "audio/webm;codecs=opus"
      });
      const { path } = await uploadToPrivateBucket(file);
      await updateVisit(params.id, { audio_url: path });
      setRecording(false);
      await loadVisit();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      recorder.setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <main className="shell fade-in">
        <div className="card stack" style={{ textAlign: "center", padding: "48px" }}>
          <div>Loading visit...</div>
        </div>
      </main>
    );
  }

  if (error && !visit) {
    return (
      <main className="shell fade-in">
        <div className="card stack">
          <div className="pill" style={{ background: "#fef2f2", color: "#b91c1c" }}>
            {error}
          </div>
          <button className="button secondary" onClick={() => router.back()}>
            Go back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="shell stack fade-in">
      <div className="card stack">
        <div className="header" style={{ padding: 0 }}>
          <div>
            <div className="pill">Visit</div>
            <h1 style={{ margin: "4px 0 0" }}>
              {patient?.full_name ? `Visit with ${patient.full_name}` : "Visit"}
            </h1>
            {visit?.created_at && (
              <div style={{ color: "#475569", marginTop: 4 }}>
                {new Date(visit.created_at).toLocaleString()}
              </div>
            )}
          </div>
          <Link className="button secondary" href={patient ? `/patients/${patient.id}` : "/dashboard"}>
            Back
          </Link>
        </div>
      </div>

      {!visit?.audio_url && (
        <div className="card stack">
          <div className="pill">Recording</div>
          <h2 style={{ margin: "4px 0 0" }}>Record conversation</h2>
          <p style={{ color: "#475569" }}>
            Tap Record to start capturing the visit conversation. Stop when finished.
          </p>
          {!recording && !recorder.isRecording && (
            <button className="button" onClick={handleStartRecording} disabled={recorder.isUploading}>
              Record
            </button>
          )}
          {recording && recorder.isRecording && (
            <div className="stack">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  className="button"
                  style={{ background: "#dc2626" }}
                  onClick={handleStopRecording}
                  disabled={recorder.isUploading}
                >
                  {recorder.isUploading ? "Uploading..." : "Stop"}
                </button>
                <span className="pill" style={{ background: "#fef2f2", color: "#dc2626" }}>
                  {recorder.formatTime(recorder.recordingTime)}
                </span>
              </div>
            </div>
          )}
          {error && (
            <div className="pill" style={{ background: "#fef2f2", color: "#b91c1c" }}>
              {error}
            </div>
          )}
        </div>
      )}

      {visit?.audio_url && (
        <>
          <div className="card stack">
            <div className="pill">Review & Edit</div>
            <h2 style={{ margin: "4px 0 0" }}>Visit notes</h2>
            <p style={{ color: "#475569" }}>
              Review the transcript and structured notes below. Edit as needed and save.
            </p>
            {visit.transcripts ? (
              <div className="stack" style={{ gap: "16px" }}>
                {/* Summary */}
                {visit.transcripts.segments?.summary && (
                  <div style={{ padding: 16, background: "#f9fafb", borderRadius: 8 }}>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600" }}>Summary</h3>
                    <p style={{ margin: 0, lineHeight: "1.6", whiteSpace: "pre-wrap", color: "#475569" }}>
                      {visit.transcripts.segments.summary}
                    </p>
                  </div>
                )}

                {/* Structured Data */}
                {visit.transcripts.segments?.structured && (
                  <details className="stack" style={{ background: "#f9fafb", padding: 16, borderRadius: 8 }}>
                    <summary style={{ cursor: "pointer", fontWeight: "600", marginBottom: 8 }}>
                      Structured Medical Data
                    </summary>
                    <div className="stack" style={{ marginTop: 12, gap: 12 }}>
                      {visit.transcripts.segments.structured.past_medical_history?.length > 0 && (
                        <div>
                          <strong>Past Medical History:</strong>
                          <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                            {visit.transcripts.segments.structured.past_medical_history.map((item: string, idx: number) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {visit.transcripts.segments.structured.current_symptoms && Object.keys(visit.transcripts.segments.structured.current_symptoms).length > 0 && (
                        <div>
                          <strong>Current Symptoms:</strong>
                          <pre style={{ margin: "4px 0 0 0", padding: 8, background: "#fff", borderRadius: 4, fontSize: 14, overflow: "auto" }}>
                            {JSON.stringify(visit.transcripts.segments.structured.current_symptoms, null, 2)}
                          </pre>
                        </div>
                      )}

                      {visit.transcripts.segments.structured.physical_exam_findings && Object.keys(visit.transcripts.segments.structured.physical_exam_findings).length > 0 && (
                        <div>
                          <strong>Physical Exam Findings:</strong>
                          <pre style={{ margin: "4px 0 0 0", padding: 8, background: "#fff", borderRadius: 4, fontSize: 14, overflow: "auto" }}>
                            {JSON.stringify(visit.transcripts.segments.structured.physical_exam_findings, null, 2)}
                          </pre>
                        </div>
                      )}

                      {visit.transcripts.segments.structured.diagnosis && (
                        <div>
                          <strong>Diagnosis:</strong>
                          <p style={{ margin: "4px 0 0 0" }}>
                            {Array.isArray(visit.transcripts.segments.structured.diagnosis)
                              ? visit.transcripts.segments.structured.diagnosis.join(", ")
                              : visit.transcripts.segments.structured.diagnosis}
                          </p>
                        </div>
                      )}

                      {visit.transcripts.segments.structured.treatment_plan?.length > 0 && (
                        <div>
                          <strong>Treatment Plan:</strong>
                          <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                            {visit.transcripts.segments.structured.treatment_plan.map((item: string, idx: number) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {visit.transcripts.segments.structured.prescriptions?.length > 0 && (
                        <div>
                          <strong>Prescriptions:</strong>
                          <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                            {visit.transcripts.segments.structured.prescriptions.map((prescription: any, idx: number) => (
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
                )}

                {/* Full Transcript */}
                <details className="stack" style={{ background: "#f9fafb", padding: 16, borderRadius: 8 }}>
                  <summary style={{ cursor: "pointer", fontWeight: "600", marginBottom: 8 }}>
                    Full Transcript
                  </summary>
                  <p style={{ margin: "12px 0 0 0", lineHeight: "1.6", whiteSpace: "pre-wrap", color: "#475569" }}>
                    {visit.transcripts.raw_text}
                  </p>
                </details>
              </div>
            ) : (
              <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8, color: "#475569" }}>
                Transcript will appear here after processing the audio...
              </div>
            )}
            <button
              className="button success"
              onClick={async () => {
                setSaving(true);
                try {
                  await updateVisit(params.id, { status: "finalized" });
                  router.push(patient ? `/patients/${patient.id}` : "/dashboard");
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Approve and save visit"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}

