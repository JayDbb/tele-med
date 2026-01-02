import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { supabaseServer } from "../../../../lib/supabaseServer";

/**
 * GET /api/clinicians/[id]
 * Get clinician information by ID
 */
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

  // Get user information from auth.users using admin API
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(id);

  if (userError || !userData?.user) {
    return NextResponse.json(
      { error: "Clinician not found" },
      { status: 404 }
    );
  }

  const user = userData.user;

  // Return clinician information
  return NextResponse.json({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
    specialty: user.user_metadata?.specialty || null,
    department: user.user_metadata?.department || null,
    role: user.user_metadata?.role || null,
  });
}

