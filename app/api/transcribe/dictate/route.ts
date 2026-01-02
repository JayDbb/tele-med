import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";
import Replicate from "replicate";

export async function POST(req: NextRequest) {
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
    // Receive the path/identifier for audio in Supabase storage
    const { path: audioPath } = await req.json();

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

    return NextResponse.json({
      transcript,
    });
  } catch (error: any) {
    console.error("Error transcribing audio:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}

