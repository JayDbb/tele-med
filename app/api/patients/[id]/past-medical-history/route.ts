import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../../../lib/auth";
import { supabaseServer } from "../../../../../lib/supabaseServer";

// GET all medical conditions for a patient
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = supabaseServer();

  // Verify patient access (owned or shared)
  const { data: patientOwned } = await supabase
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .eq("clinician_id", userId)
    .maybeSingle();

  if (!patientOwned) {
    const { data: shareRow } = await supabase
      .from("patient_shares")
      .select("patient_id")
      .eq("patient_id", patientId)
      .eq("shared_user_id", userId)
      .maybeSingle();

    if (!shareRow) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  // Get past medical history from patients table JSONB column
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("past_medical_history")
    .eq("id", patientId)
    .maybeSingle();

  if (patientError) {
    return NextResponse.json({ error: patientError.message }, { status: 400 });
  }

  // Parse past_medical_history JSONB - it's already JSON, just ensure it's an array
  let conditions = [];
  if (patient?.past_medical_history) {
    try {
      // JSONB is already parsed by Supabase, but handle both cases
      conditions = Array.isArray(patient.past_medical_history)
        ? patient.past_medical_history
        : typeof patient.past_medical_history === "string"
        ? JSON.parse(patient.past_medical_history)
        : [];
    } catch {
      conditions = [];
    }
  }

  return NextResponse.json(conditions);
}

