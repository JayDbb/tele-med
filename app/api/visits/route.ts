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
  const { data, error: dbError } = await supabase
    .from("visits")
    .insert({ ...payload, clinician_id: userId, status: payload.status ?? "draft" })
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

