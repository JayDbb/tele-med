import { NextRequest, NextResponse } from "next/server";
import { requireUser, getUserRole } from "../../../../../lib/auth";
import { supabaseServer } from "../../../../../lib/supabaseServer";

/**
 * POST /api/doctors/[id]/process-queue
 * Process the next patient in the queue (change status from 'waiting' to 'draft')
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: doctorId } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = supabaseServer();
  const userRole = await getUserRole(userId);

  // Only doctors can process their own queue, or nurses can process any queue
  if (userRole === "doctor" && userId !== doctorId) {
    return NextResponse.json(
      { error: "Doctors can only process their own queue" },
      { status: 403 }
    );
  }

  // Get the next waiting visit (oldest first - FIFO queue)
  const { data: nextVisit, error: visitError } = await supabase
    .from("visits")
    .select("id, patient_id")
    .eq("clinician_id", doctorId)
    .eq("status", "waiting")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (visitError) {
    return NextResponse.json(
      { error: visitError.message },
      { status: 400 }
    );
  }

  if (!nextVisit) {
    return NextResponse.json(
      { error: "No patients in waiting queue" },
      { status: 404 }
    );
  }

  // Update the visit status from 'waiting' to 'draft'
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

  // Update doctor availability to 'busy' when visit is processed
  if (userRole === "doctor") {
    await supabase
      .from("users")
      .update({
        availability: "busy",
        availability_updated_at: new Date().toISOString(),
      })
      .eq("id", doctorId);
  }

  return NextResponse.json({ visit: updatedVisit });
}

