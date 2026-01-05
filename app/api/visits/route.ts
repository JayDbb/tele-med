import { NextRequest, NextResponse } from "next/server";
import { requireUser, getUserRole } from "../../../lib/auth";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = supabaseServer();
  const userRole = await getUserRole(userId);

  let query = supabase
    .from("visits")
    .select("*, patients(full_name, email, dob, id)")
    .order("created_at", { ascending: false });

  // Nurses can see all visits
  // Doctors can only see visits where they are the clinician
  if (userRole === "doctor") {
    query = query.eq("clinician_id", userId);
  }
  // For other roles (patients, etc.), they would need patient_id matching
  // For now, we'll just return visits for doctors and nurses

  const { data: visits, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  return NextResponse.json({ visits: visits || [] });
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = supabaseServer();
  const userRole = await getUserRole(userId);

  // Only enforce single open visit rule for doctors
  if (userRole === "doctor") {
    // Check if doctor has any open visits (status 'draft' or 'in-progress')
    const { data: openVisits, error: checkError } = await supabase
      .from("visits")
      .select("id")
      .eq("clinician_id", userId)
      .in("status", ["draft", "in-progress"])
      .limit(1);

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 400 });
    }

    if (openVisits && openVisits.length > 0) {
      return NextResponse.json(
        { error: "You must close or finalize your current visit before starting a new one" },
        { status: 400 }
      );
    }
  }

  const payload = await req.json();

  // Verify patient access before inserting visit
  if (payload.patient_id) {
    // First check if patient exists at all
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, clinician_id")
      .eq("id", payload.patient_id)
      .maybeSingle();

    if (patientError) {
      console.error("Error checking patient:", patientError);
      return NextResponse.json(
        { error: `Failed to verify patient access: ${patientError.message}` },
        { status: 500 }
      );
    }

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Check if user owns the patient
    const isOwner = patient.clinician_id === userId;

    // If patient has no clinician_id (legacy patient), allow authenticated users to create visits
    // This handles cases where patients were created before proper ownership was set
    if (!patient.clinician_id) {
      // Allow visit creation for authenticated users if patient has no owner
      // This is a fallback for legacy data
      console.warn(
        `Patient ${payload.patient_id} has no clinician_id - allowing visit creation for authenticated user ${userId}`
      );
    } else if (!isOwner) {
      // If not owned, check if it's shared
      const { data: shareRow, error: shareError } = await supabase
        .from("patient_shares")
        .select("id")
        .eq("patient_id", payload.patient_id)
        .eq("shared_user_id", userId)
        .maybeSingle();

      if (shareError) {
        console.error("Error checking patient share:", shareError);
        return NextResponse.json(
          { error: `Failed to verify patient access: ${shareError.message}` },
          { status: 500 }
        );
      }

      if (!shareRow) {
        return NextResponse.json(
          {
            error:
              "Not authorized to create visit for this patient. You must own the patient or have it shared with you.",
          },
          { status: 403 }
        );
      }
    }
  }
  const { data, error: dbError } = await supabase
    .from("visits")
    .insert({
      ...payload,
      clinician_id: userId,
      status: payload.status ?? "draft",
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  // Update doctor availability to 'busy' when visit is created
  if (userRole === "doctor") {
    await supabase
      .from("users")
      .update({
        availability: "busy",
        availability_updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }

  return NextResponse.json(data);
}
