import { supabaseBrowser } from "./supabaseBrowser";
import type { Patient, Visit } from "./types";
import {
  queueMutation,
  syncQueue,
  removeQueuedItemByMatch,
} from "./offlineQueue";

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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);

  // If we have a session token, set server-side HttpOnly cookie for SSR authentication
  const token = data?.session?.access_token || null;
  if (token) {
    await fetch("/api/auth/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  }

  return { data, error };
}

export async function signup(payload: {
  email: string;
  password: string;
  role: "doctor" | "nurse" | string;
  name?: string;
  specialty?: string;
  department?: string;
}) {
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
    const { error: signInError, data: signInData } = await supabase.auth
      .signInWithPassword({
        email: payload.email,
        password: payload.password,
      })
      .catch(() => ({
        data: null,
        error: new Error("Sign in after sign up failed"),
      }));

    if (signInError) {
      // We won't throw here because the user may need to confirm email; return and let client handle next steps
      return {
        success: true,
        message:
          "Signup successful; check your email to confirm and then sign in.",
      };
    }

    token = signInData?.session?.access_token || null;
  }

  if (token) {
    // Update auth user metadata to include role and basic profile
    try {
      await supabase.auth.updateUser({
        data: {
          role: payload.role,
          full_name: payload.name,
          specialty: payload.specialty,
          department: payload.department,
        },
      });
    } catch (err) {
      // Non-fatal - continue
      console.warn("Failed to update auth user metadata:", err);
    }

    // Set server-side session cookie for SSR
    await fetch("/api/auth/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    // Create user row by calling server endpoint (cookie will be used for auth)
    const resp = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: payload.role,
        name: payload.name,
        specialty: payload.specialty,
        department: payload.department,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(err || "Failed to create user profile");
    }

    const { user } = await resp.json();

    return { success: true, user };
  }

  return {
    success: true,
    message: "Signup successful; please verify your email.",
  };
}

export async function getPatients(): Promise<Patient[]> {
  const res = await authFetch("/api/patients");
  if (!res.ok) throw new Error("Failed to load patients");
  return res.json();
}

