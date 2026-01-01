import Replicate from 'replicate'
import { supabaseServer } from './supabaseServer'

const WHISPER_MODEL = 'vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c'

export async function processJob(jobId: string, options?: { simulate?: boolean, replicateApiKey?: string }) {
  const supabase = supabaseServer()
  const simulate = options?.simulate ?? false
  const replicateApiKey = options?.replicateApiKey ?? process.env.REPLICATE_API_KEY
  try {
    const jobData = (options as any)?.jobData ?? null
    const skipJobUpdates = !!jobData

    // Mark job as processing (unless we're running with a direct job object for local simulation)
    if (!skipJobUpdates) {
      await supabase.from('transcription_jobs').update({ status: 'processing', updated_at: new Date().toISOString() }).eq('id', jobId)
    }

    let job: any = jobData
    if (!job) {
      const { data: jobRow, error: jobErr } = await supabase.from('transcription_jobs').select('*').eq('id', jobId).maybeSingle()
      if (jobErr || !jobRow) throw new Error(jobErr?.message || 'Job not found')
      job = jobRow
    }

    const path = job.path
    const visit_id = job.visit_id

    let transcriptText: string | null = null
    let parseStructured: any = null
    let parseSummary: string | null = null

    if (replicateApiKey && !simulate) {
      // Create signed URL for audio
      const bucket = process.env.STORAGE_BUCKET
      if (!bucket) throw new Error('STORAGE_BUCKET not configured')
      const { data: urlData, error: urlError } = await supabase.storage.from(bucket).createSignedUrl(path, 3600)
      if (urlError || !urlData) throw new Error(urlError?.message || 'Failed to create signed URL')
      const audioUrl = urlData.signedUrl

      const replicate = new Replicate({ auth: replicateApiKey })
      const transcriptionPrediction: any = await replicate.run(WHISPER_MODEL, { input: { audio: audioUrl } })

      if (typeof transcriptionPrediction === 'string') transcriptText = transcriptionPrediction
      else if (transcriptionPrediction && typeof transcriptionPrediction === 'object') transcriptText = transcriptionPrediction.text || transcriptionPrediction.transcription || transcriptionPrediction.output || JSON.stringify(transcriptionPrediction)

      // Parse via our parse endpoint
      if (transcriptText) {
        const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const defaultMedicalPrompt = `You are a medical transcription assistant. Parse the following medical consultation transcript into structured JSON format and create a summary.\n\nExtract the following information:\n1. past_medical_history: Array of past medical conditions, surgeries, and relevant medical history\n2. current_symptoms: Object or array describing current symptoms, including onset, duration, severity, and characteristics\n3. physical_exam_findings: Object describing physical examination findings (vital signs, general appearance, system-specific findings)\n4. diagnosis: String or array with the diagnosis or working diagnosis\n5. treatment_plan: Array of treatment recommendations, procedures, and follow-up plans\n6. prescriptions: Array of prescribed medications with dosage, frequency, and duration if mentioned\n7. summary: A concise, readable summary (2-3 paragraphs) of the entire medical consultation session written in continuous prose.\n\nReturn ONLY valid JSON in this exact format (no markdown, no code blocks, no additional text).\n\nTranscript:\n`
        const parseResp = await fetch(`${base}/api/transcribe/parse`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: transcriptText, prompt: defaultMedicalPrompt, visit_id }) })
        if (parseResp.ok) {
          const parsed = await parseResp.json()
          parseStructured = parsed.structured || null
          parseSummary = parsed.summary || null
        }
      }
    }

    // simulate parsing for tests
    if (simulate) {
      transcriptText = transcriptText || `SIMULATED TRANSCRIPT for ${path} at ${new Date().toISOString()}`
      parseStructured = {
        past_medical_history: ['hypertension'],
        current_symptoms: [{ symptom: 'cough', characteristics: 'mild' }],
        physical_exam_findings: { lungs: 'clear' },
        diagnosis: 'Acute bronchitis',
        treatment_plan: ['Rest', 'Fluids'],
        prescriptions: [{ name: 'Amoxicillin', dosage: '500mg', frequency: 'TID', duration: '7 days' }],
        summary: 'Patient with cough; likely acute bronchitis. Recommend rest and fluids. Prescribed amoxicillin.'
      }
      parseSummary = parseStructured.summary
    }

    // Persist transcript
    let transcriptRow: any = null
    try {
      const resp = await supabase.from('transcripts').insert({ visit_id, provider: replicateApiKey && !simulate ? 'replicate/whisper' : 'local_stub', provider_metadata: replicateApiKey && !simulate ? { model: WHISPER_MODEL } : {}, text: transcriptText }).select().maybeSingle()
      if (resp.error) throw resp.error
      transcriptRow = resp.data
    } catch (e: any) {
      // fallback to local file
      const fs = await import('fs')
      const os = await import('os')
      const tmpDir = os.tmpdir()
      const outPath = `${tmpDir}/telemed_transcripts.json`
      let arr = []
      if (fs.existsSync(outPath)) {
        const raw = fs.readFileSync(outPath, 'utf8')
        try { arr = JSON.parse(raw) } catch { arr = [] }
      }
      const entry = { id: `local-${Date.now()}-${Math.floor(Math.random()*1000)}`, visit_id, text: transcriptText, created_at: new Date().toISOString(), fallback: true }
      arr.unshift(entry)
      fs.writeFileSync(outPath, JSON.stringify(arr, null, 2), 'utf8')
      transcriptRow = entry
    }

    // Insert visit_notes for transcript and structured parts
    const notesCreated: any[] = []
    try {
      // ensure user row exists if job has metadata about user, but we may not have a user here - skip author mapping (allow null or set to system)
      const toInsert: any[] = []
      toInsert.push({ visit_id, author_id: null, section: 'transcript', content: transcriptText, source: 'transcription' })
      if (parseSummary) toInsert.push({ visit_id, author_id: null, section: 'summary', content: parseSummary, source: 'transcription' })

      // Add structured fields into relevant sections
      if (parseStructured) {
        if (parseStructured.diagnosis) {
          const dx = Array.isArray(parseStructured.diagnosis) ? parseStructured.diagnosis.join('; ') : String(parseStructured.diagnosis)
          toInsert.push({ visit_id, author_id: null, section: 'assessment', content: dx, source: 'transcription' })
        }
        if (Array.isArray(parseStructured.treatment_plan)) {
          for (const item of parseStructured.treatment_plan) {
            toInsert.push({ visit_id, author_id: null, section: 'plan', content: String(item), source: 'transcription' })
          }
        }
        if (Array.isArray(parseStructured.prescriptions)) {
          for (const p of parseStructured.prescriptions) {
            const txt = `${p.name || p.medication || ''}${p.dosage ? ` ${p.dosage}` : ''}${p.frequency ? ` ${p.frequency}` : ''}${p.duration ? ` for ${p.duration}` : ''}`.trim()
            toInsert.push({ visit_id, author_id: null, section: 'plan', content: `Prescription: ${txt}`, source: 'transcription' })
          }
        }
      }

      const { data: notesData, error: notesErr } = await supabase.from('visit_notes').insert(toInsert).select()
      if (notesErr) throw notesErr
      if (notesData) notesCreated.push(...notesData)
    } catch (e: any) {
      // fallback: local file
      const fs = await import('fs')
      const os = await import('os')
      const tmpDir = os.tmpdir()
      const outPath = `${tmpDir}/telemed_transcripts_notes.json`
      let arr = []
      if (fs.existsSync(outPath)) {
        const raw = fs.readFileSync(outPath, 'utf8')
        try { arr = JSON.parse(raw) } catch { arr = [] }
      }
      const entry = { id: `local-note-${Date.now()}-${Math.floor(Math.random()*1000)}`, visit_id, content: parseSummary || transcriptText, section: parseSummary ? 'summary' : 'transcript', source: 'transcription', created_at: new Date().toISOString(), fallback: true }
      arr.unshift(entry)
      fs.writeFileSync(outPath, JSON.stringify(arr, null, 2), 'utf8')
      notesCreated.push(entry)
    }

    // update job row as completed
    if (!skipJobUpdates) {
      await supabase.from('transcription_jobs').update({ status: 'completed', result: { transcript: transcriptRow, notes: notesCreated }, processed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', jobId)
    }

    return { transcript: transcriptRow, notes: notesCreated }
  } catch (err: any) {
    console.error('Error processing job', jobId, err)
    if (!(options as any)?.jobData) {
      await supabaseServer().from('transcription_jobs').update({ status: 'failed', error: String(err), updated_at: new Date().toISOString() }).eq('id', jobId)
    }
    throw err
  }
}
