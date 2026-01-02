import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = supabaseServer();

  const { data, error: dbError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "User record not found" }, { status: 404 });
  }

  return NextResponse.json({ user: data });
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = supabaseServer();

  // Get auth user info for reliable email and metadata
  const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
  if (authError || !authData?.user) {
    return NextResponse.json({ error: authError?.message || "Failed to fetch auth user" }, { status: 500 });
  }

  const authUser = authData.user;
  const body = await req.json();

  const payload: any = {
    id: userId,
    email: authUser.email,
    role: body.role || "patient",
    name: body.name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || null,
    avatar_url: authUser.user_metadata?.avatar || null,
    metadata: body.metadata || null,
  };

  // Add additional role-specific fields
  if (payload.role === "doctor") {
    payload.metadata = {
      ...payload.metadata,
      specialty: body.specialty || authUser.user_metadata?.specialty || null,
    };
  }

  if (payload.role === "nurse") {
    payload.metadata = {
      ...payload.metadata,
      department: body.department || authUser.user_metadata?.department || null,
    };
  }

  // Upsert the users row (on conflict id)
  const { data: upserted, error: upsertError } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ user: upserted });
}
