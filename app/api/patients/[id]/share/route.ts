import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../../../lib/auth";
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

  // ensure requester owns the patient
  const { data: patientOwned } = await supabase
    .from("patients")
    .select("id")
    .eq("id", id)
    .eq("clinician_id", userId)
    .maybeSingle();

  if (!patientOwned) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data, error: dbError } = await supabase
    .from("patient_shares")
    .upsert(
      { patient_id: id, owner_id: userId, shared_user_id },
      { onConflict: "patient_id,shared_user_id" }
    )
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
