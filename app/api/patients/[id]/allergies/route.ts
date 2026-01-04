import { NextRequest, NextResponse } from "next/server";
import { requireUser, verifyPatientAccess } from "../../../../../lib/auth";
import { supabaseServer } from "../../../../../lib/supabaseServer";

// GET all allergies for a patient
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

  // Get allergies from patients table JSONB column
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("allergies")
    .eq("id", patientId)
    .maybeSingle();

  if (patientError) {
    return NextResponse.json({ error: patientError.message }, { status: 400 });
  }

  // Parse allergies JSONB - it's already JSON, just ensure it's an array
  let allergies = [];
  if (patient?.allergies) {
    try {
      // JSONB is already parsed by Supabase, but handle both cases
      allergies = Array.isArray(patient.allergies)
        ? patient.allergies
        : typeof patient.allergies === "string"
        ? JSON.parse(patient.allergies)
        : [];
    } catch {
      allergies = [];
    }
  }

  return NextResponse.json(allergies);
}

// POST - Create a new allergy
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
    const { name, severity, type, reactions, date, notes, status } = body;

    if (!name || !severity) {
      return NextResponse.json(
        { error: "Name and severity are required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Verify patient access (nurses can access all, doctors only owned/shared)
    const { hasAccess } = await verifyPatientAccess(userId, patientId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get existing allergies from patients table
    const { data: patient, error: fetchError } = await supabase
      .from("patients")
      .select("allergies")
      .eq("id", patientId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Parse existing allergies
    let existingAllergies: any[] = [];
    if (patient?.allergies) {
      try {
        existingAllergies = Array.isArray(patient.allergies)
          ? patient.allergies
          : typeof patient.allergies === "string"
          ? JSON.parse(patient.allergies)
          : [];
      } catch {
        existingAllergies = [];
      }
    }

    // Create new allergy entry
    const allergyEntry = {
      id: crypto.randomUUID(),
      name,
      severity,
      type: type || "Unknown",
      reactions: Array.isArray(reactions)
        ? reactions.join(", ")
        : reactions || "",
      status: status || "Active",
      date: date || null,
      notes: notes || null,
      recorded_by: userId,
      created_at: new Date().toISOString(),
    };

    // Append to existing allergies array
    const updatedAllergies = [...existingAllergies, allergyEntry];

    // Update patients table with new allergies JSONB
    const { data: updatedPatient, error: updateError } = await supabase
      .from("patients")
      .update({ allergies: updatedAllergies })
      .eq("id", patientId)
      .select("allergies")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, allergy: allergyEntry });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create allergy" },
      { status: 500 }
    );
  }
}

// DELETE - Remove an allergy by ID
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
    const allergyId = searchParams.get("allergyId");

    if (!allergyId) {
      return NextResponse.json(
        { error: "Allergy ID is required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Verify patient access (nurses can access all, doctors only owned/shared)
    const { hasAccess } = await verifyPatientAccess(userId, patientId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get existing allergies from patients table
    const { data: patient, error: fetchError } = await supabase
      .from("patients")
      .select("allergies")
      .eq("id", patientId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Parse existing allergies
    let existingAllergies: any[] = [];
    if (patient?.allergies) {
      try {
        existingAllergies = Array.isArray(patient.allergies)
          ? patient.allergies
          : typeof patient.allergies === "string"
          ? JSON.parse(patient.allergies)
          : [];
      } catch {
        existingAllergies = [];
      }
    }

    // Remove the allergy by ID
    const updatedAllergies = existingAllergies.filter(
      (allergy: any) => allergy.id !== allergyId
    );

    // Update patients table with updated allergies JSONB
    const { data: updatedPatient, error: updateError } = await supabase
      .from("patients")
      .update({ allergies: updatedAllergies })
      .eq("id", patientId)
      .select("allergies")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete allergy" },
      { status: 500 }
    );
  }
}
