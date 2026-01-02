import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function POST(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const payload = await req.json();
  const supabase = supabaseServer();
  const { data, error: dbError } = await supabase
    .from("visits")
    .insert({ ...payload, clinician_id: userId, status: payload.status ?? "draft" })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

