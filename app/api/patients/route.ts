import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = supabaseServer();

  // Get patients owned by the clinician
  const { data: ownedPatients, error: ownedError } = await supabase
    .from("patients")
    .select("*")
    .eq("clinician_id", userId)
    .order("created_at", { ascending: false });

  if (ownedError) {
    return NextResponse.json({ error: ownedError.message }, { status: 400 });
  }

  // Get shared patients
  const { data: sharedPatients, error: sharedError } = await supabase
    .from("patient_shares")
    .select("patients(*)")
    .eq("shared_user_id", userId);

  if (sharedError) {
    return NextResponse.json({ error: sharedError.message }, { status: 400 });
  }

  // Combine owned and shared patients, marking shared ones
  const owned = (ownedPatients || []).map((p: any) => ({
    ...p,
    is_shared: false,
  }));
  const shared = (sharedPatients || [])
    .map((s: any) => s.patients)
    .filter(Boolean)
    .map((p: any) => ({ ...p, is_shared: true }));

  // Remove duplicates (in case a patient is both owned and shared)
  const allPatients = [...owned, ...shared];
  const uniquePatients = Array.from(
    new Map(allPatients.map((p) => [p.id, p])).values()
  );

  return NextResponse.json(uniquePatients);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, error } = await requireUser(request);
    if (!userId) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const { name, email, dob, phone, full_name } = await request.json();

    const supabase = supabaseServer();

    const { data, error: dbError } = await supabase
      .from("patients")
      .insert({
        full_name: full_name || name,
        email,
        dob,
        phone,
        clinician_id: userId,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, patient: data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create patient" },
      { status: 500 }
    );
  }
}
