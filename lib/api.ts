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

export async function signup(payload: { email: string; password: string; role: 'doctor' | 'nurse' | string; name?: string; specialty?: string; department?: string; }) {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
  });

  if (error) throw new Error(error.message);

  // Try to sign in user immediately to get session (if automatic sign-in is enabled)
  const { data: sessionData } = await supabase.auth.getSession();
  let token = sessionData?.session?.access_token || null;

  // If no token, attempt sign-in with password (some Supabase setups require confirmation)
  if (!token) {
    const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    }).catch(() => ({ data: null, error: new Error('Sign in after sign up failed') }));

    if (signInError) {
      // We won't throw here because the user may need to confirm email; return and let client handle next steps
      return { success: true, message: 'Signup successful; check your email to confirm and then sign in.' };
    }

    token = signInData?.session?.access_token || null;
  }

  if (token) {
    // Update auth user metadata to include role and basic profile
    try {
      await supabase.auth.updateUser({ data: { role: payload.role, full_name: payload.name, specialty: payload.specialty, department: payload.department } });
    } catch (err) {
      // Non-fatal - continue
      console.warn('Failed to update auth user metadata:', err);
    }

    // Create user row by calling server endpoint using the token
    const resp = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: payload.role, name: payload.name, specialty: payload.specialty, department: payload.department }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(err || 'Failed to create user profile');
    }

    const { user } = await resp.json();

    return { success: true, user };
  }

  return { success: true, message: 'Signup successful; please verify your email.' };
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

// Get all note entries for a visit (append-only system)
export async function getVisitNotes(visitId: string) {
  const res = await authFetch(`/api/visits/${visitId}/note`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    visit_id: string;
    status: "draft" | "signed" | "pending";
    entries: Array<{
      id: string;
      timestamp: string;
      content: string;
      section: "subjective" | "objective" | "assessment" | "plan";
      source: "manual" | "dictation";
      author_id: string;
    }>;
  }>;
}

