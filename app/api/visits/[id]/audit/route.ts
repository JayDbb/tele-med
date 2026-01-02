import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../../../lib/auth";
import { supabaseServer } from "../../../../../lib/supabaseServer";

// GET: Retrieve audit trail for a visit
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

  // Verify access to visit
  const { data: visit } = await supabase
    .from("visits")
    .select("id, patient_id, clinician_id")
    .eq("id", id)
    .maybeSingle();

  if (!visit) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  // Check if user has access (owner or shared)
  const isOwner = visit.clinician_id === userId;
  if (!isOwner) {
    const { data: shareRow } = await supabase
      .from("patient_shares")
      .select("patient_id")
      .eq("patient_id", visit.patient_id)
      .eq("shared_user_id", userId)
      .maybeSingle();

    if (!shareRow) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
  }

  // Get audit trail from visit_audit_trail table
  const { data: auditTrail, error: auditError } = await supabase
    .from("visit_audit_trail")
    .select("*")
    .eq("visit_id", id)
    .order("created_at", { ascending: false });

  if (auditError) {
    // If table doesn't exist, return empty array (graceful degradation)
    if (auditError.code === "42P01") {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: auditError.message }, { status: 400 });
  }

  return NextResponse.json(auditTrail || []);
}

// POST: Log an audit event
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = supabaseServer();

  // Verify access to visit
  const { data: visit } = await supabase
    .from("visits")
    .select("id, patient_id, clinician_id")
    .eq("id", id)
    .maybeSingle();

  if (!visit) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  // Check if user has access
  const isOwner = visit.clinician_id === userId;
  if (!isOwner) {
    const { data: shareRow } = await supabase
      .from("patient_shares")
      .select("patient_id")
      .eq("patient_id", visit.patient_id)
      .eq("shared_user_id", userId)
      .maybeSingle();

    if (!shareRow) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
  }

  const body = await req.json();
  const { action, entity_type, entity_id, changes, notes } = body;

  if (!action || !entity_type) {
    return NextResponse.json(
      { error: "Action and entity_type are required" },
      { status: 400 }
    );
  }

  // Get user info
  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  const userName = userData?.user?.user_metadata?.full_name || 
                   userData?.user?.email?.split("@")[0] || 
                   "Unknown User";

  // Insert audit log
  const { data: auditLog, error: insertError } = await supabase
    .from("visit_audit_trail")
    .insert({
      visit_id: id,
      patient_id: visit.patient_id,
      action,
      entity_type, // 'visit', 'note', etc.
      entity_id: entity_id || id,
      user_id: userId,
      user_name: userName,
      changes: changes || null,
      notes: notes || null,
    })
    .select()
    .single();

  if (insertError) {
    // If table doesn't exist, try to create it or return success (graceful degradation)
    if (insertError.code === "42P01") {
      console.warn("visit_audit_trail table does not exist. Audit logging skipped.");
      return NextResponse.json({ success: true, skipped: true });
    }
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json(auditLog);
}

