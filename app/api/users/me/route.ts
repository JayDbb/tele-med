import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { supabaseServer } from "../../../../lib/supabaseServer";

/**
 * GET /api/users/me
 * Get the current authenticated user's information including role
 */
export async function GET(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const supabase = supabaseServer();

    // First try to get from users table (preferred source of truth)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (userData) {
      return NextResponse.json({ 
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          metadata: userData.metadata,
          avatar_url: userData.avatar_url
        }
      });
    }

    // Fallback to auth user metadata if users table doesn't have the record
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: authError?.message || "User not found" },
        { status: 404 }
      );
    }

    const authUser = authData.user;
    return NextResponse.json({
      user: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Unknown",
        role: authUser.user_metadata?.role || "user",
        metadata: authUser.user_metadata,
        avatar_url: authUser.user_metadata?.avatar
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

