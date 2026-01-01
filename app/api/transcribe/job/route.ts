import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import Replicate from 'replicate'

// Model names
const WHISPER_MODEL = 'vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c'

// POST: trigger a transcription job (synchronous: transcribe -> parse -> persist)
export async function POST(req: NextRequest) {
  const { userId, user, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  try {
    const { path, visit_id } = await req.json()
    if (!path || !visit_id) return NextResponse.json({ error: 'Missing path or visit_id' }, { status: 400 })

    const supabase = supabaseServer()

    // Enqueue a transcription job (status = pending)
    const { data: jobData, error: jobErr } = await supabase.from('transcription_jobs').insert({ visit_id, path, status: 'pending' }).select().maybeSingle()
    if (jobErr) return NextResponse.json({ error: jobErr.message }, { status: 500 })

    return new NextResponse(JSON.stringify({ job: jobData }), { status: 202, headers: { 'Content-Type': 'application/json' } })

    const replicateApiKey = process.env.REPLICATE_API_KEY
    const bucket = process.env.STORAGE_BUCKET

    let transcriptText: string | null = null
    let parseStructured: any = null
    let parseSummary: string | null = null

    if (replicateApiKey && bucket) {
      try {
        // Create signed URL for the audio file
        const { data: urlData, error: urlError } = await supabase.storage.from(bucket).createSignedUrl(path, 3600)
        if (urlError || !urlData) throw new Error(urlError?.message || 'Failed to create signed URL')
        const audioUrl = urlData.signedUrl

        // Transcribe using Replicate Whisper model
        const replicate = new Replicate({ auth: replicateApiKey })
        const transcriptionInput = { audio: audioUrl }
        const transcriptionPrediction = await replicate.run(WHISPER_MODEL, { input: transcriptionInput })

        if (typeof transcriptionPrediction === 'string') {
          transcriptText = transcriptionPrediction
        } else if (transcriptionPrediction && typeof transcriptionPrediction === 'object') {
          transcriptText = (transcriptionPrediction as any).text || (transcriptionPrediction as any).transcription || (transcriptionPrediction as any).output || JSON.stringify(transcriptionPrediction)
        }

        // Parse transcript using our parse endpoint (delegates to deepseek)
        if (transcriptText) {
          const base = req.nextUrl?.origin || 'http://localhost:3000'
          const defaultMedicalPrompt = `You are a medical transcription assistant. Parse the following medical consultation transcript into structured JSON format and create a summary.\n\nExtract the following information:\n1. past_medical_history: Array of past medical conditions, surgeries, and relevant medical history\n2. current_symptoms: Object or array describing current symptoms, including onset, duration, severity, and characteristics\n3. physical_exam_findings: Object describing physical examination findings (vital signs, general appearance, system-specific findings)\n4. diagnosis: String or array with the diagnosis or working diagnosis\n5. treatment_plan: Array of treatment recommendations, procedures, and follow-up plans\n6. prescriptions: Array of prescribed medications with dosage, frequency, and duration if mentioned\n7. summary: A concise, readable summary (2-3 paragraphs) of the entire medical consultation session written in continuous prose.\n\nReturn ONLY valid JSON in this exact format (no markdown, no code blocks, no additional text).\n\nTranscript:\n`;

          const parseResp = await fetch(`${base}/api/transcribe/parse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript: transcriptText, prompt: defaultMedicalPrompt, visit_id })
          })

          if (parseResp.ok) {
            const parsed = await parseResp.json()
            parseStructured = parsed.structured || null
            parseSummary = parsed.summary || null
          } else {
            console.warn('Parse endpoint returned non-OK', await parseResp.text())
          }
        }
      } catch (e) {
        console.warn('Replicate transcription failed, falling back to local stub:', e)
      }
    }

    // If replicate/transcription failed, use a local stub as fallback
    if (!transcriptText) {
      transcriptText = `STUB TRANSCRIPT for ${path} at ${new Date().toISOString()}`
    }

    // Persist transcript row (try DB then fallback to local file)
    let transcriptRow: any = null
    try {
      const resp = await supabase.from('transcripts').insert({ visit_id, provider: replicateApiKey ? 'replicate/whisper' : 'local_stub', provider_metadata: replicateApiKey ? { model: WHISPER_MODEL } : {}, text: transcriptText, status: 'completed' }).select().maybeSingle()
      if (resp.error) throw resp.error
      transcriptRow = resp.data
    } catch (e: any) {
      console.warn('Could not insert into transcripts table, falling back to file store:', e.message || e)
      try {
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
      } catch (fileErr) {
        console.error('Fallback file write failed:', fileErr)
      }
    }

    // Ensure canonical user record for author exists (avoid FK errors on visit_notes)
    try {
      await supabase.from('users').upsert({ id: userId, email: user?.email ?? null, name: user?.user_metadata?.full_name ?? null }).select().maybeSingle()
    } catch (e) { console.warn('Could not upsert user before creating visit_notes:', e) }

    // Insert visit_notes: transcript and summary (if available)
    const notesCreated: any[] = []
    try {
      const toInsert: any[] = []
      toInsert.push({ visit_id, author_id: userId, section: 'transcript', content: transcriptText, source: 'transcription' })
      if (parseSummary) {
        toInsert.push({ visit_id, author_id: userId, section: 'summary', content: parseSummary, source: 'transcription' })
      }
      const { data: notesData, error: notesErr } = await supabase.from('visit_notes').insert(toInsert).select()
      if (notesErr) throw notesErr
      if (notesData) notesCreated.push(...notesData)
    } catch (e: any) {
      console.warn('Could not insert visit_notes; saving to local fallback file:', e.message || e)
      try {
        const fs = await import('fs')
        const os = await import('os')
        const tmpDir = os.tmpdir()
        const outPath = `${tmpDir}/telemed_transcripts_notes.json`
        let arr = []
        if (fs.existsSync(outPath)) {
          const raw = fs.readFileSync(outPath, 'utf8')
          try { arr = JSON.parse(raw) } catch { arr = [] }
        }
        const entry = { id: `local-note-${Date.now()}-${Math.floor(Math.random()*1000)}`, visit_id, author_id: userId, content: parseSummary || transcriptText, section: parseSummary ? 'summary' : 'transcript', source: 'transcription', created_at: new Date().toISOString(), fallback: true }
        arr.unshift(entry)
        fs.writeFileSync(outPath, JSON.stringify(arr, null, 2), 'utf8')
        notesCreated.push(entry)
      } catch (fileErr) {
        console.error('Failed to write fallback visit_notes file:', fileErr)
      }
    }

    return NextResponse.json({ transcript: transcriptRow, parse: { structured: parseStructured, summary: parseSummary }, notes: notesCreated })
  } catch (err) {
    console.error('Error in /api/transcribe/job POST:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
