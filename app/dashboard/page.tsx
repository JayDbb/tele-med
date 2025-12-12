"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPatients } from "../../lib/api";
import type { Patient } from "../../lib/types";
import { useAuthGuard } from "../../lib/useAuthGuard";

export default function DashboardPage() {
  const { ready } = useAuthGuard();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const data = await getPatients();
        setPatients(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [ready]);

  const ownedPatients = patients.filter((p) => !p.is_shared);
  const sharedPatients = patients.filter((p) => p.is_shared);

  return (
    <main className="shell stack">
      <div className="card stack">
        <div className="header" style={{ padding: 0 }}>
          <div>
            <div className="pill">Dashboard</div>
            <h1 style={{ margin: "4px 0 0" }}>Clinician overview</h1>
          </div>
          <div className="nav">
            <Link className="button" href="/patients/new">
              + New patient
            </Link>
          </div>
        </div>
        <div className="grid two">
          <div className="card stack" style={{ padding: 16 }}>
            <div className="label">My Patients</div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{ownedPatients.length}</div>
          </div>
          <div className="card stack" style={{ padding: 16 }}>
            <div className="label">Shared with Me</div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{sharedPatients.length}</div>
          </div>
        </div>
      </div>

      {!loading && ownedPatients.length > 0 && (
        <div className="card stack fade-in">
          <div className="header" style={{ padding: 0 }}>
            <div>
              <div className="pill">My Patients</div>
              <h2 style={{ margin: "4px 0 0" }}>Recent patients</h2>
            </div>
          </div>
          <div className="grid two">
            {ownedPatients.map((patient) => (
              <Link key={patient.id} href={`/patients/${patient.id}`} className="card stack card-link">
                <div style={{ fontWeight: 700, fontSize: 16 }}>{patient.full_name}</div>
                <div style={{ color: "#475569" }}>{patient.phone || "No contact"}</div>
                <div className="pill" style={{ alignSelf: "flex-start" }}>
                  Visit history
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!loading && sharedPatients.length > 0 && (
        <div className="card stack fade-in">
          <div className="header" style={{ padding: 0 }}>
            <div>
              <div className="pill" style={{ background: "#fef3c7", color: "#92400e" }}>
                Shared
              </div>
              <h2 style={{ margin: "4px 0 0" }}>Shared with me</h2>
            </div>
          </div>
          <div className="grid two">
            {sharedPatients.map((patient) => (
              <Link key={patient.id} href={`/patients/${patient.id}`} className="card stack card-link">
                <div style={{ fontWeight: 700, fontSize: 16 }}>{patient.full_name}</div>
                <div style={{ color: "#475569" }}>{patient.phone || "No contact"}</div>
                <div className="pill" style={{ alignSelf: "flex-start", background: "#fef3c7", color: "#92400e" }}>
                  Shared record
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="card stack">
          <div>Loading patients...</div>
        </div>
      )}

      {error && (
        <div className="card stack">
          <div className="pill" style={{ background: "#fef2f2", color: "#b91c1c" }}>
            {error}
          </div>
        </div>
      )}

      {!loading && patients.length === 0 && (
        <div className="card stack">
          <div style={{ color: "#475569", textAlign: "center", padding: "24px 0" }}>
            No patients yet. Create your first patient to get started.
          </div>
        </div>
      )}
    </main>
  );
}

