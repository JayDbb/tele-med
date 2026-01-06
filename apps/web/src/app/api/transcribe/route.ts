import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";
import Replicate from "replicate";
import type { TranscriptionPrediction, ParsedTranscriptionData } from "@/lib/types";

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
      const prediction = transcriptionPrediction as TranscriptionPrediction;
      transcript =
        prediction.text ||
        prediction.transcription ||
        prediction.output ||
        JSON.stringify(transcriptionPrediction);
    } else {
      return NextResponse.json(
        { error: "Transcription failed or returned invalid result" },
        { status: 500 }
      );
    }

    // Parse transcript and generate summary using DeepSeek LLM via Replicate
    const deepSeekModel = "deepseek-ai/deepseek-v3.1";
    const combinedPrompt = `You are a medical transcription assistant. Parse the following medical consultation transcript into structured JSON format and create a summary.

Extract the following information:
1. past_medical_history: Array of past medical conditions, surgeries, and relevant medical history
2. current_symptoms: Object or array describing current symptoms, including onset, duration, severity, and characteristics
3. physical_exam_findings: Object describing physical examination findings (vital signs, general appearance, system-specific findings)
4. diagnosis: String or array with the diagnosis or working diagnosis
5. treatment_plan: Array of treatment recommendations, procedures, and follow-up plans
6. prescriptions: Array of prescribed medications with dosage, frequency, and duration if mentioned
7. summary: A concise, readable summary (2-3 paragraphs) of the entire medical consultation session written in continuous prose. The summary should include the chief complaint and current symptoms, key findings from physical examination, diagnosis, and treatment plan with any prescriptions. Keep it professional and easy to read for medical review. Write in continuous text format without bullet points.

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no additional text):
{
  "past_medical_history": [],
  "current_symptoms": [{ symptom: string, characteristics: 'mild' | 'moderate' | 'severe' | 'unspecified' }],
  "physical_exam_findings": {},
  "diagnosis": "",
  "treatment_plan": [],
  "prescriptions": [],
  "summary": ""
}

If any field is not mentioned in the transcript, use an empty array [] or empty object {} or empty string "" as appropriate.

Transcript:
${transcript}`;

    const combinedInput = {
      prompt: combinedPrompt,
      max_tokens: 8096,
      response_format: "json",
      temperature: 0.2,
    };

    const combinedPrediction = await replicate.run(deepSeekModel, {
      input: combinedInput,
    });

    // Extract the parsed JSON from the response
    let parsedData: ParsedTranscriptionData;
    const predictionStr =
      typeof combinedPrediction === "string"
        ? combinedPrediction
        : Array.isArray(combinedPrediction)
        ? combinedPrediction.join("")
        : String(combinedPrediction);

    try {
      // Try to parse as JSON directly
      parsedData = JSON.parse(predictionStr);
      console.log("Parsed data:", parsedData);
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

    // Extract summary from parsed data, default to empty string if not present
    const summary = parsedData.summary || "";

    // Remove summary from structured data to keep them separate
    const { summary: _, ...structuredData } = parsedData;

    // Save transcription to database if visit_id is provided
    if (visit_id) {
      const { error: transcriptError } = await supabase
        .from("transcripts")
        .upsert(
          {
            visit_id,
            raw_text: transcript,
            segments: {
              structured: structuredData,
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

    // console.log("Transcript:", transcript);
    console.log("Structured data:", structuredData);
    // console.log("Summary:", summary);

    return NextResponse.json({
      transcript, // Full transcript
      structured: structuredData, // Structured JSON (without summary)
      summary, // Short readable summary for review
    });
  } catch (error) {
    console.error("Error processing transcript:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process transcript";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
