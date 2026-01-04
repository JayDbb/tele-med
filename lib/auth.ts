import { NextRequest } from "next/server";
import { supabaseServer } from "./supabaseServer";

export async function requireUser(req: NextRequest) {
  // Accept Authorization header OR cookie-set token fallback
  const authorization = req.headers.get("authorization");
  const cookieToken = req.cookies.get('sb-access-token')?.value

  const token = authorization ? authorization.replace("Bearer ", "") : cookieToken
  if (!token) {
    return { userId: null, error: "Missing Authorization header or session cookie" };
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return { userId: null, error: error?.message ?? "Unauthorized" };
  }

  return { userId: data.user.id, error: null };
}

/**
 * Get the user's role from the users table or auth metadata
 * Returns the role ('doctor', 'nurse', etc.) or null if not found
 */
export async function getUserRole(userId: string): Promise<string | null> {
  const supabase = supabaseServer();
  
  // First try to get from users table (preferred source of truth)
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (userData?.role) {
    return userData.role;
  }

  // Fallback to auth user metadata
  const { data: authData } = await supabase.auth.admin.getUserById(userId);
  if (authData?.user?.user_metadata?.role) {
    return authData.user.user_metadata.role;
  }

  return null;
}

/**
 * Verify if a user has access to a patient
 * Nurses have access to all patients, doctors only to owned or shared patients
 * Returns { hasAccess: boolean, patient: any | null }
 */
export async function verifyPatientAccess(
  userId: string,
  patientId: string
): Promise<{ hasAccess: boolean; patient: any | null }> {
  const supabase = supabaseServer();
  const userRole = await getUserRole(userId);

  // Nurses can access any patient
  if (userRole === 'nurse') {
    const { data: patient } = await supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .maybeSingle();

    return { hasAccess: !!patient, patient };
  }

  // Doctors can only access owned or shared patients
  // Check ownership
  const { data: patientOwned } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .eq("clinician_id", userId)
    .maybeSingle();

  if (patientOwned) {
    return { hasAccess: true, patient: patientOwned };
  }

  // Check if shared
  const { data: shareRow } = await supabase
    .from("patient_shares")
    .select("patients(*)")
    .eq("patient_id", patientId)
    .eq("shared_user_id", userId)
    .maybeSingle();

  if (shareRow?.patients) {
    return { hasAccess: true, patient: shareRow.patients };
  }

  return { hasAccess: false, patient: null };
}

