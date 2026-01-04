import { NextRequest, NextResponse } from "next/server";
import { requireUser, getUserRole } from "../../../../../lib/auth";
import { supabaseServer } from "../../../../../lib/supabaseServer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const supabase = supabaseServer();

  // List users and filter by email (Supabase admin API doesn't have getUserByEmail)
  const { data: usersList, error: userError } =
    await supabase.auth.admin.listUsers();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  // Find user by email from the list
  const user = usersList.users.find((u) => u.email === email);
  if (!user) {
    return NextResponse.json(
      { error: "User not found for email" },
      { status: 404 }
    );
  }

  const shared_user_id = user.id;

  // Check user role
  const userRole = await getUserRole(userId);

  // Nurses can share any patient, doctors can only share patients they own
  if (userRole !== 'nurse') {
    // For doctors, ensure they own the patient
    const { data: patientOwned } = await supabase
      .from("patients")
      .select("id")
      .eq("id", id)
      .eq("clinician_id", userId)
      .maybeSingle();

    if (!patientOwned) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
  } else {
    // For nurses, just verify the patient exists
    const { data: patientExists } = await supabase
      .from("patients")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!patientExists) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
  }

  // Check if share already exists
  const { data: existingShare, error: checkError } = await supabase
    .from("patient_shares")
    .select("*")
    .eq("patient_id", id)
    .eq("shared_user_id", shared_user_id)
    .maybeSingle();

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 400 });
  }

  // If share already exists, return it
  if (existingShare) {
    return NextResponse.json(existingShare);
  }

  // Otherwise, insert a new share
  const { data, error: dbError } = await supabase
    .from("patient_shares")
    .insert({
      patient_id: id,
      owner_id: userId,
      shared_user_id,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
