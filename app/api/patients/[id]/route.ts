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

  // Try selecting visits with nested notes/transcripts; if permission errors occur (e.g., notes table RLS),
  // fall back to a simpler query that selects visits only.
  let visits: any[] = []
  try {
    const { data, error } = await supabase
      .from('visits')
      .select('*, notes(note), transcripts(raw_text, segments)')
      .eq('patient_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      // If the error is permission related, retry with a simpler select
      console.warn('visits select (with notes/transcripts) failed:', error.message)
      const { data: fallbackData, error: fallbackErr } = await supabase
        .from('visits')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false })

      if (fallbackErr) {
        console.warn('fallback visits select failed:', fallbackErr.message)
        visits = []
      } else {
        visits = fallbackData || []
      }
    } else {
      visits = data || []
    }
  } catch (err: any) {
    console.error('Unexpected error selecting visits:', err)
    visits = []
  }

  const visitsWithNote = (visits ?? []).map((v: any) => ({
    ...v,
    notes: v.notes ?? null,
  }));

  return NextResponse.json({ patient, visits: visitsWithNote });
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

  try {
    const body = await req.json();
    const supabase = supabaseServer();

    // Ensure the requester owns the patient
    const { data: patientOwned } = await supabase
      .from('patients')
      .select('id, clinician_id')
      .eq('id', id)
      .maybeSingle();

    if (!patientOwned || patientOwned.clinician_id !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { data, error: dbError } = await supabase
      .from('patients')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, patient: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update patient' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const supabase = supabaseServer();

    // Ensure the requester owns the patient
    const { data: patientOwned } = await supabase
      .from('patients')
      .select('id, clinician_id')
      .eq('id', id)
      .maybeSingle();

    if (!patientOwned || patientOwned.clinician_id !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { error: dbError } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete patient' }, { status: 500 });
  }
}
