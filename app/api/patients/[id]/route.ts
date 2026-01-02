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

  // First, get visits without notes/transcripts to avoid permission issues
  const { data: visits, error: visitsError } = await supabase
    .from("visits")
    .select("*")
    .eq("patient_id", id)
    .order("created_at", { ascending: false });

  if (visitsError) {
    return NextResponse.json({ error: visitsError.message }, { status: 400 });
  }

  // Try to fetch notes and transcripts separately if the tables exist
  const visitsWithNote = await Promise.all(
    (visits ?? []).map(async (visit: any) => {
      let noteData = null;
      let transcriptData = null;

      // Try to fetch note if notes table exists and is accessible
      try {
        const { data: note } = await supabase
          .from("notes")
          .select("note, status, finalized_by, finalized_at")
          .eq("visit_id", visit.id)
          .maybeSingle();
        
        if (note) {
          noteData = note;
        }
      } catch (noteError: any) {
        // If notes table doesn't exist or permission denied, continue without it
        console.warn("Could not fetch notes:", noteError.message);
      }

      // Try to fetch transcript if transcripts table exists and is accessible
      try {
        const { data: transcript } = await supabase
          .from("transcripts")
          .select("raw_text, segments")
          .eq("visit_id", visit.id)
          .maybeSingle();
        
        if (transcript) {
          transcriptData = transcript;
        }
      } catch (transcriptError: any) {
        // If transcripts table doesn't exist or permission denied, continue without it
        console.warn("Could not fetch transcripts:", transcriptError.message);
      }

      return {
        ...visit,
        notes: noteData,
        transcripts: transcriptData,
      };
    })
  );

  return NextResponse.json({ patient, visits: visitsWithNote });
}
