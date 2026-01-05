import { NextRequest, NextResponse } from "next/server";
import { requireUser, verifyPatientAccess } from "../../../../../lib/auth";
import { supabaseServer } from "../../../../../lib/supabaseServer";

// Helper function to extract number from string
const extractNumber = (
  value: string | number | null | undefined
): number | null => {
  if (typeof value === "number") return value;
  if (value === null || value === undefined) return null;
  const str = value.toString().trim();
  if (str === "" || str === "null" || str === "undefined") return null;
  const match = str.match(/\d+\.?\d*/);
  return match ? parseFloat(match[0]) : null;
};

// Helper function to extract blood pressure
const extractBloodPressure = (
  value: string | null | undefined
): string | null => {
  if (!value) return null;
  const str = value.toString();
  // Match patterns like "120/80", "120 over 80", "120-80"
  const match = str.match(/(\d+)\s*[\/\-]\s*(\d+)/);
  if (match) {
    return `${match[1]}/${match[2]}`;
  }
  return null;
};

// Helper function to extract vitals from structured data
const extractVitalsFromStructured = (structured: any) => {
  const vitals: any = {
    bp: null,
    hr: null,
    temp: null,
    weight: null,
  };

  if (!structured?.physical_exam_findings) return vitals;

  const findings = structured.physical_exam_findings;

  // Check both vital_signs nested object and top-level of findings
  const vitalSigns = findings.vital_signs || {};

  // Helper to get value from either location
  const getVitalValue = (key: string, altKey?: string) => {
    // First check vital_signs nested object
    if (vitalSigns[key]) return vitalSigns[key];
    if (altKey && vitalSigns[altKey]) return vitalSigns[altKey];

    // Then check top-level of findings (some data might be stored there)
    if (findings[key]) return findings[key];
    if (altKey && findings[altKey]) return findings[altKey];

    return null;
  };

  // Extract blood pressure
  const bpValue = getVitalValue("blood_pressure", "bp");
  if (bpValue) {
    vitals.bp = extractBloodPressure(bpValue);
  }

  // Extract heart rate
  const hrValue = getVitalValue("heart_rate", "hr");
  if (hrValue) {
    vitals.hr = extractNumber(hrValue);
  }

  // Extract temperature
  const tempValue = getVitalValue("temperature", "temp");
  if (tempValue) {
    vitals.temp = extractNumber(tempValue);
  }

  // Extract weight
  const weightValue = getVitalValue("weight");
  if (weightValue) {
    vitals.weight = extractNumber(weightValue);
  }

  return vitals;
};

