import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";

async function assertAccess(supabase: ReturnType<typeof supabaseServer>, userId: string, visitId: string) {
  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select("patient_id")
    .eq("id", visitId)
    .maybeSingle();
  if (visitError || !visit) return { allowed: false };

  const { data: patientOwned } = await supabase
    .from("patients")
    .select("id")
    .eq("id", visit.patient_id)
    .eq("clinician_id", userId)
    .maybeSingle();

  if (patientOwned) return { allowed: true, visit };

  const { data: shareRow } = await supabase
    .from("patient_shares")
    .select("id")
    .eq("patient_id", visit.patient_id)
    .eq("shared_user_id", userId)
    .maybeSingle();

  return { allowed: !!shareRow, visit };
}

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
  const access = await assertAccess(supabase, userId, id);
  if (!access.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select("*, notes(note), transcripts(raw_text, segments)")
    .eq("id", id)
    .single();

  if (visitError) {
    return NextResponse.json({ error: visitError.message }, { status: 400 });
  }

  // Get patient info
  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", visit.patient_id)
    .single();

  return NextResponse.json({ visit, patient: patient ?? null });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = supabaseServer();
  const access = await assertAccess(supabase, userId, id);
  if (!access.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const payload = await req.json();
  const { data, error: dbError } = await supabase
    .from("visits")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