export async function checkDuplicatePatient(
  email: string | null,
  phone: string | null
): Promise<{ isDuplicate: boolean; patients: any[] }> {
  const res = await authFetch("/api/patients/check-duplicate", {
    method: "POST",
    body: JSON.stringify({ email, phone }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createPatient(payload: Partial<Patient>) {
  // Queue the mutation first
  await queueMutation({
    type: "insert",
    endpoint: "/api/patients",
    method: "POST",
    payload,
  });

  // Try to execute immediately
  try {
    const res = await authFetch("/api/patients", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();

    // If successful, remove this specific item from queue
    await removeQueuedItemByMatch("/api/patients", "POST", payload);

    return result;
  } catch (error: any) {
    // If network error, the item is already queued and will sync later
    if (
      error.message?.includes("fetch") ||
      error.message?.includes("network")
    ) {
      // Return a temporary response for offline mode
      return {
        ...payload,
        _queued: true,
      } as any;
    }
    // For other errors, rethrow
    throw error;
  }
}

export async function getPatient(id: string): Promise<{
  patient: Patient;
  visits: Visit[];
}> {
  const res = await authFetch(`/api/patients/${id}`);
  if (!res.ok) throw new Error("Failed to load patient");
  return res.json();
}

export async function getAllVisits(): Promise<{ visits: Visit[] }> {
  const res = await authFetch("/api/visits");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createVisit(payload: Partial<Visit>) {
  // Generate a temp ID for the visit
  const tempId = `temp_visit_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  // Queue the mutation first with temp ID in metadata
  await queueMutation({
    type: "insert",
    endpoint: "/api/visits",
    method: "POST",
    payload: {
      ...payload,
      _tempId: tempId, // Store temp ID in payload for tracking
    },
  });

  // Try to execute immediately
  try {
    const res = await authFetch("/api/visits", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();

    // If successful, remove this specific item from queue IMMEDIATELY
    // This is critical to prevent duplicate creation during sync
    // Try multiple approaches to ensure removal
    let removed = false;
    try {
      await removeQueuedItemByMatch("/api/visits", "POST", {
        ...payload,
        _tempId: tempId,
      });
      removed = true;
      console.log(`Successfully removed queued visit with tempId: ${tempId}`);
    } catch (removeError) {
      console.warn("Failed to remove queued item by match:", removeError);
    }

    // Fallback: try to find and remove by tempId directly if first attempt failed
    if (!removed) {
      try {
        const { db } = await import("./offlineQueue");
        const items = await db.queue
          .where("endpoint")
          .equals("/api/visits")
          .toArray();
        for (const item of items) {
          if (item.method === "POST" && item.payload?._tempId === tempId) {
            await db.queue.delete(item.id!);
            console.log(`Removed queued visit by tempId (fallback): ${tempId}`);
            removed = true;
            break;
          }
        }
      } catch (fallbackError) {
        console.error("Fallback removal also failed:", fallbackError);
      }
    }

    // Store the ID mapping immediately so sync can detect it
    if (result.id) {
      try {
        const { storeIdMapping } = await import("./offlineQueue");
        await storeIdMapping(tempId, result.id, "visit");
        console.log(`Stored ID mapping immediately: ${tempId} -> ${result.id}`);
      } catch (mappingError) {
        console.warn("Failed to store ID mapping:", mappingError);
      }
    }

    return result;
  } catch (error: any) {
    // If network error, the item is already queued
    if (
      error.message?.includes("fetch") ||
      error.message?.includes("network")
    ) {
      return {
        id: tempId,
        ...payload,
        _queued: true,
      } as any;
    }
    throw error;
  }
}

export async function getVisit(
  id: string
): Promise<{ visit: Visit; patient: Patient | null }> {
  const res = await authFetch(`/api/visits/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateVisit(id: string, payload: Partial<Visit>) {
  // Queue the mutation first
  await queueMutation({
    type: "update",
    endpoint: `/api/visits/${id}`,
    method: "PUT",
    payload,
  });

  // Try to execute immediately
  try {
    const res = await authFetch(`/api/visits/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();

    // If successful, remove this specific item from queue
    await removeQueuedItemByMatch(`/api/visits/${id}`, "PUT", payload);

    return result;
  } catch (error: any) {
    // If network error, the item is already queued
    if (
      error.message?.includes("fetch") ||
      error.message?.includes("network")
    ) {
      return { id, ...payload, _queued: true } as any;
    }
    throw error;
  }
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
  // Queue the mutation first
  await queueMutation({
    type: "update",
    endpoint: `/api/visits/${visitId}/note`,
    method: "PUT",
    payload: { note, status },
  });

  // Try to execute immediately
  try {
    const res = await authFetch(`/api/visits/${visitId}/note`, {
      method: "PUT",
      body: JSON.stringify({ note, status }),
    });
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();

    // If successful, remove this specific item from queue
    await removeQueuedItemByMatch(`/api/visits/${visitId}/note`, "PUT", {
      note,
      status,
    });

    return result;
  } catch (error: any) {
    // If network error, the item is already queued
    if (
      error.message?.includes("fetch") ||
      error.message?.includes("network")
    ) {
      return { visitId, note, status, _queued: true } as any;
    }
    throw error;
  }
}

// Append a note entry to a visit note (append-only system)
export async function appendVisitNote(
  visitId: string,
  content: string,
  section: "subjective" | "objective" | "assessment" | "plan",
  source: "manual" | "dictation" = "manual"
) {
  // Queue the mutation first
  await queueMutation({
    type: "insert",
    endpoint: `/api/visits/${visitId}/note`,
    method: "POST",
    payload: { content, section, source },
  });

  // Try to execute immediately
  try {
    const res = await authFetch(`/api/visits/${visitId}/note`, {
      method: "POST",
      body: JSON.stringify({ content, section, source }),
    });
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();

    // If successful, remove this specific item from queue
    await removeQueuedItemByMatch(`/api/visits/${visitId}/note`, "POST", {
      content,
      section,
      source,
    });

    return result;
  } catch (error: any) {
    // If network error, the item is already queued
    if (
      error.message?.includes("fetch") ||
      error.message?.includes("network")
    ) {
      return { visitId, content, section, source, _queued: true } as any;
    }
    throw error;
  }
}

// Update note status (e.g., sign note)
export async function updateVisitNoteStatus(
  visitId: string,
  status: "draft" | "signed" | "pending"
) {
  // Queue the mutation first
  await queueMutation({
    type: "update",
    endpoint: `/api/visits/${visitId}/note`,
    method: "PUT",
    payload: { status },
  });

  // Try to execute immediately
  try {
    const res = await authFetch(`/api/visits/${visitId}/note`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();

    // If successful, remove this specific item from queue
    await removeQueuedItemByMatch(`/api/visits/${visitId}/note`, "PUT", {
      status,
    });

    return result;
  } catch (error: any) {
    // If network error, the item is already queued
    if (
      error.message?.includes("fetch") ||
      error.message?.includes("network")
    ) {
      return { visitId, status, _queued: true } as any;
    }
    throw error;
  }
}

export async function sharePatient(patientId: string, email: string) {
  // Queue the mutation first
  await queueMutation({
    type: "insert",
    endpoint: `/api/patients/${patientId}/share`,
    method: "POST",
    payload: { email },
  });

  // Try to execute immediately
  try {
    const res = await authFetch(`/api/patients/${patientId}/share`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();

    // If successful, remove this specific item from queue
    await removeQueuedItemByMatch(`/api/patients/${patientId}/share`, "POST", {
      email,
    });

    return result;
  } catch (error: any) {
    // If network error, the item is already queued
    if (
      error.message?.includes("fetch") ||
      error.message?.includes("network")
    ) {
      return { patientId, email, _queued: true } as any;
    }
    throw error;
  }
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

export async function transcribeAudio(audioPath: string, visitId?: string) {
  // Queue the transcription request first
  await queueMutation({
    type: "insert",
    endpoint: "/api/transcribe",
    method: "POST",
    payload: {
      path: audioPath,
      visit_id: visitId,
    },
  });

  // Try to execute immediately
  try {
    const res = await authFetch("/api/transcribe", {
      method: "POST",
      body: JSON.stringify({ path: audioPath, visit_id: visitId }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to transcribe audio");
    }
    const result = await res.json();

    // If successful, remove from queue
    await removeQueuedItemByMatch("/api/transcribe", "POST", {
      path: audioPath,
      visit_id: visitId,
    });

    return result as {
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
  } catch (error: any) {
    // If network error, the item is already queued and will sync later
    if (
      error.message?.includes("fetch") ||
      error.message?.includes("network")
    ) {
      // Return a placeholder response for offline mode
      // The actual transcription will happen during sync
      console.log("Transcription queued for later sync");
      return {
        transcript: "",
        structured: {
          past_medical_history: [],
          current_symptoms: [],
          physical_exam_findings: {},
          diagnosis: [],
          treatment_plan: [],
          prescriptions: [],
        },
        summary: "Transcription will be processed when online.",
        _queued: true,
      } as any;
    }
    throw error;
  }
}

export async function deleteAllergy(patientId: string, allergyId: string) {
  const res = await authFetch(
    `/api/patients/${patientId}/allergies?allergyId=${allergyId}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = "Failed to delete allergy";
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

export async function getVaccines(patientId: string) {
  const res = await authFetch(`/api/patients/${patientId}/vaccines`);
  if (!res.ok) throw new Error("Failed to load vaccines");
  return res.json() as Promise<
    Array<{
      id: string;
      name: string;
      date?: string;
      dose?: string;
      site?: string;
      route?: string;
      lotNumber?: string;
      manufacturer?: string;
      created_at?: string;
    }>
  >;
}

export async function createVaccine(
  patientId: string,
  payload: {
    name: string;
    date: string;
    dose?: string;
    site?: string;
    route?: string;
    lotNumber?: string;
    manufacturer?: string;
  }
) {
  const res = await authFetch(`/api/patients/${patientId}/vaccines`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = "Failed to create vaccine";
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

export async function deleteVaccine(patientId: string, vaccineId: string) {
  const res = await authFetch(
    `/api/patients/${patientId}/vaccines?vaccineId=${vaccineId}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = "Failed to delete vaccine";
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

export async function getFamilyHistory(patientId: string) {
  const res = await authFetch(`/api/patients/${patientId}/family-history`);
  if (!res.ok) throw new Error("Failed to load family history");
  return res.json() as Promise<
    Array<{
      id: string;
      relationship: string;
      status?: string;
      conditions?: string[] | string;
      notes?: string;
      age?: number | string;
      unsure?: boolean;
      created_at?: string;
    }>
  >;
}

export async function createFamilyMember(
  patientId: string,
  payload: {
    relationship: string;
    status?: string;
    conditions?: string[] | string;
    notes?: string;
    age?: number | string;
    unsure?: boolean;
  }
) {
  const res = await authFetch(`/api/patients/${patientId}/family-history`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = "Failed to create family member";
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

export async function updateFamilyMember(
  patientId: string,
  memberId: string,
  payload: {
    relationship: string;
    status?: string;
    conditions?: string[] | string;
    notes?: string;
    age?: number | string;
    unsure?: boolean;
  }
) {
  const res = await authFetch(`/api/patients/${patientId}/family-history`, {
    method: "PUT",
    body: JSON.stringify({ memberId, ...payload }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = "Failed to update family member";
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

export async function deleteFamilyMember(patientId: string, memberId: string) {
  const res = await authFetch(
    `/api/patients/${patientId}/family-history?memberId=${memberId}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = "Failed to delete family member";
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

export async function getPastMedicalHistory(patientId: string) {
  const res = await authFetch(
    `/api/patients/${patientId}/past-medical-history`
  );
  if (!res.ok) throw new Error("Failed to load past medical history");
  return res.json() as Promise<
    Array<{
      id: string;
      condition: string;
      code?: string;
      category?: string;
      status: string;
      date?: string;
      impact?: string;
      source?: string;
      icon?: string;
      iconBg?: string;
      description?: string;
      relevance?: string;
      treatment?: string[];
      complications?: string;
      careGaps?: Array<{ label: string; icon: string }>;
      created_at?: string;
      updated_at?: string;
    }>
  >;
}

export async function createMedicalCondition(
  patientId: string,
  payload: {
    condition: string;
    code?: string;
    category?: string;
    status: string;
    date?: string;
    impact?: string;
    source?: string;
    description?: string;
    relevance?: string;
    treatment?: string[];
    complications?: string;
    careGaps?: Array<{ label: string; icon: string }>;
  }
) {
  const res = await authFetch(
    `/api/patients/${patientId}/past-medical-history`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = "Failed to create medical condition";
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

export async function updateMedicalCondition(
  patientId: string,
  conditionId: string,
  payload: Partial<{
    condition: string;
    code?: string;
    category?: string;
    status: string;
    date?: string;
    impact?: string;
    source?: string;
    description?: string;
    relevance?: string;
    treatment?: string[];
    complications?: string;
    careGaps?: Array<{ label: string; icon: string }>;
  }>
) {
  const res = await authFetch(
    `/api/patients/${patientId}/past-medical-history`,
    {
      method: "PUT",
      body: JSON.stringify({ conditionId, ...payload }),
    }
  );
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = "Failed to update medical condition";
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

export async function deleteMedicalCondition(
  patientId: string,
  conditionId: string
) {
  const res = await authFetch(
    `/api/patients/${patientId}/past-medical-history?conditionId=${conditionId}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = "Failed to delete medical condition";
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

export async function getVitals(patientId: string) {
  const res = await authFetch(`/api/patients/${patientId}/vitals`);
  if (!res.ok) throw new Error("Failed to load vitals");
  return res.json() as Promise<
    Array<{
      visit_id: string;
      recordedAt: string;
      bp: string | null;
      hr: number | null;
      temp: number | null;
      weight: number | null;
    }>
  >;
}

export async function getCurrentUser() {
  try {
    const res = await fetch("/api/users/me", {
      credentials: "include",
      cache: "no-store", // Ensure fresh data on each request
    });
    if (!res.ok) {
      // If 401, user is not authenticated - return null
      if (res.status === 401) {
        return null;
      }
      // For other errors, also return null
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch (error) {
    console.error("[getCurrentUser] Error fetching user:", error);
    return null;
  }
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

// Log an audit event for a visit
export async function logAuditEvent(
  visitId: string,
  action: string,
  entityType: string,
  changes?: any,
  notes?: string
) {
  try {
    const res = await authFetch(`/api/visits/${visitId}/audit`, {
      method: "POST",
      body: JSON.stringify({
        action,
        entity_type: entityType,
        entity_id: visitId,
        changes,
        notes,
      }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      // Don't throw on audit errors - they're non-critical
      console.warn("Failed to log audit event:", errorText);
      return null;
    }
    return res.json();
  } catch (error: any) {
    // Don't throw on audit errors - they're non-critical
    console.warn("Error logging audit event:", error);
    return null;
  }
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

IMPORTANT - Unit Assumptions and Conversions:
- Blood Pressure (BP): Assume mmHg if unit not specified. If given in other units, convert to mmHg (e.g., kPa to mmHg: multiply by 7.5).
- Heart Rate (HR): Assume bpm (beats per minute) if unit not specified. If given in other units, convert to bpm.
- Temperature: Assume °F (Fahrenheit) if unit not specified. If given in °C (Celsius), convert to °F: (°C × 9/5) + 32.
- Weight: Assume lbs (pounds) if unit not specified. If given in kg (kilograms), convert to lbs: kg × 2.20462. If given in other units, convert appropriately.

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
  * Blood pressure: "120/80" (not "120 over 80" or "120/80 mmHg") - assume mmHg if unit not specified
  * Heart rate: "72" (not "72 bpm" or "72 beats per minute") - assume bpm if unit not specified
  * Temperature: "98.6" (not "98.6 degrees Fahrenheit" or "98.6°F") - assume °F if unit not specified, convert from °C if needed
  * Weight: "165" (not "165 pounds" or "165 lbs") - assume lbs if unit not specified, convert from kg if needed
- Apply unit assumptions and conversions as specified above
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
