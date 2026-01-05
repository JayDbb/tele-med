import { NextRequest, NextResponse } from "next/server";
import { requireUser, getUserRole } from "../../../../lib/auth";
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
  const userRole = await getUserRole(userId);

  let patient = null;

  // Nurses can access any patient
  if (userRole === "nurse") {
    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (patientError) {
      return NextResponse.json(
        { error: patientError.message },
        { status: 400 }
      );
    }

    patient = patientData;
  } else {
    // Doctors can only access owned or shared patients
    // check ownership
    const { data: patientOwned } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .eq("clinician_id", userId)
      .maybeSingle();

    patient = patientOwned;

    if (!patientOwned) {
      const { data: shareRow } = await supabase
        .from("patient_shares")
        .select("patients(*)")
        .eq("patient_id", id)
        .eq("shared_user_id", userId)
        .maybeSingle();
      patient = shareRow?.patients ?? null;
    }
  }

  if (!patient) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // First, get visits without notes/transcripts to avoid permission issues
  // First, get visits without notes/transcripts to avoid permission issues
  const { data: visits, error: visitsError } = await supabase
    .from("visits")
    .select("*")
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = supabaseServer();
  const userRole = await getUserRole(userId);
  const body = await req.json();

  // Only nurses can assign doctors to patients
  if (userRole !== "nurse") {
    return NextResponse.json(
      { error: "Only nurses can assign doctors to patients" },
      { status: 403 }
    );
  }

  // Check if patient exists
  const { data: patientData, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (patientError || !patientData) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  // If assigning a clinician, check their availability and create visit accordingly
  if (body.clinician_id) {
    const { data: clinicianData, error: clinicianError } = await supabase
      .from("users")
      .select("availability, role")
      .eq("id", body.clinician_id)
      .maybeSingle();

    if (clinicianError || !clinicianData) {
      return NextResponse.json(
        { error: "Clinician not found" },
        { status: 404 }
      );
    }

    // Update clinician_id (allow assignment even if busy)
    const { data: updatedPatient, error: updateError } = await supabase
      .from("patients")
      .update({
        clinician_id: body.clinician_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Create or update visit based on doctor availability
    // If waitlist mode is requested, always set status to "waiting"
    const visitStatus = body.waitlist ? "waiting" : (clinicianData.availability === "available" ? "draft" : "waiting");
    
    // Check for the most recent visit for this patient (regardless of clinician)
    const { data: mostRecentVisit, error: visitQueryError } = await supabase
      .from("visits")
      .select("id, status, clinician_id")
      .eq("patient_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (visitQueryError) {
      console.error("Error querying visits:", visitQueryError);
    }

    // Check if the most recent visit is signed/completed
    let shouldCreateNewVisit = true;
    let visitToUpdate = null;

    if (mostRecentVisit) {
      // Check if the visit is signed by checking the notes table
      const { data: visitNote } = await supabase
        .from("notes")
        .select("status")
        .eq("visit_id", mostRecentVisit.id)
        .maybeSingle();

      const isSigned = visitNote?.status === "signed" || 
                       mostRecentVisit.status === "completed" || 
                       mostRecentVisit.status === "finalized";

      if (!isSigned) {
        // Visit exists and is not signed - update it instead of creating new one
        shouldCreateNewVisit = false;
        visitToUpdate = mostRecentVisit;
      }
    }

    if (shouldCreateNewVisit) {
      // Most recent visit is signed/completed or no visits exist - create new visit
      await supabase
        .from("visits")
        .insert({
          patient_id: id,
          clinician_id: body.clinician_id,
          status: visitStatus,
        });
    } else {
      // Update existing unsigned visit - assign to new clinician and set to waiting
      if (visitToUpdate) {
        await supabase
          .from("visits")
          .update({
            clinician_id: body.clinician_id,
            status: "waiting",
          })
          .eq("id", visitToUpdate.id);
      }
    }

    return NextResponse.json({ patient: updatedPatient, visitStatus });
  } else {
    // Removing assignment
    const { data: updatedPatient, error: updateError } = await supabase
      .from("patients")
      .update({
        clinician_id: body.clinician_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ patient: updatedPatient });
  }
}
