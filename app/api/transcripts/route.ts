import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'

// GET: list transcripts by visit_id or patient_id
export async function GET(req: NextRequest) {
  const { userId, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  const url = new URL(req.url)
  const visitId = url.searchParams.get('visit_id')
  const patientId = url.searchParams.get('patient_id')

  const supabase = supabaseServer()

  if (visitId) {
    // Try transcripts table first
    try {
      const { data, error: dbErr } = await supabase.from('transcripts').select('*').eq('visit_id', visitId).order('created_at', { ascending: false })
      if (!dbErr && Array.isArray(data) && data.length > 0) return NextResponse.json({ transcripts: data })
      // Otherwise continue to fallback
    } catch (e) {
      // ignore and fallback to file or audit_logs
    }

    // Fallback: look for local file fallback first
    try {
      const fs = await import('fs')
      const os = await import('os')
      const tmpDir = os.tmpdir()
      const outPath = `${tmpDir}/telemed_transcripts.json`
      if (fs.existsSync(outPath)) {
        const raw = fs.readFileSync(outPath, 'utf8')
        const arr = JSON.parse(raw)
        const filtered = arr.filter((e: any) => e.visit_id === visitId).map((e: any) => ({ id: e.id, visit_id: e.visit_id, text: e.text, fallback: true }))
        if (filtered.length > 0) return NextResponse.json({ transcripts: filtered })
      }
    } catch (e) {
      // ignore file errors
    }

    // Fallback: look for audit_logs entries with action=transcript and match visit_id
    const { data: logs, error: logErr } = await supabase.from('audit_logs').select('*').eq('action', 'transcript').order('created_at', { ascending: false })
    if (logErr) return NextResponse.json({ error: logErr.message }, { status: 400 })
    const transcripts = (logs || []).filter(l => l.meta && l.meta.visit_id === visitId).map(l => ({ id: l.id, visit_id: l.meta.visit_id, text: l.meta.text, fallback: true }))
    return NextResponse.json({ transcripts })
  }

  if (patientId) {
    // For patient-level queries, first try transcripts table
    try {
      const { data, error: dbErr } = await supabase
        .from('transcripts')
        .select('*, visits(patient_id)')
        .eq('visits.patient_id', patientId)
        .order('created_at', { ascending: false })
      if (!dbErr && data) return NextResponse.json({ transcripts: data })
    } catch (e) {}

    // Fallback to scanning audit_logs and matching via visits lookup
    const { data: logs, error: logErr } = await supabase.from('audit_logs').select('*').eq('action', 'transcript').order('created_at', { ascending: false })
    if (logErr) return NextResponse.json({ error: logErr.message }, { status: 400 })

    // Need to fetch visits for patient to match visit ids
    const { data: visits, error: vErr } = await supabase.from('visits').select('id').eq('patient_id', patientId)
    if (vErr) return NextResponse.json({ error: vErr.message }, { status: 400 })
    const visitIds = (visits || []).map(v => v.id)
    const transcripts = (logs || []).filter(l => l.meta && visitIds.includes(l.meta.visit_id)).map(l => ({ id: l.id, visit_id: l.meta.visit_id, text: l.meta.text, fallback: true }))
    return NextResponse.json({ transcripts })
  }

  // default: return recent transcripts from transcripts table or audit_logs
  try {
    const { data, error: dbErr } = await supabase.from('transcripts').select('*, visits(*)').order('created_at', { ascending: false })
    if (!dbErr && data) return NextResponse.json({ transcripts: data })
  } catch (e) {}

  // If DB-based transcripts not available, check local fallback file
  try {
    const fs = await import('fs')
    const os = await import('os')
    const tmpDir = os.tmpdir()
    const outPath = `${tmpDir}/telemed_transcripts.json`
    if (fs.existsSync(outPath)) {
      const raw = fs.readFileSync(outPath, 'utf8')
      const arr = JSON.parse(raw)
      const filtered = arr.filter((e: any) => !visitId || e.visit_id === visitId).map((e: any) => ({ id: e.id, visit_id: e.visit_id, text: e.text, fallback: true }))
      return NextResponse.json({ transcripts: filtered })
    }
  } catch (e) {
    // ignore file read errors
  }

  return NextResponse.json({ transcripts: [] })
}
