import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../../../../lib/supabaseServer";

/**
 * POST /api/doctors/[id]/auto-process-queue
 * Automatically process queue when doctor becomes available (called internally)
 * This should be triggered when a doctor's availability changes from busy to available
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: doctorId } = await params;
  const supabase = supabaseServer();

  // Check if doctor has any waiting patients
  const { data: waitingVisits, error: visitsError } = await supabase
    .from("visits")
    .select("id, patient_id")
    .eq("clinician_id", doctorId)
    .eq("status", "waiting")
    .order("created_at", { ascending: true })
    .limit(1);

  if (visitsError) {
    return NextResponse.json(
      { error: visitsError.message },
      { status: 400 }
    );
  }

  // If no waiting patients, nothing to process
  if (!waitingVisits || waitingVisits.length === 0) {
    return NextResponse.json({ message: "No waiting patients" });
  }

  // Process the next waiting patient (oldest first - FIFO queue)
  const nextVisit = waitingVisits[0];
  const { data: updatedVisit, error: updateError } = await supabase
    .from("visits")
    .update({ status: "draft" })
    .eq("id", nextVisit.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ visit: updatedVisit, processed: true });
}

