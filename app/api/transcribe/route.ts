import { NextRequest, NextResponse } from "next/server";

/**
 * Legacy route that combines dictation and parsing for backward compatibility.
 * This route calls the modular dictate and parse endpoints internally.
 *
 * For new implementations, use:
 * - POST /api/transcribe/dictate - for audio transcription
 * - POST /api/transcribe/parse - for transcript parsing
 */
export async function POST(req: NextRequest) {
  try {
    // Receive the path/identifier for audio in Supabase storage and optional visit_id
    const { path: audioPath, visit_id } = await req.json();

    if (!audioPath) {
      return NextResponse.json(
        { error: "Missing audio path/identifier" },
        { status: 400 }
      );
    }

    // Construct base URL from request
    const baseUrl = req.nextUrl.origin;

    // Step 1: Transcribe audio using the dictate endpoint
    const dictateResponse = await fetch(`${baseUrl}/api/transcribe/dictate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: audioPath }),
    });

    if (!dictateResponse.ok) {
      const errorData = await dictateResponse.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to transcribe audio" },
        { status: dictateResponse.status }
      );
    }

    const { transcript } = await dictateResponse.json();

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcription returned empty result" },
        { status: 500 }
      );
    }

    // Step 2: Parse transcript using the parse endpoint with default medical prompt
    const defaultMedicalPrompt = `You are a medical transcription assistant. Parse the following medical consultation transcript into structured JSON format and create a summary.

Extract the following information:
1. past_medical_history: Array of past medical conditions, surgeries, and relevant medical history
2. current_symptoms: Object or array describing current symptoms, including onset, duration, severity, and characteristics
3. physical_exam_findings: Object describing physical examination findings (vital signs, general appearance, system-specific findings)
4. diagnosis: String or array with the diagnosis or working diagnosis
5. treatment_plan: Array of treatment recommendations, procedures, and follow-up plans
6. prescriptions: Array of prescribed medications with dosage, frequency, and duration if mentioned
7. summary: A concise, readable summary (2-3 paragraphs) of the entire medical consultation session written in continuous prose. The summary should include the chief complaint and current symptoms, key findings from physical examination, diagnosis, and treatment plan with any prescriptions. Keep it professional and easy to read for medical review. Write in continuous text format without bullet points.

IMPORTANT - Unit Assumptions and Conversions:
- Blood Pressure (BP): Assume mmHg if unit not specified. If given in other units, convert to mmHg (e.g., kPa to mmHg: multiply by 7.5).
- Heart Rate (HR): Assume bpm (beats per minute) if unit not specified. If given in other units, convert to bpm.
- Temperature: Assume °F (Fahrenheit) if unit not specified. If given in °C (Celsius), convert to °F: (°C × 9/5) + 32.
- Weight: Assume lbs (pounds) if unit not specified. If given in kg (kilograms), convert to lbs: kg × 2.20462. If given in other units, convert appropriately.

For vital signs in physical_exam_findings:
- Extract ONLY the numeric values in the assumed/converted units (remove units from the value itself)
- Blood pressure format: "120/80" (systolic/diastolic)
- Heart rate format: "72" (just the number)
- Temperature format: "98.6" (just the number)
- Weight format: "165" (just the number)

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no additional text):
{
  "past_medical_history": [],
  "current_symptoms": [{ "symptom": "string", "characteristics": "mild | moderate | severe | unspecified" }],
  "physical_exam_findings": {},
  "diagnosis": "",
  "treatment_plan": [],
  "prescriptions": [],
  "summary": ""
}

If any field is not mentioned in the transcript, use an empty array [] or empty object {} or empty string "" as appropriate.

Transcript:
`;

    const parseResponse = await fetch(`${baseUrl}/api/transcribe/parse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcript,
        prompt: defaultMedicalPrompt,
        visit_id,
      }),
    });

    if (!parseResponse.ok) {
      const errorData = await parseResponse.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to parse transcript" },
        { status: parseResponse.status }
      );
    }

    const { structured, summary } = await parseResponse.json();

    // Return combined result for backward compatibility
    return NextResponse.json({
      transcript, // Full transcript
      structured, // Structured JSON (without summary)
      summary, // Short readable summary for review
    });
  } catch (error: any) {
    console.error("Error processing transcript:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process transcript" },
      { status: 500 }
    );
  }
}
