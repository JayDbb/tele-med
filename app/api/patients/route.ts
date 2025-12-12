import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = supabaseServer();
  const { data: owned, error: ownedError } = await supabase
    .from("patients")
    .select("*")
    .eq("clinician_id", userId)
    .order("created_at", { ascending: false });

  const { data: sharedLinks, error: sharedError } = await supabase
    .from("patient_shares")
    .select("patient_id, patients(*)")
    .eq("shared_user_id", userId);

  if (ownedError || sharedError) {
    return NextResponse.json(
      { error: ownedError?.message || sharedError?.message },
      { status: 500 }
    );
  }

  const sharedPatients =
    sharedLinks
      ?.map((row: any) => row.patients)
      .filter(Boolean) ?? [];

  const merged = [...(owned ?? []), ...sharedPatients].reduce((acc: any[], p: any) => {
    if (!acc.find((x) => x.id === p.id)) acc.push(p);
    return acc;
  }, []);

  // Return with ownership info
  const result = merged.map((p: any) => {
    const isShared = sharedPatients.some((sp: any) => sp.id === p.id);
    return { ...p, is_shared: isShared };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const payload = await req.json();
  const supabase = supabaseServer();
  const { data, error: dbError } = await supabase
    .from("patients")
    .insert({ ...payload, clinician_id: userId })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

