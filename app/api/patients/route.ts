import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { supabaseServerWithUser } from "../../../lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  // SECURITY: Use user's JWT token with RLS for defense in depth
  // RLS policies enforce access control at the database level
  try {
    // Get the user's JWT token for RLS-aware operations
    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return NextResponse.json(
        { error: "Missing Authorization header" },
        { status: 401 }
      );
    }

    const token = authorization.replace("Bearer ", "");
    const supabase = supabaseServerWithUser(token);

    // RLS will automatically filter to only patients the user owns or has shared access to
    // No need to manually filter by userId - RLS does it for us
    const { data: patients, error: patientsError } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (patientsError) {
      console.error("Error fetching patients:", patientsError);
      return NextResponse.json(
        { error: patientsError.message },
        { status: 500 }
      );
    }

    // Get shared patient IDs to mark which patients are shared
    const { data: sharedLinks, error: sharedError } = await supabase
      .from("patient_shares")
      .select("patient_id")
      .eq("shared_user_id", userId);

    if (sharedError) {
      console.error("Error fetching shared links:", sharedError);
      // Don't fail the whole request if shared patients fail
    }

    const sharedPatientIds = new Set(
      sharedLinks?.map((link: any) => link.patient_id) || []
    );

    // Mark which patients are shared
    const result = (patients || []).map((p: any) => ({
      ...p,
      is_shared: sharedPatientIds.has(p.id),
    }));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Error in patients GET route:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  // SECURITY: Use user's JWT token with RLS for defense in depth
  // RLS INSERT policy ensures clinician_id = auth.uid()
  const authorization = req.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  const token = authorization.replace("Bearer ", "");
  const supabase = supabaseServerWithUser(token);

  const payload = await req.json();

  // SECURITY: RLS policy will enforce that clinician_id = auth.uid()
  // We still set it explicitly for clarity, but RLS provides defense in depth
  const { data, error: dbError } = await supabase
    .from("patients")
    .insert({
      ...payload,
      clinician_id: userId, // RLS policy also checks this
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
