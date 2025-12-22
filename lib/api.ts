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
