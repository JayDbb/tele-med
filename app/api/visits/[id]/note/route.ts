// Clean single definition (duplicate block removed)
import { NextRequest, NextResponse } from "next/server";
import { requireUser, getUserRole, verifyPatientAccess } from "../../../../../lib/auth";
import { supabaseServer } from "../../../../../lib/supabaseServer";

async function assertAccess(
  supabase: ReturnType<typeof supabaseServer>,
  userId: string,
  visitId: string
) {
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

// GET: Retrieve all note entries for a visit (append-only system)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) return NextResponse.json({ error }, { status: 401 });

  const supabase = supabaseServer();
  const access = await assertAccess(supabase, userId, id);
  if (!access.allowed)
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  // Get the note record for this visit
  const { data: noteRecord, error: dbError } = await supabase
    .from("notes")
    .select("*")
    .eq("visit_id", id)
    .maybeSingle();

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 400 });

  // If no note record exists, return empty array
  if (!noteRecord) {
    return NextResponse.json({
      visit_id: id,
      status: "draft",
      entries: [],
    });
  }

  // Parse entries from note field (should be array of entries)
  let entries = [];
  if (noteRecord.note) {
    try {
      entries = Array.isArray(noteRecord.note) ? noteRecord.note : [];
    } catch {
      entries = [];
    }
  }

  return NextResponse.json({
    visit_id: noteRecord.visit_id,
    status: noteRecord.status,
    entries: entries,
  });
}

// POST: Append a new note entry (append-only system)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) return NextResponse.json({ error }, { status: 401 });

  const supabase = supabaseServer();
  const access = await assertAccess(supabase, userId, id);
  if (!access.allowed)
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const payload = await req.json();
  const { content, section, source = "manual" } = payload; // source: 'manual' | 'dictation'

  if (
    !content ||
    (typeof content !== "string" && typeof content !== "object")
  ) {
    return NextResponse.json(
      { error: "Missing or invalid content" },
      { status: 400 }
    );
  }

  if (
    !section ||
    !["subjective", "objective", "assessment", "plan"].includes(section)
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid section. Must be: subjective, objective, assessment, or plan",
      },
      { status: 400 }
    );
  }

  // Create new entry
  const newEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    content: typeof content === "string" ? content.trim() : content,
    section,
    source,
    author_id: userId,
  };

  // Get existing note record
  const { data: existingNote, error: fetchError } = await supabase
    .from("notes")
    .select("*")
    .eq("visit_id", id)
    .maybeSingle();

  let entries = [];
  if (existingNote?.note) {
    try {
      entries = Array.isArray(existingNote.note) ? existingNote.note : [];
    } catch {
      entries = [];
    }
  }

  // Append new entry
  entries.push(newEntry);

  // Insert or update note with updated entries array
  let data, dbError;
  if (existingNote) {
    // Update existing note
    const { data: updated, error: updateError } = await supabase
      .from("notes")
      .update({
        note: entries,
        status: existingNote.status,
        updated_at: new Date().toISOString(),
      })
      .eq("visit_id", id)
      .select()
      .maybeSingle();
    data = updated;
    dbError = updateError;
  } else {
    // Insert new note
    const { data: inserted, error: insertError } = await supabase
      .from("notes")
      .insert({
        visit_id: id,
        note: entries,
        status: "draft",
      })
      .select()
      .maybeSingle();
    data = inserted;
    dbError = insertError;
  }

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 400 });

  return NextResponse.json({
    entry: newEntry,
    totalEntries: entries.length,
  });
}

// PUT: Update note status (e.g., sign note)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) return NextResponse.json({ error }, { status: 401 });

  const supabase = supabaseServer();
  const access = await assertAccess(supabase, userId, id);
  if (!access.allowed)
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const payload = await req.json();
  const { status } = payload;

  if (!status || !["draft", "signed", "pending"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status. Must be: draft, signed, or pending" },
      { status: 400 }
    );
  }

  // Get existing note to preserve entries
  const { data: existingNote } = await supabase
    .from("notes")
    .select("*")
    .eq("visit_id", id)
    .maybeSingle();

  // Prepare update data
  const updateData: any = {
    visit_id: id,
    note: existingNote?.note ?? [],
    status,
    updated_at: new Date().toISOString(),
  };

  // If signing the note, set finalized_by and finalized_at
  if (status === "signed") {
    updateData.finalized_by = userId;
    updateData.finalized_at = new Date().toISOString();
  } else if (status === "draft") {
    // If reverting to draft, clear finalized fields
    updateData.finalized_by = null;
    updateData.finalized_at = null;
  }

  // Insert or update note
  let data, dbError;
  if (existingNote) {
    // Update existing note
    const { data: updated, error: updateError } = await supabase
      .from("notes")
      .update(updateData)
      .eq("visit_id", id)
      .select()
      .maybeSingle();
    data = updated;
    dbError = updateError;
  } else {
    // Insert new note
    const { data: inserted, error: insertError } = await supabase
      .from("notes")
      .insert(updateData)
      .select()
      .maybeSingle();
    data = inserted;
    dbError = insertError;
  }

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 400 });

  // Log audit trail
  try {
    const oldStatus = existingNote?.status || 'none';
    const changes = {
      status: {
        from: oldStatus,
        to: status
      }
    };

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
        patient_id: access.visit?.patient_id,
        action: status === 'signed' ? 'note_signed' : 'note_status_changed',
        entity_type: 'note',
        entity_id: id,
        user_id: userId,
        user_name: userName,
        changes,
        notes: status === 'signed' ? 'Note signed and finalized' : `Note status changed from ${oldStatus} to ${status}`
      });

    if (auditError && auditError.code !== '42P01') {
      // Only log if it's not a "table doesn't exist" error
      console.warn('Failed to log audit trail:', auditError);
    }
  } catch (auditError) {
    console.warn('Error logging audit trail:', auditError);
    // Continue even if audit logging fails
  }

  return NextResponse.json(data);
}
