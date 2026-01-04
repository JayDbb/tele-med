import { NextRequest, NextResponse } from "next/server";
import { requireUser, verifyPatientAccess } from "../../../../../lib/auth";
import { supabaseServer } from "../../../../../lib/supabaseServer";

// GET all family history for a patient
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  // Verify patient access (nurses can access all, doctors only owned/shared)
  const { hasAccess } = await verifyPatientAccess(userId, patientId);
  if (!hasAccess) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = supabaseServer();

  // Get family history from patients table JSONB column
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("family_history")
    .eq("id", patientId)
    .maybeSingle();

  if (patientError) {
    return NextResponse.json({ error: patientError.message }, { status: 400 });
  }

  // Parse family_history JSONB - it's already JSON, just ensure it's an array
  let familyHistory = [];
  if (patient?.family_history) {
    try {
      // JSONB is already parsed by Supabase, but handle both cases
      familyHistory = Array.isArray(patient.family_history)
        ? patient.family_history
        : typeof patient.family_history === "string"
        ? JSON.parse(patient.family_history)
        : [];
    } catch {
      familyHistory = [];
    }
  }

  return NextResponse.json(familyHistory);
}

// POST - Create a new family member entry
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { relationship, status, conditions, notes, age, unsure } = body;

    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship is required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Verify patient access (nurses can access all, doctors only owned/shared)
    const { hasAccess } = await verifyPatientAccess(userId, patientId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get existing family history from patients table
    const { data: patient, error: fetchError } = await supabase
      .from("patients")
      .select("family_history")
      .eq("id", patientId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Parse existing family history
    let existingHistory: any[] = [];
    if (patient?.family_history) {
      try {
        existingHistory = Array.isArray(patient.family_history)
          ? patient.family_history
          : typeof patient.family_history === "string"
          ? JSON.parse(patient.family_history)
          : [];
      } catch {
        existingHistory = [];
      }
    }

    // Create new family member entry
    const familyMemberEntry = {
      id: crypto.randomUUID(),
      relationship,
      status: status || "Living",
      conditions: Array.isArray(conditions) ? conditions : conditions ? [conditions] : [],
      notes: notes || null,
      age: age || null,
      unsure: unsure || false,
      recorded_by: userId,
      created_at: new Date().toISOString(),
    };

    // Append to existing family history array
    const updatedHistory = [...existingHistory, familyMemberEntry];

    // Update patients table with new family_history JSONB
    const { data: updatedPatient, error: updateError } = await supabase
      .from("patients")
      .update({
        family_history: updatedHistory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", patientId)
      .select("family_history")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, member: familyMemberEntry });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create family member" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing family member entry
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { memberId, relationship, status, conditions, notes, age, unsure } = body;

    if (!memberId || !relationship) {
      return NextResponse.json(
        { error: "Member ID and relationship are required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Verify patient access (nurses can access all, doctors only owned/shared)
    const { hasAccess } = await verifyPatientAccess(userId, patientId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get existing family history from patients table
    const { data: patient, error: fetchError } = await supabase
      .from("patients")
      .select("family_history")
      .eq("id", patientId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Parse existing family history
    let existingHistory: any[] = [];
    if (patient?.family_history) {
      try {
        existingHistory = Array.isArray(patient.family_history)
          ? patient.family_history
          : typeof patient.family_history === "string"
          ? JSON.parse(patient.family_history)
          : [];
      } catch {
        existingHistory = [];
      }
    }

    // Update the specific family member
    const updatedHistory = existingHistory.map((member: any) =>
      member.id === memberId
        ? {
            ...member,
            relationship,
            status: status || member.status,
            conditions: Array.isArray(conditions) ? conditions : conditions ? [conditions] : member.conditions,
            notes: notes !== undefined ? notes : member.notes,
            age: age !== undefined ? age : member.age,
            unsure: unsure !== undefined ? unsure : member.unsure,
          }
        : member
    );

    // Update patients table with updated family_history JSONB
    const { data: updatedPatient, error: updateError } = await supabase
      .from("patients")
      .update({
        family_history: updatedHistory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", patientId)
      .select("family_history")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update family member" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a family member by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Verify patient access (nurses can access all, doctors only owned/shared)
    const { hasAccess } = await verifyPatientAccess(userId, patientId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get existing family history from patients table
    const { data: patient, error: fetchError } = await supabase
      .from("patients")
      .select("family_history")
      .eq("id", patientId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Parse existing family history
    let existingHistory: any[] = [];
    if (patient?.family_history) {
      try {
        existingHistory = Array.isArray(patient.family_history)
          ? patient.family_history
          : typeof patient.family_history === "string"
          ? JSON.parse(patient.family_history)
          : [];
      } catch {
        existingHistory = [];
      }
    }

    // Remove the family member by ID
    const updatedHistory = existingHistory.filter(
      (member: any) => member.id !== memberId
    );

    // Update patients table with updated family_history JSONB
    const { data: updatedPatient, error: updateError } = await supabase
      .from("patients")
      .update({
        family_history: updatedHistory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", patientId)
      .select("family_history")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete family member" },
      { status: 500 }
    );
  }
}