// GET all vitals for a patient
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

  // Verify patient access (nurses can access all, doctors only owned/shared)
  const { hasAccess } = await verifyPatientAccess(userId, patientId);
  if (!hasAccess) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get all visits for the patient
  const { data: visits, error: visitsError } = await supabase
    .from("visits")
    .select("id, created_at")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (visitsError) {
    return NextResponse.json({ error: visitsError.message }, { status: 400 });
  }

  // Extract vitals from each visit
  const vitalsHistory = await Promise.all(
    (visits || []).map(async (visit: any) => {
      let vitals: any = {
        bp: null,
        hr: null,
        temp: null,
        weight: null,
      };

      // Try to fetch transcript
      try {
        const { data: transcript } = await supabase
          .from("transcripts")
          .select("segments")
          .eq("visit_id", visit.id)
          .maybeSingle();

        if (transcript?.segments) {
          // Handle both structured in segments and segments.structured
          const structured =
            transcript.segments.structured || transcript.segments;
          if (structured) {
            const extracted = extractVitalsFromStructured(structured);
            console.log(`Visit ${visit.id} - Extracted vitals:`, extracted);
            console.log(
              `Visit ${visit.id} - Structured data:`,
              JSON.stringify(structured, null, 2).substring(0, 500)
            );
            // Merge extracted vitals, preferring non-null values
            if (extracted.bp) vitals.bp = extracted.bp;
            if (extracted.hr) vitals.hr = extracted.hr;
            if (extracted.temp) vitals.temp = extracted.temp;
            if (extracted.weight) vitals.weight = extracted.weight;
          }
        }
      } catch (error) {
        // Continue if transcript fetch fails
        console.warn(
          `Failed to fetch transcript for visit ${visit.id}:`,
          error
        );
      }

      // Try to fetch notes
      try {
        const { data: note } = await supabase
          .from("notes")
          .select("note")
          .eq("visit_id", visit.id)
          .maybeSingle();

        if (note?.note) {
          // Try to extract from note entries
          const noteEntries = Array.isArray(note.note) ? note.note : [];
          for (const entry of noteEntries) {
            if (entry.section === "objective" && entry.content) {
              let content = entry.content;

              // Try to parse if it's a string
              if (typeof content === "string") {
                try {
                  content = JSON.parse(content);
                } catch {
                  // Not JSON, might be plain text - try to extract from text
                  // Handle format like "BP: 101\nHR: 20\nTemp: 90\nWeight: 190"
                  // Also handle "Blood Pressure: 120/80" format

                  const textContent = entry.content;

                  // Extract BP - handle both "BP: 120/80" and "BP: 120" formats
                  // Also handle "BP: 101" (single number - might be systolic only)
                  const bpMatch1 = textContent.match(
                    /bp[:\s]+(\d+)\s*[\/\-]\s*(\d+)/i
                  );
                  const bpMatch2 = textContent.match(
                    /blood\s*pressure[:\s]+(\d+)\s*[\/\-]\s*(\d+)/i
                  );
                  if (bpMatch1 && !vitals.bp) {
                    vitals.bp = `${bpMatch1[1]}/${bpMatch1[2]}`;
                  } else if (bpMatch2 && !vitals.bp) {
                    vitals.bp = `${bpMatch2[1]}/${bpMatch2[2]}`;
                  } else {
                    // Try single number format (systolic only) - like "BP: 101"
                    const bpSingle = textContent.match(/bp[:\s]+(\d+)/i);
                    if (bpSingle && !vitals.bp) {
                      // If only one number, we'll store it as-is (could be systolic)
                      // But for display, we might want to show it differently
                      vitals.bp = `${bpSingle[1]}/--`;
                    }
                  }

                  // Extract HR - handle "HR: 20" format
                  const hrMatch1 = textContent.match(/hr[:\s]+(\d+)/i);
                  const hrMatch2 = textContent.match(
                    /heart\s*rate[:\s]+(\d+)/i
                  );
                  if (hrMatch1 && !vitals.hr) {
                    vitals.hr = parseFloat(hrMatch1[1]);
                  } else if (hrMatch2 && !vitals.hr) {
                    vitals.hr = parseFloat(hrMatch2[1]);
                  }

                  // Extract Temp - handle "Temp: 90" format
                  const tempMatch1 = textContent.match(
                    /temp[:\s]+(\d+\.?\d*)/i
                  );
                  const tempMatch2 = textContent.match(
                    /temperature[:\s]+(\d+\.?\d*)/i
                  );
                  if (tempMatch1 && !vitals.temp) {
                    vitals.temp = parseFloat(tempMatch1[1]);
                  } else if (tempMatch2 && !vitals.temp) {
                    vitals.temp = parseFloat(tempMatch2[1]);
                  }

                  // Extract Weight - handle "Weight: 190" format
                  const weightMatch = textContent.match(
                    /weight[:\s]+(\d+\.?\d*)/i
                  );
                  if (weightMatch && !vitals.weight) {
                    vitals.weight = parseFloat(weightMatch[1]);
                  }

                  continue;
                }
              }

              // Check if content has physical_exam_findings
              if (content?.physical_exam_findings) {
                const extracted = extractVitalsFromStructured({
                  physical_exam_findings: content.physical_exam_findings,
                });
                // Only use if we found values
                if (
                  extracted.bp ||
                  extracted.hr ||
                  extracted.temp ||
                  extracted.weight
                ) {
                  vitals = { ...vitals, ...extracted };
                }
              }
            }
          }
        }
      } catch (error) {
        // Continue if note fetch fails
        console.warn(`Failed to fetch notes for visit ${visit.id}:`, error);
      }

      // Only return if we have at least one vital
      if (vitals.bp || vitals.hr || vitals.temp || vitals.weight) {
        return {
          visit_id: visit.id,
          recordedAt: visit.created_at,
          ...vitals,
        };
      }

      return null;
    })
  );

  // Filter out null entries and return
  const validVitals = vitalsHistory.filter((v) => v !== null);

  console.log(
    `Found ${
      validVitals.length
    } vitals records for patient ${patientId} out of ${
      visits?.length || 0
    } visits`
  );
  if (validVitals.length > 0) {
    console.log(
      "Sample vitals record:",
      JSON.stringify(validVitals[0], null, 2)
    );
  }

  return NextResponse.json(validVitals);
}

// POST - Create a new vitals record
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
    const { bp, hr, temp, weight, visit_id } = body;

    const supabase = supabaseServer();

    // Verify patient access (nurses can access all, doctors only owned/shared)
    const { hasAccess } = await verifyPatientAccess(userId, patientId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get existing vitals from patients table (if vitals column exists)
    const { data: patient, error: fetchError } = await supabase
      .from("patients")
      .select("vitals")
      .eq("id", patientId)
      .maybeSingle();

    if (fetchError && !fetchError.message.includes("column")) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Parse existing vitals (if column exists)
    let existingVitals: any[] = [];
    if (patient?.vitals) {
      try {
        existingVitals = Array.isArray(patient.vitals)
          ? patient.vitals
          : typeof patient.vitals === "string"
          ? JSON.parse(patient.vitals)
          : [];
      } catch {
        existingVitals = [];
      }
    }

    // Create new vitals entry
    const vitalsEntry = {
      id: crypto.randomUUID(),
      visit_id: visit_id || null,
      bp: bp || null,
      hr: hr ? extractNumber(hr) : null,
      temp: temp ? extractNumber(temp) : null,
      weight: weight ? extractNumber(weight) : null,
      recorded_by: userId,
      recordedAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // Append to existing vitals array
    const updatedVitals = [vitalsEntry, ...existingVitals];

    // Try to update patients table with new vitals JSONB (if column exists)
    try {
      const { data: updatedPatient, error: updateError } = await supabase
        .from("patients")
        .update({
          vitals: updatedVitals,
          updated_at: new Date().toISOString(),
        })
        .eq("id", patientId)
        .select("vitals")
        .maybeSingle();

      if (updateError && !updateError.message.includes("column")) {
        console.warn("Failed to update vitals in patients table:", updateError);
      }
    } catch (updateErr: any) {
      // If vitals column doesn't exist, that's okay - vitals will be extracted from visits
      if (!updateErr.message?.includes("column")) {
        console.warn("Failed to save vitals to patients table:", updateErr);
      }
    }

    return NextResponse.json({ success: true, vitals: vitalsEntry });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create vitals" },
      { status: 500 }
    );
  }
}
