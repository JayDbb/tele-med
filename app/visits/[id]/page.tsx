"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getVisit, updateVisit } from "../../../lib/api";
import { uploadToPrivateBucket } from "../../../lib/storage";
import { useAudioRecorder } from "../../../lib/useAudioRecorder";
import { useAuthGuard } from "../../../lib/useAuthGuard";
import type { Patient, Visit } from "../../../lib/types";
import { Header } from "../../../components/Header";

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
    <div className="bg-[#F3F6FD] min-h-screen">
      <Header />
      <main className="p-4 md:p-8 overflow-y-auto max-w-6xl mx-auto">
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
                  <div style={{ padding: 20, background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600", color: "#111827" }}>Summary</h3>
                    <div style={{ lineHeight: "1.8", color: "#374151", whiteSpace: "pre-wrap" }}>
                      {visit.transcripts.segments.summary.split('\n').map((paragraph: string, idx: number) => {
                        if (!paragraph.trim()) return null;
                        // Check if paragraph starts with a bold section header pattern
                        const isSectionHeader = /^(Chief Complaint|Examination|Treatment Plan|Physical Examination|Diagnosis):/i.test(paragraph);
                        if (isSectionHeader) {
                          const [header, ...content] = paragraph.split(':');
                          return (
                            <div key={idx} style={{ marginBottom: idx > 0 ? "16px" : 0 }}>
                              <strong style={{ color: "#111827", display: "block", marginBottom: "4px" }}>
                                {header}:
                              </strong>
                              <span style={{ display: "block", paddingLeft: "8px" }}>{content.join(':').trim()}</span>
                            </div>
                          );
                        }
                        return (
                          <p key={idx} style={{ margin: idx > 0 ? "12px 0 0 0" : 0 }}>
                            {paragraph}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Structured Data */}
                {visit.transcripts.segments?.structured && (
                  <div className="stack" style={{ gap: "16px" }}>
                    {/* Current Symptoms */}
                    {visit.transcripts.segments.structured.current_symptoms &&
                      (Array.isArray(visit.transcripts.segments.structured.current_symptoms)
                        ? visit.transcripts.segments.structured.current_symptoms.length > 0
                        : Object.keys(visit.transcripts.segments.structured.current_symptoms).length > 0) && (
                        <div style={{ background: "#f9fafb", padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" }}>
                          <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                            Current Symptoms
                          </h3>
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 6 }}>
                              <thead>
                                <tr style={{ background: "#f3f4f6" }}>
                                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#111827", borderBottom: "2px solid #e5e7eb" }}>
                                    Symptom
                                  </th>
                                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#111827", borderBottom: "2px solid #e5e7eb" }}>
                                    Characteristics
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {(Array.isArray(visit.transcripts.segments.structured.current_symptoms)
                                  ? visit.transcripts.segments.structured.current_symptoms
                                  : Object.entries(visit.transcripts.segments.structured.current_symptoms).map(([key, value]) => ({
                                    symptom: key.replace(/_/g, " "),
                                    characteristics: typeof value === "string" ? value : String(value)
                                  }))
                                ).map((symptom: any, idx: number) => (
                                  <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                    <td style={{ padding: "12px", color: "#374151" }}>
                                      {symptom.symptom || "-"}
                                    </td>
                                    <td style={{ padding: "12px", color: "#6b7280" }}>
                                      {symptom.characteristics || "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                    {/* Physical Exam Findings */}
                    {visit.transcripts.segments.structured.physical_exam_findings && Object.keys(visit.transcripts.segments.structured.physical_exam_findings).length > 0 && (
                      <div style={{ background: "#f9fafb", padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" }}>
                        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                          Physical Exam Findings
                        </h3>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 6 }}>
                            <thead>
                              <tr style={{ background: "#f3f4f6" }}>
                                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#111827", borderBottom: "2px solid #e5e7eb" }}>
                                  Category
                                </th>
                                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#111827", borderBottom: "2px solid #e5e7eb" }}>
                                  Finding
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(visit.transcripts.segments.structured.physical_exam_findings).map(([key, value], idx: number) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                  <td style={{ padding: "12px", color: "#374151", textTransform: "capitalize", fontWeight: "500" }}>
                                    {key.replace(/_/g, " ")}
                                  </td>
                                  <td style={{ padding: "12px", color: "#6b7280" }}>
                                    {typeof value === "string" ? value : typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Diagnosis */}
                    {visit.transcripts.segments.structured.diagnosis && (
                      <div style={{ background: "#eff6ff", padding: 16, borderRadius: 8, border: "1px solid #bfdbfe" }}>
                        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#1e40af" }}>
                          Diagnosis
                        </h3>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 6 }}>
                            <thead>
                              <tr style={{ background: "#dbeafe" }}>
                                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#1e40af", borderBottom: "2px solid #bfdbfe" }}>
                                  Diagnosis
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(Array.isArray(visit.transcripts.segments.structured.diagnosis)
                                ? visit.transcripts.segments.structured.diagnosis
                                : [visit.transcripts.segments.structured.diagnosis]
                              ).map((diag: string, idx: number) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #bfdbfe" }}>
                                  <td style={{ padding: "12px", color: "#1e40af", fontWeight: "500" }}>
                                    {diag}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Past Medical History */}
                    {visit.transcripts.segments.structured.past_medical_history?.length > 0 && (
                      <div style={{ background: "#f9fafb", padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" }}>
                        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                          Past Medical History
                        </h3>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 6 }}>
                            <thead>
                              <tr style={{ background: "#f3f4f6" }}>
                                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#111827", borderBottom: "2px solid #e5e7eb" }}>
                                  History Item
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {visit.transcripts.segments.structured.past_medical_history.map((item: string, idx: number) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                  <td style={{ padding: "12px", color: "#374151" }}>
                                    {item}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Treatment Plan */}
                    {visit.transcripts.segments.structured.treatment_plan?.length > 0 && (
                      <div style={{ background: "#f0fdf4", padding: 16, borderRadius: 8, border: "1px solid #bbf7d0" }}>
                        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#166534" }}>
                          Treatment Plan
                        </h3>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 6 }}>
                            <thead>
                              <tr style={{ background: "#dcfce7" }}>
                                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#166534", borderBottom: "2px solid #bbf7d0" }}>
                                  Treatment Item
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {visit.transcripts.segments.structured.treatment_plan.map((item: string, idx: number) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #bbf7d0" }}>
                                  <td style={{ padding: "12px", color: "#166534" }}>
                                    {item}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Prescriptions */}
                    {visit.transcripts.segments.structured.prescriptions?.length > 0 && (
                      <div style={{ background: "#fef3c7", padding: 16, borderRadius: 8, border: "1px solid #fde68a" }}>
                        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#92400e" }}>
                          Prescriptions
                        </h3>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 6 }}>
                            <thead>
                              <tr style={{ background: "#fef9c3" }}>
                                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#92400e", borderBottom: "2px solid #fde68a" }}>
                                  Medication
                                </th>
                                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#92400e", borderBottom: "2px solid #fde68a" }}>
                                  Dosage
                                </th>
                                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#92400e", borderBottom: "2px solid #fde68a" }}>
                                  Frequency
                                </th>
                                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#92400e", borderBottom: "2px solid #fde68a" }}>
                                  Duration
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {visit.transcripts.segments.structured.prescriptions.map((prescription: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #fde68a" }}>
                                  <td style={{ padding: "12px", color: "#92400e", fontWeight: "500" }}>
                                    {prescription.medication || "-"}
                                  </td>
                                  <td style={{ padding: "12px", color: "#78350f" }}>
                                    {prescription.dosage || "-"}
                                  </td>
                                  <td style={{ padding: "12px", color: "#78350f" }}>
                                    {prescription.frequency || "-"}
                                  </td>
                                  <td style={{ padding: "12px", color: "#78350f" }}>
                                    {prescription.duration || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
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
    </div>
  );
}

