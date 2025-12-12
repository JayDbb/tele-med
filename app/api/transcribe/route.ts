import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { supabaseServer } from "../../../lib/supabaseServer";
import Replicate from "replicate";

export async function POST(req: NextRequest) {
  //   const { userId, error } = await requireUser(req);
  //   if (!userId) {
  //     return NextResponse.json({ error }, { status: 401 });
  //   }

  const replicateApiKey = process.env.REPLICATE_API_KEY;
  if (!replicateApiKey) {
    return NextResponse.json(
      { error: "Missing REPLICATE_API_KEY environment variable" },
      { status: 500 }
    );
  }

  const bucket = process.env.STORAGE_BUCKET;
  if (!bucket) {
    return NextResponse.json(
      { error: "Missing STORAGE_BUCKET environment variable" },
      { status: 500 }
    );
  }

  try {
    // Receive the path/identifier for audio in Supabase storage and optional visit_id
    const { path: audioPath, visit_id } = await req.json();

    if (!audioPath) {
      return NextResponse.json(
        { error: "Missing audio path/identifier" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Get a signed URL for the audio file (valid for 1 hour)
    // This is a direct download URL that Replicate can access
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(audioPath, 3600);

    if (urlError || !urlData) {
      console.error("URL error:", urlError);
      return NextResponse.json(
        { error: urlError?.message || "Failed to create signed URL for audio" },
        { status: 500 }
      );
    }

    const audioUrl = urlData.signedUrl;
    console.log("Using Supabase signed URL for transcription");

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: replicateApiKey,
    });

    // Transcribe audio using Whisper via Replicate
    const whisperModel =
      "vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c";

    // Use the signed URL directly - it should be accessible to Replicate
    const transcriptionInput = {
      audio: audioUrl,
    };

    const transcriptionPrediction = await replicate.run(whisperModel, {
      input: transcriptionInput,
    });

    console.log("Transcription prediction:", transcriptionPrediction);

    // Handle different response formats from Whisper models
    let transcript: string;
    if (typeof transcriptionPrediction === "string") {
      transcript = transcriptionPrediction;
    } else if (
      transcriptionPrediction &&
      typeof transcriptionPrediction === "object"
    ) {
      // Some models return an object with text or transcription property
      transcript =
        (transcriptionPrediction as any).text ||
        (transcriptionPrediction as any).transcription ||
        (transcriptionPrediction as any).output ||
        JSON.stringify(transcriptionPrediction);
    } else {
      return NextResponse.json(
        { error: "Transcription failed or returned invalid result" },
        { status: 500 }
      );
    }

    // Parse transcript using DeepSeek LLM via Replicate
    const deepSeekModel = "deepseek-ai/deepseek-v3.1";
    const parsingPrompt = `You are a medical transcription assistant. Parse the following medical consultation transcript into structured JSON format.

Extract the following information:
1. past_medical_history: Array of past medical conditions, surgeries, and relevant medical history
2. current_symptoms: Object or array describing current symptoms, including onset, duration, severity, and characteristics
3. physical_exam_findings: Object describing physical examination findings (vital signs, general appearance, system-specific findings)
4. diagnosis: String or array with the diagnosis or working diagnosis
5. treatment_plan: Array of treatment recommendations, procedures, and follow-up plans
6. prescriptions: Array of prescribed medications with dosage, frequency, and duration if mentioned

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no additional text):
{
  "past_medical_history": [],
  "current_symptoms": {},
  "physical_exam_findings": {},
  "diagnosis": "",
  "treatment_plan": [],
  "prescriptions": []
}

If any field is not mentioned in the transcript, use an empty array [] or empty object {} or empty string "" as appropriate.

Transcript:
${transcript}`;

    const parsingInput = {
      prompt: parsingPrompt,
      max_tokens: 8096,
      response_format: "json",
      temperature: 0.2,
    };

    const parsingPrediction = await replicate.run(deepSeekModel, {
      input: parsingInput,
    });

    // Extract the parsed JSON from the response
    let parsedData: any;
    const predictionStr =
      typeof parsingPrediction === "string"
        ? parsingPrediction
        : Array.isArray(parsingPrediction)
        ? parsingPrediction.join("")
        : String(parsingPrediction);

    try {
      // Try to parse as JSON directly
      parsedData = JSON.parse(predictionStr);
    } catch {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = predictionStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
        } catch {
          parsedData = { raw: predictionStr };
        }
      } else {
        parsedData = { raw: predictionStr };
      }
    }

    // Generate a short readable summary for review
    const summaryPrompt = `Create a concise, readable summary (2-3 paragraphs) of the following medical consultation. Include:
- Chief complaint and current symptoms
- Key findings from physical examination
- Diagnosis
- Treatment plan and any prescriptions

Keep it professional and easy to read for medical review.

Structured Data:
${JSON.stringify(parsedData, null, 2)}

Transcript:
${transcript}`;

    const summaryInput = {
      prompt: summaryPrompt,
      max_tokens: 1000,
      temperature: 0.3,
    };

    const summaryPrediction = await replicate.run(deepSeekModel, {
      input: summaryInput,
    });

    // Extract the summary text
    let summary: string;
    if (typeof summaryPrediction === "string") {
      summary = summaryPrediction;
    } else if (Array.isArray(summaryPrediction)) {
      summary = summaryPrediction.join("");
    } else if (summaryPrediction && typeof summaryPrediction === "object") {
      summary =
        (summaryPrediction as any).text ||
        (summaryPrediction as any).summary ||
        (summaryPrediction as any).output ||
        JSON.stringify(summaryPrediction);
    } else {
      summary = String(summaryPrediction);
    }

    // Clean up summary (remove markdown formatting if present)
    summary = summary
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`/g, "")
      .trim();

    // Save transcription to database if visit_id is provided
    if (visit_id) {
      const { error: transcriptError } = await supabase
        .from("transcripts")
        .upsert(
          {
            visit_id,
            raw_text: transcript,
            segments: {
              structured: parsedData,
              summary: summary,
            },
          },
          { onConflict: "visit_id" }
        );

      if (transcriptError) {
        console.error("Error saving transcript:", transcriptError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      transcript, // Full transcript
      structured: parsedData, // Structured JSON
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
