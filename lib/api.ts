import { supabaseBrowser } from "./supabaseBrowser";
import type { Patient, Visit } from "./types";

async function getToken() {
  const supabase = supabaseBrowser();
  const session = await supabase.auth.getSession();
  return session.data.session?.access_token;
}

async function authFetch(input: string, init?: RequestInit) {
  const token = await getToken();
  if (!token) throw new Error("You must be logged in.");
  return fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function login(email: string, password: string) {
  const supabase = supabaseBrowser();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signup(email: string, password: string) {
  const supabase = supabaseBrowser();
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw new Error(error.message);
}

export async function getPatients(): Promise<Patient[]> {
  const res = await authFetch("/api/patients");
  if (!res.ok) throw new Error("Failed to load patients");
  return res.json();
}

export async function createPatient(payload: Partial<Patient>) {
  const res = await authFetch("/api/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPatient(id: string): Promise<{
  patient: Patient;
  visits: Visit[];
}> {
  const res = await authFetch(`/api/patients/${id}`);
  if (!res.ok) throw new Error("Failed to load patient");
  return res.json();
}

export async function createVisit(payload: Partial<Visit>) {
  const res = await authFetch("/api/visits", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getVisit(
  id: string
): Promise<{ visit: Visit; patient: Patient | null }> {
  const res = await authFetch(`/api/visits/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateVisit(id: string, payload: Partial<Visit>) {
  const res = await authFetch(`/api/visits/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createSignedUploadUrl(params: {
  filename?: string;
  contentType?: string;
}) {
  const res = await authFetch("/api/upload", {
    method: "POST",
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    path: string;
    signedUrl: string;
    token: string;
    bucket: string;
  }>;
}

export async function upsertVisitNote(
  visitId: string,
  note: any,
  status = "draft"
) {
  const res = await authFetch(`/api/visits/${visitId}/note`, {
    method: "PUT",
    body: JSON.stringify({ note, status }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sharePatient(patientId: string, email: string) {
  const res = await authFetch(`/api/patients/${patientId}/share`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function transcribeAudio(audioPath: string, visitId?: string) {
  const res = await authFetch("/api/transcribe", {
    method: "POST",
    body: JSON.stringify({ path: audioPath, visit_id: visitId }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to transcribe audio");
  }
  return res.json() as Promise<{
    transcript: string;
    structured: {
      past_medical_history: string[];
      current_symptoms: Record<string, any>;
      physical_exam_findings: Record<string, any>;
      diagnosis: string | string[];
      treatment_plan: string[];
      prescriptions: Array<{
        medication?: string;
        dosage?: string;
        frequency?: string;
        duration?: string;
      }>;
    };
    summary: string;
  }>;
}
