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

  try {
    // Receive the transcript text, required prompt, and optional visit_id
    const { transcript, prompt } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid transcript" },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid prompt" },
        { status: 400 }
      );
    }

    // Append the transcript to the provided prompt
    const combinedPrompt = `${prompt}${transcript}`;

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: replicateApiKey,
    });

    // Parse transcript and generate summary using DeepSeek LLM via Replicate
    const deepSeekModel = "deepseek-ai/deepseek-v3.1";
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
    let parsedData: any;
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

    console.log("Structured data:", structuredData);

    return NextResponse.json({
      structured: structuredData, // Structured JSON (without summary)
      summary, // Short readable summary for review
    });
  } catch (error: any) {
    console.error("Error parsing transcript:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to parse transcript" },
      { status: 500 }
    );
  }
}
