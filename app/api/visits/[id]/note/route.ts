// Clean single definition (duplicate block removed)
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../../../lib/auth";
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

  const { data: patientOwned } = await supabase
    .from("patients")
    .select("id")
    .eq("id", visit.patient_id)
    .eq("clinician_id", userId)
    .maybeSingle();

  if (patientOwned) return { allowed: true, visit };

  const { data: shareRow } = await supabase
    .from("patient_shares")
    .select("id")
    .eq("patient_id", visit.patient_id)
    .eq("shared_user_id", userId)
    .maybeSingle();

  return { allowed: !!shareRow, visit };
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

  // Fetch entries from the notes table (normalized per-entry rows)
  // Select entries from normalized `visit_notes` table
  const { data: rows, error: dbError } = await supabase
    .from("visit_notes")
    .select("id, content, section, source, author_id, created_at")
    .eq("visit_id", id)
    .order("created_at", { ascending: true });

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });

  // Determine visit-level status from visits.notes_status
  const { data: visitRow } = await supabase
    .from("visits")
    .select("notes_status, notes_finalized_by, notes_finalized_at")
    .eq("id", id)
    .maybeSingle();

  const entries = Array.isArray(rows)
    ? rows.map((r: any) => ({
        id: r.id || r?.id || r?.row?.id,
        timestamp: r.created_at || r?.created_at,
        content: r.content || r?.content,
        section: r.section || r?.section,
        source: r.source || r?.source,
        author_id: r.author_id || r?.author_id,
      }))
    : [];

  return NextResponse.json({
    visit_id: id,
    status: visitRow?.notes_status ?? "draft",
    entries,
  });
}

// POST: Append a new note entry (append-only system)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
  const { userId, user, error } = await requireUser(req);
  if (!userId) return NextResponse.json({ error }, { status: 401 });

  const supabase = supabaseServer();

  // Ensure the canonical public.users row exists for this author (foreign key requires it)
  let hasAuthorRow = false;
  try {
    const { data: existingUser } = await supabase.from('users').select('id').eq('id', userId).maybeSingle();
    if (existingUser) {
      hasAuthorRow = true;
    } else {
      // Try to upsert a minimal public.users row using email and name from auth user
      const email = user?.email || null;
      const name = user?.user_metadata?.full_name || user?.user_metadata?.fullName || null;
      if (email) {
        const { data: up, error: upsertErr } = await supabase.from('users').insert({ id: userId, email, name }).select().maybeSingle();
        if (upsertErr) {
          console.warn('Could not upsert public.users row for author:', upsertErr.message);
        } else if (up) {
          hasAuthorRow = true;
        }
      } else {
        console.warn('Author has no email to create public.users row; insert may fail due to FK');
      }
    }
  } catch (e) {
    console.warn('Error checking/creating public.users row for author', e);
  }

    const access = await assertAccess(supabase, userId, id);
    if (!access.allowed)
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    // debug logging for failing cases
    console.log("POST /api/visits/[id]/note - userId:", userId, "visitId:", id);

    const payload = await req.json();
    const { content, section, source = "manual" } = payload; // source: 'manual' | 'dictation'

    if (!content || typeof content !== "string") {
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
      content: content.trim(),
      section,
      source,
      author_id: userId,
    };

    // Insert new per-entry row into `visit_notes`
    const { data: inserted, error: insertErr } = await supabase
      .from("visit_notes")
      .insert({
        visit_id: id,
        content: newEntry.content,
        section: newEntry.section,
        source: newEntry.source,
        author_id: hasAuthorRow ? newEntry.author_id : null,
      })
      .select()
      .maybeSingle();

    if (insertErr) {
      console.error("visit_notes insertErr:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    // Get the total count for the visit
    const { data: list, error: listErr } = await supabase
      .from('visit_notes')
      .select('id')
      .eq('visit_id', id);

    if (listErr) {
      console.error("visit_notes listErr:", listErr);
    }

    const total = Array.isArray(list) ? list.length : undefined;

    return NextResponse.json({
      entry: newEntry,
      totalEntries: total,
    });
  } catch (e) {
    console.error("Unhandled error in POST /api/visits/[id]/note:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// PUT: Update note status (e.g., sign note)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId, user, token, error } = await requireUser(req);
  if (!userId) return NextResponse.json({ error }, { status: 401 });

  const supabase = supabaseServer();

  // Ensure a public.users row exists for the signer to satisfy FK when finalizing
  try {
    const { data: existingUser } = await supabase.from('users').select('id').eq('id', userId).maybeSingle();
    if (!existingUser) {
      const email = user?.email || null;
      const name = user?.user_metadata?.full_name || user?.user_metadata?.fullName || null;
      if (email) {
        const { error: upsertErr } = await supabase.from('users').insert({ id: userId, email, name }).select().maybeSingle();
        if (upsertErr) console.warn('Could not upsert public.users for signer:', upsertErr.message);
      }
    }
  } catch (e) {
    console.warn('Error ensuring public.users for signer', e);
  }

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

  // Update visit-level note metadata on the visits table
  const updateData: any = {
    notes_status: status,
  };

  if (status === "signed") {
    updateData.notes_finalized_by = userId;
    updateData.notes_finalized_at = new Date().toISOString();
  } else if (status === "draft") {
    updateData.notes_finalized_by = null;
    updateData.notes_finalized_at = null;
  }

  const { data, error: dbError } = await supabase
    .from("visits")
    .update(updateData)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 400 });

  return NextResponse.json(data);
}
