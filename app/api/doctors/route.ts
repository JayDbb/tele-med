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

    if (tableError) {
      // Fallback to auth users if table query fails
      const { data: usersList, error: userError } =
        await supabase.auth.admin.listUsers();

      if (userError) {
        return NextResponse.json(
          { error: userError.message },
          { status: 500 }
        );
      }

      // Filter for doctors from auth
      const doctors = usersList.users
        .filter((u) => {
          const role = u.user_metadata?.role || "user";
          return role === "doctor";
        })
        .map((u) => ({
          id: u.id,
          email: u.email || "",
          name: u.user_metadata?.full_name || u.email?.split("@")[0] || "Unknown",
          portalName: u.user_metadata?.full_name || u.email?.split("@")[0] || "Unknown",
          portalId: u.id,
          specialty: u.user_metadata?.specialty || "General Practice",
          status: "available" as const,
          next: null as string | null,
        }));

      return NextResponse.json(doctors);
    }

    // If we have doctors from users table, enrich with auth data if needed
    const doctors = await Promise.all(
      (doctorsFromTable || []).map(async (doctor) => {
        // Get auth user for additional metadata
        const { data: authData } = await supabase.auth.admin.getUserById(doctor.id);
        const authUser = authData?.user;

        return {
          id: doctor.id,
          email: doctor.email || authUser?.email || "",
          name: doctor.name || authUser?.user_metadata?.full_name || doctor.email?.split("@")[0] || "Unknown",
          portalName: doctor.name || authUser?.user_metadata?.full_name || doctor.email?.split("@")[0] || "Unknown",
          portalId: doctor.id,
          specialty: doctor.metadata?.specialty || authUser?.user_metadata?.specialty || "General Practice",
          status: "available" as const,
          next: null as string | null,
        };
      })
    );

    return NextResponse.json(doctors);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}

