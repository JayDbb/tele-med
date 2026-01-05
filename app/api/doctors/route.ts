import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { supabaseServer } from "../../../lib/supabaseServer";

/**
 * GET /api/doctors
 * Get all doctors with their specialty and metadata
 */
export async function GET(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const supabase = supabaseServer();

    // Query users table for doctors
    const { data: doctorsFromTable, error: tableError } = await supabase
      .from("users")
      .select("*")
      .eq("role", "doctor");

    // If we have doctors from users table, enrich with auth data if needed
    const doctors = await Promise.all(
      (doctorsFromTable || []).map(async (doctor) => {
        // Get auth user for additional metadata
        const { data: authData } = await supabase.auth.admin.getUserById(
          doctor.id
        );
        const authUser = authData?.user;

        // Map availability_status to status
        // availability_status enum: 'online', 'offline', 'busy', etc.

        return {
          id: doctor.id,
          email: doctor.email || authUser?.email || "",
          name:
            doctor.name ||
            authUser?.user_metadata?.full_name ||
            doctor.email?.split("@")[0] ||
            "Unknown",
          portalName:
            doctor.name ||
            authUser?.user_metadata?.full_name ||
            doctor.email?.split("@")[0] ||
            "Unknown",
          portalId: doctor.id,
          specialty:
            doctor.metadata?.specialty ||
            authUser?.user_metadata?.specialty ||
            "General Practice",
          availability: doctor.availability || "offline",
          last_seen_at: doctor.last_seen_at || null,
          availability_updated_at: doctor.availability_updated_at || null,
          next: null as string | null,
        };
      })
    );

    console.log("Doctors data from API:", doctors);
    return NextResponse.json(doctors);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
