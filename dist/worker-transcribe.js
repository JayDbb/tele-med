"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// scripts/worker-transcribe.ts
var import_dotenv = __toESM(require("dotenv"));
var import_supabase_js2 = require("@supabase/supabase-js");

// lib/transcribeWorker.ts
var import_replicate = __toESM(require("replicate"));

// lib/supabaseServer.ts
var import_supabase_js = require("@supabase/supabase-js");
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabaseServer = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Service role credentials missing");
  }
  return (0, import_supabase_js.createClient)(supabaseUrl, supabaseKey);
};

// lib/transcribeWorker.ts
var WHISPER_MODEL = "vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c";
async function processJob(jobId, options) {
  const supabase2 = (options == null ? void 0 : options.supabaseClient) ?? supabaseServer();
  const simulate2 = (options == null ? void 0 : options.simulate) ?? false;
  const replicateApiKey = (options == null ? void 0 : options.replicateApiKey) ?? process.env.REPLICATE_API_KEY;
  try {
    const jobData = (options == null ? void 0 : options.jobData) ?? null;
    const skipJobUpdates = !!jobData;
    if (!skipJobUpdates) {
      await supabase2.from("transcription_jobs").update({ status: "processing", updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", jobId);
    }
    let job = jobData;
    if (!job) {
      const { data: jobRow, error: jobErr } = await supabase2.from("transcription_jobs").select("*").eq("id", jobId).maybeSingle();
      if (jobErr || !jobRow)
        throw new Error((jobErr == null ? void 0 : jobErr.message) || "Job not found");
      job = jobRow;
    }
    const path = job.path;
    const visit_id = job.visit_id;
    let transcriptText = null;
    let parseStructured = null;
    let parseSummary = null;
    if (replicateApiKey && !simulate2) {
      const bucket = process.env.STORAGE_BUCKET;
      if (!bucket)
        throw new Error("STORAGE_BUCKET not configured");
      const { data: urlData, error: urlError } = await supabase2.storage.from(bucket).createSignedUrl(path, 3600);
      if (urlError || !urlData)
        throw new Error((urlError == null ? void 0 : urlError.message) || "Failed to create signed URL");
      const audioUrl = urlData.signedUrl;
      const replicate = new import_replicate.default({ auth: replicateApiKey });
      const transcriptionPrediction = await replicate.run(WHISPER_MODEL, { input: { audio: audioUrl } });
      if (typeof transcriptionPrediction === "string")
        transcriptText = transcriptionPrediction;
      else if (transcriptionPrediction && typeof transcriptionPrediction === "object")
        transcriptText = transcriptionPrediction.text || transcriptionPrediction.transcription || transcriptionPrediction.output || JSON.stringify(transcriptionPrediction);
      if (transcriptText) {
        const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const defaultMedicalPrompt = `You are a medical transcription assistant. Parse the following medical consultation transcript into structured JSON format and create a summary.

Extract the following information:
1. past_medical_history: Array of past medical conditions, surgeries, and relevant medical history
2. current_symptoms: Object or array describing current symptoms, including onset, duration, severity, and characteristics
3. physical_exam_findings: Object describing physical examination findings (vital signs, general appearance, system-specific findings)
4. diagnosis: String or array with the diagnosis or working diagnosis
5. treatment_plan: Array of treatment recommendations, procedures, and follow-up plans
6. prescriptions: Array of prescribed medications with dosage, frequency, and duration if mentioned
7. summary: A concise, readable summary (2-3 paragraphs) of the entire medical consultation session written in continuous prose.

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no additional text).

Transcript:
`;
        const parseResp = await fetch(`${base}/api/transcribe/parse`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: transcriptText, prompt: defaultMedicalPrompt, visit_id }) });
        if (parseResp.ok) {
          const parsed = await parseResp.json();
          parseStructured = parsed.structured || null;
          parseSummary = parsed.summary || null;
        }
      }
    }
    if (simulate2) {
      transcriptText = transcriptText || `SIMULATED TRANSCRIPT for ${path} at ${(/* @__PURE__ */ new Date()).toISOString()}`;
      parseStructured = {
        past_medical_history: ["hypertension"],
        current_symptoms: [{ symptom: "cough", characteristics: "mild" }],
        physical_exam_findings: { lungs: "clear" },
        diagnosis: "Acute bronchitis",
        treatment_plan: ["Rest", "Fluids"],
        prescriptions: [{ name: "Amoxicillin", dosage: "500mg", frequency: "TID", duration: "7 days" }],
        summary: "Patient with cough; likely acute bronchitis. Recommend rest and fluids. Prescribed amoxicillin."
      };
      parseSummary = parseStructured.summary;
    }
    let transcriptRow = null;
    try {
      const resp = await supabase2.from("transcripts").insert({ visit_id, provider: replicateApiKey && !simulate2 ? "replicate/whisper" : "local_stub", provider_metadata: replicateApiKey && !simulate2 ? { model: WHISPER_MODEL } : {}, text: transcriptText }).select().maybeSingle();
      if (resp.error)
        throw resp.error;
      transcriptRow = resp.data;
    } catch (e) {
      const fs = await import("fs");
      const os = await import("os");
      const tmpDir = os.tmpdir();
      const outPath = `${tmpDir}/telemed_transcripts.json`;
      let arr = [];
      if (fs.existsSync(outPath)) {
        const raw = fs.readFileSync(outPath, "utf8");
        try {
          arr = JSON.parse(raw);
        } catch {
          arr = [];
        }
      }
      const entry = { id: `local-${Date.now()}-${Math.floor(Math.random() * 1e3)}`, visit_id, text: transcriptText, created_at: (/* @__PURE__ */ new Date()).toISOString(), fallback: true };
      arr.unshift(entry);
      fs.writeFileSync(outPath, JSON.stringify(arr, null, 2), "utf8");
      transcriptRow = entry;
    }
    const notesCreated = [];
    try {
      const toInsert = [];
      toInsert.push({ visit_id, author_id: null, section: "transcript", content: transcriptText, source: "transcription" });
      if (parseSummary)
        toInsert.push({ visit_id, author_id: null, section: "summary", content: parseSummary, source: "transcription" });
      if (parseStructured) {
        if (parseStructured.diagnosis) {
          const dx = Array.isArray(parseStructured.diagnosis) ? parseStructured.diagnosis.join("; ") : String(parseStructured.diagnosis);
          toInsert.push({ visit_id, author_id: null, section: "assessment", content: dx, source: "transcription" });
        }
        if (Array.isArray(parseStructured.treatment_plan)) {
          for (const item of parseStructured.treatment_plan) {
            toInsert.push({ visit_id, author_id: null, section: "plan", content: String(item), source: "transcription" });
          }
        }
        if (Array.isArray(parseStructured.prescriptions)) {
          for (const p of parseStructured.prescriptions) {
            const txt = `${p.name || p.medication || ""}${p.dosage ? ` ${p.dosage}` : ""}${p.frequency ? ` ${p.frequency}` : ""}${p.duration ? ` for ${p.duration}` : ""}`.trim();
            toInsert.push({ visit_id, author_id: null, section: "plan", content: `Prescription: ${txt}`, source: "transcription" });
          }
        }
      }
      const { data: notesData, error: notesErr } = await supabase2.from("visit_notes").insert(toInsert).select();
      if (notesErr)
        throw notesErr;
      if (notesData)
        notesCreated.push(...notesData);
    } catch (e) {
      const fs = await import("fs");
      const os = await import("os");
      const tmpDir = os.tmpdir();
      const outPath = `${tmpDir}/telemed_transcripts_notes.json`;
      let arr = [];
      if (fs.existsSync(outPath)) {
        const raw = fs.readFileSync(outPath, "utf8");
        try {
          arr = JSON.parse(raw);
        } catch {
          arr = [];
        }
      }
      const entry = { id: `local-note-${Date.now()}-${Math.floor(Math.random() * 1e3)}`, visit_id, content: parseSummary || transcriptText, section: parseSummary ? "summary" : "transcript", source: "transcription", created_at: (/* @__PURE__ */ new Date()).toISOString(), fallback: true };
      arr.unshift(entry);
      fs.writeFileSync(outPath, JSON.stringify(arr, null, 2), "utf8");
      notesCreated.push(entry);
    }
    if (!skipJobUpdates) {
      await supabase2.from("transcription_jobs").update({ status: "completed", result: { transcript: transcriptRow, notes: notesCreated }, processed_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", jobId);
    }
    return { transcript: transcriptRow, notes: notesCreated };
  } catch (err) {
    console.error("Error processing job", jobId, err);
    if (!(options == null ? void 0 : options.jobData)) {
      await supabaseServer().from("transcription_jobs").update({ status: "failed", error: String(err), updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", jobId);
    }
    throw err;
  }
}

// scripts/worker-transcribe.ts
import_dotenv.default.config({ path: ".env.local" });
var argv = process.argv.slice(2);
var once = argv.includes("--once");
var simulate = argv.includes("--simulate");
var intervalArg = argv.find((a) => a.startsWith("--interval="));
var intervalMs = intervalArg ? parseInt(intervalArg.split("=")[1], 10) : 5e3;
var supabase = (() => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  return (0, import_supabase_js2.createClient)(url, key);
})();
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
async function main() {
  console.log(`Worker starting (once=${once}, simulate=${simulate}, interval=${intervalMs})`);
  let processedOne = false;
  while (true) {
    try {
      const { data: job, error } = await supabase.from("transcription_jobs").select("*").eq("status", "pending").order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (error)
        throw error;
      if (!job) {
        if (once && processedOne)
          break;
        await sleep(intervalMs);
        continue;
      }
      const { data: updated, error: updErr } = await supabase.from("transcription_jobs").update({ status: "processing", updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", job.id).eq("status", "pending");
      if (updErr) {
        console.warn("Failed to claim job, will retry", updErr);
        await sleep(1e3);
        continue;
      }
      console.log("Processing job", job.id);
      processedOne = true;
      try {
        await processJob(job.id, { simulate, supabaseClient: supabase });
        console.log("Job processed", job.id);
      } catch (err) {
        console.error("Error processing job", job.id, (err == null ? void 0 : err.message) || err);
        await supabase.from("transcription_jobs").update({ status: "failed", error: String((err == null ? void 0 : err.message) || err), updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", job.id);
      }
      if (once)
        break;
    } catch (err) {
      console.error("Worker loop error", (err == null ? void 0 : err.message) || err);
      await sleep(2e3);
    }
  }
  console.log("Worker exiting");
}
main().catch((e) => {
  console.error("Fatal worker error", e);
  process.exit(1);
});
