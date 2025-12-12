"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getPatient, sharePatient } from "../../../lib/api";
import type { Patient, Visit } from "../../../lib/types";
import { useAuthGuard } from "../../../lib/useAuthGuard";

export default function PatientDetailPage() {
  const { ready } = useAuthGuard();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const data = await getPatient(params.id);
        setPatient(data.patient);
        setVisits(data.visits);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, ready]);

  if (loading) {
    return (
      <main className="shell">
        <div>Loading patient...</div>
      </main>
    );
  }

  if (error || !patient) {
    return (
      <main className="shell">
        <div className="pill" style={{ background: "#fef2f2", color: "#b91c1c" }}>
          {error ?? "Patient not found"}
        </div>
      </main>
    );
  }

  return (
    <main className="shell stack fade-in">
      <div className="card stack">
        <div className="pill">Patient</div>
        <h1 style={{ margin: 0 }}>{patient.full_name}</h1>
        <div style={{ color: "#475569", display: "flex", flexWrap: "wrap", gap: 12 }}>
          <span>Sex: {patient.sex_at_birth || "—"}</span>
          <span>Contact: {patient.phone || "—"}</span>
        </div>
        <div className="nav">
          <Link className="button" href={`/visits/new?patientId=${patient.id}`}>
            Start visit
          </Link>
          <Link className="button secondary" href="/dashboard">
            Back to dashboard
          </Link>
        </div>
        <div className="card stack" style={{ padding: 12 }}>
          <div className="label">Share access (enter clinician email)</div>
          <div className="grid two">
            <input
              className="input"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="clinician@example.com"
            />
            <button
              className="button secondary"
              disabled={!shareEmail || sharing}
              onClick={async () => {
                setSharing(true);
                setError(null);
                try {
                  await sharePatient(params.id, shareEmail);
                  setShareEmail("");
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  setSharing(false);
                }
              }}
            >
              {sharing ? "Sharing..." : "Share record"}
            </button>
          </div>
        </div>
      </div>

      <div className="card stack">
        <div className="header" style={{ padding: 0 }}>
          <div>
            <div className="pill">Visits</div>
            <h2 style={{ margin: "4px 0 0" }}>Visit history</h2>
          </div>
        </div>
        {visits.length === 0 && (
          <div style={{ color: "#475569", padding: "24px 0", textAlign: "center" }}>
            No visits yet. Start a visit to begin recording.
          </div>
        )}
        {visits.length > 0 && (
          <div className="stack">
            {visits.map((visit, idx) => {
              const visitDate = visit.created_at ? new Date(visit.created_at) : null;
              // Prefer transcript summary, fallback to notes
              const transcriptSummary = visit.transcripts?.segments?.summary;
              const noteData = Array.isArray(visit.notes) 
                ? visit.notes[0]?.note 
                : visit.notes?.note;
              const summary = transcriptSummary || noteData?.summary || noteData?.text?.substring(0, 100) || "No notes yet";
              
              return (
                <Link
                  key={visit.id}
                  href={`/visits/${visit.id}`}
                  className="card-link"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="card stack slide-in" style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {visitDate?.toLocaleDateString()} {visitDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ color: "#475569", fontSize: 14, marginBottom: 8 }}>
                          {summary}...
                        </div>
                      </div>
                      <span className="pill" style={{ 
                        background: visit.status === "finalized" ? "#d1fae5" : visit.status === "pending_review" ? "#fef3c7" : "#e0f2fe",
                        color: visit.status === "finalized" ? "#065f46" : visit.status === "pending_review" ? "#92400e" : "#0369a1"
                      }}>
                        {visit.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#475569", display: "flex", gap: 8 }}>
                      {visit.audio_url && <span>✓ Audio recorded</span>}
                      {visit.transcripts && <span>✓ Transcribed</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

