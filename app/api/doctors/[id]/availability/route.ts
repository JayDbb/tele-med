import { NextRequest, NextResponse } from "next/server";
import { requireUser, getUserRole } from "../../../../../lib/auth";
import { supabaseServer } from "../../../../../lib/supabaseServer";

/**
 * PUT /api/doctors/[id]/availability
 * Update doctor availability status
 */
export async function PUT(
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

  // Only doctors can update their own availability, or admins can update any doctor's availability
  if (userRole === "doctor" && userId !== doctorId) {
    return NextResponse.json(
      { error: "You can only update your own availability" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { availability } = body;

  // Validate availability value
  const validStatuses = ["available", "offline", "busy"];
  if (!validStatuses.includes(availability)) {
    return NextResponse.json(
      { error: "Invalid availability status. Must be one of: available, offline, busy" },
      { status: 400 }
    );
  }

  // Update availability
  const { data, error: updateError } = await supabase
    .from("users")
    .update({
      availability,
      availability_updated_at: new Date().toISOString(),
    })
    .eq("id", doctorId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ user: data });
}

/**
 * GET /api/doctors/[id]/availability
 * Get doctor availability status
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

  const { data, error: fetchError } = await supabase
    .from("users")
    .select("availability, availability_updated_at")
    .eq("id", doctorId)
    .single();

  if (fetchError) {
    return NextResponse.json(
      { error: fetchError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ availability: data.availability, updated_at: data.availability_updated_at });
}

