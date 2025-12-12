"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createPatient } from "../../../lib/api";
import { useAuthGuard } from "../../../lib/useAuthGuard";

export default function NewPatientPage() {
  const { ready } = useAuthGuard();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [sex, setSex] = useState<"M" | "F" | "">("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setLoading(true);
    setError(null);
    try {
      const patient = await createPatient({
        full_name: fullName,
        sex_at_birth: sex || null,
        phone: phone || null
      });
      router.push(`/patients/${patient.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="shell fade-in">
      <div className="card stack">
        <div className="pill">Patient intake</div>
        <h1 style={{ margin: "4px 0 0" }}>Create patient</h1>
        <form className="stack" onSubmit={onSubmit} style={{ maxWidth: 400 }}>
          <label className="stack">
            <span className="label">Full name</span>
            <input
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className="stack">
            <span className="label">Sex</span>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                className={`button ${sex === "M" ? "" : "secondary"}`}
                onClick={() => setSex("M")}
                style={{ flex: 1 }}
              >
                Male (M)
              </button>
              <button
                type="button"
                className={`button ${sex === "F" ? "" : "secondary"}`}
                onClick={() => setSex("F")}
                style={{ flex: 1 }}
              >
                Female (F)
              </button>
            </div>
          </label>
          <label className="stack">
            <span className="label">Contact number</span>
            <input
              className="input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </label>
          {error && (
            <div className="pill" style={{ background: "#fef2f2", color: "#b91c1c" }}>
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: 12 }}>
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Create patient"}
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

