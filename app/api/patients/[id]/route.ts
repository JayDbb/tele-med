import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { supabaseServer } from "../../../../lib/supabaseServer";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = supabaseServer();
  // check ownership
  const { data: patientOwned } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .eq("clinician_id", userId)
    .maybeSingle();

  let patient = patientOwned;

  if (!patientOwned) {
    const { data: shareRow } = await supabase
      .from("patient_shares")
      .select("patients(*)")
      .eq("patient_id", id)
      .eq("shared_user_id", userId)
      .maybeSingle();
    patient = shareRow?.patients ?? null;
  }

  if (!patient) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: visits, error: visitsError } = await supabase
    .from("visits")
    .select("*, notes(note), transcripts(raw_text, segments)")
    .eq("patient_id", id)
    .order("created_at", { ascending: false });

  if (visitsError) {
    return NextResponse.json({ error: visitsError.message }, { status: 400 });
  }

  const visitsWithNote = (visits ?? []).map((v: any) => ({
    ...v,
    notes: v.notes ?? null,
  }));

  return NextResponse.json({ patient, visits: visitsWithNote });
}
