import { NextRequest, NextResponse } from "next/server";
import { requireUser, getUserRole, verifyPatientAccess } from "../../../../lib/auth";
import { supabaseServer } from "../../../../lib/supabaseServer";

async function assertAccess(supabase: ReturnType<typeof supabaseServer>, userId: string, visitId: string) {
  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select("patient_id")
    .eq("id", visitId)
    .maybeSingle();
  if (visitError || !visit) return { allowed: false };

  // Nurses can access all visits
  const userRole = await getUserRole(userId);
  if (userRole === 'nurse') {
    return { allowed: true, visit };
  }

  // Doctors can only access visits for owned or shared patients
  const { hasAccess } = await verifyPatientAccess(userId, visit.patient_id);
  return { allowed: hasAccess, visit };
}

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
  const access = await assertAccess(supabase, userId, id);
  if (!access.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select("*, notes(note), transcripts(raw_text, segments)")
    .eq("id", id)
    .single();

  if (visitError) {
    return NextResponse.json({ error: visitError.message }, { status: 400 });
  }

  // Get patient info
  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", visit.patient_id)
    .single();

  return NextResponse.json({ visit, patient: patient ?? null });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = supabaseServer();
  const access = await assertAccess(supabase, userId, id);
  if (!access.allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Get existing visit data for audit trail
  const { data: existingVisit } = await supabase
    .from("visits")
    .select("*")
    .eq("id", id)
    .single();

  if (!existingVisit) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  const payload = await req.json();
  const { data, error: dbError } = await supabase
    .from("visits")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  // Log audit trail for visit changes
  try {
    const changes: any = {};
    Object.keys(payload).forEach(key => {
      if (existingVisit[key] !== payload[key]) {
        changes[key] = {
          from: existingVisit[key],
          to: payload[key]
        };
      }
    });

    if (Object.keys(changes).length > 0) {
      // Get user info for audit log
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      const userName = userData?.user?.user_metadata?.full_name || 
                       userData?.user?.email?.split("@")[0] || 
                       "Unknown User";

      // Insert audit log directly
      const { error: auditError } = await supabase
        .from("visit_audit_trail")
        .insert({
          visit_id: id,
          patient_id: existingVisit.patient_id,
          action: 'visit_updated',
          entity_type: 'visit',
          entity_id: id,
          user_id: userId,
          user_name: userName,
          changes,
          notes: 'Visit information updated'
        });

      if (auditError && auditError.code !== '42P01') {
        // Only log if it's not a "table doesn't exist" error
        console.warn('Failed to log audit trail:', auditError);
      }
    }
  } catch (auditError) {
    console.warn('Error logging audit trail:', auditError);
    // Continue even if audit logging fails
  }

  return NextResponse.json(data);
}