// Append a new note entry (append-only system)
export async function appendVisitNote(
  visitId: string,
  content: string,
  section: "subjective" | "objective" | "assessment" | "plan",
  source: "manual" | "dictation" = "manual"
) {
  const res = await authFetch(`/api/visits/${visitId}/note`, {
    method: "POST",
    body: JSON.stringify({ content, section, source }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    entry: {
      id: string;
      timestamp: string;
      content: string;
      section: string;
      source: string;
      author_id: string;
    };
    totalEntries: number;
  }>;
}

// Update note status (e.g., sign note)
export async function updateVisitNoteStatus(
  visitId: string,
  status: "draft" | "signed" | "pending"
) {
  const res = await authFetch(`/api/visits/${visitId}/note`, {
    method: "PUT",
    body: JSON.stringify({ status }),
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

export async function getAllergies(patientId: string) {
  const res = await authFetch(`/api/patients/${patientId}/allergies`);
  if (!res.ok) throw new Error("Failed to load allergies");
  return res.json() as Promise<
    Array<{
      id: string;
      name: string;
      severity: string;
      type?: string;
      reactions?: string;
      status?: string;
      date?: string;
      notes?: string;
      created_at?: string;
    }>
  >;
}

export async function createAllergy(
  patientId: string,
  payload: {
    name: string;
    severity: string;
    type?: string;
    reactions?: string[];
    date?: string;
    notes?: string;
    status?: string;
  }
) {
  const res = await authFetch(`/api/patients/${patientId}/allergies`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = "Failed to create allergy";
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export async function getCurrentUser() {
  const res = await authFetch('/api/users');
  if (!res.ok) {
    return null;
  }
  const data = await res.json();
  return data.user;
}

// Dictate audio to text (transcription only, no parsing)
export async function dictateAudio(audioPath: string) {
  const res = await authFetch("/api/transcribe/dictate", {
    method: "POST",
    body: JSON.stringify({ path: audioPath }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to transcribe audio");
  }
  return res.json() as Promise<{ transcript: string }>;
}

// Default medical prompt for parsing transcripts
// This is used when no custom prompt is provided to transcribeVisitAudio
const DEFAULT_MEDICAL_PROMPT = `You are a medical transcription assistant. Parse the following medical consultation transcript into structured JSON format and create a summary.

Extract the following information:
1. past_medical_history: Array of past medical conditions, surgeries, and relevant medical history
2. current_symptoms: Object or array describing current symptoms, including onset, duration, severity, and characteristics
3. physical_exam_findings: Object describing physical examination findings. CRITICAL: Vital signs MUST be nested in a "vital_signs" object with these exact keys:
   - "blood_pressure" (string, format: "120/80" - extract ONLY the numbers, e.g., "120/80" not "120 over 80")
   - "heart_rate" or "hr" (string, extract ONLY the number, e.g., "72" not "72 bpm")
   - "temperature" or "temp" (string, extract ONLY the number in Fahrenheit, e.g., "98.6" not "98.6 degrees Fahrenheit")
   - "weight" (string, extract ONLY the number in pounds, e.g., "165" not "165 pounds")
   Example structure: { "vital_signs": { "blood_pressure": "120/80", "heart_rate": "72", "temperature": "98.6", "weight": "165" }, "general_appearance": "...", "other_findings": "..." }
   All other physical exam findings (excluding vitals) should be in separate keys at the same level as "vital_signs".
   DO NOT put vital signs at the top level of physical_exam_findings. They MUST be inside the "vital_signs" nested object.
4. diagnosis: String or array with the diagnosis or working diagnosis
5. treatment_plan: Array of treatment recommendations, procedures, and follow-up plans
6. prescriptions: Array of prescribed medications with dosage, frequency, and duration if mentioned
7. summary: A concise, readable summary (2-3 paragraphs) of the entire medical consultation session written in continuous prose. The summary should include the chief complaint and current symptoms, key findings from physical examination, diagnosis, and treatment plan with any prescriptions. Keep it professional and easy to read for medical review. Write in continuous text format without bullet points.

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no additional text):
{
  "past_medical_history": [],
  "current_symptoms": [{ "symptom": "string", "characteristics": "mild | moderate | severe | unspecified" }],
  "physical_exam_findings": {
    "vital_signs": {
      "blood_pressure": "",
      "heart_rate": "",
      "temperature": "",
      "weight": ""
    },
    "general_appearance": "",
    "other_findings": ""
  },
  "diagnosis": "",
  "treatment_plan": [],
  "prescriptions": [],
  "summary": ""
}

CRITICAL RULES FOR VITAL SIGNS:
- Vital signs MUST be in the "vital_signs" nested object, NOT at the top level of physical_exam_findings
- Extract ONLY numeric values for vitals (remove units and descriptive text):
  * Blood pressure: "120/80" (not "120 over 80" or "120/80 mmHg")
  * Heart rate: "72" (not "72 bpm" or "72 beats per minute")
  * Temperature: "98.6" (not "98.6 degrees Fahrenheit" or "98.6°F")
  * Weight: "165" (not "165 pounds" or "165 lbs")
- If any field is not mentioned in the transcript, use an empty array [], empty object {}, or empty string "" as appropriate

Transcript:
`;

/**
 * Transcribe audio and parse it into structured medical data.
 *
 * @param audioPath - Path to the audio file in storage
 * @param visitId - Optional visit ID for tracking
 * @param prompt - Optional custom prompt for parsing. If not provided, uses DEFAULT_MEDICAL_PROMPT
 * @returns Object containing transcript, structured data, and summary
 */
export async function transcribeVisitAudio(
  audioPath: string,
  visitId?: string,
  prompt?: string
) {
  // Step 1: Transcribe audio using the dictate endpoint
  const dictateRes = await authFetch("/api/transcribe/dictate", {
    method: "POST",
    body: JSON.stringify({ path: audioPath }),
  });

  if (!dictateRes.ok) {
    const errorText = await dictateRes.text();
    throw new Error(errorText || "Failed to transcribe audio");
  }

  const { transcript } = await dictateRes.json();

  if (!transcript) {
    throw new Error("Transcription returned empty result");
  }

  // Step 2: Parse transcript using the parse endpoint
  // Use custom prompt if provided, otherwise use default medical prompt
  const parseRes = await authFetch("/api/transcribe/parse", {
    method: "POST",
    body: JSON.stringify({
      transcript,
      prompt: prompt || DEFAULT_MEDICAL_PROMPT,
    }),
  });

  if (!parseRes.ok) {
    const errorText = await parseRes.text();
    throw new Error(errorText || "Failed to parse transcript");
  }

  const { structured, summary } = await parseRes.json();

  // Return combined result in the same format as before
  return {
    transcript,
    structured,
    summary,
  } as {
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
  };
}
