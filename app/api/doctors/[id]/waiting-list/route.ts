import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../../../lib/auth";
import { supabaseServer } from "../../../../../lib/supabaseServer";

/**
 * GET /api/doctors/[id]/waiting-list
 * Get the waiting list (visits with status 'waiting') for a doctor
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: doctorId } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = supabaseServer();

  // Get waiting visits for this doctor, ordered by created_at (queue order)
  const { data: waitingVisits, error: visitsError } = await supabase
    .from("visits")
    .select(`
      id,
      patient_id,
      status,
      created_at,
      patients (
        id,
        full_name,
        email,
        dob
      )
    `)
    .eq("clinician_id", doctorId)
    .eq("status", "waiting")
    .order("created_at", { ascending: true }); // Oldest first (FIFO queue)

  if (visitsError) {
    return NextResponse.json(
      { error: visitsError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ waitingList: waitingVisits || [] });
}

