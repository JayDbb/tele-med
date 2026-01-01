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

  // Sanitize and default incoming values to avoid DB errors
  const allowedStatus = ['draft','registered','in_progress','completed','pending_review','finalized'];
  const allowedTypes = ['telehealth','mobile_acute','triage','nurse_visit','doctor_visit'];
  const status = allowedStatus.includes(payload.status) ? payload.status : 'draft';
  const type = allowedTypes.includes(payload.type) ? payload.type : null;

  // Validate optional location payload
  const loc: any = {};
  if (payload.location_lat !== undefined && payload.location_lng !== undefined) {
    const lat = Number(payload.location_lat);
    const lng = Number(payload.location_lng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      loc.location_lat = lat;
      loc.location_lng = lng;
      if (payload.location_accuracy !== undefined) loc.location_accuracy = Number(payload.location_accuracy);
      if (payload.location_recorded_at) loc.location_recorded_at = payload.location_recorded_at;
    }
  }

  const insertPayload = { ...payload, clinician_id: userId, status, type, ...loc };

  const { data, error: dbError } = await supabase
    .from("visits")
    .insert(insertPayload)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