// POST - Create a new medical condition
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
    const {
      condition,
      code,
      category,
      status,
      date,
      impact,
      source,
      description,
      relevance,
      treatment,
      complications,
      careGaps,
    } = body;

    if (!condition || !status) {
      return NextResponse.json(
        { error: "Condition and status are required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Verify patient access
    const { data: patientOwned } = await supabase
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .eq("clinician_id", userId)
      .maybeSingle();

    if (!patientOwned) {
      const { data: shareRow } = await supabase
        .from("patient_shares")
        .select("patient_id")
        .eq("patient_id", patientId)
        .eq("shared_user_id", userId)
        .maybeSingle();

      if (!shareRow) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    // Get existing past medical history from patients table
    const { data: patient, error: fetchError } = await supabase
      .from("patients")
      .select("past_medical_history")
      .eq("id", patientId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Parse existing conditions
    let existingConditions: any[] = [];
    if (patient?.past_medical_history) {
      try {
        existingConditions = Array.isArray(patient.past_medical_history)
          ? patient.past_medical_history
          : typeof patient.past_medical_history === "string"
          ? JSON.parse(patient.past_medical_history)
          : [];
      } catch {
        existingConditions = [];
      }
    }

    // Helper function to get icon and iconBg based on category/condition
    const getIconAndBg = (category: string, condition: string) => {
      const conditionLower = condition.toLowerCase();
      const categoryLower = category?.toLowerCase() || "";

      if (conditionLower.includes("diabetes") || conditionLower.includes("glucose")) {
        return { icon: "glucose", iconBg: "bg-red-50 text-red-600" };
      }
      if (conditionLower.includes("hypertension") || conditionLower.includes("blood pressure")) {
        return { icon: "favorite", iconBg: "bg-orange-50 text-orange-600" };
      }
      if (conditionLower.includes("lipid") || conditionLower.includes("cholesterol")) {
        return { icon: "water_drop", iconBg: "bg-yellow-50 text-yellow-600" };
      }
      if (conditionLower.includes("gerd") || conditionLower.includes("reflux") || conditionLower.includes("stomach")) {
        return { icon: "stomach", iconBg: "bg-green-50 text-green-600" };
      }
      if (conditionLower.includes("arthritis") || conditionLower.includes("joint") || conditionLower.includes("bone")) {
        return { icon: "bone", iconBg: "bg-purple-50 text-purple-600" };
      }
      if (categoryLower.includes("surgical") || conditionLower.includes("surgery") || conditionLower.includes("ectomy")) {
        return { icon: "surgical", iconBg: "bg-gray-50 text-gray-600" };
      }
      if (categoryLower.includes("allergic") || conditionLower.includes("allergy")) {
        return { icon: "air", iconBg: "bg-blue-50 text-blue-600" };
      }
      if (categoryLower.includes("nutritional") || conditionLower.includes("vitamin")) {
        return { icon: "wb_sunny", iconBg: "bg-yellow-50 text-yellow-600" };
      }
      return { icon: "medical_information", iconBg: "bg-blue-50 text-blue-600" };
    };

    const { icon, iconBg } = getIconAndBg(category || "", condition);

    // Create new condition entry
    const conditionEntry = {
      id: crypto.randomUUID(),
      condition,
      code: code || null,
      category: category || "Chronic",
      status: status || "Active",
      date: date || null,
      impact: impact || "Medium",
      source: source || "Clinician",
      icon,
      iconBg,
      description: description || null,
      relevance: relevance || null,
      treatment: Array.isArray(treatment) ? treatment : treatment ? [treatment] : [],
      complications: complications || null,
      careGaps: Array.isArray(careGaps) ? careGaps : [],
      recorded_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Append to existing conditions array
    const updatedConditions = [...existingConditions, conditionEntry];

    // Update patients table with new past_medical_history JSONB
    const { data: updatedPatient, error: updateError } = await supabase
      .from("patients")
      .update({ past_medical_history: updatedConditions })
      .eq("id", patientId)
      .select("past_medical_history")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, condition: conditionEntry });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create condition" },
      { status: 500 }
    );
  }
}

// PUT - Update a medical condition
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
    const { conditionId, ...updates } = body;

    if (!conditionId) {
      return NextResponse.json(
        { error: "Condition ID is required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Verify patient access
    const { data: patientOwned } = await supabase
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .eq("clinician_id", userId)
      .maybeSingle();

    if (!patientOwned) {
      const { data: shareRow } = await supabase
        .from("patient_shares")
        .select("patient_id")
        .eq("patient_id", patientId)
        .eq("shared_user_id", userId)
        .maybeSingle();

      if (!shareRow) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    // Get existing past medical history
    const { data: patient, error: fetchError } = await supabase
      .from("patients")
      .select("past_medical_history")
      .eq("id", patientId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Parse existing conditions
    let existingConditions: any[] = [];
    if (patient?.past_medical_history) {
      try {
        existingConditions = Array.isArray(patient.past_medical_history)
          ? patient.past_medical_history
          : typeof patient.past_medical_history === "string"
          ? JSON.parse(patient.past_medical_history)
          : [];
      } catch {
        existingConditions = [];
      }
    }

    // Find and update the condition
    const conditionIndex = existingConditions.findIndex(
      (c: any) => c.id === conditionId
    );

    if (conditionIndex === -1) {
      return NextResponse.json(
        { error: "Condition not found" },
        { status: 404 }
      );
    }

    // Update the condition
    existingConditions[conditionIndex] = {
      ...existingConditions[conditionIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Update patients table
    const { data: updatedPatient, error: updateError } = await supabase
      .from("patients")
      .update({ past_medical_history: existingConditions })
      .eq("id", patientId)
      .select("past_medical_history")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      condition: existingConditions[conditionIndex],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update condition" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a medical condition
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
    const conditionId = searchParams.get("conditionId");

    if (!conditionId) {
      return NextResponse.json(
        { error: "Condition ID is required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Verify patient access
    const { data: patientOwned } = await supabase
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .eq("clinician_id", userId)
      .maybeSingle();

    if (!patientOwned) {
      const { data: shareRow } = await supabase
        .from("patient_shares")
        .select("patient_id")
        .eq("patient_id", patientId)
        .eq("shared_user_id", userId)
        .maybeSingle();

      if (!shareRow) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    // Get existing past medical history
    const { data: patient, error: fetchError } = await supabase
      .from("patients")
      .select("past_medical_history")
      .eq("id", patientId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Parse existing conditions
    let existingConditions: any[] = [];
    if (patient?.past_medical_history) {
      try {
        existingConditions = Array.isArray(patient.past_medical_history)
          ? patient.past_medical_history
          : typeof patient.past_medical_history === "string"
          ? JSON.parse(patient.past_medical_history)
          : [];
      } catch {
        existingConditions = [];
      }
    }

    // Filter out the condition to delete
    const updatedConditions = existingConditions.filter(
      (c: any) => c.id !== conditionId
    );

    // Update patients table
    const { data: updatedPatient, error: updateError } = await supabase
      .from("patients")
      .update({ past_medical_history: updatedConditions })
      .eq("id", patientId)
      .select("past_medical_history")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete condition" },
      { status: 500 }
    );
  }
}

