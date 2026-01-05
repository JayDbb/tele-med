import { NextRequest, NextResponse } from "next/server";
import { requireUser, getUserRole } from "../../../lib/auth";
import {
  supabaseServer,
  supabaseServerWithUser,
} from "../../../lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    // Get user role to determine access level
    const userRole = await getUserRole(userId);

    // Get the user's JWT token for RLS-aware operations
    const authorization = req.headers.get("authorization");
    const cookieToken = req.cookies.get("sb-access-token")?.value;
    const token = authorization
      ? authorization.replace("Bearer ", "")
      : cookieToken;

    if (!token) {
      return NextResponse.json(
        { error: "Missing Authorization header or session cookie" },
        { status: 401 }
      );
    }

    // Use RLS-aware client for security
    const supabase = supabaseServerWithUser(token);

    let patients: any[] = [];

    // Nurses can see all patients (RLS policy should allow this)
    if (userRole === "nurse") {
      const { data: allPatients, error: allError } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (allError) {
        console.error("Error fetching all patients for nurse:", allError);
        return NextResponse.json({ error: allError.message }, { status: 500 });
      }

      patients = allPatients || [];
    } else {
      // For doctors: RLS will automatically filter to only patients the user owns or has shared access to
      const { data: patientsData, error: patientsError } = await supabase
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

      patients = patientsData || [];
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
    const result = patients.map((p: any) => ({
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

  try {
    // Get the user's JWT token for RLS-aware operations
    const authorization = req.headers.get("authorization");
    const cookieToken = req.cookies.get("sb-access-token")?.value;
    const token = authorization
      ? authorization.replace("Bearer ", "")
      : cookieToken;

    if (!token) {
      return NextResponse.json(
        { error: "Missing Authorization header or session cookie" },
        { status: 401 }
      );
    }

    // SECURITY: Use user's JWT token with RLS for defense in depth
    // RLS INSERT policy ensures clinician_id = auth.uid()
    const supabase = supabaseServerWithUser(token);

    const payload = await req.json();
    const { name, email, dob, phone, full_name } = payload;

    // SECURITY: RLS policy will enforce that clinician_id = auth.uid()
    // We still set it explicitly for clarity, but RLS provides defense in depth
    const { data, error: dbError } = await supabase
      .from("patients")
      .insert({
        full_name: full_name || name,
        email,
        dob,
        phone,
        clinician_id: userId, // RLS policy also checks this
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, patient: data });
  } catch (error: any) {
    console.error("Error in patients POST route:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create patient" },
      { status: 500 }
    );
  }
}
