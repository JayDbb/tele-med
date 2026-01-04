import { NextRequest, NextResponse } from "next/server";
import { requireUser, verifyPatientAccess } from "../../../../../lib/auth";
import { supabaseServer } from "../../../../../lib/supabaseServer";

// GET all vaccines for a patient
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

  // Get vaccines from patients table JSONB column
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("vaccines")
    .eq("id", patientId)
    .maybeSingle();

  if (patientError) {
    return NextResponse.json({ error: patientError.message }, { status: 400 });
  }

  // Parse vaccines JSONB - it's already JSON, just ensure it's an array
  let vaccines = [];
  if (patient?.vaccines) {
    try {
      // JSONB is already parsed by Supabase, but handle both cases
      vaccines = Array.isArray(patient.vaccines)
        ? patient.vaccines
        : typeof patient.vaccines === "string"
        ? JSON.parse(patient.vaccines)
        : [];
    } catch {
      vaccines = [];
    }
  }

  return NextResponse.json(vaccines);
}

// POST - Create a new vaccine record
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
    const { name, date, dose, site, route, lotNumber, manufacturer } = body;

    if (!name || !date) {
      return NextResponse.json(
        { error: "Name and date are required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Verify patient access (nurses can access all, doctors only owned/shared)
    const { hasAccess } = await verifyPatientAccess(userId, patientId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get existing vaccines from patients table
    const { data: patient, error: fetchError } = await supabase
      .from("patients")
      .select("vaccines")
      .eq("id", patientId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Parse existing vaccines
    let existingVaccines: any[] = [];
    if (patient?.vaccines) {
      try {
        existingVaccines = Array.isArray(patient.vaccines)
          ? patient.vaccines
          : typeof patient.vaccines === "string"
          ? JSON.parse(patient.vaccines)
          : [];
      } catch {
        existingVaccines = [];
      }
    }

    // Create new vaccine entry
    const vaccineEntry = {
      id: crypto.randomUUID(),
      name,
      date: date || null,
      dose: dose || null,
      site: site || null,
      route: route || null,
      lotNumber: lotNumber || null,
      manufacturer: manufacturer || null,
      recorded_by: userId,
      created_at: new Date().toISOString(),
    };

    // Append to existing vaccines array
    const updatedVaccines = [...existingVaccines, vaccineEntry];

    // Update patients table with new vaccines JSONB
    const { data: updatedPatient, error: updateError } = await supabase
      .from("patients")
      .update({ 
        vaccines: updatedVaccines,
        updated_at: new Date().toISOString()
      })
      .eq("id", patientId)
      .select("vaccines")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, vaccine: vaccineEntry });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create vaccine" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a vaccine by ID
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
    const vaccineId = searchParams.get("vaccineId");

    if (!vaccineId) {
      return NextResponse.json(
        { error: "Vaccine ID is required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Verify patient access (nurses can access all, doctors only owned/shared)
    const { hasAccess } = await verifyPatientAccess(userId, patientId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get existing vaccines from patients table
    const { data: patient, error: fetchError } = await supabase
      .from("patients")
      .select("vaccines")
      .eq("id", patientId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Parse existing vaccines
    let existingVaccines: any[] = [];
    if (patient?.vaccines) {
      try {
        existingVaccines = Array.isArray(patient.vaccines)
          ? patient.vaccines
          : typeof patient.vaccines === "string"
          ? JSON.parse(patient.vaccines)
          : [];
      } catch {
        existingVaccines = [];
      }
    }

    // Remove the vaccine by ID
    const updatedVaccines = existingVaccines.filter(
      (vaccine: any) => vaccine.id !== vaccineId
    );

    // Update patients table with updated vaccines JSONB
    const { data: updatedPatient, error: updateError } = await supabase
      .from("patients")
      .update({ 
        vaccines: updatedVaccines,
        updated_at: new Date().toISOString()
      })
      .eq("id", patientId)
      .select("vaccines")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete vaccine" },
      { status: 500 }
    );
  }
}

