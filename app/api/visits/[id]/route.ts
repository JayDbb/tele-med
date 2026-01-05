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
  
  // Check if visit is being finalized/closed (status changed to 'completed' or 'finalized')
  const wasOpen = existingVisit.status === "draft" || existingVisit.status === "in-progress";
  const isBeingClosed = payload.status && (payload.status === "completed" || payload.status === "finalized");

  const { data, error: dbError } = await supabase
    .from("visits")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  // If visit was closed/finalized and doctor had an open visit, update availability to 'available'
  if (isBeingClosed && wasOpen && existingVisit.clinician_id) {
    const userRole = await getUserRole(userId);
    if (userRole === "doctor" || existingVisit.clinician_id === userId) {
      // Check if doctor has any other open visits
      const { data: otherOpenVisits } = await supabase
        .from("visits")
        .select("id")
        .eq("clinician_id", existingVisit.clinician_id)
        .in("status", ["draft", "in-progress"])
        .neq("id", id)
        .limit(1);

      // Only update availability if no other open visits exist
      if (!otherOpenVisits || otherOpenVisits.length === 0) {
        await supabase
          .from("users")
          .update({
            availability: "available",
            availability_updated_at: new Date().toISOString(),
          })
          .eq("id", existingVisit.clinician_id);
      }
    }
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
